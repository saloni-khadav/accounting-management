const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');
const Document = require('../models/Document');
const router = express.Router();

// Initialize Vision and Storage clients
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
  apiKey: process.env.GOOGLE_OCR_KEY
});

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
  apiKey: process.env.GOOGLE_OCR_KEY
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
  }
});

// Google Vision API function with GCS for PDF processing
const performOCR = async (fileBuffer, mimeType, fileName) => {
  try {
    console.log('File buffer size:', fileBuffer.length);
    console.log('MIME type:', mimeType);
    
    if (mimeType === 'application/pdf') {
      // Upload PDF to GCS and process
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`temp/${Date.now()}-${fileName}`);
      
      await file.save(fileBuffer, {
        metadata: { contentType: mimeType }
      });
      
      const gcsSourceUri = `gs://${bucketName}/${file.name}`;
      const gcsDestinationUri = `gs://${bucketName}/output/`;
      
      const request = {
        requests: [{
          inputConfig: {
            gcsSource: { uri: gcsSourceUri },
            mimeType: 'application/pdf'
          },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          outputConfig: {
            gcsDestination: { uri: gcsDestinationUri }
          }
        }]
      };
      
      const [operation] = await client.asyncBatchAnnotateFiles(request);
      const [filesResult] = await operation.promise();
      
      console.log('PDF processing completed, checking output...');
      
      // Wait for output to be written
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        // Read the output from GCS
        const outputBucket = storage.bucket(bucketName);
        const [files] = await outputBucket.getFiles({ prefix: 'output/' });
        console.log('Found output files:', files.map(f => f.name));
        
        if (files.length > 0) {
          // Get the latest output file
          const latestFile = files.sort((a, b) => new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated))[0];
          console.log('Reading file:', latestFile.name);
          
          const [content] = await latestFile.download();
          const jsonResult = JSON.parse(content.toString());
          
          console.log('Output file content keys:', Object.keys(jsonResult));
          
          // Clean up files
          await file.delete().catch(() => {});
          await latestFile.delete().catch(() => {});
          
          if (jsonResult.responses && jsonResult.responses[0]) {
            return jsonResult.responses[0];
          }
        } else {
          console.log('No output files found in GCS');
        }
      } catch (outputError) {
        console.error('Error reading GCS output:', outputError);
      }
      
      // Clean up temp file
      await file.delete().catch(() => {});
      
      if (filesResult.responses && filesResult.responses[0]) {
        return filesResult.responses[0];
      }
      return { error: { message: 'No response from PDF processing' } };
    } else {
      // For images, use direct API call
      const base64Content = fileBuffer.toString('base64');
      
      const requestBody = {
        requests: [{
          image: { content: base64Content },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        }]
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_OCR_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      const result = await response.json();
      return result.responses ? result.responses[0] : { error: { message: 'No response' } };
    }
  } catch (error) {
    console.error('OCR processing error:', error);
    return { error: { message: error.message } };
  }
};

// Regex patterns for extraction
const patterns = {
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
  tan: /\b[A-Z]{4}[0-9]{5}[A-Z]{1}\b/g,
  gst: /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
  mca: /\b[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/g,
  accountNumber: /(?:Account\s*(?:No|Number|#)|A\/C\s*(?:No|Number|#)|Acc\s*(?:No|Number|#)|Acct\s*(?:No|Number|#)|Bank\s*Account\s*(?:No|Number|#)|Savings\s*Account\s*(?:No|Number|#)|Current\s*Account\s*(?:No|Number|#))\s*:?\s*[:-]?\s*(\d{9,18})\b/gi,
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi,
  aadhar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  bankName: /(HDFC|ICICI|SBI|AXIS|KOTAK|PNB|BOB|CANARA|UNION|INDIAN|BANK OF BARODA|BANK OF INDIA|PUNJAB NATIONAL|STATE BANK)\s*BANK/gi
};

// Extract data using regex
const extractData = (text, documentType) => {
  const panMatches = text.match(patterns.pan) || [];
  const tanMatches = text.match(patterns.tan) || [];
  const gstMatches = text.match(patterns.gst) || [];
  const mcaMatches = text.match(patterns.mca) || [];
  
  // Extract account number with context - avoid customer numbers
  const accountMatches = text.match(patterns.accountNumber) || [];
  let accountNumber = '';
  
  if (accountMatches.length > 0) {
    // Extract just the number part from the match
    const match = accountMatches[0].match(/(\d{9,18})/);
    accountNumber = match ? match[1] : '';
  }
  
  // If no match with keywords, try standalone number patterns (fallback)
  if (!accountNumber && documentType === 'bankStatement') {
    // Look for standalone account numbers (9-18 digits)
    const standalonePattern = /\b(\d{9,18})\b/g;
    const allNumbers = text.match(standalonePattern) || [];
    
    // Filter out common false positives
    for (const num of allNumbers) {
      const numStr = num.trim();
      // Skip if it looks like phone number (10 digits starting with 6-9)
      if (numStr.length === 10 && /^[6-9]/.test(numStr)) continue;
      // Skip if it looks like amount (has decimal context)
      if (text.includes(`${numStr}.00`) || text.includes(`${numStr}.`)) continue;
      // Use first valid number
      if (numStr.length >= 9 && numStr.length <= 18) {
        accountNumber = numStr;
        break;
      }
    }
  }
  
  const ifscMatches = text.match(patterns.ifsc) || [];
  const bankMatches = text.match(patterns.bankName) || [];
  
  // Only extract Aadhar for Aadhar documents, not bank statements
  const aadharMatches = documentType === 'aadharCard' ? (text.match(patterns.aadhar) || []) : [];

  // Extract address for GST certificate
  let billingAddress = '';
  let tradeName = '';
  if (documentType === 'gstCertificate' && gstMatches.length > 0) {
    // Try multiple patterns to extract trade name
    const patterns = [
      // Pattern 1: After Registration Number, before any label
      /Registration Number[^\n]*\n\s*([A-Z][A-Z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))/i,
      // Pattern 2: Company name before "1. Legal Name" (numbered format)
      /([A-Z][A-Z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))\s*\n(?:[^\n]*\n)?(?:[^\n]*\n)?[\s\d.]*Legal Name/i,
      // Pattern 3: After "Tax" or "eTax" keyword
      /\be?Tax\s*\n\s*([A-Z][A-Z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))/i,
      // Pattern 4: After "Business" keyword (Address of Principal Place of Business)
      /Business\s*\n\s*([A-Z][A-Z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))/i,
      // Pattern 5: Any company name appearing twice (common in GST certificates)
      /\n([A-Z][A-Z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))\s*\n[^\n]*\n\1/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        // Validate it's not a false positive
        if (!extracted.includes('Additional') && !extracted.includes('Constitution') && !extracted.includes('Certificate')) {
          tradeName = extracted;
          console.log('Trade name extracted with pattern:', pattern);
          break;
        }
      }
    }
    
    // If not found, try standard patterns
    if (!tradeName) {
      const tradeNamePatterns = [
        /Legal Name[^:]*:\s*([A-Z][A-Za-z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP))/i,
        /Trade Name[^:]*:\s*([A-Z][A-Za-z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP)?)/i,
        /Business Name[^:]*:\s*([A-Z][A-Za-z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP)?)/i,
        /Taxpayer Name[^:]*:\s*([A-Z][A-Za-z\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP|PARTNERSHIP|PROPRIETORSHIP)?)/i
      ];
      
      for (const pattern of tradeNamePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const extractedName = match[1].trim();
          // Filter out common false positives
          if (extractedName.length > 3 && 
              !extractedName.match(/^\d+$/) && 
              !extractedName.match(/^Plot/) &&
              !extractedName.match(/^Building/) &&
              !extractedName.toLowerCase().includes('certificate') &&
              !extractedName.toLowerCase().includes('registration')) {
            tradeName = extractedName;
            console.log('Trade name extracted with pattern:', pattern);
            console.log('Trade name value:', tradeName);
            break;
          }
        }
      }
    }
    
    // Method 1: Try structured format with labels (Building No, Road, City, State, PIN)
    const buildingMatch = text.match(/(?:Building No|Flat No|Plot)[^:]*:\s*([^\n]+)/i);
    const roadMatch = text.match(/(?:Road|Street)[^:]*:\s*([^\n]+)/i);
    const localityMatch = text.match(/(?:Locality|Sub Locality)[^:]*:\s*([^\n]+)/i);
    const cityMatch = text.match(/(?:City|Town|Village)[^:]*:\s*([^\n]+)/i);
    const districtMatch = text.match(/District[^:]*:\s*([^\n]+)/i);
    const stateMatch = text.match(/State[^:]*:\s*([^\n]+)/i);
    const pinMatch = text.match(/PIN Code[^:]*:\s*(\d{6})/i);
    
    if (buildingMatch || cityMatch || pinMatch) {
      const parts = [];
      if (buildingMatch) parts.push(buildingMatch[1].trim());
      if (roadMatch) parts.push(roadMatch[1].trim());
      if (localityMatch) parts.push(localityMatch[1].trim());
      if (cityMatch) parts.push(cityMatch[1].trim());
      if (districtMatch) parts.push(districtMatch[1].trim());
      if (stateMatch) parts.push(stateMatch[1].trim());
      if (pinMatch) parts.push(pinMatch[1].trim());
      
      billingAddress = parts.join(', ');
      console.log('Address extracted (structured format):', billingAddress);
    }
    
    // Method 2: If structured format not found, try simple pattern (street, city, state, PIN)
    if (!billingAddress) {
      const simpleMatch = text.match(/([A-Z0-9][^\n]{10,200}[,\s]+[A-Za-z]+[,\s]+[A-Za-z]+[,\s]*\n?\s*\d{6})/i);
      if (simpleMatch) {
        billingAddress = simpleMatch[1]
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        console.log('Address extracted (simple format):', billingAddress);
      } else {
        console.log('Address pattern not found');
      }
    }
  }

  return {
    panNumber: panMatches[0] || '',
    tanNumber: tanMatches[0] || '',
    gstNumber: gstMatches[0] || '',
    tradeName: tradeName,
    billingAddress: billingAddress,
    mcaNumber: mcaMatches[0] || '',
    accountNumber: accountNumber,
    ifscCode: ifscMatches[0] || '',
    bankName: bankMatches[0] || '',
    aadharNumber: aadharMatches[0] ? aadharMatches[0].replace(/\s/g, '') : '',
    extractedText: text
  };
};

// OCR processing endpoint
router.post('/extract', upload.single('document'), async (req, res) => {
  try {
    console.log('OCR Extract request received');
    console.log('File:', req.file ? req.file.originalname : 'No file');
    console.log('Document Type:', req.body.documentType);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { documentType } = req.body;

    // Perform OCR using Google Vision
    console.log('Starting OCR processing...');
    const result = await performOCR(req.file.buffer, req.file.mimetype, req.file.originalname);
    console.log('OCR completed');
    console.log('Vision API response keys:', Object.keys(result));
    console.log('Has fullTextAnnotation:', !!result.fullTextAnnotation);
    console.log('Has textAnnotations:', !!result.textAnnotations);
    console.log('Error in result:', result.error);
    
    const rawText = result.fullTextAnnotation ? result.fullTextAnnotation.text : 
                   (result.textAnnotations && result.textAnnotations.length > 0 ? result.textAnnotations[0].description : '');
    console.log('textAnnotations length:', result.textAnnotations ? result.textAnnotations.length : 0);
    if (result.textAnnotations && result.textAnnotations.length > 0) {
      console.log('First textAnnotation:', result.textAnnotations[0]);
    }
    console.log('Extracted text length:', rawText.length);
    if (rawText.length > 0) {
      console.log('Raw text preview:', rawText.substring(0, 500));
    }

    if (!rawText || result.error) {
      console.log('OCR failed, no text extracted');
      return res.json({ 
        success: false,
        message: 'No text found in document'
      });
    }

    // Extract structured data
    const extractedData = extractData(rawText, documentType);
    
    console.log('Extracted data from extractData function:', extractedData);
    console.log('Document type:', documentType);
    console.log('PAN number found:', extractedData.panNumber);
    console.log('GST number found:', extractedData.gstNumber);
    console.log('Billing address found:', extractedData.billingAddress);
    console.log('Billing address length:', extractedData.billingAddress?.length);
    
    // Force extract UDYAM number for MSME certificates
    if (documentType === 'msmeCertificate') {
      console.log('Processing MSME certificate...');
      const udyamMatch = rawText.match(/UDYAM-[A-Z]{2}-\d{2}-\d{7}/i);
      if (udyamMatch) {
        extractedData.msmeNumber = udyamMatch[0];
        console.log('UDYAM number extracted:', udyamMatch[0]);
      } else {
        console.log('No UDYAM match found in text');
      }
    }
    
    // Force extract TAN number for TAN certificates with multiple patterns
    if (documentType === 'tanCertificate') {
      console.log('Processing TAN certificate...');
      console.log('Raw text sample:', rawText.substring(0, 500));
      
      // Try multiple TAN patterns
      const tanPatterns = [
        /TAN\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /Tax\s+Deduction\s+(?:and\s+)?Collection\s+Account\s+Number\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /Account\s+Number\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /\b([A-Z]{4}[0-9]{5}[A-Z])\b/g
      ];
      
      for (const pattern of tanPatterns) {
        const matches = rawText.match(pattern);
        if (matches) {
          console.log('TAN pattern matched:', pattern, matches);
          // Extract just the TAN number from the match
          const tanMatch = matches[0].match(/[A-Z]{4}[0-9]{5}[A-Z]/);
          if (tanMatch) {
            extractedData.tanNumber = tanMatch[0];
            console.log('TAN number extracted:', tanMatch[0]);
            break;
          }
        }
      }
      
      if (!extractedData.tanNumber) {
        console.log('No TAN match found with any pattern');
      }
    }
    
    console.log('Extracted data:', extractedData);
    
    // Check if relevant data was found based on document type
    let hasRelevantData = false;
    if (documentType === 'panCard' && extractedData.panNumber) hasRelevantData = true;
    if (documentType === 'tanCertificate' && extractedData.tanNumber) hasRelevantData = true;
    if (documentType === 'gstCertificate' && extractedData.gstNumber) hasRelevantData = true;
    if (documentType === 'mcaCertificate' && extractedData.mcaNumber) hasRelevantData = true;
    if (documentType === 'msmeCertificate' && extractedData.msmeNumber) hasRelevantData = true;
    if (documentType === 'bankStatement' && (extractedData.accountNumber || extractedData.ifscCode || extractedData.bankName)) hasRelevantData = true;
    if (documentType === 'aadharCard' && extractedData.aadharNumber) hasRelevantData = true;

    console.log('Has relevant data:', hasRelevantData);
    console.log('Checking conditions:');
    console.log('- panCard check:', documentType === 'panCard', extractedData.panNumber);
    console.log('- gstCertificate check:', documentType === 'gstCertificate', extractedData.gstNumber);

    if (!hasRelevantData) {
      console.log('No relevant data found, returning error');
      console.log('Raw text sample:', rawText.substring(0, 200));
      return res.json({
        success: false,
        data: extractedData,
        message: `No ${documentType === 'panCard' ? 'PAN number' : documentType === 'bankStatement' ? 'bank details' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'relevant data'} found in this document. Please upload the correct document.`
      });
    }

    res.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed. Please try again.',
      error: error.message
    });
  }
});

module.exports = router;
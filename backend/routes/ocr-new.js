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
  
  let accountNumber = '';
  const accountMatches = text.match(patterns.accountNumber) || [];
  if (accountMatches.length > 0) {
    const match = accountMatches[0].match(/(\d{9,18})/);
    accountNumber = match ? match[1] : '';
  }
  
  if (!accountNumber && documentType === 'bankStatement') {
    const standalonePattern = /\b(\d{9,18})\b/g;
    const allNumbers = text.match(standalonePattern) || [];
    for (const num of allNumbers) {
      const numStr = num.trim();
      if (numStr.length === 10 && /^[6-9]/.test(numStr)) continue;
      if (text.includes(`${numStr}.00`) || text.includes(`${numStr}.`)) continue;
      if (numStr.length >= 9 && numStr.length <= 18) {
        accountNumber = numStr;
        break;
      }
    }
  }
  
  const ifscMatches = text.match(patterns.ifsc) || [];
  const bankMatches = text.match(patterns.bankName) || [];
  const aadharMatches = documentType === 'aadharCard' ? (text.match(patterns.aadhar) || []) : [];

  let companyName = '';
  if (documentType === 'bankStatement') {
    const companyPatterns = [
      /([A-Z][A-Z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))(?:\s*\n|\s*$)/i,
      /(?:Account Holder|Name|Customer Name|A\/C Holder)\s*:?\s*([A-Z][A-Za-z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))\s*(?:\n|$)/i,
      /([A-Z][A-Za-z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))\s*(?:Account|Statement|Bank)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        companyName = match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        console.log('Company name extracted with pattern:', companyName);
        break;
      }
    }
  }

  // Extract address for GST certificate
  let billingAddress = '';
  let tradeName = '';
  if (documentType === 'gstCertificate' && gstMatches.length > 0) {
    const tradeNamePatterns = [
      /(?:1\.|2\.)\s*(?:Legal Name|Trade Name)(?:[^\n]{0,20})?\n?\s*([A-Z][A-Za-z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))\s*(?:\n|$)/i,
      /(?:Legal Name|Trade Name)\s*:?\s*([A-Z][A-Za-z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))\s*(?:\n|$)/i
    ];
    
    for (const pattern of tradeNamePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let extractedName = match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        
        extractedName = extractedName.replace(/^\d+\s*/, '').replace(/\s*\d+$/, '');
        extractedName = extractedName.replace(/^[,\s]+|[,\s]+$/g, '');
        
        const words = extractedName.split(' ');
        const halfLength = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, halfLength).join(' ');
        const secondHalf = words.slice(halfLength).join(' ');
        if (firstHalf === secondHalf && firstHalf.length > 0) {
          extractedName = firstHalf;
        }
        
        if (extractedName.length > 10 && 
            !extractedName.match(/^PRIVATE LIMITED$/i) &&
            !extractedName.match(/^Legal Name$/i) &&
            !extractedName.match(/^Trade Name$/i) &&
            !extractedName.match(/if any/i) &&
            !extractedName.match(/Constitution/i)) {
          tradeName = extractedName;
          console.log('Trade name extracted:', tradeName);
          break;
        }
      }
    }
    
    if (!tradeName) {
      const match = text.match(/Registration Number[^\n]*\n\s*([A-Z][A-Z0-9\s&.,-]+(?:PRIVATE LIMITED|PVT LTD|LIMITED|LTD|LLP))\s*(?:\n|$)/i);
      if (match && match[1]) {
        let extracted = match[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        extracted = extracted.replace(/^\d+\s*/, '').replace(/\s*\d+$/, '');
        const words = extracted.split(' ');
        const halfLength = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, halfLength).join(' ');
        const secondHalf = words.slice(halfLength).join(' ');
        if (firstHalf === secondHalf && firstHalf.length > 0) {
          extracted = firstHalf;
        }
        if (extracted.length > 10) {
          tradeName = extracted;
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
    companyName: companyName,
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

    const { documentType, companyTradeName } = req.body;

    console.log('Starting OCR processing...');
    const result = await performOCR(req.file.buffer, req.file.mimetype, req.file.originalname);
    console.log('OCR completed');
    console.log('Result keys:', Object.keys(result));
    console.log('Has fullTextAnnotation:', !!result.fullTextAnnotation);
    console.log('Has textAnnotations:', !!result.textAnnotations);
    
    const rawText = result.fullTextAnnotation ? result.fullTextAnnotation.text : 
                   (result.textAnnotations && result.textAnnotations.length > 0 ? result.textAnnotations[0].description : '');
    
    console.log('Raw text length:', rawText.length);
    if (rawText.length > 0) {
      console.log('Raw text preview (first 500 chars):', rawText.substring(0, 500));
    }

    if (!rawText || result.error) {
      console.log('No text extracted or error occurred');
      return res.json({ 
        success: false,
        message: 'No text found in document'
      });
    }

    const extractedData = extractData(rawText, documentType);
    
    console.log('Extracted data:', extractedData);
    console.log('Company trade name from request:', companyTradeName);
    console.log('Extracted company name:', extractedData.companyName);
    
    if (documentType === 'bankStatement' && companyTradeName) {
      const extractedCompanyName = extractedData.companyName || '';
      const normalizedExpected = companyTradeName.toUpperCase().replace(/\s+/g, ' ').trim();
      const normalizedExtracted = extractedCompanyName.toUpperCase().replace(/\s+/g, ' ').trim();
      
      console.log('Validation check:');
      console.log('Expected (normalized):', normalizedExpected);
      console.log('Extracted (normalized):', normalizedExtracted);
      console.log('Does extracted include expected?', normalizedExtracted.includes(normalizedExpected));
      
      if (extractedCompanyName && !normalizedExtracted.includes(normalizedExpected)) {
        console.log('Validation failed - company name mismatch');
        return res.json({
          success: false,
          message: `Bank statement belongs to a different company. Expected: ${companyTradeName}, Found: ${extractedCompanyName}. Please upload the correct bank statement.`
        });
      }
      
      if (!extractedCompanyName) {
        console.log('Warning: Could not extract company name from bank statement');
      }
    }
    
    if (documentType === 'msmeCertificate') {
      const udyamMatch = rawText.match(/UDYAM-[A-Z]{2}-\d{2}-\d{7}/i);
      if (udyamMatch) {
        extractedData.msmeNumber = udyamMatch[0];
      }
    }
    
    if (documentType === 'tanCertificate') {
      const tanPatterns = [
        /TAN\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /Tax\s+Deduction\s+(?:and\s+)?Collection\s+Account\s+Number\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /Account\s+Number\s*:?\s*([A-Z]{4}[0-9]{5}[A-Z])/gi,
        /\b([A-Z]{4}[0-9]{5}[A-Z])\b/g
      ];
      
      for (const pattern of tanPatterns) {
        const matches = rawText.match(pattern);
        if (matches) {
          const tanMatch = matches[0].match(/[A-Z]{4}[0-9]{5}[A-Z]/);
          if (tanMatch) {
            extractedData.tanNumber = tanMatch[0];
            break;
          }
        }
      }
    }
    
    let hasRelevantData = false;
    if (documentType === 'panCard' && extractedData.panNumber) hasRelevantData = true;
    if (documentType === 'tanCertificate' && extractedData.tanNumber) hasRelevantData = true;
    if (documentType === 'gstCertificate' && extractedData.gstNumber) hasRelevantData = true;
    if (documentType === 'mcaCertificate' && extractedData.mcaNumber) hasRelevantData = true;
    if (documentType === 'msmeCertificate' && extractedData.msmeNumber) hasRelevantData = true;
    if (documentType === 'bankStatement' && (extractedData.accountNumber || extractedData.ifscCode || extractedData.bankName)) hasRelevantData = true;
    if (documentType === 'aadharCard' && extractedData.aadharNumber) hasRelevantData = true;

    if (!hasRelevantData) {
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
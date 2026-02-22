const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const Document = require('../models/Document');
const router = express.Router();

// Initialize Vision client with API key (credentials file not needed)
const client = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_OCR_KEY
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
  }
});

// Google Vision API function for PDF and images
const performOCR = async (fileBuffer, mimetype) => {
  try {
    const request = {
      image: {
        content: fileBuffer.toString('base64')
      },
      features: [
        { type: 'DOCUMENT_TEXT_DETECTION' },
        { type: 'TEXT_DETECTION' }
      ]
    };

    const [result] = await client.annotateImage(request);
    console.log('OCR Result:', {
      hasFullText: !!result.fullTextAnnotation,
      hasTextAnnotations: !!result.textAnnotations,
      textLength: result.fullTextAnnotation?.text?.length || 0,
      error: result.error
    });
    return result;
  } catch (error) {
    console.error('OCR API Error:', error);
    throw error;
  }
};

// Regex patterns for extraction
const patterns = {
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
  gst: /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
  accountNumber: /\b\d{9,18}\b/g,
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi,
  aadhar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  bankName: /(HDFC|ICICI|SBI|AXIS|KOTAK|PNB|BOB|CANARA|UNION|INDIAN)\s*BANK/gi,
  msmeNumber: /UDYAM-[A-Z]{2}-\d{2}-\d{7}/gi,
  mcaNumber: /\b(U\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}|L\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6})\b/gi
};

// Extract data using regex
const extractData = (text, documentType) => {
  const panMatches = text.match(patterns.pan) || [];
  const gstMatches = text.match(patterns.gst) || [];
  const accountMatches = text.match(patterns.accountNumber) || [];
  const ifscMatches = text.match(patterns.ifsc) || [];
  const aadharMatches = text.match(patterns.aadhar) || [];
  const bankMatches = text.match(patterns.bankName) || [];
  const msmeMatches = text.match(patterns.msmeNumber) || [];
  const mcaMatches = text.match(patterns.mcaNumber) || [];

  const baseData = {
    panNumber: panMatches[0] || '',
    gstNumber: gstMatches[0] || '',
    accountNumber: accountMatches[0] || '',
    ifscCode: ifscMatches[0] || '',
    bankName: bankMatches[0] || '',
    aadharNumber: aadharMatches[0] ? aadharMatches[0].replace(/\s/g, '') : '',
    msmeNumber: msmeMatches[0] || '',
    mcaNumber: mcaMatches[0] || ''
  };

  // Add MSME specific data
  if (documentType === 'msmeCertificate') {
    // Try multiple patterns for MSME/UDYAM number
    let msmeNumber = baseData.msmeNumber;
    if (!msmeNumber) {
      const udyamMatch = text.match(/UDYAM-[A-Z]{2}-\d{2}-\d{7}/i);
      if (udyamMatch) {
        msmeNumber = udyamMatch[0];
      }
    }
    baseData.msmeNumber = msmeNumber;
    console.log('MSME number found:', msmeNumber);
  }

  // Add MCA specific data
  if (documentType === 'mcaCertificate') {
    baseData.mcaNumber = mcaMatches[0] || '';
  }

  return baseData;
};

// Auto-detect document type from extracted text
const detectDocumentType = (text) => {
  const detectedTypes = [];
  
  if (patterns.pan.test(text)) detectedTypes.push('panCard');
  if (patterns.gst.test(text)) detectedTypes.push('gstCertificate');
  if (patterns.aadhar.test(text)) detectedTypes.push('aadharCard');
  if (patterns.ifsc.test(text) || patterns.bankName.test(text)) detectedTypes.push('bankStatement');
  
  return detectedTypes;
};

// OCR processing endpoint with auto-detection
router.post('/extract', upload.single('document'), async (req, res) => {
  try {
    console.log('Upload received:', req.file?.originalname, req.file?.mimetype);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let { documentType } = req.body;

    console.log('Starting OCR...');
    const result = await performOCR(req.file.buffer, req.file.mimetype);
    
    const rawText = result.fullTextAnnotation?.text || 
                   result.textAnnotations?.[0]?.description || '';

    console.log('Extracted text length:', rawText.length);
    console.log('Text preview:', rawText.substring(0, 200));

    if (!rawText || result.error) {
      console.error('OCR Error:', result.error);
      return res.json({
        success: false,
        message: 'Could not extract text from document. Please ensure the document is clear and readable.',
        data: {},
        error: result.error?.message
      });
    }

    // Auto-detect document type if not provided
    if (!documentType) {
      const detectedTypes = detectDocumentType(rawText);
      documentType = detectedTypes[0] || 'unknown';
      console.log('Detected types:', detectedTypes);
    }

    // Extract all possible data
    const extractedData = extractData(rawText, documentType);
    
    // Determine what data was found
    const foundData = {};
    if (extractedData.panNumber) foundData.panNumber = extractedData.panNumber;
    if (extractedData.gstNumber) foundData.gstNumber = extractedData.gstNumber;
    if (extractedData.aadharNumber) foundData.aadharNumber = extractedData.aadharNumber;
    if (extractedData.accountNumber) foundData.accountNumber = extractedData.accountNumber;
    if (extractedData.ifscCode) foundData.ifscCode = extractedData.ifscCode;
    if (extractedData.bankName) foundData.bankName = extractedData.bankName;

    console.log('Found data:', foundData);

    res.json({
      success: true,
      data: foundData,
      detectedType: documentType,
      rawTextPreview: rawText.substring(0, 500),
      message: Object.keys(foundData).length > 0 ? 'Data extracted successfully' : 'No relevant data found'
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed: ' + error.message,
      error: error.message
    });
  }
});

// OCR processing endpoint
router.post('/process-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, userId = 'default' } = req.body;

    if (!documentType || !['GST_CERTIFICATE', 'BANK_STATEMENT', 'AADHAR_CARD'].includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Perform OCR using Google Vision
    const result = await performOCR(req.file.buffer);
    
    const annotations = result.responses[0].textAnnotations;
    const rawText = annotations && annotations.length > 0 ? annotations[0].description : '';

    if (!rawText) {
      return res.status(400).json({ 
        message: 'No text found in document',
        status: 'FAILED'
      });
    }

    // Extract structured data
    const extractedData = extractData(rawText);

    // Save to database
    const document = new Document({
      userId,
      documentType,
      extractedData,
      rawText,
      status: 'AUTO_FILLED',
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    await document.save();

    res.json({
      success: true,
      extractedData,
      documentId: document._id,
      status: 'AUTO_FILLED'
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ 
      message: 'OCR processing failed',
      error: error.message,
      status: 'FAILED'
    });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document status
router.patch('/:id/verify', async (req, res) => {
  try {
    const { extractedData } = req.body;
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        extractedData,
        status: 'VERIFIED'
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
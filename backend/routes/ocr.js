const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Document = require('../models/Document');
const router = express.Router();

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

// Google Vision API function
const performOCR = async (imageBuffer) => {
  const base64Image = imageBuffer.toString('base64');
  
  const requestBody = {
    requests: [{
      image: {
        content: base64Image
      },
      features: [{
        type: 'TEXT_DETECTION'
      }]
    }]
  };

  const response = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_OCR_KEY}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

// Regex patterns for extraction
const patterns = {
  gst: /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
  accountNumber: /\b\d{9,18}\b/g,
  ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
  aadhar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g
};

// Extract data using regex
const extractData = (text) => {
  const gstMatches = text.match(patterns.gst) || [];
  const accountMatches = text.match(patterns.accountNumber) || [];
  const ifscMatches = text.match(patterns.ifsc) || [];
  const aadharMatches = text.match(patterns.aadhar) || [];

  return {
    gstNumber: gstMatches[0] || '',
    accountNumber: accountMatches[0] || '',
    ifsc: ifscMatches[0] || '',
    aadharNumber: aadharMatches[0] ? aadharMatches[0].replace(/\s/g, '') : ''
  };
};

// OCR processing endpoint
router.post('/extract', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { documentType } = req.body;

    // Perform OCR using Google Vision
    const result = await performOCR(req.file.buffer);
    
    const annotations = result.responses[0].textAnnotations;
    const rawText = annotations && annotations.length > 0 ? annotations[0].description : '';

    if (!rawText) {
      return res.json({ 
        success: false,
        message: 'No text found in document'
      });
    }

    // Extract structured data
    const extractedData = extractData(rawText);
    
    // Check if relevant data was found based on document type
    let hasRelevantData = false;
    if (documentType === 'gstCertificate' && extractedData.gstNumber) hasRelevantData = true;
    if (documentType === 'bankStatement' && (extractedData.accountNumber || extractedData.ifsc)) hasRelevantData = true;
    if (documentType === 'aadharCard' && extractedData.aadharNumber) hasRelevantData = true;

    if (!hasRelevantData) {
      return res.json({
        success: false,
        message: `Could not extract ${documentType === 'gstCertificate' ? 'GST number' : 
                                documentType === 'bankStatement' ? 'bank details' : 
                                'Aadhar number'} from document`
      });
    }

    res.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.json({ 
      success: false,
      message: 'Upload failed. Please try again.'
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
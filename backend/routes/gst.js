const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const gstService = require('../services/gstService');
const GST = require('../models/GST');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Initialize Google Cloud Vision client
const visionClient = new ImageAnnotatorClient();

// POST /api/gst/verify - Verify GST number (manual or OCR)
router.post('/verify', auth, upload.single('document'), async (req, res) => {
  try {
    let { gstNumber } = req.body;
    const userId = req.user.id;

    // If document uploaded, extract GST using OCR
    if (req.file && !gstNumber) {
      try {
        const [result] = await visionClient.textDetection({
          image: { content: req.file.buffer }
        });
        
        const extractedText = result.textAnnotations?.[0]?.description || '';
        gstNumber = gstService.extractGSTFromText(extractedText);
        
        if (!gstNumber) {
          return res.status(400).json({
            success: false,
            error: 'Could not extract GST number from document'
          });
        }
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        return res.status(500).json({
          success: false,
          error: 'Failed to process document'
        });
      }
    }

    if (!gstNumber) {
      return res.status(400).json({
        success: false,
        error: 'GST number is required'
      });
    }

    // Verify GST using Appyflow API
    const verificationResult = await gstService.verifyGST(gstNumber.toUpperCase());
    
    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Save to database
    const existingGST = await GST.findOne({ userId, gstNumber: gstNumber.toUpperCase() });
    
    if (existingGST) {
      // Update existing record
      Object.assign(existingGST, verificationResult.data);
      existingGST.verifiedAt = new Date();
      await existingGST.save();
    } else {
      // Create new record
      await GST.create({
        userId,
        ...verificationResult.data
      });
    }

    res.json({
      success: true,
      data: verificationResult.data,
      message: 'GST verified and saved successfully'
    });

  } catch (error) {
    console.error('GST Verification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/gst/details/:userId - Get saved GST details
router.get('/details/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own data
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const gstDetails = await GST.findOne({ userId }).sort({ verifiedAt: -1 });
    
    if (!gstDetails) {
      return res.status(404).json({
        success: false,
        error: 'No GST details found'
      });
    }

    res.json({
      success: true,
      data: gstDetails
    });

  } catch (error) {
    console.error('Get GST Details Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/gst/test/:gstNumber - Test GST API directly
router.get('/test/:gstNumber', async (req, res) => {
  try {
    const { gstNumber } = req.params;
    console.log('Testing GST:', gstNumber);
    
    const result = await gstService.verifyGST(gstNumber);
    
    res.json({
      gstNumber,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
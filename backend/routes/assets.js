const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Asset = require('../models/Asset');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/assets');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
    }
  }
});

// Get next asset code
router.get('/next-code', async (req, res) => {
  try {
    const count = await Asset.countDocuments();
    const assetCode = `AST${String(count + 1).padStart(3, '0')}`;
    res.json({ assetCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assets with filtering
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
router.post('/', auth, checkPeriodPermission('Assets'), upload.array('attachments', 10), async (req, res) => {
  try {
    const assetData = { ...req.body };
    
    // Parse items if it's a string
    if (typeof assetData.items === 'string') {
      assetData.items = JSON.parse(assetData.items);
    }
    
    // Parse vendor details if it's a string
    if (typeof assetData.vendorDetails === 'string') {
      assetData.vendorDetails = JSON.parse(assetData.vendorDetails);
    }
    
    // Clean up empty numeric fields
    if (!assetData.usefulLife || assetData.usefulLife === '') delete assetData.usefulLife;
    if (!assetData.salvageValue || assetData.salvageValue === '') delete assetData.salvageValue;
    if (!assetData.warrantyPeriod || assetData.warrantyPeriod === '') delete assetData.warrantyPeriod;
    
    // Add attachments info
    if (req.files && req.files.length > 0) {
      assetData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }
    
    const asset = new Asset(assetData);
    const savedAsset = await asset.save();
    res.status(201).json(savedAsset);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Asset code already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update asset
router.put('/:id', auth, checkPeriodPermission('Assets'), upload.array('attachments', 10), async (req, res) => {
  try {
    const assetData = { ...req.body };
    
    // Parse items if it's a string
    if (typeof assetData.items === 'string') {
      assetData.items = JSON.parse(assetData.items);
    }
    
    // Parse vendor details if it's a string
    if (typeof assetData.vendorDetails === 'string') {
      assetData.vendorDetails = JSON.parse(assetData.vendorDetails);
    }
    
    // Clean up empty numeric fields
    if (!assetData.usefulLife || assetData.usefulLife === '') delete assetData.usefulLife;
    if (!assetData.salvageValue || assetData.salvageValue === '') delete assetData.salvageValue;
    if (!assetData.warrantyPeriod || assetData.warrantyPeriod === '') delete assetData.warrantyPeriod;
    
    // Add new attachments if uploaded
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      // Get existing attachments
      const existingAsset = await Asset.findById(req.params.id);
      assetData.attachments = [...(existingAsset.attachments || []), ...newAttachments];
    }
    
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      assetData,
      { new: true, runValidators: true }
    );
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Download attachment
router.get('/download/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
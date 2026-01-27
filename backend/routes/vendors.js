const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Vendor = require('../models/Vendor');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/vendors');
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

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new vendor
router.post('/', upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    const vendorData = { ...req.body };
    
    // Parse gstNumbers if it's a string
    if (typeof vendorData.gstNumbers === 'string') {
      vendorData.gstNumbers = JSON.parse(vendorData.gstNumbers);
    }
    
    // Ensure gstNumber is a string, not an array
    if (Array.isArray(vendorData.gstNumber)) {
      vendorData.gstNumber = vendorData.gstNumber[0] || '';
    }
    
    // Handle file uploads
    if (req.files) {
      vendorData.documents = {};
      
      // Handle single document uploads
      if (req.files.panCard) {
        vendorData.documents.panCard = req.files.panCard[0].filename;
      }
      if (req.files.aadharCard) {
        vendorData.documents.aadharCard = req.files.aadharCard[0].filename;
      }
      if (req.files.gstCertificate) {
        vendorData.documents.gstCertificate = req.files.gstCertificate[0].filename;
      }
      if (req.files.bankStatement) {
        vendorData.documents.bankStatement = req.files.bankStatement[0].filename;
      }
      
      // Handle multiple other documents
      if (req.files.otherDocuments) {
        vendorData.documents.otherDocuments = req.files.otherDocuments.map(file => file.filename);
      }
    }
    
    const vendor = new Vendor(vendorData);
    const savedVendor = await vendor.save();
    res.status(201).json(savedVendor);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Vendor code already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update vendor
router.put('/:id', upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    const vendorData = { ...req.body };
    
    // Parse gstNumbers if it's a string
    if (typeof vendorData.gstNumbers === 'string') {
      vendorData.gstNumbers = JSON.parse(vendorData.gstNumbers);
    }
    
    // Ensure gstNumber is a string, not an array
    if (Array.isArray(vendorData.gstNumber)) {
      vendorData.gstNumber = vendorData.gstNumber[0] || '';
    }
    
    // Handle file uploads
    if (req.files) {
      if (!vendorData.documents) vendorData.documents = {};
      
      // Handle single document uploads
      if (req.files.panCard) {
        vendorData.documents.panCard = req.files.panCard[0].filename;
      }
      if (req.files.aadharCard) {
        vendorData.documents.aadharCard = req.files.aadharCard[0].filename;
      }
      if (req.files.gstCertificate) {
        vendorData.documents.gstCertificate = req.files.gstCertificate[0].filename;
      }
      if (req.files.bankStatement) {
        vendorData.documents.bankStatement = req.files.bankStatement[0].filename;
      }
      
      // Handle multiple other documents - append to existing
      if (req.files.otherDocuments) {
        const existingVendor = await Vendor.findById(req.params.id);
        const existingDocs = existingVendor?.documents?.otherDocuments || [];
        const newDocs = req.files.otherDocuments.map(file => file.filename);
        vendorData.documents.otherDocuments = [...existingDocs, ...newDocs];
      }
    }
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      vendorData,
      { new: true, runValidators: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search vendors
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const vendors = await Vendor.find({
      $or: [
        { vendorName: { $regex: searchTerm, $options: 'i' } },
        { vendorCode: { $regex: searchTerm, $options: 'i' } },
        { contactPerson: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download document
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
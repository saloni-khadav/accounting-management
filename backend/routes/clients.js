const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Client = require('../models/Client');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/clients');
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

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new client
router.post('/', upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    const clientData = { ...req.body };
    
    // Parse gstNumbers if it's a string
    if (typeof clientData.gstNumbers === 'string') {
      clientData.gstNumbers = JSON.parse(clientData.gstNumbers);
    }
    
    // Ensure gstNumber is a string, not an array
    if (Array.isArray(clientData.gstNumber)) {
      clientData.gstNumber = clientData.gstNumber[0] || '';
    }
    
    // Handle file uploads
    if (req.files) {
      clientData.documents = {};
      
      // Handle single document uploads
      if (req.files.panCard) {
        clientData.documents.panCard = req.files.panCard[0].filename;
      }
      if (req.files.aadharCard) {
        clientData.documents.aadharCard = req.files.aadharCard[0].filename;
      }
      if (req.files.gstCertificate) {
        clientData.documents.gstCertificate = req.files.gstCertificate[0].filename;
      }
      if (req.files.bankStatement) {
        clientData.documents.bankStatement = req.files.bankStatement[0].filename;
      }
      
      // Handle multiple other documents
      if (req.files.otherDocuments) {
        clientData.documents.otherDocuments = req.files.otherDocuments.map(file => file.filename);
      }
    }
    
    const client = new Client(clientData);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Client code already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update client
router.put('/:id', upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    const clientData = { ...req.body };
    
    // Parse gstNumbers if it's a string
    if (typeof clientData.gstNumbers === 'string') {
      clientData.gstNumbers = JSON.parse(clientData.gstNumbers);
    }
    
    // Ensure gstNumber is a string, not an array
    if (Array.isArray(clientData.gstNumber)) {
      clientData.gstNumber = clientData.gstNumber[0] || '';
    }
    
    // Handle file uploads
    if (req.files) {
      if (!clientData.documents) clientData.documents = {};
      
      // Handle single document uploads
      if (req.files.panCard) {
        clientData.documents.panCard = req.files.panCard[0].filename;
      }
      if (req.files.aadharCard) {
        clientData.documents.aadharCard = req.files.aadharCard[0].filename;
      }
      if (req.files.gstCertificate) {
        clientData.documents.gstCertificate = req.files.gstCertificate[0].filename;
      }
      if (req.files.bankStatement) {
        clientData.documents.bankStatement = req.files.bankStatement[0].filename;
      }
      
      // Handle multiple other documents - append to existing
      if (req.files.otherDocuments) {
        const existingClient = await Client.findById(req.params.id);
        const existingDocs = existingClient?.documents?.otherDocuments || [];
        const newDocs = req.files.otherDocuments.map(file => file.filename);
        clientData.documents.otherDocuments = [...existingDocs, ...newDocs];
      }
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      clientData,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search clients
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const clients = await Client.find({
      $or: [
        { clientName: { $regex: searchTerm, $options: 'i' } },
        { clientCode: { $regex: searchTerm, $options: 'i' } },
        { contactPerson: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(clients);
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

// View document
router.get('/view/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
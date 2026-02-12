const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const CreditDebitNote = require('../models/CreditDebitNote');
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/credit-debit-notes');
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

// Get next note number
router.get('/next-note-number/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const yearCode = '2627';
    const prefix = type === 'Credit Note' ? 'CN' : 'DN';
    
    // Find the latest note number for current year format (check all notes, not just user's)
    const latestNote = await CreditDebitNote.findOne({
      noteNumber: { $regex: `^${prefix}-${yearCode}-` }
    }).sort({ noteNumber: -1 });
    
    let nextNumber = 1;
    if (latestNote) {
      const parts = latestNote.noteNumber.split('-');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2]);
        nextNumber = lastNumber + 1;
      }
    }
    
    const noteNumber = `${prefix}-${yearCode}-${nextNumber.toString().padStart(3, '0')}`;
    res.json({ noteNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all credit/debit notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await CreditDebitNote.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching credit/debit notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all credit/debit notes for reconciliation (without auth)
router.get('/reconciliation', async (req, res) => {
  try {
    const notes = await CreditDebitNote.find({})
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching credit/debit notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new credit/debit note
router.post('/', auth, upload.array('attachments', 10), async (req, res) => {
  try {
    const noteData = {
      ...req.body,
      userId: req.user.id
    };
    
    // Check if note number already exists
    if (noteData.noteNumber) {
      const existingNote = await CreditDebitNote.findOne({ noteNumber: noteData.noteNumber });
      if (existingNote) {
        return res.status(400).json({ message: 'Note number already exists' });
      }
    }
    
    // Parse JSON fields that were stringified in FormData
    if (typeof noteData.items === 'string') {
      noteData.items = JSON.parse(noteData.items);
    }
    
    // Clean up empty/invalid fields
    Object.keys(noteData).forEach(key => {
      if (noteData[key] === '' || noteData[key] === 'undefined') {
        delete noteData[key];
      }
    });
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      noteData.attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/credit-debit-notes/${file.filename}`,
        fileSize: file.size,
        uploadedAt: new Date()
      }));
    }
    
    const note = new CreditDebitNote(noteData);
    await note.save();
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating credit/debit note:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Note number already exists', error: error.message });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', error: error.message });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update credit/debit note
router.put('/:id', auth, upload.array('attachments', 10), async (req, res) => {
  try {
    const existingNote = await CreditDebitNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if note number is being changed and if it already exists
    if (req.body.noteNumber && req.body.noteNumber !== existingNote.noteNumber) {
      const duplicateNote = await CreditDebitNote.findOne({ noteNumber: req.body.noteNumber });
      if (duplicateNote) {
        return res.status(400).json({ message: 'Note number already exists' });
      }
    }
    
    const updateData = { ...req.body };
    
    // Parse JSON fields that were stringified in FormData
    if (typeof updateData.items === 'string') {
      updateData.items = JSON.parse(updateData.items);
    }
    
    // Clean up empty/invalid fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === 'undefined') {
        delete updateData[key];
      }
    });
    
    // Handle file uploads and existing attachments
    let finalAttachments = [];
    
    // Parse existing attachments if provided
    if (updateData.existingAttachments) {
      try {
        const existingAttachments = JSON.parse(updateData.existingAttachments);
        finalAttachments = existingAttachments.map(att => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl.replace('http://localhost:5001', ''), // Remove base URL
          fileSize: att.fileSize,
          uploadedAt: att.uploadedAt
        }));
      } catch (e) {
        console.error('Error parsing existing attachments:', e);
      }
      delete updateData.existingAttachments;
    }
    
    // Add new file uploads
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/credit-debit-notes/${file.filename}`,
        fileSize: file.size,
        uploadedAt: new Date()
      }));
      
      finalAttachments = [...finalAttachments, ...newAttachments];
    }
    
    updateData.attachments = finalAttachments;
    
    const note = await CreditDebitNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true }
    );
    
    res.json(note);
  } catch (error) {
    console.error('Error updating credit/debit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete credit/debit note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await CreditDebitNote.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit/debit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single credit/debit note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await CreditDebitNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching credit/debit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download attachment
router.get('/download/:filename', auth, (req, res) => {
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
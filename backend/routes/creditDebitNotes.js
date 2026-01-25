const express = require('express');
const router = express.Router();
const CreditDebitNote = require('../models/CreditDebitNote');
const auth = require('../middleware/auth');

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
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    const noteData = {
      ...req.body,
      userId: req.user.id
    };
    
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
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await CreditDebitNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
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

module.exports = router;
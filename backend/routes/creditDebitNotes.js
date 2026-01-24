const express = require('express');
const router = express.Router();
const CreditDebitNote = require('../models/CreditDebitNote');
const auth = require('../middleware/auth');

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
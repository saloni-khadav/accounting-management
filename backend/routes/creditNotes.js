const express = require('express');
const router = express.Router();
const CreditNote = require('../models/CreditNote');
const auth = require('../middleware/auth');

// Get all credit notes
router.get('/', auth, async (req, res) => {
  try {
    const creditNotes = await CreditNote.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(creditNotes);
  } catch (error) {
    console.error('Error fetching credit notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new credit note
router.post('/', auth, async (req, res) => {
  try {
    // Generate credit note number if not provided
    let creditNoteNumber = req.body.creditNoteNumber;
    
    if (!creditNoteNumber) {
      const lastCreditNote = await CreditNote.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select('creditNoteNumber');
      
      if (lastCreditNote && lastCreditNote.creditNoteNumber) {
        const match = lastCreditNote.creditNoteNumber.match(/CN-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          creditNoteNumber = `CN-${String(nextNumber).padStart(5, '0')}`;
        } else {
          creditNoteNumber = 'CN-00001';
        }
      } else {
        creditNoteNumber = 'CN-00001';
      }
    }
    
    const creditNoteData = {
      ...req.body,
      creditNoteNumber,
      userId: req.user.id
    };
    
    const creditNote = new CreditNote(creditNoteData);
    await creditNote.save();
    
    res.status(201).json(creditNote);
  } catch (error) {
    console.error('Error creating credit note:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Credit note number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update credit note
router.put('/:id', auth, async (req, res) => {
  try {
    const creditNote = await CreditNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    res.json(creditNote);
  } catch (error) {
    console.error('Error updating credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete credit note
router.delete('/:id', auth, async (req, res) => {
  try {
    const creditNote = await CreditNote.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    res.json({ message: 'Credit note deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single credit note
router.get('/:id', auth, async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    res.json(creditNote);
  } catch (error) {
    console.error('Error fetching credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
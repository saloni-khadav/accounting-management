const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    
    const bills = await Bill.find(query).sort({ billDate: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    const bill = new Bill(req.body);
    const savedBill = await bill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update bill status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve or reject bill
router.patch('/:id/approval', async (req, res) => {
  try {
    const { action } = req.body;
    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    const status = action === 'approve' ? 'Pending' : 'Cancelled';
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { approvalStatus, status },
      { new: true }
    );
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

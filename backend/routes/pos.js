const express = require('express');
const PO = require('../models/PO');
const router = express.Router();

// Generate next PO number
router.get('/next-number', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    // Find the last PO for this year
    const lastPO = await PO.findOne({
      poNumber: { $regex: `^PO-${yearCode}-` }
    }).sort({ poNumber: -1 });
    
    let nextNumber = 1;
    if (lastPO) {
      const lastNumber = parseInt(lastPO.poNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const poNumber = `PO-${yearCode}-${nextNumber.toString().padStart(3, '0')}`;
    res.json({ poNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new PO
router.post('/', async (req, res) => {
  try {
    const po = new PO(req.body);
    const savedPO = await po.save();
    res.status(201).json(savedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all POs
router.get('/', async (req, res) => {
  try {
    const pos = await PO.find().populate('supplier').sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all POs
router.delete('/all/pos', async (req, res) => {
  try {
    const result = await PO.deleteMany({});
    res.json({ 
      message: 'All purchase orders deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get PO by ID
router.get('/:id', async (req, res) => {
  try {
    const po = await PO.findById(req.params.id).populate('supplier');
    if (!po) {
      return res.status(404).json({ message: 'PO not found' });
    }
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
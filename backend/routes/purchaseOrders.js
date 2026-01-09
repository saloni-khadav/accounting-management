const express = require('express');
const PurchaseOrder = require('../models/PurchaseOrder');
const router = express.Router();

// Create PO
router.post('/', async (req, res) => {
  try {
    const po = new PurchaseOrder(req.body);
    await po.save();
    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all POs
router.get('/', async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update PO status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectedBy } = req.body;
    
    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approvedBy = approvedBy || 'Manager';
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedBy = rejectedBy || 'Manager';
      updateData.rejectedAt = new Date();
    }
    
    const po = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
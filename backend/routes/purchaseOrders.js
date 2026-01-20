const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');

// Get next PO number
router.get('/next-po-number', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    // Find the latest PO number for current year format
    const latestPO = await PurchaseOrder.findOne({
      poNumber: { $regex: `^PO-${yearCode}-` }
    }).sort({ poNumber: -1 });
    
    let nextNumber = 1;
    if (latestPO) {
      const lastNumber = parseInt(latestPO.poNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const poNumber = `PO-${yearCode}-${nextNumber.toString().padStart(3, '0')}`;
    res.json({ poNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new purchase order
router.post('/', async (req, res) => {
  try {
    const purchaseOrder = new PurchaseOrder(req.body);
    const savedPO = await purchaseOrder.save();
    res.status(201).json(savedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get purchase order by ID
router.get('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update purchase order
router.put('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete purchase order
router.delete('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');

// Get Purchase Orders by vendor name
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const vendorName = req.params.vendorName;
    console.log('Searching Purchase Orders for vendor:', vendorName);
    
    const purchaseOrders = await PurchaseOrder.find({ 
      $or: [
        { supplier: { $regex: vendorName, $options: 'i' } },
        { supplier: vendorName }
      ],
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    }).select('poNumber supplier poDate deliveryDate items subTotal totalAmount').sort({ createdAt: -1 });
    
    console.log('Found Purchase Orders:', purchaseOrders.length);
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching Purchase Orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get available POs with remaining amounts
router.get('/available', async (req, res) => {
  try {
    // Get all approved purchase orders
    const approvedPOs = await PurchaseOrder.find({
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    }).sort({ createdAt: -1 });
    
    // Get all approved bills
    const approvedBills = await Bill.find({
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    });
    
    // Calculate remaining amounts for each PO
    const availablePOs = approvedPOs.map(po => {
      // Find all bills that reference this PO
      const relatedBills = approvedBills.filter(bill => 
        bill.referenceNumber === po.poNumber
      );
      
      // Calculate total used amount from approved bills
      const usedAmount = relatedBills.reduce((sum, bill) => {
        return sum + (bill.grandTotal || 0);
      }, 0);
      
      const remainingAmount = (po.totalAmount || 0) - usedAmount;
      
      return {
        ...po.toObject(),
        usedAmount,
        remainingAmount,
        isFullyUsed: remainingAmount <= 0
      };
    }).filter(po => !po.isFullyUsed); // Only return POs with remaining amount
    
    res.json(availablePOs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
router.post('/', auth, checkPeriodPermission('Purchase Orders'), async (req, res) => {
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
router.put('/:id', auth, checkPeriodPermission('Purchase Orders'), async (req, res) => {
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

// Delete all purchase orders
router.delete('/all/purchase-orders', async (req, res) => {
  try {
    const result = await PurchaseOrder.deleteMany({});
    res.json({ 
      message: 'All purchase orders deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
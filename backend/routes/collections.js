const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { notifyPaymentReceived } = require('../utils/notificationHelper');
const Invoice = require('../models/Invoice');
const CreditNote = require('../models/CreditNote');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');

// Helper function to update invoice status
const updateInvoiceStatus = async (invoiceNumber) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      console.log(`Invoice ${invoiceNumber} not found`);
      return;
    }

    // Get all approved collections for this invoice
    const collections = await Collection.find({ 
      invoiceNumber: { $regex: new RegExp(invoiceNumber, 'i') },
      approvalStatus: 'Approved'
    });
    
    // Get all approved credit notes for this invoice
    const creditNotes = await CreditNote.find({ 
      originalInvoiceNumber: invoiceNumber,
      approvalStatus: 'Approved'
    });

    // Calculate total collected and credited amounts
    const totalCollected = collections.reduce((sum, col) => sum + (parseFloat(col.netAmount) || 0), 0);
    const totalCredited = creditNotes.reduce((sum, cn) => sum + (parseFloat(cn.grandTotal) || 0), 0);
    const totalReceived = totalCollected + totalCredited;

    // Update invoice status based on received amount
    const grandTotal = parseFloat(invoice.grandTotal) || 0;
    let newStatus = 'Not Received';
    
    if (totalReceived >= grandTotal - 0.01) { // Small tolerance for floating point
      newStatus = 'Fully Received';
    } else if (totalReceived > 0) {
      newStatus = 'Partially Received';
    }

    console.log(`Invoice ${invoiceNumber}: Total=${grandTotal}, Collected=${totalCollected}, Credited=${totalCredited}, NewStatus=${newStatus}`);

    if (invoice.status !== newStatus) {
      invoice.status = newStatus;
      await invoice.save();
      console.log(`Invoice ${invoiceNumber} status updated to ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
};

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().sort({ collectionDate: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create collection
router.post('/', auth, checkPeriodPermission('Collections'), async (req, res) => {
  try {
    const collection = new Collection(req.body);
    const savedCollection = await collection.save();
    
    // Create notification for payment received
    if (req.user && req.user.id) {
      await notifyPaymentReceived(req.user.id, savedCollection);
    }
    
    // Update invoice status if approved
    if (savedCollection.approvalStatus === 'Approved' && savedCollection.invoiceNumber) {
      const invoiceNumbers = savedCollection.invoiceNumber.split(',').map(num => num.trim());
      for (const invNum of invoiceNumbers) {
        await updateInvoiceStatus(invNum);
      }
    }
    
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalCollections = await Collection.countDocuments({ approvalStatus: 'Approved' });
    const pendingInvoices = await Collection.countDocuments({ approvalStatus: 'Pending' });
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyCollections = await Collection.aggregate([
      { 
        $match: { 
          collectionDate: { $gte: currentMonth },
          approvalStatus: 'Approved'
        } 
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    res.json({
      totalCollections,
      pendingInvoices,
      monthlyAmount: monthlyCollections[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update approval status
router.patch('/:id/approval', async (req, res) => {
  try {
    const { approvalStatus, approvedBy, rejectionReason } = req.body;
    
    const oldCollection = await Collection.findById(req.params.id);
    if (!oldCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const updateData = {
      approvalStatus,
      approvedAt: approvalStatus === 'Approved' ? new Date() : undefined,
      rejectionReason: approvalStatus === 'Rejected' ? rejectionReason : undefined
    };
    
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }
    
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Update invoice status when approval status changes
    if (collection.invoiceNumber) {
      const invoiceNumbers = collection.invoiceNumber.split(',').map(num => num.trim());
      for (const invNum of invoiceNumbers) {
        await updateInvoiceStatus(invNum);
      }
    }
    
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update collection
router.put('/:id', auth, checkPeriodPermission('Collections'), async (req, res) => {
  try {
    const oldCollection = await Collection.findById(req.params.id);
    if (!oldCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Update invoice status for both old and new invoice numbers
    const oldInvoiceNumbers = oldCollection.invoiceNumber ? oldCollection.invoiceNumber.split(',').map(num => num.trim()) : [];
    const newInvoiceNumbers = collection.invoiceNumber ? collection.invoiceNumber.split(',').map(num => num.trim()) : [];
    
    const allInvoiceNumbers = [...new Set([...oldInvoiceNumbers, ...newInvoiceNumbers])];
    
    for (const invNum of allInvoiceNumbers) {
      await updateInvoiceStatus(invNum);
    }
    
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const invoiceNumbers = collection.invoiceNumber ? collection.invoiceNumber.split(',').map(num => num.trim()) : [];
    const wasApproved = collection.approvalStatus === 'Approved';
    
    await Collection.findByIdAndDelete(req.params.id);
    
    // Update invoice status if collection was approved
    if (wasApproved) {
      for (const invNum of invoiceNumbers) {
        await updateInvoiceStatus(invNum);
      }
    }
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


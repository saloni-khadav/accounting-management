const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const PO = require('../models/PO');
const Client = require('../models/Client');

const router = express.Router();

// Middleware to check if user is manager
const requireManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'manager') {
      return res.status(403).json({ message: 'Manager access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending approvals (Manager only)
router.get('/pending', auth, requireManager, async (req, res) => {
  try {
    const pendingApprovals = [];
    
    // Get pending invoices
    const pendingInvoices = await Invoice.find({ status: 'Draft' })
      .select('invoiceNumber customerName grandTotal createdAt createdBy')
      .limit(10)
      .sort({ createdAt: -1 });
    
    pendingInvoices.forEach(invoice => {
      pendingApprovals.push({
        id: invoice._id,
        type: 'Invoice',
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
        amount: `₹${invoice.grandTotal.toLocaleString()}`,
        requestedBy: invoice.createdBy || 'System',
        requestDate: invoice.createdAt.toISOString().split('T')[0],
        status: 'pending'
      });
    });
    
    // Get pending POs
    const pendingPOs = await PO.find({ status: 'Draft' })
      .populate('supplier', 'name')
      .select('poNumber supplierName totalAmount createdAt')
      .limit(10)
      .sort({ createdAt: -1 });
    
    pendingPOs.forEach(po => {
      pendingApprovals.push({
        id: po._id,
        type: 'Purchase Order',
        description: `PO ${po.poNumber} - ${po.supplierName}`,
        amount: `₹${po.totalAmount.toLocaleString()}`,
        requestedBy: 'Purchase Team',
        requestDate: po.createdAt.toISOString().split('T')[0],
        status: 'pending'
      });
    });
    
    // Get high-value clients for approval
    const highValueClients = await Client.find({ 
      $or: [
        { creditLimit: { $gt: 100000 } },
        { outstandingAmount: { $gt: 50000 } }
      ]
    })
    .select('name creditLimit outstandingAmount createdAt')
    .limit(5)
    .sort({ createdAt: -1 });
    
    highValueClients.forEach(client => {
      pendingApprovals.push({
        id: client._id,
        type: 'Client Approval',
        description: `High-value client: ${client.name}`,
        amount: `Credit: ₹${client.creditLimit?.toLocaleString() || 0}`,
        requestedBy: 'Sales Team',
        requestDate: client.createdAt.toISOString().split('T')[0],
        status: 'pending'
      });
    });
    
    res.json({ approvals: pendingApprovals });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject item (Manager only)
router.post('/action', auth, requireManager, async (req, res) => {
  try {
    const { itemId, action } = req.body; // action: 'approve' or 'reject'
    
    // Mock response - replace with actual database update
    res.json({ 
      message: `Item ${action}d successfully`,
      itemId,
      action
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
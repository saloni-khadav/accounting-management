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
    const pendingInvoices = await Invoice.find({ status: { $in: ['Draft', 'Approved', 'Rejected'] } })
      .select('invoiceNumber customerName grandTotal createdAt createdBy status')
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
        status: invoice.status === 'Draft' ? 'pending' : invoice.status.toLowerCase()
      });
    });
    
    // Get pending POs
    const pendingPOs = await PO.find({ status: { $in: ['Draft', 'Approved', 'Rejected'] } })
      .populate('supplier', 'name')
      .select('poNumber supplierName totalAmount createdAt status')
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
        status: po.status === 'Draft' ? 'pending' : po.status.toLowerCase()
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
        status: client.approvalStatus ? client.approvalStatus.toLowerCase() : 'pending'
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
    const { itemId, action, type, rejectionReason } = req.body;
    
    let updateResult;
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    
    // Update based on item type
    if (type === 'Invoice') {
      const updateData = {
        status: newStatus,
        updatedBy: req.user._id,
        updatedAt: new Date()
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await Invoice.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Purchase Order') {
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await PO.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Client Approval') {
      const updateData = {
        approvalStatus: newStatus,
        updatedAt: new Date()
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await Client.findByIdAndUpdate(itemId, updateData, { new: true });
    }
    
    if (!updateResult) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ 
      message: `Item ${action}d successfully`,
      itemId,
      action,
      newStatus,
      success: true
    });
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own requests and their status
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRequests = [];
    
    // Get user's invoices
    const userInvoices = await Invoice.find({ createdBy: userId })
      .select('invoiceNumber customerName grandTotal createdAt status rejectionReason')
      .sort({ createdAt: -1 });
    
    userInvoices.forEach(invoice => {
      userRequests.push({
        id: invoice._id,
        type: 'Invoice',
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
        amount: `₹${invoice.grandTotal.toLocaleString()}`,
        requestDate: invoice.createdAt.toISOString().split('T')[0],
        status: invoice.status || 'Draft',
        rejectionReason: invoice.rejectionReason || null
      });
    });
    
    // Get user's POs (if they created any)
    const userPOs = await PO.find({ createdBy: userId })
      .select('poNumber supplierName totalAmount createdAt status rejectionReason')
      .sort({ createdAt: -1 });
    
    userPOs.forEach(po => {
      userRequests.push({
        id: po._id,
        type: 'Purchase Order',
        description: `PO ${po.poNumber} - ${po.supplierName}`,
        amount: `₹${po.totalAmount.toLocaleString()}`,
        requestDate: po.createdAt.toISOString().split('T')[0],
        status: po.status || 'Draft',
        rejectionReason: po.rejectionReason || null
      });
    });
    
    res.json({ requests: userRequests });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rejection reason for specific item
router.get('/rejection-reason/:itemId/:type', auth, async (req, res) => {
  try {
    const { itemId, type } = req.params;
    let item;
    
    if (type === 'Invoice') {
      item = await Invoice.findById(itemId).select('rejectionReason');
    } else if (type === 'Purchase Order') {
      item = await PO.findById(itemId).select('rejectionReason');
    } else if (type === 'Client Approval') {
      item = await Client.findById(itemId).select('rejectionReason');
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ rejectionReason: item.rejectionReason || 'No reason provided' });
  } catch (error) {
    console.error('Error fetching rejection reason:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
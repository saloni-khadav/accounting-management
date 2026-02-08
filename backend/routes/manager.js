const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const PO = require('../models/PO');
const PurchaseOrder = require('../models/PurchaseOrder');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const CreditDebitNote = require('../models/CreditDebitNote');

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
    const pendingInvoices = await Invoice.find({ approvalStatus: 'Pending' })
      .select('invoiceNumber customerName grandTotal createdAt createdBy status approvalStatus reminderSent approvedAt rejectedAt')
      .limit(10)
      .sort({ createdAt: -1 });
    
    console.log('Pending Invoices:', pendingInvoices.length);
    
    pendingInvoices.forEach(invoice => {
      pendingApprovals.push({
        id: invoice._id,
        type: 'Tax Invoice',
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
        amount: `₹${invoice.grandTotal.toLocaleString()}`,
        requestedBy: invoice.createdBy || 'System',
        requestDate: invoice.createdAt.toISOString().split('T')[0],
        status: 'pending',
        reminderSent: invoice.reminderSent || false,
        approvedAt: invoice.approvedAt ? invoice.approvedAt.toISOString().split('T')[0] : null,
        rejectedAt: invoice.rejectedAt ? invoice.rejectedAt.toISOString().split('T')[0] : null
      });
    });
    
    // Get pending POs (both models)
    const pendingPOs = await PO.find({ 
      $or: [
        { status: 'Draft' },
        { status: 'Pending Approval' },
        { approvalStatus: 'pending' }
      ]
    })
      .populate('supplier', 'name')
      .select('poNumber supplierName totalAmount createdAt status approvalStatus reminderSent approvedAt rejectedAt createdBy')
      .limit(10)
      .sort({ createdAt: -1 });
    
    // Get pending Purchase Orders
    const pendingPurchaseOrders = await PurchaseOrder.find({ approvalStatus: 'pending' })
      .select('poNumber supplier totalAmount createdAt status approvalStatus reminderSent createdBy')
      .limit(10)
      .sort({ createdAt: -1 });
    
    console.log('Pending POs:', pendingPOs.length);
    console.log('Pending Purchase Orders:', pendingPurchaseOrders.length);
    
    pendingPOs.forEach(po => {
      pendingApprovals.push({
        id: po._id,
        type: 'Proforma Invoice',
        description: `Proforma Invoice ${po.poNumber} - ${po.supplierName}`,
        amount: `₹${po.totalAmount.toLocaleString()}`,
        requestedBy: po.createdBy || 'User',
        requestDate: po.createdAt.toISOString().split('T')[0],
        status: po.approvalStatus === 'pending' || po.status === 'Pending Approval' ? 'pending' : po.status.toLowerCase(),
        reminderSent: po.reminderSent || false,
        approvedAt: po.approvedAt ? po.approvedAt.toISOString().split('T')[0] : null,
        rejectedAt: po.rejectedAt ? po.rejectedAt.toISOString().split('T')[0] : null
      });
    });
    
    pendingPurchaseOrders.forEach(po => {
      pendingApprovals.push({
        id: po._id,
        type: 'Purchase Order',
        description: `PO ${po.poNumber} - ${po.supplier}`,
        amount: `₹${po.totalAmount.toLocaleString()}`,
        requestedBy: po.createdBy || 'User',
        requestDate: po.createdAt.toISOString().split('T')[0],
        status: 'pending',
        reminderSent: false
      });
    });
    
    // Get pending Bills
    const pendingBills = await Bill.find({ approvalStatus: 'pending' })
      .select('billNumber vendorName grandTotal tdsAmount createdAt approvalStatus reminderSent')
      .limit(10)
      .sort({ createdAt: -1 });
    
    console.log('Pending Bills:', pendingBills.length);
    
    pendingBills.forEach(bill => {
      const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
      pendingApprovals.push({
        id: bill._id,
        type: 'Bill',
        description: `Bill ${bill.billNumber} - ${bill.vendorName}`,
        amount: `₹${netPayable.toLocaleString()}`,
        requestedBy: 'Accounts Team',
        requestDate: bill.createdAt.toISOString().split('T')[0],
        status: 'pending',
        reminderSent: bill.reminderSent || false
      });
    });
    
    // Get pending Payments
    const pendingPayments = await Payment.find({ approvalStatus: 'pending' })
      .select('paymentNumber vendor netAmount createdAt approvalStatus reminderSent createdBy')
      .limit(10)
      .sort({ createdAt: -1 });
    
    console.log('Pending Payments:', pendingPayments.length);
    
    pendingPayments.forEach(payment => {
      pendingApprovals.push({
        id: payment._id,
        type: 'Payment',
        description: `Payment ${payment.paymentNumber} - ${payment.vendor}`,
        amount: `₹${payment.netAmount.toLocaleString()}`,
        requestedBy: payment.createdBy || 'User',
        requestDate: payment.createdAt.toISOString().split('T')[0],
        status: 'pending',
        reminderSent: payment.reminderSent || false
      });
    });
    
    // Get pending Credit/Debit Notes
    const pendingCreditDebitNotes = await CreditDebitNote.find({ approvalStatus: 'pending' })
      .select('noteNumber type vendorName grandTotal tdsAmount createdAt approvalStatus reminderSent createdBy')
      .limit(10)
      .sort({ createdAt: -1 });
    
    console.log('Pending Credit/Debit Notes:', pendingCreditDebitNotes.length);
    
    pendingCreditDebitNotes.forEach(note => {
      const netAmount = (note.grandTotal || 0) - (note.tdsAmount || 0);
      pendingApprovals.push({
        id: note._id,
        type: note.type,
        description: `${note.type} ${note.noteNumber} - ${note.vendorName}`,
        amount: `₹${netAmount.toLocaleString()}`,
        requestedBy: note.createdBy || 'User',
        requestDate: note.createdAt.toISOString().split('T')[0],
        status: 'pending',
        reminderSent: note.reminderSent || false
      });
    });
    
    console.log('Total Pending Approvals:', pendingApprovals.length);
    
    // Sort by request date (newest first)
    pendingApprovals.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
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
    if (type === 'Tax Invoice') {
      const updateData = {
        approvalStatus: action === 'approve' ? 'Approved' : 'Rejected',
        updatedBy: req.user._id,
        updatedAt: new Date(),
        reminderSent: false
      };
      if (action === 'approve') {
        updateData.approvedAt = new Date();
      } else if (action === 'reject') {
        updateData.rejectedAt = new Date();
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
      }
      updateResult = await Invoice.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Invoice') {
      const updateData = {
        status: newStatus,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        reminderSent: false // Clear reminder when status changes
      };
      if (action === 'approve') {
        updateData.approvedAt = new Date();
      } else if (action === 'reject') {
        updateData.rejectedAt = new Date();
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
      }
      updateResult = await Invoice.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Proforma Invoice') {
      // Handle Proforma Invoice (PO model)
      updateResult = await PO.findByIdAndUpdate(itemId, {
        status: newStatus,
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: action === 'approve' ? new Date() : undefined,
        rejectedAt: action === 'reject' ? new Date() : undefined,
        rejectionReason: action === 'reject' && rejectionReason ? rejectionReason : undefined,
        reminderSent: false
      }, { new: true });
    } else if (type === 'Purchase Order') {
      // Try PurchaseOrder model first
      updateResult = await PurchaseOrder.findByIdAndUpdate(itemId, {
        status: newStatus,
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' && rejectionReason ? rejectionReason : undefined
      }, { new: true });
      
      // If not found in PurchaseOrder, try PO model
      if (!updateResult) {
        updateResult = await PO.findByIdAndUpdate(itemId, {
          status: newStatus,
          approvedAt: action === 'approve' ? new Date() : undefined,
          rejectedAt: action === 'reject' ? new Date() : undefined,
          rejectionReason: action === 'reject' && rejectionReason ? rejectionReason : undefined,
          reminderSent: false
        }, { new: true });
      }
    } else if (type === 'Bill') {
      const updateData = {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'Pending' : 'Cancelled',
        updatedAt: new Date(),
        reminderSent: false
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await Bill.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Payment') {
      const updateData = {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'Completed' : 'Rejected',
        updatedAt: new Date(),
        reminderSent: false
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await Payment.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Credit Note' || type === 'Debit Note') {
      const updateData = {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'Open' : 'Cancelled',
        updatedAt: new Date(),
        reminderSent: false
      };
      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      updateResult = await CreditDebitNote.findByIdAndUpdate(itemId, updateData, { new: true });
    } else if (type === 'Client Approval') {
      const updateData = {
        approvalStatus: newStatus,
        updatedAt: new Date(),
        reminderSent: false // Clear reminder when status changes
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
    
    // Get ALL invoices from database
    const allInvoices = await Invoice.find({})
      .select('invoiceNumber customerName grandTotal createdAt status rejectionReason reminderSent approvedAt rejectedAt')
      .sort({ createdAt: -1 });
    
    allInvoices.forEach(invoice => {
      userRequests.push({
        id: invoice._id,
        type: 'Invoice',
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
        amount: `₹${invoice.grandTotal.toLocaleString()}`,
        requestDate: invoice.createdAt.toISOString().split('T')[0],
        status: invoice.status === 'Draft' ? 'Pending' : (invoice.status || 'Pending'),
        rejectionReason: invoice.rejectionReason || null,
        reminderSent: invoice.reminderSent || false,
        approvedAt: invoice.approvedAt ? invoice.approvedAt.toISOString().split('T')[0] : null,
        rejectedAt: invoice.rejectedAt ? invoice.rejectedAt.toISOString().split('T')[0] : null
      });
    });
    
    // Get ALL POs from database
    const allPOs = await PO.find({})
      .select('poNumber supplierName totalAmount createdAt status rejectionReason reminderSent approvedAt rejectedAt')
      .sort({ createdAt: -1 });
    
    allPOs.forEach(po => {
      userRequests.push({
        id: po._id,
        type: 'Purchase Order',
        description: `PO ${po.poNumber} - ${po.supplierName}`,
        amount: `₹${po.totalAmount.toLocaleString()}`,
        requestDate: po.createdAt.toISOString().split('T')[0],
        status: po.status === 'Draft' ? 'Pending' : (po.status || 'Pending'),
        rejectionReason: po.rejectionReason || null,
        reminderSent: po.reminderSent || false,
        approvedAt: po.approvedAt ? po.approvedAt.toISOString().split('T')[0] : null,
        rejectedAt: po.rejectedAt ? po.rejectedAt.toISOString().split('T')[0] : null
      });
    });
    
    // Get ALL Bills from database
    const allBills = await Bill.find({})
      .select('billNumber vendorName grandTotal tdsAmount createdAt approvalStatus rejectionReason reminderSent')
      .sort({ createdAt: -1 });
    
    allBills.forEach(bill => {
      const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
      userRequests.push({
        id: bill._id,
        type: 'Bill',
        description: `Bill ${bill.billNumber} - ${bill.vendorName}`,
        amount: `₹${netPayable.toLocaleString()}`,
        requestDate: bill.createdAt.toISOString().split('T')[0],
        status: bill.approvalStatus === 'pending' ? 'Pending' : 
                bill.approvalStatus === 'approved' ? 'Approved' : 'Rejected',
        rejectionReason: bill.rejectionReason || null,
        reminderSent: bill.reminderSent || false
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
    } else if (type === 'Bill') {
      item = await Bill.findById(itemId).select('rejectionReason');
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

// Send reminder to manager for pending item
router.post('/send-reminder', auth, async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const userId = req.user._id;
    
    let item;
    if (type === 'Invoice') {
      item = await Invoice.findByIdAndUpdate(
        itemId, 
        { reminderSent: true, reminderSentBy: userId, reminderSentAt: new Date() },
        { new: true }
      );
    } else if (type === 'Purchase Order') {
      item = await PO.findByIdAndUpdate(
        itemId, 
        { reminderSent: true, reminderSentBy: userId, reminderSentAt: new Date() },
        { new: true }
      );
    } else if (type === 'Bill') {
      item = await Bill.findByIdAndUpdate(
        itemId, 
        { reminderSent: true, reminderSentBy: userId, reminderSentAt: new Date() },
        { new: true }
      );
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ 
      message: 'Reminder sent to manager successfully',
      success: true
    });
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
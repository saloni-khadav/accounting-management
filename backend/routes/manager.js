const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

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
    // Mock data for now - replace with actual database queries
    const pendingApprovals = [
      {
        id: 1,
        type: 'Invoice',
        description: 'Invoice #INV-2024-001 - ABC Corp',
        amount: '$5,250.00',
        requestedBy: 'John Doe',
        requestDate: '2024-01-15',
        status: 'pending'
      },
      {
        id: 2,
        type: 'Payment',
        description: 'Payment to XYZ Vendor',
        amount: '$3,800.00',
        requestedBy: 'Jane Smith',
        requestDate: '2024-01-14',
        status: 'pending'
      }
    ];
    
    res.json({ approvals: pendingApprovals });
  } catch (error) {
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
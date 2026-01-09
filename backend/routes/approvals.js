const express = require('express');
const Approval = require('../models/Approval');
const router = express.Router();

// Get all approvals
router.get('/', async (req, res) => {
  try {
    const approvals = await Approval.find().sort({ createdAt: -1 });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create approval request
router.post('/', async (req, res) => {
  try {
    const { title, type, amount, requestedBy, description } = req.body;
    
    const requestId = `REQ-${Date.now()}`;
    
    const approval = new Approval({
      requestId,
      title,
      type,
      amount,
      requestedBy,
      description
    });
    
    await approval.save();
    res.status(201).json(approval);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update approval status
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
    
    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }
    
    res.json(approval);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const totalRequests = await Approval.countDocuments();
    const pendingRequests = await Approval.countDocuments({ status: 'pending' });
    const approvedRequests = await Approval.countDocuments({ status: 'approved' });
    const rejectedRequests = await Approval.countDocuments({ status: 'rejected' });
    
    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
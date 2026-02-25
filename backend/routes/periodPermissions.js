const express = require('express');
const router = express.Router();
const PeriodPermission = require('../models/PeriodPermission');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Period permissions route working!', timestamp: new Date() });
});

// Get all users (for manager dropdown) - No auth for testing
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('fullName workEmail');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all period permissions
router.get('/', auth, async (req, res) => {
  try {
    const permissions = await PeriodPermission.find({ managerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create period permission - No auth for testing
router.post('/', async (req, res) => {
  try {
    console.log('Creating period permission:', req.body);
    
    // Find manager by email for testing
    const manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      return res.status(400).json({ message: 'No manager found' });
    }
    
    const permission = new PeriodPermission({
      managerId: manager._id,
      ...req.body
    });
    
    await permission.save();
    console.log('Permission created:', permission);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update period permission
router.put('/:id', auth, async (req, res) => {
  try {
    const permission = await PeriodPermission.findOneAndUpdate(
      { _id: req.params.id, managerId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.json(permission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete period permission
router.delete('/:id', auth, async (req, res) => {
  try {
    const permission = await PeriodPermission.findOneAndDelete({
      _id: req.params.id,
      managerId: req.user.id
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.json({ message: 'Permission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user has permission for a section and date
router.post('/check', auth, async (req, res) => {
  try {
    const { section, date } = req.body;
    const checkDate = new Date(date);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({ hasPermission: false });
    }
    
    const permission = await PeriodPermission.findOne({
      username: user.workEmail,
      section,
      isActive: true,
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate }
    });
    
    res.json({ hasPermission: !!permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

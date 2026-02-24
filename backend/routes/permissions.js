const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const getDefaultPermissions = (role) => {
  const permissions = {
    'admin': ['*'],
    'manager': ['view_notifications', 'manage_notifications', 'view_dashboard', 'view_reports', 'manage_approvals'],
    'accountant': ['view_notifications', 'manage_bills', 'manage_invoices', 'manage_payments', 'view_dashboard'],
    'user': ['view_notifications', 'view_dashboard']
  };
  return permissions[role] || permissions['user'];
};

// Add permissions to current user
router.post('/add-permissions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.permissions = getDefaultPermissions(user.role);
    await user.save();

    res.json({
      message: 'Permissions added successfully',
      permissions: user.permissions,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding permissions', error: error.message });
  }
});

// Get user permissions
router.get('/permissions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      permissions: user.permissions || [],
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permissions' });
  }
});

module.exports = router;
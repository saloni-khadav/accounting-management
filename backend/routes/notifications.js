const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Get all notifications for user
router.get('/', auth, checkPermission('view_notifications'), async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, checkPermission('view_notifications'), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark all as read
router.put('/read-all', auth, checkPermission('view_notifications'), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, checkPermission('manage_notifications'), async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create notification (for testing or system use)
router.post('/', auth, checkPermission('manage_notifications'), async (req, res) => {
  try {
    const notification = new Notification({
      userId: req.user.id,
      ...req.body
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create test notifications (for development)
router.post('/test/create', auth, checkPermission('view_notifications'), async (req, res) => {
  try {
    const testNotifications = [
      {
        userId: req.user.id,
        title: 'Payment Created',
        message: 'Payment of ₹50,000 to ABC Vendor has been created',
        type: 'payment',
        link: 'Payments'
      },
      {
        userId: req.user.id,
        title: 'Invoice Overdue',
        message: 'Invoice INV001 for XYZ Client is overdue',
        type: 'overdue',
        link: 'Invoice Management'
      },
      {
        userId: req.user.id,
        title: 'Bill Approval Required',
        message: 'Bill BILL001 from Vendor needs your approval',
        type: 'approval',
        link: 'Approvals'
      }
    ];
    
    const created = await Notification.insertMany(testNotifications);
    res.json({ message: 'Test notifications created', count: created.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

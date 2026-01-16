const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const completed = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const pending = await Payment.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    const upcoming = await Payment.aggregate([
      { $match: { status: 'Upcoming' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    res.json({
      completed: completed[0]?.total || 0,
      pending: pending[0]?.total || 0,
      upcoming: upcoming[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

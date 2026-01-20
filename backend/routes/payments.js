const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');

// Function to update bill status when payment is made
const updateBillStatusOnPayment = async (billId) => {
  try {
    const bill = await Bill.findById(billId);
    if (!bill) return;
    
    // Calculate total paid amount for this bill using billId
    const payments = await Payment.find({ 
      billId: billId,
      status: 'Completed'
    });
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.netAmount, 0);
    
    // Update bill with paid amount
    bill.paidAmount = totalPaid;
    await bill.save(); // This will trigger the pre-save hook to update status
    
    console.log(`Updated bill ${bill.billNumber}: Total paid = ${totalPaid}, Status = ${bill.status}`);
  } catch (error) {
    console.error('Error updating bill status:', error);
  }
};

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
    console.log('Creating payment with data:', req.body);
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    
    console.log('Payment saved:', savedPayment);
    
    // Update bill status if billId is provided
    if (savedPayment.billId && savedPayment.status === 'Completed') {
      console.log('Updating bill status for billId:', savedPayment.billId);
      await updateBillStatusOnPayment(savedPayment.billId);
    } else {
      console.log('No billId or payment not completed:', { billId: savedPayment.billId, status: savedPayment.status });
    }
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const oldPayment = await Payment.findById(req.params.id);
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update bill status if billId is provided and status changed
    if (payment.billId && (payment.status !== oldPayment?.status || payment.netAmount !== oldPayment?.netAmount)) {
      await updateBillStatusOnPayment(payment.billId);
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

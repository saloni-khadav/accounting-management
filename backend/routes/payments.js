const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { notifyPaymentCreated, notifyPaymentApproved } = require('../utils/notificationHelper');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/payments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

// Function to update bill status when payment is made
const updateBillStatusOnPayment = async (billId) => {
  try {
    const bill = await Bill.findById(billId);
    if (!bill) return;
    
    // Calculate total paid amount for this bill using billId
    const payments = await Payment.find({ 
      billId: billId,
      approvalStatus: 'approved'
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
router.post('/', auth, upload.array('attachments', 10), checkPeriodPermission('Payments'), async (req, res) => {
  try {
    // Validate total attachment size
    if (req.files && req.files.length > 0) {
      const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (totalSize > MAX_TOTAL_SIZE) {
        // Delete uploaded files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({ 
          message: `Total attachment size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds 10MB limit` 
        });
      }
    }
    
    const paymentData = { ...req.body };
    
    // Clean up empty/invalid fields
    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] === '' || paymentData[key] === 'undefined') {
        delete paymentData[key];
      }
    });
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      paymentData.attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: `/uploads/payments/${file.filename}`,
        uploadedAt: new Date()
      }));
    }
    
    // Set createdBy from authenticated user if available
    if (req.user && req.user.id) {
      paymentData.createdBy = req.user.id;
    }
    
    const payment = new Payment(paymentData);
    const savedPayment = await payment.save();
    
    // Create notification for payment creation
    if (req.user && req.user.id) {
      await notifyPaymentCreated(req.user.id, savedPayment);
    }
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update payment approval status
router.patch('/:id/approval', async (req, res) => {
  try {
    const { action } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (action === 'approve') {
      payment.approvalStatus = 'approved';
      payment.status = 'Completed';
      
      // Create notification for payment approval
      if (req.user && req.user.id) {
        await notifyPaymentApproved(req.user.id, payment);
      }
      
      // Update bill status when payment is approved
      if (payment.billId) {
        await updateBillStatusOnPayment(payment.billId);
      }
    } else if (action === 'reject') {
      payment.approvalStatus = 'rejected';
      payment.status = 'Rejected';
    }
    
    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', auth, upload.array('attachments', 10), checkPeriodPermission('Payments'), async (req, res) => {
  try {
    const existingPayment = await Payment.findById(req.params.id);
    if (!existingPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const updateData = { ...req.body };
    
    // Clean up empty/invalid fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === 'undefined') {
        delete updateData[key];
      }
    });
    
    // Handle file attachments
    let finalAttachments = [];
    
    // Parse existingAttachments if provided (files user wants to keep)
    if (req.body.existingAttachments) {
      try {
        const existingAttachments = typeof req.body.existingAttachments === 'string' 
          ? JSON.parse(req.body.existingAttachments) 
          : req.body.existingAttachments;
        finalAttachments = existingAttachments;
      } catch (e) {
        console.error('Error parsing existingAttachments:', e);
      }
    }
    
    // Add new uploaded files
    if (req.files && req.files.length > 0) {
      // Calculate total size including existing attachments
      const existingSize = finalAttachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);
      const newFilesSize = req.files.reduce((sum, file) => sum + file.size, 0);
      const totalSize = existingSize + newFilesSize;
      const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (totalSize > MAX_TOTAL_SIZE) {
        // Delete uploaded files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({ 
          message: `Total attachment size would be ${(totalSize / (1024 * 1024)).toFixed(2)}MB. Maximum 10MB allowed. Current: ${(existingSize / (1024 * 1024)).toFixed(2)}MB` 
        });
      }
      
      const newAttachments = req.files.map(file => ({
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: `/uploads/payments/${file.filename}`,
        uploadedAt: new Date()
      }));
      
      finalAttachments = [...finalAttachments, ...newAttachments];
    }
    
    // Set final attachments array
    if (finalAttachments.length > 0) {
      updateData.attachments = finalAttachments;
    }
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Update bill status if billId is provided and status changed
    if (payment.billId && (payment.status !== existingPayment?.status || payment.netAmount !== existingPayment?.netAmount)) {
      await updateBillStatusOnPayment(payment.billId);
    }
    
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete all payments
router.delete('/all/payments', async (req, res) => {
  try {
    const result = await Payment.deleteMany({});
    res.json({ 
      message: 'All payments deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const pending = await Payment.aggregate([
      { $match: { approvalStatus: 'pending' } },
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

// Download attachment
router.get('/download/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

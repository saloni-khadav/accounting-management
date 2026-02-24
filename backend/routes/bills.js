const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const { compressFile } = require('../utils/fileCompressor');
const { notifyBillCreated, notifyBillApprovalPending } = require('../utils/notificationHelper');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/bills');
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
    }
  }
});

// Function to update bill status based on payments
const updateBillStatus = async (billId) => {
  try {
    const bill = await Bill.findById(billId);
    if (!bill) return;
    
    // Calculate total paid amount for this bill
    const payments = await Payment.find({ 
      billId: billId,
      status: 'Completed'
    });
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.netAmount, 0);
    
    // Update bill with paid amount
    bill.paidAmount = totalPaid;
    await bill.save(); // This will trigger the pre-save hook to update status
  } catch (error) {
    console.error('Error updating bill status:', error);
  }
};

// Function to update all bill statuses based on due dates
const updateAllBillStatuses = async () => {
  try {
    const bills = await Bill.find({ 
      status: { $nin: ['Draft', 'Cancelled', 'Fully Paid'] }
    });
    
    for (const bill of bills) {
      await updateBillStatus(bill._id);
    }
  } catch (error) {
    console.error('Error updating all bill statuses:', error);
  }
};

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, vendorName } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (vendorName) {
      query.vendorName = { $regex: vendorName, $options: 'i' };
    }
    
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    
    // Update all bill statuses before returning
    await updateAllBillStatuses();
    
    const bills = await Bill.find(query).sort({ billDate: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download attachment (move this before /:id route)
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

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create bill
router.post('/', auth, checkPeriodPermission('Bills'), upload.array('attachments', 10), async (req, res) => {
  console.log('📥 Bill POST request received');
  console.log('📥 Files received:', req.files?.length || 0);
  if (req.files && req.files.length > 0) {
    console.log('📥 File details:', req.files.map(f => ({
      original: f.originalname,
      saved: f.filename,
      path: f.path,
      size: f.size
    })));
  }
  try {
    const billData = { ...req.body };
    
    // Check if bill number already exists
    if (billData.billNumber) {
      const existingBill = await Bill.findOne({ billNumber: billData.billNumber });
      if (existingBill) {
        return res.status(400).json({ message: 'Bill number already exists' });
      }
    }
    
    // Parse JSON fields that were stringified in FormData
    if (typeof billData.items === 'string') {
      billData.items = JSON.parse(billData.items);
    }
    
    // Convert numeric fields from strings to numbers
    const numericFields = ['subtotal', 'totalDiscount', 'totalTaxableValue', 'totalCGST', 'totalSGST', 'totalIGST', 'totalCESS', 'totalTax', 'grandTotal', 'tdsPercentage', 'tdsAmount'];
    numericFields.forEach(field => {
      if (billData[field] !== undefined && billData[field] !== '') {
        billData[field] = Number(billData[field]);
      }
    });
    
    // Clean up empty/invalid fields
    Object.keys(billData).forEach(key => {
      if (billData[key] === '' || billData[key] === 'undefined') {
        delete billData[key];
      }
    });
    
    // Handle file uploads with compression
    if (req.files && req.files.length > 0) {
      console.log('📥 Processing', req.files.length, 'files...');
      const processedFiles = [];
      
      for (const file of req.files) {
        console.log('📥 Processing file:', file.originalname, 'at', file.path);
        try {
          await compressFile(file.path);
          const stats = fs.statSync(file.path);
          console.log('✅ File compressed and saved:', file.filename, 'size:', stats.size);
          processedFiles.push({
            fileName: file.originalname,
            fileUrl: file.filename,
            fileSize: stats.size
          });
        } catch (error) {
          console.error('❌ Compression failed:', error);
          processedFiles.push({
            fileName: file.originalname,
            fileUrl: file.filename,
            fileSize: file.size
          });
        }
      }
      
      console.log('📥 Total processed files:', processedFiles.length);
      billData.attachments = processedFiles;
    }
    
    const bill = new Bill(billData);
    const savedBill = await bill.save();
    
    // Create notification for bill creation
    if (req.user && req.user.id) {
      await notifyBillCreated(req.user.id, savedBill);
      
      // If bill needs approval, notify manager
      if (savedBill.approvalStatus === 'pending') {
        // Get all managers and notify them
        const User = require('../models/User');
        const managers = await User.find({ role: 'manager' });
        for (const manager of managers) {
          await notifyBillApprovalPending(manager._id, savedBill);
        }
      }
    }
    
    res.status(201).json(savedBill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update bill
router.put('/:id', auth, checkPeriodPermission('Bills'), upload.array('attachments', 10), async (req, res) => {
  try {
    const existingBill = await Bill.findById(req.params.id);
    if (!existingBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Check if bill number is being changed and if it already exists
    if (req.body.billNumber && req.body.billNumber !== existingBill.billNumber) {
      const duplicateBill = await Bill.findOne({ billNumber: req.body.billNumber });
      if (duplicateBill) {
        return res.status(400).json({ message: 'Bill number already exists' });
      }
    }
    
    const updateData = {
      ...req.body,
      status: req.body.status || existingBill.status,
      approvalStatus: req.body.approvalStatus || existingBill.approvalStatus,
      paidAmount: existingBill.paidAmount
    };
    
    // Parse JSON fields that were stringified in FormData
    if (typeof updateData.items === 'string') {
      updateData.items = JSON.parse(updateData.items);
    }
    
    // Convert numeric fields from strings to numbers
    const numericFields = ['subtotal', 'totalDiscount', 'totalTaxableValue', 'totalCGST', 'totalSGST', 'totalIGST', 'totalCESS', 'totalTax', 'grandTotal', 'tdsPercentage', 'tdsAmount'];
    numericFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        updateData[field] = Number(updateData[field]);
      }
    });
    
    // Clean up empty/invalid fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === 'undefined') {
        delete updateData[key];
      }
    });
    
    // Handle attachments - preserve existing and add new
    let allAttachments = [];
    
    // Get existing attachments from request
    if (req.body.existingAttachments) {
      try {
        const existingAttachments = JSON.parse(req.body.existingAttachments);
        allAttachments = [...existingAttachments];
      } catch (error) {
        console.error('Error parsing existing attachments:', error);
      }
    }
    
    // Handle new file uploads with compression
    if (req.files && req.files.length > 0) {
      const processedFiles = [];
      
      for (const file of req.files) {
        try {
          await compressFile(file.path);
          const stats = fs.statSync(file.path);
          processedFiles.push({
            fileName: file.originalname,
            fileUrl: file.filename,
            fileSize: stats.size
          });
        } catch (error) {
          console.error('Compression failed:', error);
          processedFiles.push({
            fileName: file.originalname,
            fileUrl: file.filename,
            fileSize: file.size
          });
        }
      }
      
      allAttachments = [...allAttachments, ...processedFiles];
    }
    
    updateData.attachments = allAttachments;
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update bill status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve or reject bill
router.patch('/:id/approval', async (req, res) => {
  try {
    const { action } = req.body;
    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    
    let updateData = { approvalStatus };
    
    if (action === 'approve') {
      // When approved, set status to 'Not Paid' and let pre-save hook determine correct status
      updateData.status = 'Not Paid';
    } else {
      updateData.status = 'Cancelled';
    }
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // If approved, save again to trigger pre-save hook for status calculation
    if (action === 'approve') {
      await bill.save();
    }
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export the updateBillStatus function for use in payments route
router.updateBillStatus = updateBillStatus;

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/invoices';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
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

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, customer } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (customer) query.customerName = { $regex: customer, $options: 'i' };
    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const invoices = await Invoice.find(query).sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new invoice
router.post('/', upload.array('attachments', 10), async (req, res) => {
  try {
    const invoiceData = { ...req.body };
    
    // Parse JSON fields
    if (typeof invoiceData.items === 'string') {
      invoiceData.items = JSON.parse(invoiceData.items);
    }
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      invoiceData.attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: `/uploads/invoices/${file.filename}`,
        uploadedAt: new Date()
      }));
    }
    
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Invoice number already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update invoice
router.put('/:id', upload.array('attachments', 10), async (req, res) => {
  try {
    const invoiceData = { ...req.body };
    
    // Parse JSON fields
    if (typeof invoiceData.items === 'string') {
      invoiceData.items = JSON.parse(invoiceData.items);
    }
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: `/uploads/invoices/${file.filename}`,
        uploadedAt: new Date()
      }));
      
      // Merge with existing attachments
      const existingInvoice = await Invoice.findById(req.params.id);
      invoiceData.attachments = [...(existingInvoice.attachments || []), ...newAttachments];
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      invoiceData,
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search invoices
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const invoices = await Invoice.find({
      $or: [
        { invoiceNumber: { $regex: searchTerm, $options: 'i' } },
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { referenceNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get invoice statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' }
        }
      }
    ]);
    
    const totalInvoices = await Invoice.countDocuments();
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: { $in: ['Sent', 'Paid'] } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    
    res.json({
      totalInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Not Received', 'Partially Received', 'Fully Received'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice approval status
router.patch('/:id/approval', async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    
    if (!validStatuses.includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }
    
    const updateData = { approvalStatus };
    if (approvalStatus === 'Approved') {
      updateData.approvedAt = new Date();
    } else if (approvalStatus === 'Rejected') {
      updateData.rejectedAt = new Date();
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate next invoice number
router.get('/utils/next-number', async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    let nextNumber = 'INV001';
    
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.replace('INV', ''));
      nextNumber = `INV${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    res.json({ nextInvoiceNumber: nextNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get debtors aging report
router.get('/reports/debtors-aging', async (req, res) => {
  try {
    const today = new Date();
    const invoices = await Invoice.find({ 
      status: { $in: ['Sent', 'Overdue'] },
      dueDate: { $exists: true }
    });

    const agingData = {};
    
    invoices.forEach(invoice => {
      const daysOverdue = Math.floor((today - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
      const customer = invoice.customerName;
      
      if (!agingData[customer]) {
        agingData[customer] = {
          customerName: customer,
          totalDue: 0,
          days1_30: 0,
          days31_60: 0,
          days61_120: 0,
          days121_180: 0,
          days180Plus: 0
        };
      }
      
      agingData[customer].totalDue += invoice.grandTotal;
      
      if (daysOverdue <= 30) {
        agingData[customer].days1_30 += invoice.grandTotal;
      } else if (daysOverdue <= 60) {
        agingData[customer].days31_60 += invoice.grandTotal;
      } else if (daysOverdue <= 120) {
        agingData[customer].days61_120 += invoice.grandTotal;
      } else if (daysOverdue <= 180) {
        agingData[customer].days121_180 += invoice.grandTotal;
      } else {
        agingData[customer].days180Plus += invoice.grandTotal;
      }
    });
    
    res.json(Object.values(agingData));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get remaining amount for an invoice
router.get('/:invoiceNumber/remaining-amount', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const Invoice = require('../models/Invoice');
    const Collection = require('../models/Collection');
    const CreditNote = require('../models/CreditNote');
    
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get all approved collections for this invoice
    const collections = await Collection.find({ 
      invoiceNumber: { $regex: invoiceNumber },
      approvalStatus: 'Approved'
    });
    
    // Get all approved credit notes for this invoice
    const creditNotes = await CreditNote.find({ 
      originalInvoiceNumber: invoiceNumber,
      approvalStatus: 'Approved'
    });

    // Calculate total collected and credited amounts
    const totalCollected = collections.reduce((sum, col) => sum + (parseFloat(col.netAmount) || 0), 0);
    const totalCredited = creditNotes.reduce((sum, cn) => sum + (parseFloat(cn.grandTotal) || 0), 0);
    const totalReceived = totalCollected + totalCredited;
    const remainingAmount = Math.max(0, invoice.grandTotal - totalReceived);

    res.json({
      invoiceNumber,
      grandTotal: invoice.grandTotal,
      totalCollected,
      totalCredited,
      totalReceived,
      remainingAmount,
      status: invoice.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
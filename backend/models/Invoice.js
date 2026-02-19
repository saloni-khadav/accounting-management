const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  hsnCode: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['Nos', 'Kg', 'Liters', 'Hours', 'Pieces', 'Meters', 'Sq.Ft'],
    default: 'Nos'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  cgstRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 28
  },
  sgstRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 28
  },
  igstRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 28
  },
  cessRate: {
    type: Number,
    default: 0,
    min: 0
  },
  cgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sgstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  igstAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  cessAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  // Invoice Details
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 16
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  invoiceSeries: {
    type: String,
    default: 'INV',
    trim: true
  },
  piNumber: {
    type: String,
    trim: true
  },
  // Legacy field for backward compatibility
  referenceNumber: {
    type: String,
    trim: true
  },
  piDate: {
    type: Date
  },
  // Legacy field for backward compatibility
  poDate: {
    type: Date
  },
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  
  // Supplier Details
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  supplierAddress: {
    type: String,
    required: true,
    trim: true
  },
  supplierGSTIN: {
    type: String,
    required: true,
    trim: true,
    maxlength: 15
  },
  supplierPAN: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10,
    uppercase: true
  },
  supplierEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  supplierPhone: {
    type: String,
    trim: true
  },
  supplierWebsite: {
    type: String,
    trim: true
  },
  
  // Customer Details
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerAddress: {
    type: String,
    required: true,
    trim: true
  },
  customerGSTIN: {
    type: String,
    trim: true,
    maxlength: 15
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactDetails: {
    type: String,
    trim: true
  },
  
  // Payment Terms
  paymentTerms: {
    type: String,
    enum: ['15 Days', '30 Days', '45 Days', '60 Days', 'Advance'],
    default: '30 Days'
  },
  dueDate: {
    type: Date
  },
  
  // Items
  items: [invoiceItemSchema],
  
  // Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTaxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  totalCGST: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSGST: {
    type: Number,
    default: 0,
    min: 0
  },
  totalIGST: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCESS: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTax: {
    type: Number,
    required: true,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Additional Details
  notes: {
    type: String,
    trim: true
  },
  termsConditions: {
    type: String,
    default: 'This is a tax invoice as per GST compliance requirements.',
    trim: true
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileSize: Number,
    fileUrl: String,
    uploadedAt: Date
  }],
  
  // E-Invoice Details
  eInvoiceIRN: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Not Received', 'Partially Received', 'Fully Received'],
    default: 'Not Received'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reminderSentAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster searches
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customerName: 'text', invoiceNumber: 'text' });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ status: 1 });

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Sync referenceNumber and piNumber
  if (this.referenceNumber && !this.piNumber) {
    this.piNumber = this.referenceNumber;
  } else if (this.piNumber && !this.referenceNumber) {
    this.referenceNumber = this.piNumber;
  }
  
  // Sync poDate and piDate for backward compatibility
  if (this.poDate && !this.piDate) {
    this.piDate = this.poDate;
  } else if (this.piDate && !this.poDate) {
    this.poDate = this.piDate;
  }
  
  // Calculate item totals
  this.items.forEach(item => {
    item.taxableValue = (item.quantity * item.unitPrice) - item.discount;
    item.cgstAmount = (item.taxableValue * item.cgstRate) / 100;
    item.sgstAmount = (item.taxableValue * item.sgstRate) / 100;
    item.igstAmount = (item.taxableValue * item.igstRate) / 100;
    item.cessAmount = (item.taxableValue * item.cessRate) / 100;
    item.totalAmount = item.taxableValue + item.cgstAmount + item.sgstAmount + item.igstAmount + item.cessAmount;
  });
  
  // Calculate invoice totals
  this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  this.totalDiscount = this.items.reduce((sum, item) => sum + item.discount, 0);
  this.totalTaxableValue = this.items.reduce((sum, item) => sum + item.taxableValue, 0);
  this.totalCGST = this.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  this.totalSGST = this.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  this.totalIGST = this.items.reduce((sum, item) => sum + item.igstAmount, 0);
  this.totalCESS = this.items.reduce((sum, item) => sum + item.cessAmount, 0);
  this.totalTax = this.totalCGST + this.totalSGST + this.totalIGST + this.totalCESS;
  this.grandTotal = this.totalTaxableValue + this.totalTax;
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
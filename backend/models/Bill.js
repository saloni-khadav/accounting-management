const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
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
    enum: ['Nos', 'Kg', 'Liters', 'Hours', 'Pieces'],
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

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  billDate: {
    type: Date,
    required: true
  },
  billSeries: {
    type: String,
    default: 'BILL',
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  
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
    maxlength: 10
  },
  
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  vendorAddress: {
    type: String,
    required: true,
    trim: true
  },
  vendorGSTIN: {
    type: String,
    trim: true,
    maxlength: 15
  },
  vendorPAN: {
    type: String,
    trim: true,
    maxlength: 10
  },
  vendorPlace: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactDetails: {
    type: String,
    trim: true
  },
  
  paymentTerms: {
    type: String,
    enum: ['15 Days', '30 Days', '45 Days', '60 Days', 'Advance'],
    default: '30 Days'
  },
  dueDate: {
    type: Date
  },
  
  tdsSection: {
    type: String,
    trim: true
  },
  tdsPercentage: {
    type: Number,
    default: 0,
    min: 0
  },
  tdsAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  items: [billItemSchema],
  
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
  
  notes: {
    type: String,
    trim: true
  },
  termsConditions: {
    type: String,
    default: 'This is a vendor bill as per GST compliance requirements.',
    trim: true
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Not Paid', 'Due Soon', 'Overdue', 'Partially Paid', 'Fully Paid', 'Cancelled'],
    default: 'Draft'
  },
  
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  creditNoteAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  remainingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

billSchema.index({ billNumber: 1 });
billSchema.index({ vendorName: 'text', billNumber: 'text' });
billSchema.index({ billDate: -1 });
billSchema.index({ status: 1 });

billSchema.pre('save', function(next) {
  // Only recalculate if items have changed AND calculations are not already done from frontend
  if ((this.isNew || this.isModified('items')) && (!this.grandTotal || this.grandTotal === 0)) {
    this.items.forEach(item => {
      item.taxableValue = (item.quantity * item.unitPrice) - item.discount;
      item.cgstAmount = (item.taxableValue * item.cgstRate) / 100;
      item.sgstAmount = (item.taxableValue * item.sgstRate) / 100;
      item.igstAmount = (item.taxableValue * item.igstRate) / 100;
      item.cessAmount = (item.taxableValue * item.cessRate) / 100;
      item.totalAmount = item.taxableValue + item.cgstAmount + item.sgstAmount + item.igstAmount + item.cessAmount;
    });
    
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    this.totalDiscount = this.items.reduce((sum, item) => sum + item.discount, 0);
    this.totalTaxableValue = this.items.reduce((sum, item) => sum + item.taxableValue, 0);
    this.totalCGST = this.items.reduce((sum, item) => sum + item.cgstAmount, 0);
    this.totalSGST = this.items.reduce((sum, item) => sum + item.sgstAmount, 0);
    this.totalIGST = this.items.reduce((sum, item) => sum + item.igstAmount, 0);
    this.totalCESS = this.items.reduce((sum, item) => sum + item.cessAmount, 0);
    this.totalTax = this.totalCGST + this.totalSGST + this.totalIGST + this.totalCESS;
    this.grandTotal = this.totalTaxableValue + this.totalTax;
  }
  
  // Calculate remaining amount (after TDS deduction and credit notes)
  this.remainingAmount = (this.grandTotal || 0) - (this.paidAmount || 0) - (this.creditNoteAmount || 0);
  
  // Only update status if it's not explicitly set or if it's a payment update
  if (this.isModified('paidAmount') || (!this.isModified('status') && this.status !== 'Cancelled')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.dueDate) {
      const dueDate = new Date(this.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      // Use net payable amount (grandTotal - TDS - creditNotes) for payment comparison
      const netPayable = (this.grandTotal || 0) - (this.tdsAmount || 0) - (this.creditNoteAmount || 0);
      
      if (this.paidAmount >= netPayable) {
        this.status = 'Fully Paid';
      } else if (this.paidAmount > 0) {
        this.status = 'Partially Paid';
      } else if (daysDiff < 0) {
        this.status = 'Overdue';
      } else if (daysDiff <= 7) {
        this.status = 'Due Soon';
      } else {
        this.status = 'Not Paid';
      }
    } else {
      // No due date - only check payment status
      const netPayable = (this.grandTotal || 0) - (this.tdsAmount || 0) - (this.creditNoteAmount || 0);
      
      if (this.paidAmount >= netPayable) {
        this.status = 'Fully Paid';
      } else if (this.paidAmount > 0) {
        this.status = 'Partially Paid';
      } else if (this.isNew) {
        this.status = 'Draft'; // Only set Draft for new bills
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('Bill', billSchema);

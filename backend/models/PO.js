const mongoose = require('mongoose');

const poSchema = new mongoose.Schema({
  piNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Legacy field for backward compatibility
  poNumber: {
    type: String
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  piDate: {
    type: Date,
    required: true
  },
  // Legacy field for backward compatibility
  poDate: {
    type: Date
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  gstNumber: {
    type: String
  },
  deliveryAddress: {
    type: String
  },
  items: [{
    name: String,
    hsn: String,
    quantity: Number,
    rate: Number,
    discount: Number,
    cgstRate: Number,
    sgstRate: Number,
    igstRate: Number
  }],
  subTotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  cgst: {
    type: Number,
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  igst: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending Approval'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: String
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
  }
}, {
  timestamps: true
});

// Virtual field to support both poDate and piDate
poSchema.virtual('effectiveDate').get(function() {
  return this.piDate || this.poDate;
});

// Pre-save hook to sync poNumber and piNumber, poDate and piDate
poSchema.pre('save', function(next) {
  // Sync poNumber and piNumber
  if (this.poNumber && !this.piNumber) {
    this.piNumber = this.poNumber;
  } else if (this.piNumber && !this.poNumber) {
    this.poNumber = this.piNumber;
  }
  
  // Sync poDate and piDate
  if (this.poDate && !this.piDate) {
    this.piDate = this.poDate;
  } else if (this.piDate && !this.poDate) {
    this.poDate = this.piDate;
  }
  next();
});

module.exports = mongoose.model('PO', poSchema);
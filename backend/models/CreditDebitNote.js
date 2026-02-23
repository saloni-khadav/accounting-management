const mongoose = require('mongoose');

const creditDebitNoteSchema = new mongoose.Schema({
  noteNumber: {
    type: String,
    required: true
  },
  noteDate: {
    type: Date,
    required: true
  },
  invoiceDate: Date,
  type: {
    type: String,
    enum: ['Credit Note', 'Debit Note'],
    required: true
  },
  referenceNumber: String,
  originalInvoiceNumber: String,
  originalBillNumber: String,
  reason: String,
  
  // TDS Details
  tdsSection: String,
  tdsPercentage: {
    type: Number,
    default: 0
  },
  tdsAmount: {
    type: Number,
    default: 0
  },
  
  // Vendor Details
  vendorName: {
    type: String,
    required: true
  },
  vendorAddress: String,
  vendorGSTIN: String,
  
  // Items
  items: [{
    product: String,
    description: String,
    hsnCode: String,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxableValue: {
      type: Number,
      default: 0
    },
    cgstRate: {
      type: Number,
      default: 9
    },
    sgstRate: {
      type: Number,
      default: 9
    },
    igstRate: {
      type: Number,
      default: 0
    },
    cessRate: {
      type: Number,
      default: 0
    },
    cgstAmount: {
      type: Number,
      default: 0
    },
    sgstAmount: {
      type: Number,
      default: 0
    },
    igstAmount: {
      type: Number,
      default: 0
    },
    cessAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  }],
  
  // Totals
  subtotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalTaxableValue: {
    type: Number,
    default: 0
  },
  totalCGST: {
    type: Number,
    default: 0
  },
  totalSGST: {
    type: Number,
    default: 0
  },
  totalIGST: {
    type: Number,
    default: 0
  },
  totalCESS: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  
  notes: String,
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Cancelled'],
    default: 'Open'
  },
  
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  createdBy: {
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

module.exports = mongoose.model('CreditDebitNote', creditDebitNoteSchema);
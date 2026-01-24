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
  reason: String,
  
  // Vendor Details
  vendorName: {
    type: String,
    required: true
  },
  vendorAddress: String,
  vendorGSTIN: String,
  
  // Items
  items: [{
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
    cgstRate: {
      type: Number,
      default: 9
    },
    sgstRate: {
      type: Number,
      default: 9
    },
    cgstAmount: {
      type: Number,
      default: 0
    },
    sgstAmount: {
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
  totalCGST: {
    type: Number,
    default: 0
  },
  totalSGST: {
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CreditDebitNote', creditDebitNoteSchema);
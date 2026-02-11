const mongoose = require('mongoose');

const creditNoteSchema = new mongoose.Schema({
  creditNoteNumber: {
    type: String,
    unique: true
  },
  creditNoteDate: {
    type: Date,
    required: true
  },
  referenceNumber: String,
  originalInvoiceNumber: {
    type: String,
    required: true
  },
  originalInvoiceDate: Date,
  reason: String,
  
  // Supplier Details
  supplierName: {
    type: String,
    required: true
  },
  supplierAddress: String,
  supplierGSTIN: String,
  supplierPAN: String,
  
  // Customer Details
  customerName: {
    type: String,
    required: true
  },
  customerAddress: String,
  customerGSTIN: String,
  customerPlace: String,
  
  // Items
  items: [{
    product: String,
    description: String,
    hsnCode: String,
    quantity: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      default: 'Nos'
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    discount: {
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
  totalTax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  
  // Additional Details
  notes: String,
  termsConditions: String,
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Applied', 'Cancelled'],
    default: 'Draft'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to generate credit note number
creditNoteSchema.pre('save', async function(next) {
  if (!this.creditNoteNumber) {
    const lastCreditNote = await this.constructor.findOne({ userId: this.userId })
      .sort({ createdAt: -1 })
      .select('creditNoteNumber');
    
    if (lastCreditNote && lastCreditNote.creditNoteNumber) {
      const match = lastCreditNote.creditNoteNumber.match(/CN-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        this.creditNoteNumber = `CN-${String(nextNumber).padStart(5, '0')}`;
      } else {
        this.creditNoteNumber = 'CN-00001';
      }
    } else {
      this.creditNoteNumber = 'CN-00001';
    }
  }
  next();
});

// Post-save hook to update invoice status
creditNoteSchema.post('save', async function(doc) {
  if (doc.approvalStatus === 'Approved' && doc.originalInvoiceNumber) {
    try {
      const Invoice = require('./Invoice');
      const Collection = require('./Collection');
      
      const invoice = await Invoice.findOne({ invoiceNumber: doc.originalInvoiceNumber });
      if (!invoice) return;

      const collections = await Collection.find({ 
        invoiceNumber: { $regex: doc.originalInvoiceNumber },
        approvalStatus: 'Approved'
      });
      
      const creditNotes = await this.constructor.find({ 
        originalInvoiceNumber: doc.originalInvoiceNumber,
        approvalStatus: 'Approved'
      });

      const totalCollected = collections.reduce((sum, col) => sum + (parseFloat(col.netAmount) || 0), 0);
      const totalCredited = creditNotes.reduce((sum, cn) => sum + (parseFloat(cn.grandTotal) || 0), 0);
      const totalReceived = totalCollected + totalCredited;

      const grandTotal = invoice.grandTotal || 0;
      let newStatus = 'Not Received';
      
      if (totalReceived >= grandTotal) {
        newStatus = 'Fully Received';
      } else if (totalReceived > 0) {
        newStatus = 'Partially Received';
      }

      if (invoice.status !== newStatus) {
        invoice.status = newStatus;
        await invoice.save();
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  }
});

module.exports = mongoose.model('CreditNote', creditNoteSchema);
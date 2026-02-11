const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  collectionNumber: {
    type: String,
    unique: true,
    trim: true
  },
  customer: {
    type: String,
    required: true,
    trim: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tdsSection: {
    type: String,
    trim: true
  },
  tdsPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tdsAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  netAmount: {
    type: Number,
    min: 0
  },
  collectionDate: {
    type: Date,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Online', 'Cheque', 'Bank Transfer', 'UPI', 'Cash'],
    default: 'Online'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Collected', 'Pending'],
    default: 'Collected'
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
  rejectionReason: String
}, {
  timestamps: true
});

collectionSchema.pre('save', async function(next) {
  if (!this.collectionNumber) {
    const count = await this.constructor.countDocuments();
    this.collectionNumber = `COLL-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Auto-calculate netAmount if not provided
  if (!this.netAmount) {
    this.netAmount = this.amount - (this.tdsAmount || 0);
  }
  
  next();
});

// Post-save hook to update invoice status
collectionSchema.post('save', async function(doc) {
  if (doc.approvalStatus === 'Approved' && doc.invoiceNumber) {
    try {
      const Invoice = require('./Invoice');
      const CreditNote = require('./CreditNote');
      
      const invoiceNumbers = doc.invoiceNumber.split(',').map(num => num.trim());
      
      for (const invNum of invoiceNumbers) {
        const invoice = await Invoice.findOne({ invoiceNumber: invNum });
        if (!invoice) continue;

        const collections = await this.constructor.find({ 
          invoiceNumber: { $regex: invNum },
          approvalStatus: 'Approved'
        });
        
        const creditNotes = await CreditNote.find({ 
          originalInvoiceNumber: invNum,
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
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  }
});

module.exports = mongoose.model('Collection', collectionSchema);

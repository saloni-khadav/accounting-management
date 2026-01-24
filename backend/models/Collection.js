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
  }
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

module.exports = mongoose.model('Collection', collectionSchema);

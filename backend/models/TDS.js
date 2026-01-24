const mongoose = require('mongoose');

const tdsSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  invoiceNo: {
    type: String,
    required: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  panNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  tdsSection: {
    type: String,
    required: true,
    enum: ['194C', '194J', '194Q', '194I', '194H', '194A', '194B', '194D', '194G', '194LA']
  },
  taxableValue: {
    type: Number,
    required: true,
    min: 0
  },
  tdsAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interest: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTdsPayable: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Paid', 'Payable'],
    default: 'Payable'
  },
  chalanNo: {
    type: String,
    trim: true
  },
  chalanDate: {
    type: Date
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

// Calculate total TDS payable before saving
tdsSchema.pre('save', function(next) {
  this.totalTdsPayable = this.tdsAmount + (this.interest || 0);
  next();
});

module.exports = mongoose.model('TDS', tdsSchema);
const mongoose = require('mongoose');

const poSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
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
  poDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  gstNumber: {
    type: String
  },
  items: [{
    name: String,
    hsn: String,
    quantity: Number,
    rate: Number,
    discount: Number
  }],
  subTotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Cancelled', 'Rejected'],
    default: 'Draft'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PO', poSchema);
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  supplier: {
    type: String,
    required: true
  },
  poDate: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: String,
    required: true
  },
  items: [{
    name: String,
    hsn: String,
    quantity: Number,
    rate: Number,
    discount: Number
  }],
  amount: {
    type: Number,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: String,
  rejectedBy: String,
  approvedAt: Date,
  rejectedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
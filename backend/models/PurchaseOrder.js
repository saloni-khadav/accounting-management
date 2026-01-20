const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: String,
    required: true
  },
  poDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date
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
    enum: ['Draft', 'Open', 'Completed', 'Cancelled'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
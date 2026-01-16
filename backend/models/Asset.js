const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: {
    type: String,
    required: true,
    trim: true
  },
  assetCode: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['IT Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Buildings']
  },
  subCategory: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchaseValue: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  depreciationMethod: {
    type: String,
    enum: ['straight-line', 'declining-balance', 'sum-of-years', 'units-of-production'],
    default: 'straight-line'
  },
  usefulLife: {
    type: Number,
    min: 0
  },
  salvageValue: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  warrantyPeriod: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Disposed', 'Sold'],
    default: 'Active'
  },
  currentValue: {
    type: Number,
    min: 0
  },
  accumulatedDepreciation: {
    type: Number,
    min: 0,
    default: 0
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
  }]
}, {
  timestamps: true
});

// Auto-generate asset code if not provided
assetSchema.pre('save', async function(next) {
  if (!this.assetCode) {
    const count = await this.constructor.countDocuments();
    this.assetCode = `AST${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
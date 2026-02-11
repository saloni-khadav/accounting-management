const mongoose = require('mongoose');

const depreciationHistorySchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  assetCode: {
    type: String,
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  period: {
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  openingValue: {
    type: Number,
    required: true
  },
  depreciationAmount: {
    type: Number,
    required: true
  },
  accumulatedDepreciation: {
    type: Number,
    required: true
  },
  closingValue: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['straight-line', 'declining-balance', 'sum-of-years', 'units-of-production'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique period per asset
depreciationHistorySchema.index({ assetId: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });

module.exports = mongoose.model('DepreciationHistory', depreciationHistorySchema);

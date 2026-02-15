const mongoose = require('mongoose');

const bankReconciliationSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    enum: ['collection', 'payment'],
    required: true
  },
  narration: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankReconciliation', bankReconciliationSchema);

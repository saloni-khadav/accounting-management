const mongoose = require('mongoose');

const bankStatementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankStatement', bankStatementSchema);

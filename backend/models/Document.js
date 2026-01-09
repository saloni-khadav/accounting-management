const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['GST_CERTIFICATE', 'BANK_STATEMENT', 'AADHAR_CARD'],
    required: true
  },
  extractedData: {
    gstNumber: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true
    },
    aadharNumber: {
      type: String,
      trim: true
    }
  },
  rawText: {
    type: String
  },
  status: {
    type: String,
    enum: ['AUTO_FILLED', 'VERIFIED', 'FAILED'],
    default: 'AUTO_FILLED'
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
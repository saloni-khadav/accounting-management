const mongoose = require('mongoose');

const gstSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gstNumber: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  },
  tradeName: {
    type: String,
    required: true
  },
  legalName: {
    type: String,
    required: true
  },
  panNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GST', gstSchema);
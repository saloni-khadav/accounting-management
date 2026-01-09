const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
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
  description: String,
  approvedBy: String,
  rejectedBy: String,
  approvedAt: Date,
  rejectedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Approval', approvalSchema);
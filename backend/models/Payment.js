const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    trim: true
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tdsSection: {
    type: String,
    trim: true
  },
  tdsPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tdsAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Check', 'Cash', 'Credit Card', 'UPI', 'NEFT/RTGS'],
    default: 'Bank Transfer'
  },
  bankName: {
    type: String,
    enum: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank'],
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Upcoming', 'Rejected'],
    default: 'Pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Auto-generate payment number
paymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber) {
    const count = await this.constructor.countDocuments();
    this.paymentNumber = `PYMT-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate net amount
  this.netAmount = this.amount - (this.tdsAmount || 0);
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

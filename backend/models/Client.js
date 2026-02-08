const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactDetails: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  billingAddress: {
    type: String,
    trim: true
  },
  gstNumbers: [{
    gstNumber: {
      type: String,
      trim: true,
      maxlength: 15
    },
    billingAddress: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  gstNumber: {
    type: String,
    trim: true,
    maxlength: 15
  },
  panNumber: {
    type: String,
    trim: true,
    maxlength: 10,
    uppercase: true
  },
  paymentTerms: {
    type: String,
    enum: ['15 Days', '30 Days', '45 Days', '60 Days', 'Advance', '']
  },
  creditLimit: {
    type: Number,
    min: 0
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    maxlength: 11,
    uppercase: true
  },
  bankName: {
    type: String,
    trim: true
  },
  industryType: {
    type: String,
    enum: ['Company', 'Firm', 'Partnership', 'Proprietorship', 'LLP', '']
  },
  clientCategory: {
    type: String,
    enum: ['Retail', 'Corporate', '']
  },
  contractStartDate: {
    type: Date
  },
  contractEndDate: {
    type: Date
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  accountManager: {
    type: String,
    trim: true
  },
  aadharNumber: {
    type: String,
    trim: true,
    maxlength: 12
  },
  documents: {
    panCard: {
      type: String,
      trim: true
    },
    aadharCard: {
      type: String,
      trim: true
    },
    gstCertificate: {
      type: String,
      trim: true
    },
    bankStatement: {
      type: String,
      trim: true
    },
    otherDocuments: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Index for faster searches
clientSchema.index({ clientName: 'text', clientCode: 'text' });

module.exports = mongoose.model('Client', clientSchema);
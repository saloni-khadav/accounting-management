const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vendorName: {
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
  vendorCategory: {
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
  }
}, {
  timestamps: true
});

// Index for faster searches
vendorSchema.index({ vendorName: 'text', vendorCode: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
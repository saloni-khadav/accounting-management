const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientCode: {
    type: String,
    required: true,
    unique: true,
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
    trim: true
  },
  panNumber: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    enum: ['15 Days', '30 Days', '45 Days', '60 Days', 'Advance', '']
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  bankDetails: {
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
  contractDates: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Client', clientSchema);
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  companyLogo: String,
  gstNumber: String,
  gstNumbers: [{
    gstNumber: String,
    address: String,
    tradeName: String,
    panNumber: String,
    isDefault: { type: Boolean, default: false }
  }],
  tradeName: String,
  address: String,
  panNumber: String,
  tanNumber: String,
  mcaNumber: String,
  msmeStatus: {
    type: String,
    default: 'No',
    enum: ['Yes', 'No']
  },
  msmeNumber: String,
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);

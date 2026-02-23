const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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

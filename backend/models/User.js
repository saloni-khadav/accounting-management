const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  workEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    required: true
  },
  annualTurnover: {
    type: String,
    required: true
  },
  password: {
    type: String,
    minlength: 6
  },
  isActive: {
    type: Boolean,
    default: false
  },
  passwordSetupToken: {
    type: String
  },
  passwordSetupExpire: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin', 'accountant'],
    default: 'user'
  },
  permissions: [{
    type: String
  }],
  gstDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GST'
  },
  profile: {
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
    msmeStatus: { type: String, default: 'No' },
    msmeNumber: String,
    bankAccounts: [{
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      branchName: String
    }]
  }
}, {
  timestamps: true
});

// Drop old email index if it exists
userSchema.index({ email: 1 }, { background: true, sparse: true });
userSchema.index({ workEmail: 1 }, { unique: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
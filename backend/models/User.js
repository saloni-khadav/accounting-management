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
  totalEmployees: {
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
  activationToken: {
    type: String
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
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // General Settings
  companyName: String,
  financialYear: { type: String, default: '2024-25' },
  currency: { type: String, default: 'INR' },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  numberFormat: { type: String, default: 'Indian' },
  
  // Invoice Settings
  invoicePrefix: { type: String, default: 'INV' },
  invoiceStartNumber: { type: String, default: '1' },
  autoGenerateInvoice: { type: Boolean, default: true },
  invoiceTemplate: { type: String, default: 'Standard' },
  
  // Credit Note Settings
  creditNotePrefix: { type: String, default: 'CN' },
  creditNoteStartNumber: { type: String, default: '1' },
  autoGenerateCreditNote: { type: Boolean, default: true },
  creditNoteTemplate: { type: String, default: 'Standard' },
  
  // Notification Settings
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  overdueReminders: { type: Boolean, default: true },
  paymentAlerts: { type: Boolean, default: true },
  
  // Security Settings
  twoFactorAuth: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 30 },
  passwordExpiry: { type: Number, default: 90 },
  
  // Backup Settings
  autoBackup: { type: Boolean, default: true },
  backupFrequency: { type: String, default: 'Daily' },
  backupLocation: { type: String, default: 'Cloud' },
  
  // User Permissions
  allowMultipleUsers: { type: Boolean, default: true },
  maxUsers: { type: Number, default: 5 },
  roleBasedAccess: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);

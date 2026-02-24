const mongoose = require('mongoose');

const periodPermissionSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

periodPermissionSchema.index({ username: 1, section: 1, isActive: 1 });

module.exports = mongoose.model('PeriodPermission', periodPermissionSchema);

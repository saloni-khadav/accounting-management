const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const getDefaultPermissions = (role) => {
  const permissions = {
    'admin': ['*'],
    'manager': ['view_notifications', 'manage_notifications', 'view_dashboard', 'view_reports', 'manage_approvals'],
    'accountant': ['view_notifications', 'manage_bills', 'manage_invoices', 'manage_payments', 'view_dashboard'],
    'user': ['view_notifications', 'view_dashboard']
  };
  return permissions[role] || permissions['user'];
};

const updateUserPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      if (!user.permissions || user.permissions.length === 0) {
        await User.updateOne(
          { _id: user._id },
          { $set: { permissions: getDefaultPermissions(user.role) } }
        );
        console.log(`Updated permissions for ${user.workEmail} (${user.role})`);
      }
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateUserPermissions();
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const forceAddPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('Connected to MongoDB');

    // Update ALL users with permissions
    const result = await User.updateMany(
      {},
      {
        $set: {
          permissions: ['view_notifications', 'view_dashboard', 'manage_bills', 'manage_invoices']
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with permissions`);

    // Show updated users
    const users = await User.find({}, 'workEmail role permissions').limit(5);
    console.log('Sample users:');
    users.forEach(user => {
      console.log(`${user.workEmail} (${user.role}): ${user.permissions}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

forceAddPermissions();
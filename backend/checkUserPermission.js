const mongoose = require('mongoose');
require('dotenv').config();

const PeriodPermission = require('./models/PeriodPermission');
const User = require('./models/User');

async function checkUserPermission() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('✅ Connected to MongoDB\n');

    const email = 'amishajat15@gmail.com';
    
    // Find user
    const user = await User.findOne({ workEmail: email });
    if (!user) {
      console.log(`❌ User not found with email: ${email}\n`);
      await mongoose.connection.close();
      return;
    }
    
    console.log(`👤 User Found:`);
    console.log(`  Name: ${user.fullName}`);
    console.log(`  Email: ${user.workEmail}`);
    console.log(`  Role: ${user.role}\n`);

    // Find permissions for this user
    const permissions = await PeriodPermission.find({ 
      username: user.workEmail 
    });
    
    console.log(`📊 Total Permissions for ${email}: ${permissions.length}\n`);
    
    if (permissions.length === 0) {
      console.log('❌ No permissions found for this user!\n');
      console.log('🔍 Checking all permissions in database:\n');
      
      const allPerms = await PeriodPermission.find({});
      allPerms.forEach((perm, index) => {
        console.log(`Permission ${index + 1}:`);
        console.log(`  Username: "${perm.username}"`);
        console.log(`  Section: ${perm.section}`);
        console.log(`  Active: ${perm.isActive}\n`);
      });
    } else {
      permissions.forEach((perm, index) => {
        console.log(`Permission ${index + 1}:`);
        console.log(`  Section: ${perm.section}`);
        console.log(`  Start Date: ${perm.startDate.toISOString().split('T')[0]}`);
        console.log(`  End Date: ${perm.endDate.toISOString().split('T')[0]}`);
        console.log(`  Active: ${perm.isActive ? '✅ YES' : '❌ NO'}\n`);
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserPermission();

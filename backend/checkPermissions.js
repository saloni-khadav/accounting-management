const mongoose = require('mongoose');
require('dotenv').config();

const PeriodPermission = require('./models/PeriodPermission');

async function checkPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('✅ Connected to MongoDB\n');

    const permissions = await PeriodPermission.find({});
    
    console.log(`📊 Total Permissions: ${permissions.length}\n`);
    
    if (permissions.length === 0) {
      console.log('❌ No permissions found in database!\n');
    } else {
      permissions.forEach((perm, index) => {
        console.log(`Permission ${index + 1}:`);
        console.log(`  Username: ${perm.username}`);
        console.log(`  Section: ${perm.section}`);
        console.log(`  Start Date: ${perm.startDate.toISOString().split('T')[0]}`);
        console.log(`  End Date: ${perm.endDate.toISOString().split('T')[0]}`);
        console.log(`  Active: ${perm.isActive ? '✅ YES' : '❌ NO'}`);
        console.log(`  Created: ${perm.createdAt}\n`);
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPermissions();

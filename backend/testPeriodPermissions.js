const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testPeriodPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('Connected to MongoDB');

    // Find a manager user
    const manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      console.log('No manager found. Creating one...');
      const newManager = new User({
        fullName: 'Test Manager',
        workEmail: 'manager@test.com',
        companyName: 'Test Company',
        companySize: 'Small',
        annualTurnover: '1-5 Crores',
        role: 'manager',
        isActive: true,
        password: 'password123'
      });
      await newManager.save();
      console.log('Manager created:', newManager.workEmail);
    } else {
      console.log('Manager found:', manager.workEmail);
    }

    // Find users
    const users = await User.find({ role: 'user' }).select('fullName workEmail');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.workEmail})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPeriodPermissions();
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ workEmail: 'salonijat003@gmail.com' });
    
    if (user) {
      user.password = '123456';
      user.isActive = true;
      user.fullName = 'Saloni Khadav';
      await user.save();
      
      console.log('✅ User updated!');
      console.log('Email: salonijat003@gmail.com');
      console.log('Password: 123456');
      console.log('Role: manager');
      console.log('Status: Active');
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

updateUser();
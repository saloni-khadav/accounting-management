const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ workEmail: 'salonijat003@gmail.com' });
    
    if (user) {
      console.log('✅ User found!');
      console.log('Email:', user.workEmail);
      console.log('Name:', user.fullName);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Has Password:', !!user.password);
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUser();
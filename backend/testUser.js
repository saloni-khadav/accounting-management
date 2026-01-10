const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const testUser = new User({
      fullName: 'Saloni Khadav',
      workEmail: 'salonijat003@gmail.com',
      companyName: 'Test Company',
      companySize: '1-10',
      annualTurnover: '<1M',
      role: 'manager',
      password: '123456',
      isActive: true
    });
    
    await testUser.save();
    console.log('User created: salonijat003@gmail.com');
    console.log('Password: 123456');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestUser();
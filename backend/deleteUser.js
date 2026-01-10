const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const deleteUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const emails = [
      'salonijat003@gmail.com',
      'salonik.bca2023@gmail.com', 
      'salonikhadav@gmail.com'
    ];
    
    const result = await User.deleteMany({ 
      workEmail: { $in: emails } 
    });
    
    console.log(`Deleted ${result.deletedCount} users`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

deleteUsers();
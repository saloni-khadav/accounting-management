const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    await mongoose.connection.db.collection('users').insertOne({
      fullName: 'Test User',
      workEmail: 'test@gmail.com',
      companyName: 'Test Company',
      totalEmployees: '1-10',
      annualTurnover: '<1M',
      password: hashedPassword,
      isActive: true
    });
    
    console.log('✅ Test user created!');
    console.log('📧 Email: test@gmail.com');
    console.log('🔑 Password: 123456');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUser();
const mongoose = require('mongoose');
require('dotenv').config();

async function removeEmails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Remove users with these emails
    const result = await mongoose.connection.db.collection('users').deleteMany({
      workEmail: { $in: ['salonijat003@gmail.com', 'salonikhadav@gmail.com'] }
    });
    
    console.log(`Removed ${result.deletedCount} users`);
    
    await mongoose.connection.close();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

removeEmails();
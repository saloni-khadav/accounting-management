const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Drop the users collection to remove old indexes
    await mongoose.connection.db.collection('users').drop();
    console.log('Users collection dropped');
    
    await mongoose.connection.close();
    console.log('Database fixed. Restart your server.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();
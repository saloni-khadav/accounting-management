const mongoose = require('mongoose');
const Settings = require('./models/Settings');

const MONGODB_URI = 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function checkAndFixSettings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const settings = await Settings.find({});
    console.log('\n=== Current Settings ===');
    
    for (const setting of settings) {
      console.log(`\nCompany: ${setting.companyName}`);
      console.log(`PO Prefix: "${setting.poPrefix}"`);
      console.log(`PO Start Number: "${setting.poStartNumber}"`);
      
      // Check if prefix contains repeated "2526"
      if (setting.poPrefix && setting.poPrefix.includes('252625262526')) {
        console.log('⚠️  CORRUPTED PREFIX DETECTED!');
        console.log('Fixing to: "06-PO-2526"');
        setting.poPrefix = '06-PO-2526';
        setting.poStartNumber = '001';
        await setting.save();
        console.log('✅ Fixed!');
      }
    }
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndFixSettings();

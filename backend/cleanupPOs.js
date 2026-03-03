const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');

const MONGODB_URI = 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function cleanupPOs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allPOs = await PurchaseOrder.find({}).sort({ createdAt: -1 });
    console.log(`Total POs: ${allPOs.length}\n`);
    
    console.log('=== ALL PO NUMBERS ===');
    allPOs.forEach((po, i) => {
      console.log(`${i + 1}. ${po.poNumber} (ID: ${po._id})`);
    });
    
    console.log('\n=== DELETING CORRUPTED POs ===');
    let deletedCount = 0;
    
    for (const po of allPOs) {
      const poNum = po.poNumber || '';
      
      // Delete if:
      // 1. Contains "25262526" (repeated pattern)
      // 2. Length > 20 characters
      // 3. Contains scientific notation
      if (poNum.includes('25262526') || poNum.length > 20 || /e\+|e-/i.test(poNum)) {
        console.log(`❌ Deleting: ${poNum}`);
        await PurchaseOrder.deleteOne({ _id: po._id });
        deletedCount++;
      }
    }
    
    console.log(`\n✅ Deleted ${deletedCount} corrupted PO(s)`);
    
    // Show remaining POs
    const remaining = await PurchaseOrder.find({}).sort({ createdAt: -1 });
    console.log(`\n=== REMAINING POs (${remaining.length}) ===`);
    remaining.forEach((po, i) => {
      console.log(`${i + 1}. ${po.poNumber}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupPOs();

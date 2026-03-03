const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');

const MONGODB_URI = 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function deleteAllCorruptedPOs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all POs
    const allPOs = await PurchaseOrder.find({});
    console.log(`Total POs found: ${allPOs.length}`);
    
    let deletedCount = 0;
    
    for (const po of allPOs) {
      const poNum = po.poNumber;
      
      // Check if PO number has "2526" repeated or is too long
      if (poNum && (
        poNum.includes('252625262526') || 
        poNum.length > 20 ||
        /e\+|e-|E\+|E-/.test(poNum)
      )) {
        console.log(`Deleting corrupted PO: ${poNum}`);
        await PurchaseOrder.deleteOne({ _id: po._id });
        deletedCount++;
      }
    }
    
    console.log(`\nDeleted ${deletedCount} corrupted PO(s)`);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAllCorruptedPOs();

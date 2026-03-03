const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function cleanupCorruptedPOs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all POs
    const allPOs = await PurchaseOrder.find({});
    console.log(`Total POs found: ${allPOs.length}`);

    let deletedCount = 0;
    
    for (const po of allPOs) {
      if (po.poNumber) {
        // Check if PO number contains 'e+' or 'e-' (scientific notation)
        if (po.poNumber.includes('e+') || po.poNumber.includes('e-') || po.poNumber.includes('E+') || po.poNumber.includes('E-')) {
          console.log(`Deleting corrupted PO: ${po.poNumber}`);
          await PurchaseOrder.findByIdAndDelete(po._id);
          deletedCount++;
        }
      }
    }

    console.log(`\nCleanup complete!`);
    console.log(`Deleted ${deletedCount} corrupted PO(s)`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupCorruptedPOs();

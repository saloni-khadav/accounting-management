const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');

const MONGODB_URI = 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function deleteCorruptedPO() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete the specific corrupted PO
    const result = await PurchaseOrder.deleteOne({ 
      poNumber: "06-PO-25262526252625262526000" 
    });
    
    console.log('Delete result:', result);
    console.log(`Deleted ${result.deletedCount} PO(s)`);
    
    // Also delete any PO with scientific notation pattern
    const result2 = await PurchaseOrder.deleteMany({
      poNumber: /e\+|e-|E\+|E-/
    });
    
    console.log('Deleted POs with scientific notation:', result2.deletedCount);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteCorruptedPO();

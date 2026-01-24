const mongoose = require('mongoose');
const Bill = require('./models/Bill');
const Vendor = require('./models/Vendor');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const migrateBillPAN = async () => {
  try {
    console.log('Starting migration to add vendorPAN to existing bills...');
    
    // Find all bills that don't have vendorPAN or have empty vendorPAN
    const bills = await Bill.find({
      $or: [
        { vendorPAN: { $exists: false } },
        { vendorPAN: '' },
        { vendorPAN: null }
      ]
    });
    
    console.log(`Found ${bills.length} bills without vendorPAN`);
    
    let updated = 0;
    
    for (const bill of bills) {
      if (bill.vendorName) {
        // Find vendor by name
        const vendor = await Vendor.findOne({ vendorName: bill.vendorName });
        
        if (vendor && vendor.panNumber) {
          // Update bill with vendor PAN
          await Bill.findByIdAndUpdate(bill._id, { 
            vendorPAN: vendor.panNumber 
          });
          console.log(`Updated bill ${bill.billNumber} with PAN: ${vendor.panNumber}`);
          updated++;
        } else {
          console.log(`No PAN found for vendor: ${bill.vendorName} in bill ${bill.billNumber}`);
        }
      }
    }
    
    console.log(`Migration completed. Updated ${updated} bills with vendorPAN.`);
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateBillPAN();
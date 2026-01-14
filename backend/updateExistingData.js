const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const PO = require('./models/PO');

require('dotenv').config();

const updateExistingData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('Connected to MongoDB');

    // Update existing approved invoices with approvedAt date
    const approvedInvoices = await Invoice.updateMany(
      { status: 'Approved', approvedAt: { $exists: false } },
      { $set: { approvedAt: new Date('2024-01-15') } }
    );
    console.log(`Updated ${approvedInvoices.modifiedCount} approved invoices`);

    // Update existing rejected invoices with rejectedAt date
    const rejectedInvoices = await Invoice.updateMany(
      { status: 'Rejected', rejectedAt: { $exists: false } },
      { $set: { rejectedAt: new Date('2024-01-10') } }
    );
    console.log(`Updated ${rejectedInvoices.modifiedCount} rejected invoices`);

    // Update existing approved POs with approvedAt date
    const approvedPOs = await PO.updateMany(
      { status: 'Approved', approvedAt: { $exists: false } },
      { $set: { approvedAt: new Date('2024-01-12') } }
    );
    console.log(`Updated ${approvedPOs.modifiedCount} approved POs`);

    // Update existing rejected POs with rejectedAt date
    const rejectedPOs = await PO.updateMany(
      { status: 'Rejected', rejectedAt: { $exists: false } },
      { $set: { rejectedAt: new Date('2024-01-08') } }
    );
    console.log(`Updated ${rejectedPOs.modifiedCount} rejected POs`);

    console.log('Data update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating data:', error);
    process.exit(1);
  }
};

updateExistingData();
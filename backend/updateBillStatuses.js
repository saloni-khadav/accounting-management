const mongoose = require('mongoose');
const Bill = require('./models/Bill');
const Payment = require('./models/Payment');
require('dotenv').config();

const updateExistingBillStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting-management');
    console.log('Connected to MongoDB');

    // Get all bills
    const bills = await Bill.find({});
    console.log(`Found ${bills.length} bills to update`);

    for (const bill of bills) {
      // Calculate total paid amount for this bill
      const payments = await Payment.find({ 
        invoiceNumber: bill.billNumber,
        vendor: bill.vendorName,
        status: 'Completed'
      });
      
      const totalPaid = payments.reduce((sum, payment) => sum + payment.netAmount, 0);
      
      // Update bill with paid amount and let the pre-save hook handle status
      bill.paidAmount = totalPaid;
      
      // Convert old status to new status
      if (bill.status === 'Paid') {
        bill.status = 'Fully Paid';
      } else if (bill.status === 'Pending') {
        bill.status = 'Not Paid';
      }
      
      await bill.save();
      console.log(`Updated bill ${bill.billNumber}: Status=${bill.status}, Paid=${totalPaid}`);
    }

    console.log('All bills updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating bills:', error);
    process.exit(1);
  }
};

updateExistingBillStatuses();
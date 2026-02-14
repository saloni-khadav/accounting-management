const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const Bill = require('./models/Bill');

async function checkGSTAmounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/accounting-management');
    
    // Get approved invoices (GST Receivable)
    const invoices = await Invoice.find({ 
      $or: [
        { approvalStatus: 'Approved' },
        { approvalStatus: 'approved' }
      ]
    });
    
    // Get approved bills (GST Payable)  
    const bills = await Bill.find({ approvalStatus: 'approved' });
    
    const totalGSTReceivable = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const totalGSTPayable = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    
    console.log('=== GST AMOUNTS ===');
    console.log('GST Receivable (Invoices):', totalGSTReceivable.toFixed(2));
    console.log('GST Payable (Bills):', totalGSTPayable.toFixed(2));
    console.log('Net GST (Receivable - Payable):', (totalGSTReceivable - totalGSTPayable).toFixed(2));
    console.log('Total Invoices:', invoices.length);
    console.log('Total Bills:', bills.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkGSTAmounts();
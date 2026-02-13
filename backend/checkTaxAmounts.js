const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const Bill = require('./models/Bill');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/accounting-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkTaxAmounts() {
  try {
    console.log('=== TAX AMOUNTS CHECK ===\n');
    
    // Get approved invoices
    const invoices = await Invoice.find({ 
      $or: [
        { approvalStatus: 'Approved' },
        { approvalStatus: 'approved' }
      ]
    });
    
    // Get approved bills
    const bills = await Bill.find({ approvalStatus: 'approved' });
    
    console.log(`Total Approved Invoices: ${invoices.length}`);
    console.log(`Total Approved Bills: ${bills.length}\n`);
    
    // Calculate GST amounts
    const totalGSTFromInvoices = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const totalGSTFromBills = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    
    console.log('=== CURRENT AMOUNTS ===');
    console.log(`Account Receivable (Invoice GST): ₹${totalGSTFromInvoices.toLocaleString('en-IN')}`);
    console.log(`GSTR2B (Bill GST): ₹${totalGSTFromBills.toLocaleString('en-IN')}`);
    console.log(`GST Payable (Difference): ₹${(totalGSTFromInvoices - totalGSTFromBills).toLocaleString('en-IN')}`);
    
    // Show individual invoice amounts
    if (invoices.length > 0) {
      console.log('\n=== INVOICE DETAILS ===');
      invoices.forEach(inv => {
        console.log(`${inv.invoiceNumber}: ₹${(inv.totalTax || 0).toLocaleString('en-IN')}`);
      });
    }
    
    // Show individual bill amounts
    if (bills.length > 0) {
      console.log('\n=== BILL DETAILS ===');
      bills.forEach(bill => {
        console.log(`${bill.billNumber}: ₹${(bill.totalTax || 0).toLocaleString('en-IN')}`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkTaxAmounts();
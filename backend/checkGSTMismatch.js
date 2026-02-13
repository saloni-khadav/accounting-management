const mongoose = require('mongoose');
require('dotenv').config();

const Invoice = require('./models/Invoice');
const Bill = require('./models/Bill');

async function checkGSTMismatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check Invoices
    console.log('=== CHECKING INVOICES ===');
    const invoices = await Invoice.find({ 
      $or: [
        { approvalStatus: 'Approved' },
        { approvalStatus: 'approved' }
      ]
    });
    
    console.log(`Total Approved Invoices: ${invoices.length}\n`);
    
    let invoiceMismatch = 0;
    invoices.forEach(inv => {
      const calculatedGST = (inv.totalCGST || 0) + (inv.totalSGST || 0) + (inv.totalIGST || 0) + (inv.totalCESS || 0);
      const storedGST = inv.totalTax || 0;
      const diff = Math.abs(calculatedGST - storedGST);
      
      if (diff > 0.01) {
        console.log(`Invoice: ${inv.invoiceNumber}`);
        console.log(`  CGST: ${inv.totalCGST || 0}`);
        console.log(`  SGST: ${inv.totalSGST || 0}`);
        console.log(`  IGST: ${inv.totalIGST || 0}`);
        console.log(`  CESS: ${inv.totalCESS || 0}`);
        console.log(`  Calculated Total: ${calculatedGST}`);
        console.log(`  Stored totalTax: ${storedGST}`);
        console.log(`  MISMATCH: ${diff}\n`);
        invoiceMismatch += diff;
      }
    });
    
    console.log(`Total Invoice Mismatch: ₹${invoiceMismatch}\n`);

    // Check Bills
    console.log('=== CHECKING BILLS ===');
    const bills = await Bill.find({ approvalStatus: 'approved' });
    
    console.log(`Total Approved Bills: ${bills.length}\n`);
    
    let billMismatch = 0;
    bills.forEach(bill => {
      const calculatedGST = (bill.totalCGST || 0) + (bill.totalSGST || 0) + (bill.totalIGST || 0) + (bill.totalCESS || 0);
      const storedGST = bill.totalTax || 0;
      const diff = Math.abs(calculatedGST - storedGST);
      
      if (diff > 0.01) {
        console.log(`Bill: ${bill.billNumber}`);
        console.log(`  CGST: ${bill.totalCGST || 0}`);
        console.log(`  SGST: ${bill.totalSGST || 0}`);
        console.log(`  IGST: ${bill.totalIGST || 0}`);
        console.log(`  CESS: ${bill.totalCESS || 0}`);
        console.log(`  Calculated Total: ${calculatedGST}`);
        console.log(`  Stored totalTax: ${storedGST}`);
        console.log(`  MISMATCH: ${diff}\n`);
        billMismatch += diff;
      }
    });
    
    console.log(`Total Bill Mismatch: ₹${billMismatch}\n`);
    
    // Summary
    console.log('=== SUMMARY ===');
    const totalGSTInvoices = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const totalGSTBills = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    
    console.log(`Total GST from Invoices (GSTR1): ₹${totalGSTInvoices}`);
    console.log(`Total GST from Bills (GSTR2B): ₹${totalGSTBills}`);
    console.log(`Net GST Position: ₹${totalGSTInvoices - totalGSTBills}`);
    console.log(`Total Mismatch Found: ₹${invoiceMismatch + billMismatch}`);
    
    if (invoiceMismatch + billMismatch === 0) {
      console.log('\n✅ NO MISMATCH - All GST calculations are correct!');
    } else {
      console.log('\n❌ MISMATCH FOUND - Some invoices/bills have incorrect GST totals!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkGSTMismatch();

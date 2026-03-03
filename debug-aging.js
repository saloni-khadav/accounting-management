// Debug script - Run in browser console
(async () => {
  const bills = await fetch('https://nextbook-backend.nextsphere.co.in/api/bills').then(r => r.json());
  const payments = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments').then(r => r.json());
  const creditNotes = await fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes').then(r => r.json());
  
  console.log('=== BILLS ===');
  bills.forEach(bill => {
    console.log(`${bill.billNumber}: Grand=${bill.grandTotal}, TDS=${bill.tdsAmount}`);
  });
  
  console.log('\n=== PAYMENTS ===');
  payments.forEach(p => {
    console.log(`${p.paymentNumber}: Bill=${p.billNumber}, Amount=${p.amount}, Status=${p.approvalStatus}`);
  });
  
  console.log('\n=== CREDIT NOTES ===');
  creditNotes.forEach(cn => {
    console.log(`${cn.noteNumber}: Invoice=${cn.originalInvoice}, Amount=${cn.amount}, Type=${cn.type}, Status=${cn.approvalStatus}`);
  });
  
  console.log('\n=== CALCULATION ===');
  bills.forEach(bill => {
    const billPayments = payments.filter(p => p.billId === bill._id && p.approvalStatus === 'approved');
    const totalPaid = billPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const billCreditNotes = creditNotes.filter(cn => 
      cn.originalInvoice === bill.billNumber && 
      cn.type === 'Credit Note' &&
      cn.approvalStatus === 'approved'
    );
    const totalCreditNote = billCreditNotes.reduce((sum, cn) => sum + (cn.amount || 0), 0);
    
    const actualTDS = (bill.tdsAmount && parseFloat(bill.tdsAmount) > 0) ? parseFloat(bill.tdsAmount) : 0;
    const netPayable = (bill.grandTotal || 0) - actualTDS;
    const remaining = netPayable - totalPaid - totalCreditNote;
    
    console.log(`\n${bill.billNumber}:`);
    console.log(`  Grand Total: ${bill.grandTotal}`);
    console.log(`  TDS: ${bill.tdsAmount} (actual: ${actualTDS})`);
    console.log(`  Net Payable: ${netPayable}`);
    console.log(`  Paid: ${totalPaid}`);
    console.log(`  Credit Notes: ${totalCreditNote} (matched: ${billCreditNotes.length})`);
    console.log(`  Remaining: ${remaining}`);
  });
})();

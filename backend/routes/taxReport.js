const express = require('express');
const Invoice = require('../models/Invoice');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const TDS = require('../models/TDS');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  try {
    const { timePeriod = 'current_financial_year' } = req.query;
    
    // Calculate date range based on time period
    const now = new Date();
    let startDate, endDate;
    
    switch(timePeriod) {
      case 'current_financial_year':
        const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(currentYear, 3, 1); // April 1st
        endDate = new Date(currentYear + 1, 2, 31, 23, 59, 59); // March 31st
        break;
      
      case 'previous_financial_year':
        const prevYear = now.getMonth() >= 3 ? now.getFullYear() - 1 : now.getFullYear() - 2;
        startDate = new Date(prevYear, 3, 1);
        endDate = new Date(prevYear + 1, 2, 31, 23, 59, 59);
        break;
      
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      
      case 'previous_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      
      case 'current_quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
        break;
      
      case 'previous_quarter':
        const prevQuarter = Math.floor(now.getMonth() / 3) - 1;
        const quarterYear = prevQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const quarter = prevQuarter < 0 ? 3 : prevQuarter;
        startDate = new Date(quarterYear, quarter * 3, 1);
        endDate = new Date(quarterYear, (quarter + 1) * 3, 0, 23, 59, 59);
        break;
      
      default:
        startDate = new Date(0);
        endDate = now;
    }
    
    // GST Calculations - Fix case sensitivity
    const invoices = await Invoice.find({ 
      $or: [
        { approvalStatus: 'Approved' },
        { approvalStatus: 'approved' }
      ],
      invoiceDate: { $gte: startDate, $lte: endDate }
    });
    const bills = await Bill.find({ 
      approvalStatus: 'approved',
      billDate: { $gte: startDate, $lte: endDate }
    });
    const payments = await Payment.find({ 
      approvalStatus: 'approved',
      paymentDate: { $gte: startDate, $lte: endDate }
    });
    
    // Get collections for account receivable calculation
    const Collection = require('../models/Collection');
    const collections = await Collection.find({
      approvalStatus: 'Approved',
      collectionDate: { $gte: startDate, $lte: endDate }
    });
    
    console.log('Tax Report Debug:');
    console.log('Total invoices (Approved):', invoices.length);
    console.log('Total bills (approved):', bills.length);
    console.log('Total payments (approved):', payments.length);
    
    const totalGSTFromInvoices = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const totalGSTFromBills = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    
    const gstr1AccountReceivable = totalGSTFromInvoices; // GST we will receive (Output GST)
    const gstr2b = totalGSTFromBills; // GST we have to pay (Input GST)
    
    // Net GST calculation
    const netGSTPayable = gstr2b - gstr1AccountReceivable; // Bills GST - Invoice GST
    
    // Total GST Payable should be the actual GST from bills (what we owe)
    const totalGSTPayable = gstr2b;
    
    // Total GST should show Net GST Payable (what we actually need to pay after adjusting receivables)
    const totalGST = netGSTPayable > 0 ? netGSTPayable : 0;
    
    // Calculate Mismatched Amount by comparing invoice-wise GST
    let mismatchedAmount = 0;
    
    // Check for invoices with unusual GST patterns
    invoices.forEach(inv => {
      const calculatedGST = (inv.totalCGST || 0) + (inv.totalSGST || 0) + (inv.totalIGST || 0) + (inv.totalCESS || 0);
      const difference = Math.abs(calculatedGST - (inv.totalTax || 0));
      if (difference > 0.01) { // Allow 1 paisa tolerance for rounding
        mismatchedAmount += difference;
      }
    });
    
    // Check for bills with unusual GST patterns
    bills.forEach(bill => {
      const calculatedGST = (bill.totalCGST || 0) + (bill.totalSGST || 0) + (bill.totalIGST || 0) + (bill.totalCESS || 0);
      const difference = Math.abs(calculatedGST - (bill.totalTax || 0));
      if (difference > 0.01) { // Allow 1 paisa tolerance for rounding
        mismatchedAmount += difference;
      }
    });
    
    console.log('GST from invoices:', totalGSTFromInvoices);
    console.log('GST from bills:', totalGSTFromBills);
    console.log('Net Total GST:', totalGST);
    console.log('Mismatched Amount Found:', mismatchedAmount);
    
    // Calculate Account Receivable GST (pending invoices from selected period)
    const invoiceNumbers = invoices.map(inv => inv.invoiceNumber);
    
    // Get all collections for these invoices (not time-filtered)
    const allCollections = await Collection.find({
      approvalStatus: 'Approved',
      invoiceNumber: { $in: invoiceNumbers }
    });
    
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalCollectedAmount = allCollections.reduce((sum, col) => sum + (col.netAmount || 0), 0);
    const pendingAmount = totalInvoiceAmount - totalCollectedAmount;
    
    // Calculate GST portion of pending amount (proportional)
    const totalGSTAccountReceivable = pendingAmount > 0 && totalInvoiceAmount > 0
      ? (totalGSTFromInvoices * pendingAmount) / totalInvoiceAmount 
      : 0;
    
    console.log('=== Account Receivable Calculation ===');
    console.log('Total Invoice Amount:', totalInvoiceAmount);
    console.log('Total Collected Amount:', totalCollectedAmount);
    console.log('Pending Amount:', pendingAmount);
    console.log('Total GST from Invoices:', totalGSTFromInvoices);
    console.log('Total GST Account Receivable:', totalGSTAccountReceivable);
    console.log('====================================');
    
    // TDS Calculations - Get from Bills and Payments like TDS routes
    const billsWithTds = bills.filter(bill => bill.tdsAmount && bill.tdsAmount > 0);
    const paymentsWithTds = payments.filter(payment => payment.tdsAmount && payment.tdsAmount > 0);
    
    console.log('Bills with TDS:', billsWithTds.length);
    console.log('Payments with TDS:', paymentsWithTds.length);
    
    const billTdsAmount = billsWithTds.reduce((sum, bill) => sum + (bill.tdsAmount || 0), 0);
    const paymentTdsAmount = paymentsWithTds.reduce((sum, payment) => sum + (payment.tdsAmount || 0), 0);
    
    console.log('Bill TDS amount:', billTdsAmount);
    console.log('Payment TDS amount:', paymentTdsAmount);
    
    const totalTDS = billTdsAmount + paymentTdsAmount;
    const totalTDSPayable = billTdsAmount; // Bills are payable
    const totalTDSReceivable = 0; // Empty as requested
    
    // Income Tax Calculations
    const totalIncomeTaxReceivable = totalTDS; // TDS is income tax receivable
    
    // Prepare tax details from all transactions
    const details = [];
    
    // Add invoice GST details
    invoices.forEach(inv => {
      if (inv.totalTax > 0) {
        details.push({
          date: new Date(inv.invoiceDate).toLocaleDateString('en-GB'),
          taxType: 'GST',
          category: 'GSTR1',
          amount: inv.totalTax
        });
      }
    });
    
    // Add bill GST details
    bills.forEach(bill => {
      if (bill.totalTax > 0) {
        details.push({
          date: new Date(bill.billDate).toLocaleDateString('en-GB'),
          taxType: 'GST',
          category: 'GSTR2B',
          amount: bill.totalTax
        });
      }
    });
    
    // Add TDS from bills
    billsWithTds.forEach(bill => {
      details.push({
        date: new Date(bill.billDate).toLocaleDateString('en-GB'),
        taxType: 'TDS',
        category: 'TDS Payable',
        amount: bill.tdsAmount
      });
    });
    
    // Add TDS from payments
    paymentsWithTds.forEach(payment => {
      details.push({
        date: new Date(payment.paymentDate).toLocaleDateString('en-GB'),
        taxType: 'TDS',
        category: 'TDS',
        amount: payment.tdsAmount
      });
    });
    
    // Sort by date descending
    details.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });
    
    const result = {
      totalGST: totalGST, // Net GST (receivable - payable)
      totalTDS: totalTDS,
      totalIncomeTax: totalIncomeTaxReceivable,
      totalGSTPayable, // Net GST to pay (payable - receivable)
      gstr1AccountReceivable, // Total GST from invoices
      gstr2b, // Total GST from bills
      totalGSTAccountReceivable, // GST portion of pending invoices
      mismatchedAmount,
      totalTDSPayable,
      totalIncomeTaxReceivable,
      totalTDSReceivable
    };
    
    console.log('Final Tax Report Result:', result);
    
    res.json({
      success: true,
      data: result,
      details: details
    });
  } catch (error) {
    console.error('Tax Report Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tax report' });
  }
});

module.exports = router;

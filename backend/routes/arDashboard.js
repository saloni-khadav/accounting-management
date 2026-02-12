const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Collection = require('../models/Collection');
const CreditNote = require('../models/CreditNote');

// Helper function to filter by period
const filterByPeriod = (data, period, dateField) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const getFinancialYearAndQuarter = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    let financialYear = month >= 3 ? year : year - 1;
    let quarter;
    if (month >= 3 && month <= 5) quarter = 1;
    else if (month >= 6 && month <= 8) quarter = 2;
    else if (month >= 9 && month <= 11) quarter = 3;
    else quarter = 4;
    return { financialYear, quarter };
  };
  
  const { financialYear: currentFY, quarter: currentQuarter } = getFinancialYearAndQuarter(now);
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    const itemMonth = itemDate.getMonth();
    const itemYear = itemDate.getFullYear();
    const { financialYear: itemFY, quarter: itemQuarter } = getFinancialYearAndQuarter(itemDate);
    
    switch (period) {
      case 'This Month':
        return itemYear === currentYear && itemMonth === currentMonth;
      case 'Last Month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return itemYear === lastMonthYear && itemMonth === lastMonth;
      case 'First Quarter':
        return itemFY === currentFY && itemQuarter === 1;
      case 'Second Quarter':
        return itemFY === currentFY && itemQuarter === 2;
      case 'Third Quarter':
        return itemFY === currentFY && itemQuarter === 3;
      case 'Fourth Quarter':
        return itemFY === currentFY && itemQuarter === 4;
      case 'Last Quarter':
        const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const lastQuarterFY = currentQuarter === 1 ? currentFY - 1 : currentFY;
        return itemFY === lastQuarterFY && itemQuarter === lastQuarter;
      case 'This Year':
        return itemFY === currentFY;
      case 'Last Year':
        return itemFY === currentFY - 1;
      default:
        return true;
    }
  });
};

// Get AR Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const { period, client } = req.query;
    
    // Fetch all approved invoices
    let invoices = await Invoice.find({ approvalStatus: 'Approved' });
    
    // Filter by client if specified
    if (client && client !== 'All Clients') {
      invoices = invoices.filter(inv => inv.customerName === client);
    }
    
    // Filter by period if specified
    if (period) {
      invoices = filterByPeriod(invoices, period, 'invoiceDate');
    }
    
    // Fetch all approved collections
    let collections = await Collection.find({ approvalStatus: 'Approved' });
    
    // Filter collections by client
    if (client && client !== 'All Clients') {
      collections = collections.filter(col => col.customer === client);
    }
    
    // Fetch all approved credit notes
    let creditNotes = await CreditNote.find({ approvalStatus: 'Approved' });
    
    // Filter credit notes by client
    if (client && client !== 'All Clients') {
      creditNotes = creditNotes.filter(cn => cn.customerName === client);
    }
    
    // Calculate total receivable
    const totalReceivable = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    
    // Calculate total collected
    const totalCollected = collections.reduce((sum, col) => 
      sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
    );
    
    // Calculate total credit notes
    const totalCreditNotes = creditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
    
    // Calculate total TDS
    const totalTDS = collections.reduce((sum, col) => 
      sum + (parseFloat(col.tdsAmount) || 0), 0
    );
    
    // Calculate outstanding (receivable - collected - TDS)
    const outstanding = Math.max(0, totalReceivable - totalCollected - totalTDS);
    
    // Calculate overdue and aging
    const currentDate = new Date();
    let overdueAmount = 0;
    let days0to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let daysOver90 = 0;
    let overdueCount = 0;
    
    invoices.forEach(invoice => {
      // Calculate paid amount for this invoice
      const invoiceCollections = collections.filter(col => 
        col.invoiceNumber?.includes(invoice.invoiceNumber)
      );
      const paidAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
      );
      
      // Calculate TDS for this invoice
      const tdsAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.tdsAmount) || 0), 0
      );
      
      // Calculate credit notes for this invoice
      const invoiceCreditNotes = creditNotes.filter(cn => 
        cn.originalInvoiceNumber === invoice.invoiceNumber
      );
      const creditAmount = invoiceCreditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
      
      const remainingAmount = (invoice.grandTotal || 0) - paidAmount - creditAmount - tdsAmount;
      
      if (remainingAmount > 0 && invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        const daysDiff = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0) {
          overdueAmount += remainingAmount;
          overdueCount++;
          
          if (daysDiff <= 30) days0to30 += remainingAmount;
          else if (daysDiff <= 60) days31to60 += remainingAmount;
          else if (daysDiff <= 90) days61to90 += remainingAmount;
          else daysOver90 += remainingAmount;
        }
      }
    });
    
    // Calculate pending invoices count
    const pendingInvoices = invoices.filter(inv => {
      const invoiceCollections = collections.filter(col => 
        col.invoiceNumber?.includes(inv.invoiceNumber)
      );
      const paidAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
      );
      
      const tdsAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.tdsAmount) || 0), 0
      );
      
      const invoiceCreditNotes = creditNotes.filter(cn => 
        cn.originalInvoiceNumber === inv.invoiceNumber
      );
      const creditAmount = invoiceCreditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
      
      return (inv.grandTotal || 0) - paidAmount - creditAmount - tdsAmount > 0;
    }).length;
    
    // Calculate unapplied credits (credit notes not yet applied)
    const unappliedCredits = totalCreditNotes;
    
    res.json({
      totalReceivable,
      totalCollected,
      outstanding,
      overdueAmount,
      overdueCount,
      days0to30,
      days31to60,
      days61to90,
      daysOver90,
      pendingInvoices,
      unappliedCredits
    });
  } catch (error) {
    console.error('Error fetching AR dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get overdue invoices
router.get('/overdue-invoices', async (req, res) => {
  try {
    const { period, client } = req.query;
    
    let invoices = await Invoice.find({ approvalStatus: 'Approved' });
    
    if (client && client !== 'All Clients') {
      invoices = invoices.filter(inv => inv.customerName === client);
    }
    
    if (period) {
      invoices = filterByPeriod(invoices, period, 'invoiceDate');
    }
    
    let collections = await Collection.find({ approvalStatus: 'Approved' });
    if (client && client !== 'All Clients') {
      collections = collections.filter(col => col.customer === client);
    }
    
    let creditNotes = await CreditNote.find({ approvalStatus: 'Approved' });
    if (client && client !== 'All Clients') {
      creditNotes = creditNotes.filter(cn => cn.customerName === client);
    }
    
    const currentDate = new Date();
    const overdueInvoices = [];
    
    invoices.forEach(invoice => {
      if (!invoice.dueDate) return;
      
      const invoiceCollections = collections.filter(col => 
        col.invoiceNumber?.includes(invoice.invoiceNumber)
      );
      const paidAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
      );
      
      const tdsAmount = invoiceCollections.reduce((sum, col) => 
        sum + (parseFloat(col.tdsAmount) || 0), 0
      );
      
      const invoiceCreditNotes = creditNotes.filter(cn => 
        cn.originalInvoiceNumber === invoice.invoiceNumber
      );
      const creditAmount = invoiceCreditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
      
      const remainingAmount = (invoice.grandTotal || 0) - paidAmount - creditAmount - tdsAmount;
      const dueDate = new Date(invoice.dueDate);
      const daysDiff = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
      
      if (remainingAmount > 0 && daysDiff > 0) {
        overdueInvoices.push({
          customerName: invoice.customerName,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          daysOverdue: daysDiff,
          amount: remainingAmount
        });
      }
    });
    
    // Sort by days overdue (descending)
    overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue);
    
    res.json(overdueInvoices.slice(0, 10)); // Return top 10
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    res.status(500).json({ message: 'Error fetching overdue invoices' });
  }
});

// Get monthly revenue data
router.get('/monthly-revenue', async (req, res) => {
  try {
    const { period, client } = req.query;
    
    let invoices = await Invoice.find({ approvalStatus: 'Approved' });
    let collections = await Collection.find({ approvalStatus: 'Approved' });
    let creditNotes = await CreditNote.find({ approvalStatus: 'Approved' });
    
    // Filter by client
    if (client && client !== 'All Clients') {
      invoices = invoices.filter(inv => inv.customerName === client);
      collections = collections.filter(col => col.customer === client);
      creditNotes = creditNotes.filter(cn => cn.customerName === client);
    }
    
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 10 months
    const currentDate = new Date();
    for (let i = 9; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = { revenue: 0, receivables: 0 };
    }
    
    // Calculate revenue (invoices)
    invoices.forEach(invoice => {
      const date = new Date(invoice.invoiceDate);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += (invoice.grandTotal || 0) / 100000; // Convert to lakhs
      }
    });
    
    // Calculate receivables (outstanding per month)
    Object.keys(monthlyData).forEach(monthKey => {
      const [month, year] = monthKey.split(' ');
      const monthIndex = months.indexOf(month);
      const monthEnd = new Date(parseInt(year), monthIndex + 1, 0);
      
      let receivables = 0;
      invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        if (invoiceDate <= monthEnd) {
          const invoiceCollections = collections.filter(col => 
            col.invoiceNumber?.includes(invoice.invoiceNumber) &&
            new Date(col.collectionDate) <= monthEnd
          );
          const paidAmount = invoiceCollections.reduce((sum, col) => 
            sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
          );
          
          const tdsAmount = invoiceCollections.reduce((sum, col) => 
            sum + (parseFloat(col.tdsAmount) || 0), 0
          );
          
          const invoiceCreditNotes = creditNotes.filter(cn => 
            cn.originalInvoiceNumber === invoice.invoiceNumber &&
            new Date(cn.creditNoteDate) <= monthEnd
          );
          const creditAmount = invoiceCreditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
          
          receivables += Math.max(0, (invoice.grandTotal || 0) - paidAmount - creditAmount - tdsAmount);
        }
      });
      
      monthlyData[monthKey].receivables = receivables / 100000; // Convert to lakhs
    });
    
    const result = Object.keys(monthlyData).map(key => ({
      month: key.split(' ')[0],
      Revenue: parseFloat(monthlyData[key].revenue.toFixed(2)),
      Receivables: parseFloat(monthlyData[key].receivables.toFixed(2))
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Error fetching monthly revenue' });
  }
});

module.exports = router;

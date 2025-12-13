const express = require('express');
const router = express.Router();

// Simple AI response function (you can replace with actual AI API)
const getAIResponse = async (message) => {
  try {
    // For now, using a simple response system
    // You can integrate Google Gemini API here later
    const responses = {
      greeting: [
        "Hello! I'm your AI accounting assistant. How can I help you today?",
        "Hi there! I'm here to help with your accounting needs. What would you like to know?",
        "Welcome! I can assist you with GST, invoices, reports, and more. How may I help?"
      ],
      features: [
        "This Accounting Management Dashboard includes: GST Dashboard (₹2.5L payable), Invoice Management, Bank Reconciliation, Financial Reports, Accounts Receivable/Payable tracking, Tax Compliance, Asset Management, and Real-time Analytics.",
        "Key features: 📊 Dashboard Analytics, 💰 GST Management, 📄 Invoice Creation, 🏦 Bank Reconciliation, 📈 Financial Reports, 💳 Payment Tracking, 📋 Tax Compliance, and 🔄 Automated Workflows."
      ],
      gst: [
        "For GST: Current status shows ₹2,50,000 payable and ₹1,00,000 receivable. You can file returns, reconcile transactions, and generate compliance reports from the GST Dashboard.",
        "GST features include: Filing status tracking, Mismatch resolution, Missing invoice alerts, GSTR-1/3B preparation, and automated calculations."
      ],
      payments: [
        "💳 Payment Management: Track ₹45,000 overdue receivables, manage vendor payments, set up payment reminders, and monitor cash flow. Access Accounts Receivable/Payable sections for detailed payment tracking.",
        "Payment features: Online payment processing, automated reminders, aging reports, payment reconciliation, vendor payment scheduling, and real-time payment status updates.",
        "For payments: Monitor outstanding amounts, schedule recurring payments, track payment history, generate payment reports, and manage payment approvals through the workflow system."
      ],
      invoices: [
        "📄 Invoice Management: Create GST invoices, track invoice status, manage credit/debit notes, and automate invoice workflows. Access Sales Entry for new invoices or GST Invoice for tax-compliant billing.",
        "Invoice features: Automated invoice generation, payment tracking, overdue alerts, invoice templates, bulk invoicing, and integration with payment gateways."
      ],
      reports: [
        "📊 Financial Reports: Generate revenue charts, expense analysis, balance sheets, P&L statements, cash flow reports, and tax compliance reports. All reports available in real-time with export options.",
        "Available reports: GST reports, aging reports, bank reconciliation reports, financial statements, tax summaries, and custom analytics dashboards."
      ],
      default: [
        "I can help you with accounting tasks like GST compliance, invoice management, financial reporting, and more. What specific area would you like assistance with?",
        "I'm here to assist with your accounting needs. You can ask about GST, invoices, reports, payments, or any other financial management topic."
      ]
    };

    const msg = message.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (msg.includes('payment') || msg.includes('pay') || msg.includes('receivable') || msg.includes('payable') || msg.includes('outstanding')) {
      return responses.payments[Math.floor(Math.random() * responses.payments.length)];
    } else if (msg.includes('invoice') || msg.includes('bill') || msg.includes('billing')) {
      return responses.invoices[Math.floor(Math.random() * responses.invoices.length)];
    } else if (msg.includes('report') || msg.includes('analytics') || msg.includes('chart') || msg.includes('analysis')) {
      return responses.reports[Math.floor(Math.random() * responses.reports.length)];
    } else if (msg.includes('feature') || msg.includes('what can') || msg.includes('capabilities')) {
      return responses.features[Math.floor(Math.random() * responses.features.length)];
    } else if (msg.includes('gst') || msg.includes('tax')) {
      return responses.gst[Math.floor(Math.random() * responses.gst.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  } catch (error) {
    return "I'm having trouble processing your request right now. Please try again.";
  }
};

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getAIResponse(message);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
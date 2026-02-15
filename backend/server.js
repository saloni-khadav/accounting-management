const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/auth'); // Using MongoDB auth
const aiRoutes = require('./routes/ai');
const clientRoutes = require('./routes/clients');
const vendorRoutes = require('./routes/vendors');
const invoiceRoutes = require('./routes/invoices');
const billRoutes = require('./routes/bills');
const ocrRoutes = require('./routes/ocr-new');
const gstRoutes = require('./routes/gst');
const managerRoutes = require('./routes/manager');
const poRoutes = require('./routes/pos');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const creditNoteRoutes = require('./routes/creditNotes');
const creditDebitNoteRoutes = require('./routes/creditDebitNotes');
const assetRoutes = require('./routes/assets');
const depreciationRoutes = require('./routes/depreciation');
const paymentRoutes = require('./routes/payments');
const collectionRoutes = require('./routes/collections');
const tdsRoutes = require('./routes/tds');
const proformaInvoiceRoutes = require('./routes/proformaInvoices');
const arDashboardRoutes = require('./routes/arDashboard');
const taxReportRoutes = require('./routes/taxReport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Home / Health route
app.get("/", (req, res) => {
  res.send("Accounting Backend API is Running 🚀");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/pos', poRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/credit-notes', creditNoteRoutes);
app.use('/api/credit-debit-notes', creditDebitNoteRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/depreciation', depreciationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/tds', tdsRoutes);
app.use('/api/proforma-invoices', proformaInvoiceRoutes);
app.use('/api/ar-dashboard', arDashboardRoutes);
app.use('/api/tax-report', taxReportRoutes);

// test route 
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Serve frontend (React build) - Only for production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// MongoDB Connection with fallback
const connectDB = async () => {
  try {
    // Try cloud MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected');
  } catch (err) {
    console.log('❌ MongoDB Atlas failed:', err.message);
    console.log('🔄 Trying local MongoDB...');
    
    try {
      // Fallback to local MongoDB
      await mongoose.connect('mongodb://localhost:27017/accounting-management');
      console.log('✅ Local MongoDB connected');
    } catch (localErr) {
      console.log('❌ Local MongoDB failed:', localErr.message);
      console.log('⚠️  Running without database - some features may not work');
    }
  }
};

connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

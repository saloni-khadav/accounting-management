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
const ocrRoutes = require('./routes/ocr-new');
const gstRoutes = require('./routes/gst');
const poRoutes = require('./routes/pos');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/pos', poRoutes);

// test route 

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

// Serve frontend (React buil
const buildPath = path.join(__dirname, '../build');

// 3. Serve the static files
app.use(express.static(buildPath));

// 4. The "Catch-all" route for React (MUST be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

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
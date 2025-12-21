const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); // Using MongoDB auth
const aiRoutes = require('./routes/ai');
const clientRoutes = require('./routes/clients');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clients', clientRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
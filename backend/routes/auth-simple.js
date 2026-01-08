const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Simple in-memory storage for testing
const users = [];

// Register
router.post('/register', (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { name, email, company, password } = req.body;

    if (!name || !email || !company || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      company,
      password
    };
    
    users.push(user);
    console.log('User created successfully:', user.email);

    const token = jwt.sign({ id: user.id }, 'simple-secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, 'simple-secret', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working!', 
    users: users.length,
    timestamp: new Date()
  });
});

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendActivationEmail } = require('../utils/emailService');

const router = express.Router();

// Signup - Send activation email
router.post('/signup', async (req, res) => {
  try {
    const { fullName, workEmail, companyName, totalEmployees, annualTurnover } = req.body;

    if (!fullName || !workEmail || !companyName || !totalEmployees || !annualTurnover) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ workEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const activationToken = crypto.randomBytes(32).toString('hex');
    
    const user = new User({ 
      fullName, 
      workEmail, 
      companyName, 
      totalEmployees, 
      annualTurnover,
      activationToken
    });
    await user.save();

    // Send activation email
    const emailSent = await sendActivationEmail(workEmail, fullName, activationToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send activation email. Please try again.' });
    }

    res.status(201).json({
      message: 'Account created. Please check your email for activation link.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set password after email activation
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({ activationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired activation token' });
    }

    user.password = password;
    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    res.json({ message: 'Password set successfully. You can now login.' });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ workEmail: email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated. Please check your email.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        workEmail: user.workEmail,
        companyName: user.companyName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      company: req.user.company
    }
  });
});

module.exports = router;
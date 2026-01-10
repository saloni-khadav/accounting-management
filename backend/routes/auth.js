const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Signup - Step 1: Collect user info and send password setup email
router.post('/signup', async (req, res) => {
  try {
    const { fullName, workEmail, companyName, companySize, annualTurnover } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ workEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate password setup token
    const passwordSetupToken = crypto.randomBytes(32).toString('hex');
    const passwordSetupExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create user without password (inactive)
    const user = new User({
      fullName,
      workEmail,
      companyName,
      companySize,
      annualTurnover,
      isActive: false,
      passwordSetupToken,
      passwordSetupExpire
    });

    await user.save();

    // Send password setup email
    const passwordSetupUrl = `${process.env.CLIENT_URL}/set-password/${passwordSetupToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e293b; margin-bottom: 10px;">Welcome to Nextbook Accounting!</h1>
          <p style="color: #64748b; font-size: 16px;">Complete your account setup</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 15px;">Hi ${fullName},</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up for Nextbook Accounting! To complete your account setup and start managing your business finances, please set your password by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${passwordSetupUrl}" 
               style="background: #1e293b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Set Your Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This link will expire in 30 minutes for security reasons.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            If you didn't create this account, please ignore this email.
          </p>
          <p style="color: #64748b; font-size: 12px;">
            © 2024 Nextbook Accounting. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      email: workEmail,
      subject: 'Set your password for Nextbook Accounting',
      html: emailHtml
    });

    res.status(201).json({
      message: 'Account created successfully. Please check your email to set your password.',
      success: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set Password - Step 2: Verify token and set password
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with valid token
    const user = await User.findOne({
      passwordSetupToken: token,
      passwordSetupExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set password and activate account
    user.password = password;
    user.isActive = true;
    user.passwordSetupToken = undefined;
    user.passwordSetupExpire = undefined;

    await user.save();

    res.json({
      message: 'Password set successfully. Your account is now active.',
      success: true
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login - Step 3: Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ workEmail: email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated. Please check your email to set your password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      workEmail: req.user.workEmail,
      companyName: req.user.companyName,
      profile: req.user.profile || {}
    }
  });
});

// Save profile data
router.post('/profile', auth, async (req, res) => {
  try {
    const { companyLogo, gstNumber, tradeName, address, panNumber, mcaNumber, msmeStatus, msmeNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profile: {
          companyLogo,
          gstNumber,
          tradeName,
          address,
          panNumber,
          mcaNumber,
          msmeStatus,
          msmeNumber
        }
      },
      { new: true }
    );

    res.json({
      message: 'Profile saved successfully',
      success: true,
      profile: user.profile
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
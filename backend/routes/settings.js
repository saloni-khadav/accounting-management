const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get company settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let settings = await Settings.findOne({ companyName: user.companyName });
    
    if (!settings) {
      settings = new Settings({ companyName: user.companyName });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update company settings
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let settings = await Settings.findOne({ companyName: user.companyName });
    
    if (!settings) {
      settings = new Settings({ companyName: user.companyName, ...req.body });
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    res.json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

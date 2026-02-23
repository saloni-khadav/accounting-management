const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });
    
    if (!settings) {
      settings = new Settings({ userId: req.user.id });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });
    
    if (!settings) {
      settings = new Settings({ userId: req.user.id, ...req.body });
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

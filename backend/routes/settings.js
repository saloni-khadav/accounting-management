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
    } else {
      // Force update to add missing PO fields
      let needsUpdate = false;
      if (settings.poPrefix === undefined || settings.poPrefix === null) {
        settings.poPrefix = 'PO';
        needsUpdate = true;
      }
      if (settings.poStartNumber === undefined || settings.poStartNumber === null) {
        settings.poStartNumber = '1';
        needsUpdate = true;
      }
      if (settings.autoGeneratePO === undefined || settings.autoGeneratePO === null) {
        settings.autoGeneratePO = true;
        needsUpdate = true;
      }
      if (settings.poTemplate === undefined || settings.poTemplate === null) {
        settings.poTemplate = 'Standard';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await settings.save();
        console.log('Updated settings with PO fields');
      }
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error in GET settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update company settings
router.put('/', auth, async (req, res) => {
  try {
    console.log('=== UPDATE SETTINGS ROUTE ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User company:', user.companyName);

    let settings = await Settings.findOne({ companyName: user.companyName });
    
    if (!settings) {
      console.log('Creating new settings');
      settings = new Settings({ companyName: user.companyName, ...req.body });
    } else {
      console.log('Updating existing settings');
      Object.assign(settings, req.body);
    }
    
    const savedSettings = await settings.save();
    console.log('Settings saved successfully:', savedSettings._id);
    res.json({ message: 'Settings saved successfully', settings: savedSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(400).json({ message: error.message, error: error.toString() });
  }
});

module.exports = router;

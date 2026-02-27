const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get company profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profile = await Profile.findOne({ companyName: user.companyName });
    res.json({ success: true, profile: profile || {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save/Update company profile
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { companyLogo, gstNumber, tradeName, address, panNumber, tanNumber, mcaNumber, msmeStatus, msmeNumber, bankAccounts } = req.body;
    
    let profile = await Profile.findOne({ companyName: user.companyName });
    
    if (profile) {
      // Update existing profile
      if (companyLogo !== undefined) profile.companyLogo = companyLogo;
      if (gstNumber !== undefined) profile.gstNumber = gstNumber;
      if (tradeName !== undefined) profile.tradeName = tradeName;
      if (address !== undefined) profile.address = address;
      if (panNumber !== undefined) profile.panNumber = panNumber;
      if (tanNumber !== undefined) profile.tanNumber = tanNumber;
      if (mcaNumber !== undefined) profile.mcaNumber = mcaNumber;
      if (msmeStatus !== undefined) profile.msmeStatus = msmeStatus;
      if (msmeNumber !== undefined) profile.msmeNumber = msmeNumber;
      if (bankAccounts !== undefined) profile.bankAccounts = bankAccounts;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        companyName: user.companyName,
        companyLogo,
        gstNumber,
        tradeName,
        address,
        panNumber,
        tanNumber,
        mcaNumber,
        msmeStatus,
        msmeNumber,
        bankAccounts
      });
      await profile.save();
    }

    res.json({ success: true, message: 'Profile saved successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete bank account
router.delete('/bank/:index', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { index } = req.params;
    const profile = await Profile.findOne({ companyName: user.companyName });
    
    if (!profile || !profile.bankAccounts) {
      return res.status(404).json({ message: 'No bank accounts found' });
    }
    
    profile.bankAccounts.splice(parseInt(index), 1);
    await profile.save();

    res.json({ success: true, message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

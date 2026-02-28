const express = require('express');
const multer = require('multer');
const path = require('path');
const Profile = require('../models/Profile');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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

// Save/Update company profile with file uploads
router.post('/', auth, upload.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'tanCertificate', maxCount: 1 },
  { name: 'mcaCertificate', maxCount: 1 },
  { name: 'msmeCertificate', maxCount: 1 },
  { name: 'gstCertificates', maxCount: 10 },
  { name: 'bankStatements', maxCount: 10 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { gstNumber, gstNumbers, tradeName, address, panNumber, tanNumber, mcaNumber, msmeStatus, msmeNumber, bankAccounts } = req.body;
    
    // Parse gstNumbers if it's a string
    let parsedGstNumbers = gstNumbers;
    if (typeof gstNumbers === 'string') {
      parsedGstNumbers = JSON.parse(gstNumbers);
    }
    
    // Attach file paths to gstNumbers - only update entries that have new files
    if (req.files && req.files.gstCertificates) {
      let fileIndex = 0;
      parsedGstNumbers.forEach((gst, index) => {
        // Only assign file if this GST entry doesn't already have a certificate
        if (!gst.gstCertificate && fileIndex < req.files.gstCertificates.length) {
          gst.gstCertificate = req.files.gstCertificates[fileIndex].path;
          gst.gstCertificateName = req.files.gstCertificates[fileIndex].originalname;
          fileIndex++;
        }
      });
    }
    
    // Parse bankAccounts
    let parsedBankAccounts = bankAccounts;
    if (typeof bankAccounts === 'string') {
      parsedBankAccounts = JSON.parse(bankAccounts);
    }
    
    // Attach bank statement files
    if (req.files && req.files.bankStatements) {
      let fileIndex = 0;
      parsedBankAccounts.forEach((bank, index) => {
        if (!bank.bankStatement && fileIndex < req.files.bankStatements.length) {
          bank.bankStatement = req.files.bankStatements[fileIndex].path;
          bank.bankStatementName = req.files.bankStatements[fileIndex].originalname;
          fileIndex++;
        }
      });
    }
    
    let profile = await Profile.findOne({ companyName: user.companyName });
    
    if (profile) {
      // Update existing profile
      if (req.files?.companyLogo) profile.companyLogo = req.files.companyLogo[0].path;
      if (gstNumber !== undefined) profile.gstNumber = gstNumber;
      if (parsedGstNumbers !== undefined) profile.gstNumbers = parsedGstNumbers;
      if (tradeName !== undefined) profile.tradeName = tradeName;
      if (address !== undefined) profile.address = address;
      if (panNumber !== undefined) profile.panNumber = panNumber;
      if (tanNumber !== undefined) profile.tanNumber = tanNumber;
      if (req.files?.tanCertificate) {
        profile.tanCertificate = req.files.tanCertificate[0].path;
        profile.tanCertificateName = req.files.tanCertificate[0].originalname;
      }
      if (mcaNumber !== undefined) profile.mcaNumber = mcaNumber;
      if (req.files?.mcaCertificate) {
        profile.mcaCertificate = req.files.mcaCertificate[0].path;
        profile.mcaCertificateName = req.files.mcaCertificate[0].originalname;
      }
      if (msmeStatus !== undefined) profile.msmeStatus = msmeStatus;
      if (msmeNumber !== undefined) profile.msmeNumber = msmeNumber;
      if (req.files?.msmeCertificate) {
        profile.msmeCertificate = req.files.msmeCertificate[0].path;
        profile.msmeCertificateName = req.files.msmeCertificate[0].originalname;
      }
      if (parsedBankAccounts !== undefined) profile.bankAccounts = parsedBankAccounts;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        companyName: user.companyName,
        companyLogo: req.files?.companyLogo?.[0]?.path,
        gstNumber,
        gstNumbers: parsedGstNumbers,
        tradeName,
        address,
        panNumber,
        tanNumber,
        tanCertificate: req.files?.tanCertificate?.[0]?.path,
        tanCertificateName: req.files?.tanCertificate?.[0]?.originalname,
        mcaNumber,
        mcaCertificate: req.files?.mcaCertificate?.[0]?.path,
        mcaCertificateName: req.files?.mcaCertificate?.[0]?.originalname,
        msmeStatus,
        msmeNumber,
        msmeCertificate: req.files?.msmeCertificate?.[0]?.path,
        msmeCertificateName: req.files?.msmeCertificate?.[0]?.originalname,
        bankAccounts: parsedBankAccounts
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

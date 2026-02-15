const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BankStatement = require('../models/BankStatement');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/bank-statements');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { bankName, period } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const bankStatement = new BankStatement({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSize: (req.file.size / 1024).toFixed(2) + ' KB',
      filePath: req.file.path,
      bankName,
      period
    });

    await bankStatement.save();

    res.json({
      success: true,
      message: 'Bank statement uploaded successfully',
      data: bankStatement
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const statements = await BankStatement.find({ userId: req.user.id }).sort({ uploadDate: -1 });
    res.json({ success: true, data: statements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/download/:id', auth, async (req, res) => {
  try {
    const statement = await BankStatement.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!statement) {
      return res.status(404).json({ success: false, message: 'Statement not found' });
    }

    if (!fs.existsSync(statement.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(statement.filePath, statement.fileName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const statement = await BankStatement.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!statement) {
      return res.status(404).json({ success: false, message: 'Statement not found' });
    }

    if (fs.existsSync(statement.filePath)) {
      fs.unlinkSync(statement.filePath);
    }

    await BankStatement.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Statement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

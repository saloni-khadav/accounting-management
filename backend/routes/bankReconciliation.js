const express = require('express');
const router = express.Router();
const BankReconciliation = require('../models/BankReconciliation');

// Update or create reconciliation entry
router.post('/update', async (req, res) => {
  try {
    const { transactionId, transactionType, narration, remarks, status } = req.body;
    
    const reconciliation = await BankReconciliation.findOneAndUpdate(
      { transactionId, transactionType },
      { narration, remarks, status },
      { upsert: true, new: true }
    );
    
    res.json(reconciliation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get reconciliation entry
router.get('/:transactionId/:transactionType', async (req, res) => {
  try {
    const { transactionId, transactionType } = req.params;
    const reconciliation = await BankReconciliation.findOne({ transactionId, transactionType });
    res.json(reconciliation || { narration: '', remarks: '', status: '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reconciliation entries
router.get('/', async (req, res) => {
  try {
    const reconciliations = await BankReconciliation.find();
    res.json(reconciliations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

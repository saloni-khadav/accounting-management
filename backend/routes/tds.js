const express = require('express');
const router = express.Router();
const TDS = require('../models/TDS');
const Bill = require('../models/Bill');
const Vendor = require('../models/Vendor');

// Get all TDS entries from bills
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {
      tdsAmount: { $gt: 0 },
      tdsSection: { $exists: true, $ne: null, $ne: '' }
    };
    
    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { vendorName: { $regex: search, $options: 'i' } },
            { billNumber: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }
    
    const bills = await Bill.find(query).sort({ billDate: -1 });
    
    // Get vendor PAN numbers
    const vendorNames = [...new Set(bills.map(bill => bill.vendorName))];
    const vendors = await Vendor.find({ vendorName: { $in: vendorNames } });
    const vendorPanMap = {};
    vendors.forEach(vendor => {
      vendorPanMap[vendor.vendorName] = vendor.panNumber || 'N/A';
    });
    
    // Transform bills to TDS format
    const tdsEntries = bills.map(bill => ({
      _id: bill._id,
      vendorName: bill.vendorName || 'N/A',
      invoiceNo: bill.billNumber || 'N/A',
      invoiceDate: bill.billDate,
      panNo: vendorPanMap[bill.vendorName] || 'N/A',
      tdsSection: bill.tdsSection || 'N/A',
      taxableValue: bill.totalTaxableValue || 0,
      tdsAmount: bill.tdsAmount || 0,
      interest: 0,
      totalTdsPayable: bill.tdsAmount || 0,
      status: bill.status === 'Paid' ? 'Paid' : 'Payable',
      chalanNo: '',
      chalanDate: null
    }));
    
    res.json(tdsEntries);
  } catch (error) {
    console.error('TDS fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get TDS summary statistics from bills
router.get('/summary', async (req, res) => {
  try {
    const totalTds = await Bill.aggregate([
      { $match: { tdsAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
    ]);
    
    const paidTds = await Bill.aggregate([
      { $match: { tdsAmount: { $gt: 0 }, status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
    ]);
    
    const payableTds = await Bill.aggregate([
      { $match: { tdsAmount: { $gt: 0 }, status: { $ne: 'Paid' } } },
      { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
    ]);

    res.json({
      totalTds: totalTds[0]?.total || 0,
      paid: paidTds[0]?.total || 0,
      payable: payableTds[0]?.total || 0,
      interest: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
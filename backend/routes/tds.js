const express = require('express');
const router = express.Router();
const TDS = require('../models/TDS');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');

// Get all TDS entries from bills and payments
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let billQuery = {
      tdsAmount: { $gt: 0 },
      tdsSection: { $exists: true, $ne: null, $ne: '' },
      approvalStatus: 'approved'
    };
    
    let paymentQuery = {
      tdsAmount: { $gt: 0 },
      tdsSection: { $exists: true, $ne: null, $ne: '' },
      approvalStatus: 'approved'
    };
    
    if (search) {
      const searchCondition = {
        $or: [
          { vendorName: { $regex: search, $options: 'i' } },
          { billNumber: { $regex: search, $options: 'i' } }
        ]
      };
      const paymentSearchCondition = {
        $or: [
          { vendor: { $regex: search, $options: 'i' } },
          { invoiceNumber: { $regex: search, $options: 'i' } }
        ]
      };
      
      billQuery = { ...billQuery, ...searchCondition };
      paymentQuery = { ...paymentQuery, ...paymentSearchCondition };
    }
    
    const [bills, payments] = await Promise.all([
      Bill.find(billQuery).sort({ billDate: -1 }),
      Payment.find(paymentQuery).sort({ paymentDate: -1 })
    ]);
    
    // Get vendor PAN numbers
    const vendorNames = [...new Set([
      ...bills.map(bill => bill.vendorName),
      ...payments.map(payment => payment.vendor)
    ])];
    const vendors = await Vendor.find({ vendorName: { $in: vendorNames } });
    const vendorPanMap = {};
    vendors.forEach(vendor => {
      vendorPanMap[vendor.vendorName] = vendor.panNumber || 'N/A';
    });
    
    // Transform bills to TDS format
    const billTdsEntries = bills.map(bill => ({
      _id: bill._id,
      source: 'Bill',
      vendorName: bill.vendorName || 'N/A',
      invoiceNo: bill.billNumber || 'N/A',
      invoiceDate: bill.billDate,
      panNo: bill.vendorPAN || vendorPanMap[bill.vendorName] || 'N/A',
      tdsSection: bill.tdsSection || 'N/A',
      taxableValue: bill.totalTaxableValue || 0,
      tdsAmount: bill.tdsAmount || 0,
      interest: 0,
      totalTdsPayable: bill.tdsAmount || 0,
      status: 'Payable',
      chalanNo: bill.chalanNo || '',
      chalanDate: bill.chalanDate || null
    }));
    
    // Transform payments to TDS format
    const paymentTdsEntries = payments.map(payment => ({
      _id: payment._id,
      source: 'Payment',
      vendorName: payment.vendor || 'N/A',
      invoiceNo: payment.invoiceNumber || 'N/A',
      invoiceDate: payment.paymentDate,
      panNo: vendorPanMap[payment.vendor] || 'N/A',
      tdsSection: payment.tdsSection || 'N/A',
      taxableValue: payment.amount || 0,
      tdsAmount: payment.tdsAmount || 0,
      interest: 0,
      totalTdsPayable: payment.tdsAmount || 0,
      status: 'Paid',
      chalanNo: '',
      chalanDate: null
    }));
    
    // Combine and sort by date
    const allTdsEntries = [...billTdsEntries, ...paymentTdsEntries]
      .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
    
    res.json(allTdsEntries);
  } catch (error) {
    console.error('TDS fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get TDS summary statistics from bills and payments
router.get('/summary', async (req, res) => {
  try {
    // Debug: Check all bills first
    const allBills = await Bill.find({});
    console.log('Total bills in database:', allBills.length);
    console.log('Bills with TDS amount > 0:', allBills.filter(b => b.tdsAmount > 0).length);
    console.log('Approved bills with TDS:', allBills.filter(b => b.tdsAmount > 0 && b.approvalStatus === 'approved').length);
    
    const [billTotalTds, paymentTotalTds] = await Promise.all([
      Bill.aggregate([
        { $match: { tdsAmount: { $gt: 0 }, approvalStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
      ]),
      Payment.aggregate([
        { $match: { tdsAmount: { $gt: 0 }, approvalStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
      ])
    ]);
    
    const [billPayableTds, paymentPaidTds] = await Promise.all([
      Bill.aggregate([
        { $match: { tdsAmount: { $gt: 0 }, approvalStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
      ]),
      Payment.aggregate([
        { $match: { tdsAmount: { $gt: 0 }, approvalStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$tdsAmount' } } }
      ])
    ]);

    const totalTds = (billTotalTds[0]?.total || 0) + (paymentTotalTds[0]?.total || 0);
    const paid = paymentPaidTds[0]?.total || 0;
    const payable = billPayableTds[0]?.total || 0;

    console.log('TDS Summary:', { totalTds, paid, payable });

    res.json({
      totalTds,
      paid,
      payable,
      interest: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
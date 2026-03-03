const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/bills/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get PO details for vendor
router.get('/po-details', async (req, res) => {
  try {
    const { po, vendor, token } = req.query;
    
    // Verify token
    const expectedToken = Buffer.from(vendor + ':' + po).toString('base64');
    if (token !== expectedToken) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const poData = await PurchaseOrder.findById(po);
    const vendorData = await Vendor.findById(vendor);

    if (!poData || !vendorData) {
      return res.status(404).json({ message: 'PO or Vendor not found' });
    }

    res.json({ po: poData, vendor: vendorData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit bill from vendor
router.post('/submit', upload.single('invoice'), async (req, res) => {
  try {
    const { poId, vendorId, token, billNumber, billDate } = req.body;
    
    // Verify token
    const expectedToken = Buffer.from(vendorId + ':' + poId).toString('base64');
    if (token !== expectedToken) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const po = await PurchaseOrder.findById(poId);
    const vendor = await Vendor.findById(vendorId);

    if (!po || !vendor) {
      return res.status(404).json({ message: 'PO or Vendor not found' });
    }

    // Create bill from PO data
    const bill = new Bill({
      billNumber,
      billDate,
      referenceNumber: po.poNumber,
      vendorName: vendor.vendorName,
      vendorGSTIN: vendor.gstNumber,
      vendorPAN: vendor.panNumber,
      billingAddress: vendor.billingAddress,
      items: po.items,
      subTotal: po.subTotal,
      totalTax: po.totalTax,
      grandTotal: po.totalAmount,
      approvalStatus: 'pending',
      status: 'Pending',
      submittedByVendor: true,
      invoicePath: req.file ? req.file.path : null
    });

    await bill.save();

    // Create notification for all users
    const users = await User.find({});
    for (const user of users) {
      await Notification.create({
        userId: user._id,
        type: 'bill_submitted',
        title: 'New Bill Submitted by Vendor',
        message: `${vendor.vendorName} has submitted bill ${billNumber} for PO ${po.poNumber}`,
        relatedId: bill._id,
        relatedModel: 'Bill'
      });
    }

    res.json({ message: 'Bill submitted successfully', billId: bill._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

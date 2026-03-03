const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');
const sendEmail = require('../utils/sendEmail');

// Get Purchase Orders by vendor name
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const vendorName = req.params.vendorName;
    console.log('Searching Purchase Orders for vendor:', vendorName);
    
    const purchaseOrders = await PurchaseOrder.find({ 
      $or: [
        { supplier: { $regex: vendorName, $options: 'i' } },
        { supplier: vendorName }
      ],
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    }).select('poNumber supplier poDate deliveryDate items subTotal totalAmount').sort({ createdAt: -1 });
    
    console.log('Found Purchase Orders:', purchaseOrders.length);
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching Purchase Orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get available POs with remaining amounts
router.get('/available', async (req, res) => {
  try {
    // Get all approved purchase orders
    const approvedPOs = await PurchaseOrder.find({
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    }).sort({ createdAt: -1 });
    
    // Get all approved bills
    const approvedBills = await Bill.find({
      $or: [
        { approvalStatus: 'approved' },
        { status: 'Approved' }
      ]
    });
    
    // Calculate remaining amounts for each PO
    const availablePOs = approvedPOs.map(po => {
      // Find all bills that reference this PO
      const relatedBills = approvedBills.filter(bill => 
        bill.referenceNumber === po.poNumber
      );
      
      // Calculate total used amount from approved bills
      const usedAmount = relatedBills.reduce((sum, bill) => {
        return sum + (bill.grandTotal || 0);
      }, 0);
      
      const remainingAmount = (po.totalAmount || 0) - usedAmount;
      
      return {
        ...po.toObject(),
        usedAmount,
        remainingAmount,
        isFullyUsed: remainingAmount <= 0
      };
    }).filter(po => !po.isFullyUsed); // Only return POs with remaining amount
    
    res.json(availablePOs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get next PO number
router.get('/next-po-number', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let settings = await Settings.findOne({ companyName: user.companyName });
    
    if (!settings) {
      settings = new Settings({ 
        companyName: user.companyName,
        poPrefix: 'PO-',
        poStartNumber: '001'
      });
      await settings.save();
    }
    
    const poPrefix = settings.poPrefix || 'PO-';
    const startNum = settings.poStartNumber || '001';
    
    // Find all POs with this exact prefix
    const allPOs = await PurchaseOrder.find({}).sort({ createdAt: -1 });
    let maxNumber = parseInt(startNum) - 1;
    
    for (const po of allPOs) {
      if (po.poNumber && po.poNumber.startsWith(poPrefix)) {
        const afterPrefix = po.poNumber.substring(poPrefix.length);
        if (/^\d+$/.test(afterPrefix)) {
          const num = parseInt(afterPrefix);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    
    const nextNum = maxNumber + 1;
    const paddedNum = String(nextNum).padStart(startNum.length, '0');
    const poNumber = poPrefix + paddedNum;
    
    res.json({ poNumber });
  } catch (error) {
    console.error('Error generating PO number:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new purchase order
router.post('/', auth, checkPeriodPermission('Purchase Orders'), async (req, res) => {
  try {
    const purchaseOrder = new PurchaseOrder(req.body);
    const savedPO = await purchaseOrder.save();
    res.status(201).json(savedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send PO email to vendor
router.post('/:id/send-email', auth, async (req, res) => {
  try {
    console.log('=== EMAIL ENDPOINT CALLED ===');
    const { pdfData } = req.body;
    console.log('PDF Data received:', pdfData ? 'Yes' : 'No');
    console.log('PDF Data length:', pdfData ? pdfData.length : 0);
    
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const vendor = await Vendor.findOne({ vendorName: purchaseOrder.supplier });
    
    if (!vendor || !vendor.email) {
      return res.status(404).json({ message: 'Vendor email not found' });
    }

    const emailOptions = {
      email: vendor.email,
      subject: `Purchase Order - ${purchaseOrder.poNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Purchase Order</h2>
          <p>Dear ${vendor.contactPerson || vendor.vendorName},</p>
          <p>Please find attached the Purchase Order <strong>${purchaseOrder.poNumber}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>PO Number:</strong> ${purchaseOrder.poNumber}</p>
            <p style="margin: 5px 0;"><strong>PO Date:</strong> ${new Date(purchaseOrder.poDate).toLocaleDateString('en-GB')}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${purchaseOrder.totalAmount?.toFixed(2)}</p>
          </div>
          <p>Please review the attached document.</p>
          <p>Best regards,<br/>ECOAGRITEK AI SOLUTIONS PRIVATE LIMITED</p>
        </div>
      `
    };
    
    if (pdfData) {
      console.log('Adding PDF attachment...');
      emailOptions.attachments = [
        {
          filename: `PurchaseOrder_${purchaseOrder.poNumber}.pdf`,
          content: pdfData,
          encoding: 'base64'
        }
      ];
      console.log('PDF attachment added');
    } else {
      console.log('No PDF data provided');
    }

    console.log('Sending email...');
    await sendEmail(emailOptions);
    console.log('✅ Email sent successfully');
    
    res.json({ message: 'Email sent successfully', email: vendor.email });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get purchase order by ID
router.get('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update purchase order
router.put('/:id', auth, checkPeriodPermission('Purchase Orders'), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete all purchase orders
router.delete('/all/purchase-orders', async (req, res) => {
  try {
    const result = await PurchaseOrder.deleteMany({});
    res.json({ 
      message: 'All purchase orders deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete purchase order
router.delete('/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
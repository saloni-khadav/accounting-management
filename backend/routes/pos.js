const express = require('express');
const PO = require('../models/PO');
const Settings = require('../models/Settings');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkPeriodPermission = require('../middleware/checkPeriodPermission');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// Generate next PI number
router.get('/next-number', auth, async (req, res) => {
  try {
    // Get user's company settings
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne({ companyName: user.companyName });
    
    const poPrefix = settings?.poPrefix || 'PO';
    const poStartNumber = parseInt(settings?.poStartNumber || '1');
    
    // Find the last PO with this prefix
    const lastPO = await PO.findOne({
      $or: [
        { piNumber: { $regex: `^${poPrefix}` } },
        { poNumber: { $regex: `^${poPrefix}` } }
      ]
    }).sort({ createdAt: -1 });
    
    let nextNumber = poStartNumber;
    if (lastPO) {
      const number = lastPO.piNumber || lastPO.poNumber;
      if (number) {
        // Extract number from the end of the string
        const match = number.match(/(\d+)$/);
        if (match) {
          const lastNumber = parseInt(match[1]);
          if (!isNaN(lastNumber) && lastNumber >= poStartNumber) {
            nextNumber = lastNumber + 1;
          }
        }
      }
    }
    
    const piNumber = `${poPrefix}${nextNumber.toString().padStart(3, '0')}`;
    res.json({ poNumber: piNumber, piNumber });
  } catch (error) {
    console.error('Error generating PI number:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new PI
router.post('/', auth, checkPeriodPermission('Proforma Invoices'), async (req, res) => {
  try {
    console.log('=== CREATE PI ROUTE ENTERED ===');
    console.log('Received PI data:', JSON.stringify(req.body, null, 2));
    
    // Check if PI number already exists
    const piNumberToCheck = req.body.piNumber || req.body.poNumber;
    const existingPO = await PO.findOne({ 
      $or: [
        { piNumber: piNumberToCheck }, 
        { poNumber: piNumberToCheck }
      ] 
    });
    if (existingPO) {
      console.log('Duplicate PI found:', existingPO);
      return res.status(400).json({ 
        message: `PI number ${piNumberToCheck} already exists. Please use a different PI number.` 
      });
    }
    
    // Sync poNumber/piNumber and poDate/piDate
    const poData = { ...req.body };
    if (req.body.poNumber && !req.body.piNumber) {
      poData.piNumber = req.body.poNumber;
    } else if (req.body.piNumber && !req.body.poNumber) {
      poData.poNumber = req.body.piNumber;
    }
    if (req.body.poDate && !req.body.piDate) {
      poData.piDate = req.body.poDate;
    } else if (req.body.piDate && !req.body.poDate) {
      poData.poDate = req.body.piDate;
    }
    
    const po = new PO(poData);
    const savedPO = await po.save();
    res.status(201).json(savedPO);
  } catch (error) {
    console.error('Error creating PI:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate PI number. This PI number already exists.' 
      });
    }
    res.status(400).json({ message: error.message, details: error });
  }
});

// Get POs by vendor name
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const vendorName = req.params.vendorName;
    console.log('Searching POs for vendor:', vendorName);
    
    const pos = await PO.find({ 
      $or: [
        { supplierName: { $regex: vendorName, $options: 'i' } },
        { supplierName: vendorName }
      ],
      approvalStatus: 'approved'
    }).select('piNumber poNumber piDate poDate deliveryDate items subTotal totalAmount supplierName').sort({ createdAt: -1 });
    
    console.log('Found POs:', pos.length);
    res.json(pos);
  } catch (error) {
    console.error('Error fetching POs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all PIs
router.get('/', async (req, res) => {
  try {
    const pos = await PO.find().populate('supplier').sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all PIs
router.delete('/all/pos', async (req, res) => {
  try {
    const result = await PO.deleteMany({});
    res.json({ 
      message: 'All proforma invoices deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get PI by ID
router.get('/:id', async (req, res) => {
  try {
    let po = await PO.findById(req.params.id).populate('supplier');
    
    // If not found in PO model, try PurchaseOrder model
    if (!po) {
      const PurchaseOrder = require('../models/PurchaseOrder');
      po = await PurchaseOrder.findById(req.params.id);
      
      if (po) {
        // Convert PurchaseOrder to PO format
        po = {
          _id: po._id,
          piNumber: po.poNumber,
          poNumber: po.poNumber,
          piDate: po.poDate,
          poDate: po.poDate,
          deliveryDate: po.deliveryDate,
          gstNumber: po.gstNumber,
          deliveryAddress: po.deliveryAddress,
          supplierName: po.supplier,
          items: po.items,
          subTotal: po.subTotal,
          totalDiscount: po.totalDiscount,
          totalTax: po.totalTax,
          totalAmount: po.totalAmount
        };
      }
    }
    
    if (!po) {
      return res.status(404).json({ message: 'PI not found' });
    }
    res.json(po);
  } catch (error) {
    console.error('Error fetching PO:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update PI
router.put('/:id', auth, checkPeriodPermission('Proforma Invoices'), async (req, res) => {
  try {
    // Sync poNumber/piNumber and poDate/piDate
    const updateData = { ...req.body };
    if (req.body.poNumber && !req.body.piNumber) {
      updateData.piNumber = req.body.poNumber;
    } else if (req.body.piNumber && !req.body.poNumber) {
      updateData.poNumber = req.body.piNumber;
    }
    if (req.body.poDate && !req.body.piDate) {
      updateData.piDate = req.body.poDate;
    } else if (req.body.piDate && !req.body.poDate) {
      updateData.poDate = req.body.piDate;
    }
    
    const po = await PO.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!po) {
      return res.status(404).json({ message: 'PI not found' });
    }
    res.json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete PI
router.delete('/:id', async (req, res) => {
  try {
    const po = await PO.findByIdAndDelete(req.params.id);
    if (!po) {
      return res.status(404).json({ message: 'PI not found' });
    }
    res.json({ message: 'PI deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send Proforma Invoice email with PDF
router.post('/:id/send-email', auth, async (req, res) => {
  try {
    const po = await PO.findById(req.params.id).populate('supplier');
    if (!po) {
      return res.status(404).json({ message: 'Proforma Invoice not found' });
    }

    // Get customer email - try multiple sources
    let customerEmail = null;
    
    // Try from populated supplier (Client model)
    if (po.supplier && po.supplier.email) {
      customerEmail = po.supplier.email;
    }
    
    // If not found, try to find vendor by name
    if (!customerEmail) {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ vendorName: po.supplierName });
      if (vendor && vendor.email) {
        customerEmail = vendor.email;
      }
    }
    
    if (!customerEmail || !customerEmail.includes('@')) {
      console.error('No valid email found for:', po.supplierName);
      return res.status(400).json({ message: 'Valid customer email not found for ' + po.supplierName });
    }

    // Get PDF from frontend (base64) - MUST come from frontend
    const { pdfBase64 } = req.body;
    
    if (!pdfBase64) {
      console.error('No PDF data received from frontend');
      return res.status(400).json({ message: 'PDF data is required from frontend' });
    }
    
    console.log('Sending email to:', customerEmail);
    console.log('PDF size:', pdfBase64.length, 'characters');
    
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    console.log('PDF buffer size:', pdfBuffer.length, 'bytes');

    // Create email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Proforma Invoice</h2>
        <p>Dear ${po.supplierName},</p>
        <p>Please find the attached proforma invoice for your reference.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>PI Number:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${po.piNumber || po.poNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>PI Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(po.piDate || po.poDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₹${po.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        
        <p>Thank you for your business!</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    await sendEmail({
      email: customerEmail,
      subject: `Proforma Invoice - ${po.piNumber || po.poNumber}`,
      html: emailHtml,
      attachments: [{
        filename: `PO-${po.piNumber || po.poNumber}.pdf`,
        content: pdfBuffer
      }]
    });

    console.log('Email sent successfully to:', customerEmail);
    res.json({ message: 'Email sent successfully', email: customerEmail });
  } catch (error) {
    console.error('Error sending proforma invoice email:', error);
    res.status(500).json({ message: 'Failed to send email: ' + error.message });
  }
});

module.exports = router;
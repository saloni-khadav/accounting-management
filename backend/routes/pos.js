const express = require('express');
const PO = require('../models/PO');
const router = express.Router();

// Generate next PI number
router.get('/next-number', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    // Find the last PI for this year - check both piNumber and poNumber fields
    const lastPO = await PO.findOne({
      $or: [
        { piNumber: { $regex: `^PI-${yearCode}-` } },
        { poNumber: { $regex: `^PI-${yearCode}-` } }
      ]
    }).sort({ createdAt: -1 });
    
    let nextNumber = 1;
    if (lastPO) {
      const number = lastPO.piNumber || lastPO.poNumber;
      if (number) {
        const parts = number.split('-');
        if (parts.length === 3) {
          const lastNumber = parseInt(parts[2]);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
      }
    }
    
    const piNumber = `PI-${yearCode}-${nextNumber.toString().padStart(3, '0')}`;
    res.json({ poNumber: piNumber, piNumber });
  } catch (error) {
    console.error('Error generating PI number:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new PI
router.post('/', async (req, res) => {
  try {
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
    const po = await PO.findById(req.params.id).populate('supplier');
    if (!po) {
      return res.status(404).json({ message: 'PI not found' });
    }
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update PI
router.put('/:id', async (req, res) => {
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

module.exports = router;
const express = require('express');
const PO = require('../models/PO');
const router = express.Router();

// Get proforma invoices with filters
router.get('/', async (req, res) => {
  try {
    const { customerName, status } = req.query;
    
    let query = {};
    
    // Filter by customer name
    if (customerName) {
      query.supplierName = customerName;
    }
    
    // Filter by status (Approved)
    if (status) {
      if (status === 'Approved') {
        query.$or = [
          { status: 'Approved' },
          { approvalStatus: 'approved' }
        ];
      }
    }
    
    const proformas = await PO.find(query).sort({ createdAt: -1 });
    
    // Map PO fields to proforma invoice fields
    const mappedProformas = proformas.map(po => ({
      _id: po._id,
      proformaNumber: po.piNumber || po.poNumber,
      proformaDate: po.piDate || po.poDate,
      customerName: po.supplierName,
      items: po.items,
      grandTotal: po.totalAmount,
      status: po.status,
      approvalStatus: po.approvalStatus
    }));
    
    res.json(mappedProformas);
  } catch (error) {
    console.error('Error fetching proforma invoices:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

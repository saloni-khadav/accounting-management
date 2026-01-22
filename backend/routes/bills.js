const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

// Function to update bill status based on payments
const updateBillStatus = async (billId) => {
  try {
    const bill = await Bill.findById(billId);
    if (!bill) return;
    
    // Calculate total paid amount for this bill
    const payments = await Payment.find({ 
      billId: billId,
      status: 'Completed'
    });
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.netAmount, 0);
    
    // Update bill with paid amount
    bill.paidAmount = totalPaid;
    await bill.save(); // This will trigger the pre-save hook to update status
  } catch (error) {
    console.error('Error updating bill status:', error);
  }
};

// Function to update all bill statuses based on due dates
const updateAllBillStatuses = async () => {
  try {
    const bills = await Bill.find({ 
      status: { $nin: ['Draft', 'Cancelled', 'Fully Paid'] }
    });
    
    for (const bill of bills) {
      await updateBillStatus(bill._id);
    }
  } catch (error) {
    console.error('Error updating all bill statuses:', error);
  }
};

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, vendorName } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (vendorName) {
      query.vendorName = { $regex: vendorName, $options: 'i' };
    }
    
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    
    // Update all bill statuses before returning
    await updateAllBillStatuses();
    
    const bills = await Bill.find(query).sort({ billDate: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    console.log('Creating bill with data:', {
      grandTotal: req.body.grandTotal,
      tdsAmount: req.body.tdsAmount,
      tdsSection: req.body.tdsSection
    });
    
    const bill = new Bill(req.body);
    const savedBill = await bill.save();
    
    console.log('Saved bill:', {
      grandTotal: savedBill.grandTotal,
      tdsAmount: savedBill.tdsAmount,
      tdsSection: savedBill.tdsSection
    });
    
    res.status(201).json(savedBill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const existingBill = await Bill.findById(req.params.id);
    if (!existingBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Preserve certain fields during update
    const updateData = {
      ...req.body,
      // Preserve status and approval status if not explicitly changed
      status: req.body.status || existingBill.status,
      approvalStatus: req.body.approvalStatus || existingBill.approvalStatus,
      paidAmount: existingBill.paidAmount // Preserve paid amount
    };
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update bill status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve or reject bill
router.patch('/:id/approval', async (req, res) => {
  try {
    const { action } = req.body;
    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    
    let updateData = { approvalStatus };
    
    if (action === 'approve') {
      // When approved, set status to 'Not Paid' and let pre-save hook determine correct status
      updateData.status = 'Not Paid';
    } else {
      updateData.status = 'Cancelled';
    }
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // If approved, save again to trigger pre-save hook for status calculation
    if (action === 'approve') {
      await bill.save();
    }
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export the updateBillStatus function for use in payments route
router.updateBillStatus = updateBillStatus;

module.exports = router;

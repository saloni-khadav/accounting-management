const express = require('express');
const router = express.Router();
const CreditNote = require('../models/CreditNote');
const Invoice = require('../models/Invoice');
const Collection = require('../models/Collection');
const auth = require('../middleware/auth');

// Helper function to update invoice status
const updateInvoiceStatus = async (invoiceNumber) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      console.log(`Invoice ${invoiceNumber} not found`);
      return;
    }

    // Get all approved collections for this invoice
    const collections = await Collection.find({ 
      invoiceNumber: { $regex: new RegExp(invoiceNumber, 'i') },
      approvalStatus: 'Approved'
    });
    
    // Get all approved credit notes for this invoice
    const creditNotes = await CreditNote.find({ 
      originalInvoiceNumber: invoiceNumber,
      approvalStatus: 'Approved'
    });

    // Calculate total collected and credited amounts
    const totalCollected = collections.reduce((sum, col) => sum + (parseFloat(col.netAmount) || 0), 0);
    const totalCredited = creditNotes.reduce((sum, cn) => sum + (parseFloat(cn.grandTotal) || 0), 0);
    const totalReceived = totalCollected + totalCredited;

    // Update invoice status based on received amount
    const grandTotal = parseFloat(invoice.grandTotal) || 0;
    let newStatus = 'Not Received';
    
    if (totalReceived >= grandTotal - 0.01) { // Small tolerance for floating point
      newStatus = 'Fully Received';
    } else if (totalReceived > 0) {
      newStatus = 'Partially Received';
    }

    console.log(`Invoice ${invoiceNumber}: Total=${grandTotal}, Collected=${totalCollected}, Credited=${totalCredited}, NewStatus=${newStatus}`);

    if (invoice.status !== newStatus) {
      invoice.status = newStatus;
      await invoice.save();
      console.log(`Invoice ${invoiceNumber} status updated to ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
};

// Get all credit notes
router.get('/', auth, async (req, res) => {
  try {
    const creditNotes = await CreditNote.find()
      .sort({ createdAt: -1 });
    res.json(creditNotes);
  } catch (error) {
    console.error('Error fetching credit notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new credit note
router.post('/', auth, async (req, res) => {
  try {
    // Generate credit note number if not provided
    let creditNoteNumber = req.body.creditNoteNumber;
    
    if (!creditNoteNumber) {
      const lastCreditNote = await CreditNote.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select('creditNoteNumber');
      
      if (lastCreditNote && lastCreditNote.creditNoteNumber) {
        const match = lastCreditNote.creditNoteNumber.match(/CN-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          creditNoteNumber = `CN-${String(nextNumber).padStart(5, '0')}`;
        } else {
          creditNoteNumber = 'CN-00001';
        }
      } else {
        creditNoteNumber = 'CN-00001';
      }
    }
    
    const creditNoteData = {
      ...req.body,
      creditNoteNumber,
      userId: req.user.id
    };
    
    const creditNote = new CreditNote(creditNoteData);
    await creditNote.save();
    
    // Update invoice status if approved
    if (creditNote.approvalStatus === 'Approved' && creditNote.originalInvoiceNumber) {
      await updateInvoiceStatus(creditNote.originalInvoiceNumber);
    }
    
    res.status(201).json(creditNote);
  } catch (error) {
    console.error('Error creating credit note:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Credit note number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update credit note
router.put('/:id', auth, async (req, res) => {
  try {
    const oldCreditNote = await CreditNote.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!oldCreditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    const creditNote = await CreditNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    // Update invoice status if approval status changed or amount changed
    const approvalChanged = oldCreditNote.approvalStatus !== creditNote.approvalStatus;
    const amountChanged = oldCreditNote.grandTotal !== creditNote.grandTotal;
    
    if ((approvalChanged || amountChanged) && creditNote.approvalStatus === 'Approved' && creditNote.originalInvoiceNumber) {
      await updateInvoiceStatus(creditNote.originalInvoiceNumber);
    }
    
    // If it was approved before but now rejected, update invoice
    if (oldCreditNote.approvalStatus === 'Approved' && creditNote.approvalStatus === 'Rejected' && oldCreditNote.originalInvoiceNumber) {
      await updateInvoiceStatus(oldCreditNote.originalInvoiceNumber);
    }
    
    res.json(creditNote);
  } catch (error) {
    console.error('Error updating credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete credit note
router.delete('/:id', auth, async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    const originalInvoiceNumber = creditNote.originalInvoiceNumber;
    const wasApproved = creditNote.approvalStatus === 'Approved';
    
    await CreditNote.findByIdAndDelete(req.params.id);
    
    // Update invoice status if credit note was approved
    if (wasApproved && originalInvoiceNumber) {
      await updateInvoiceStatus(originalInvoiceNumber);
    }
    
    res.json({ message: 'Credit note deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single credit note
router.get('/:id', auth, async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    res.json(creditNote);
  } catch (error) {
    console.error('Error fetching credit note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update approval status (Manager only)
router.patch('/:id/approval', auth, async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    
    if (!['Approved', 'Rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }
    
    const creditNote = await CreditNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        approvalStatus,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    // Update invoice status if approved
    if (approvalStatus === 'Approved' && creditNote.originalInvoiceNumber) {
      await updateInvoiceStatus(creditNote.originalInvoiceNumber);
    }
    
    res.json(creditNote);
  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
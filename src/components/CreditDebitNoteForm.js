import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, X } from 'lucide-react';

const CreditDebitNoteForm = ({ isOpen, onClose, onSave, editingNote }) => {
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

  // Generate automatic note number
  const generateNoteNumber = (type) => {
    // For financial year 2026-27 format
    const yearCode = '2627';
    const prefix = type === 'Credit Note' ? 'CN' : 'DN';
    
    // Find existing notes with same prefix and year
    const existingNotes = creditDebitNotes.filter(note => 
      note.noteNumber && note.noteNumber.startsWith(`${prefix}-${yearCode}-`)
    );
    
    // Get the highest sequence number
    let maxSequence = 0;
    existingNotes.forEach(note => {
      const parts = note.noteNumber.split('-');
      if (parts.length === 3) {
        const sequence = parseInt(parts[2]);
        if (sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });
    
    const nextSequence = (maxSequence + 1).toString().padStart(3, '0');
    return `${prefix}-${yearCode}-${nextSequence}`;
  };

  useEffect(() => {
    // Fetch existing notes for number generation
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/credit-debit-notes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCreditDebitNotes(data);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    
    // Fetch vendors
    const fetchVendors = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/vendors', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    
    if (isOpen) {
      fetchNotes();
      fetchVendors();
    }
  }, [isOpen]);

  const [noteData, setNoteData] = useState({
    noteNumber: '',
    noteDate: new Date().toISOString().split('T')[0],
    invoiceDate: '',
    type: 'Credit Note',
    referenceNumber: '',
    originalInvoiceNumber: '',
    reason: '',
    
    // Vendor Details
    vendorName: '',
    vendorAddress: '',
    vendorGSTIN: '',
    
    // Items
    items: [{
      description: '',
      hsnCode: '',
      quantity: 1,
      unitPrice: 0,
      cgstRate: 9,
      sgstRate: 9,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0
    }],
    
    // Totals
    subtotal: 0,
    totalCGST: 0,
    totalSGST: 0,
    grandTotal: 0,
    
    notes: ''
  });

  useEffect(() => {
    if (editingNote) {
      setNoteData({
        ...editingNote,
        noteDate: editingNote.date ? new Date(editingNote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceDate: editingNote.invoiceDate || '',
        noteNumber: editingNote.noteNumber || generateNoteNumber(editingNote.type || 'Credit Note'),
        items: editingNote.items || [{
          description: '',
          hsnCode: '',
          quantity: 1,
          unitPrice: 0,
          cgstRate: 9,
          sgstRate: 9,
          cgstAmount: 0,
          sgstAmount: 0,
          totalAmount: 0
        }]
      });
    } else if (creditDebitNotes.length >= 0) {
      setNoteData({
        noteNumber: generateNoteNumber('Credit Note'),
        noteDate: new Date().toISOString().split('T')[0],
        invoiceDate: '',
        type: 'Credit Note',
        referenceNumber: '',
        originalInvoiceNumber: '',
        reason: '',
        vendorName: '',
        vendorAddress: '',
        vendorGSTIN: '',
        items: [{
          description: '',
          hsnCode: '',
          quantity: 1,
          unitPrice: 0,
          cgstRate: 9,
          sgstRate: 9,
          cgstAmount: 0,
          sgstAmount: 0,
          totalAmount: 0
        }],
        subtotal: 0,
        totalCGST: 0,
        totalSGST: 0,
        grandTotal: 0,
        notes: ''
      });
    }
  }, [editingNote, creditDebitNotes]);

  useEffect(() => {
    calculateTotals();
  }, [noteData.items]);

  const calculateItemTotals = (item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const cgstRate = Math.max(0, Number(item.cgstRate) || 0);
    const sgstRate = Math.max(0, Number(item.sgstRate) || 0);
    
    const taxableValue = quantity * unitPrice;
    const cgstAmount = (taxableValue * cgstRate) / 100;
    const sgstAmount = (taxableValue * sgstRate) / 100;
    const totalAmount = taxableValue + cgstAmount + sgstAmount;

    return {
      ...item,
      cgstAmount,
      sgstAmount,
      totalAmount
    };
  };

  const calculateTotals = () => {
    if (!noteData.items || noteData.items.length === 0) return;
    
    const updatedItems = noteData.items.map(calculateItemTotals);
    
    const subtotal = updatedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const totalCGST = updatedItems.reduce((sum, item) => sum + Number(item.cgstAmount), 0);
    const totalSGST = updatedItems.reduce((sum, item) => sum + Number(item.sgstAmount), 0);
    const grandTotal = subtotal + totalCGST + totalSGST;

    setNoteData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      totalCGST,
      totalSGST,
      grandTotal
    }));
  };

  const handleInputChange = (field, value) => {
    if (field === 'type') {
      // Keep the same number but change only the prefix
      const currentNumber = noteData.noteNumber;
      if (currentNumber) {
        const parts = currentNumber.split('-');
        if (parts.length === 3) {
          const newPrefix = value === 'Credit Note' ? 'CN' : 'DN';
          const newNoteNumber = `${newPrefix}-${parts[1]}-${parts[2]}`;
          setNoteData(prev => ({
            ...prev,
            [field]: value,
            noteNumber: newNoteNumber
          }));
          return;
        }
      }
      // Fallback to generate new number if parsing fails
      setNoteData(prev => ({
        ...prev,
        [field]: value,
        noteNumber: generateNoteNumber(value)
      }));
    } else if (field === 'vendorName') {
      setVendorSearchTerm(value);
      setShowVendorDropdown(true);
      setNoteData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setNoteData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleVendorSelect = (vendor) => {
    setNoteData(prev => ({
      ...prev,
      vendorName: vendor.vendorName,
      vendorAddress: vendor.billingAddress || '',
      vendorGSTIN: vendor.gstNumber || ''
    }));
    setVendorSearchTerm('');
    setShowVendorDropdown(false);
    
    // Fetch fully paid invoices for this vendor
    fetchVendorInvoices(vendor.vendorName);
  };

  const fetchVendorInvoices = async (vendorName) => {
    try {
      const response = await fetch('http://localhost:5001/api/bills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const bills = await response.json();
        
        // Get payments to calculate paid amounts
        const paymentsResponse = await fetch('http://localhost:5001/api/payments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        let payments = [];
        if (paymentsResponse.ok) {
          payments = await paymentsResponse.json();
        }
        
        // Filter bills for this vendor and exclude fully paid ones
        const vendorBills = bills.filter(bill => bill.vendorName === vendorName);
        const availableInvoices = vendorBills.filter(bill => {
          const billPayments = payments.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
          return totalPaid < netPayable; // Show invoices that are NOT fully paid
        });
        
        setVendorInvoices(availableInvoices);
      }
    } catch (error) {
      console.error('Error fetching vendor invoices:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor && vendor.vendorName && vendor.vendorName.toLowerCase().includes((vendorSearchTerm || noteData.vendorName || '').toLowerCase()) ||
    vendor && vendor.vendorCode && vendor.vendorCode.toLowerCase().includes((vendorSearchTerm || noteData.vendorName || '').toLowerCase())
  );

  const handleItemChange = (index, field, value) => {
    setNoteData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addItem = () => {
    const newItem = {
      description: '',
      hsnCode: '',
      quantity: 1,
      unitPrice: 0,
      cgstRate: 9,
      sgstRate: 9,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0
    };
    
    setNoteData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    if (noteData.items.length > 1) {
      const updatedItems = noteData.items.filter((_, i) => i !== index);
      setNoteData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const handleSave = async () => {
    if (!noteData.vendorName || !noteData.vendorName.trim()) {
      alert('Vendor name is required');
      return;
    }
    if (!noteData.noteNumber || !noteData.noteNumber.trim()) {
      alert('Note number is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const userResponse = await fetch('http://localhost:5001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      const userRole = userData.user.role;

      const savedNote = {
        ...noteData,
        status: 'Open',
        approvalStatus: userRole === 'manager' ? 'approved' : 'pending',
        createdBy: userData.user._id
      };
      
      if (onSave) {
        onSave(savedNote);
      }
      
      if (userRole === 'manager') {
        alert(`${noteData.type} created successfully!`);
      } else {
        alert(`${noteData.type} created and sent for manager approval!`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {editingNote ? `Edit ${noteData.type}` : `Create ${noteData.type}`}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Vendor Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={vendorSearchTerm || noteData.vendorName}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                    onFocus={() => setShowVendorDropdown(true)}
                    onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                    placeholder="Search or select vendor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  {showVendorDropdown && filteredVendors.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredVendors.map((vendor) => (
                        <div
                          key={vendor._id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleVendorSelect(vendor);
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                          <div className="text-sm text-gray-500">{vendor.vendorCode}</div>
                          {vendor.gstNumber && (
                            <div className="text-xs text-blue-600">GSTIN: {vendor.gstNumber}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor GSTIN</label>
                <input
                  type="text"
                  value={noteData.vendorGSTIN}
                  onChange={(e) => handleInputChange('vendorGSTIN', e.target.value)}
                  maxLength="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                <textarea
                  value={noteData.vendorAddress}
                  onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Note Type and Details */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type *</label>
              <select
                value={noteData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Credit Note">Credit Note</option>
                <option value="Debit Note">Debit Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Number *</label>
              <input
                type="text"
                value={noteData.noteNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Date *</label>
              <input
                type="date"
                value={noteData.noteDate}
                onChange={(e) => handleInputChange('noteDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={noteData.invoiceDate}
                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Invoice</label>
              <div className="relative">
                <input
                  type="text"
                  value={noteData.originalInvoiceNumber}
                  onChange={(e) => handleInputChange('originalInvoiceNumber', e.target.value)}
                  onFocus={() => setShowInvoiceDropdown(true)}
                  onBlur={() => setTimeout(() => setShowInvoiceDropdown(false), 200)}
                  placeholder="Select or enter invoice number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                {showInvoiceDropdown && vendorInvoices.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {vendorInvoices.map((invoice) => (
                      <div
                        key={invoice._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleInputChange('originalInvoiceNumber', invoice.billNumber);
                          handleInputChange('invoiceDate', new Date(invoice.billDate).toISOString().split('T')[0]);
                          setShowInvoiceDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{invoice.billNumber}</div>
                        <div className="text-sm text-gray-500">
                          Date: {new Date(invoice.billDate).toLocaleDateString()} | 
                          Amount: ₹{(invoice.grandTotal || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              value={noteData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for credit/debit note"
            />
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Item Details</h2>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Description *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Qty *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Rate *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">CGST %</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">SGST %</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Total</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {noteData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="HSN/SAC"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.cgstRate}
                          onChange={(e) => handleItemChange(index, 'cgstRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="28"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.sgstRate}
                          onChange={(e) => handleItemChange(index, 'sgstRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="28"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium">₹{(item.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={noteData.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={noteData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{(noteData.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{(noteData.totalCGST || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{(noteData.totalSGST || 0).toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>₹{(noteData.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end p-6 border-t bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save {noteData.type}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditDebitNoteForm;
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, X, Upload, Paperclip, Download } from 'lucide-react';

const CreditDebitNoteForm = ({ isOpen, onClose, onSave, editingNote }) => {
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

  const tdsSection = [
    { code: '194H', rate: 5, description: 'Commission or Brokerage' },
    { code: '194C', rate: 1, description: 'Individual/HUF' },
    { code: '194C', rate: 2, description: 'Company' },
    { code: '194J(a)', rate: 2, description: 'Technical Services' },
    { code: '194J(b)', rate: 10, description: 'Professional' },
    { code: '194I(a)', rate: 2, description: 'Rent - Plant & Machinery' },
    { code: '194I(b)', rate: 10, description: 'Rent - Land & Building' },
    { code: '194A', rate: 10, description: 'Interest other than on Securities' }
  ];

  // Generate automatic note number
  const generateNoteNumber = async (type) => {
    try {
      const response = await fetch(`http://localhost:5001/api/credit-debit-notes/next-note-number/${encodeURIComponent(type)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.noteNumber;
      } else {
        throw new Error('Failed to generate note number');
      }
    } catch (error) {
      console.error('Error generating note number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-3);
      const prefix = type === 'Credit Note' ? 'CN' : 'DN';
      return `${prefix}-2627-${timestamp}`;
    }
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
    
    // TDS Details
    tdsSection: '',
    tdsPercentage: 0,
    tdsAmount: 0,
    
    // Vendor Details
    vendorName: '',
    vendorAddress: '',
    vendorGSTIN: '',
    
    // Items
    items: [{
      product: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'Nos',
      unitPrice: 0,
      discount: 0,
      taxableValue: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      cessRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cessAmount: 0,
      totalAmount: 0
    }],
    
    // Totals
    subtotal: 0,
    totalCGST: 0,
    totalSGST: 0,
    grandTotal: 0,
    
    notes: '',
    attachments: []
  });

  useEffect(() => {
    if (editingNote) {
      setNoteData({
        ...editingNote,
        noteDate: editingNote.date ? new Date(editingNote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceDate: editingNote.invoiceDate || '',
        noteNumber: editingNote.noteNumber || '',
        items: editingNote.items || [{
          product: '',
          description: '',
          hsnCode: '',
          quantity: 1,
          unit: 'Nos',
          unitPrice: 0,
          discount: 0,
          taxableValue: 0,
          cgstRate: 9,
          sgstRate: 9,
          igstRate: 0,
          cessRate: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          cessAmount: 0,
          totalAmount: 0
        }]
      });
      
      // Load existing attachments for edit mode
      if (editingNote.attachments && editingNote.attachments.length > 0) {
        const existingAttachments = editingNote.attachments.map(attachment => ({
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          fileUrl: `http://localhost:5001${attachment.fileUrl}`,
          uploadedAt: attachment.uploadedAt,
          isExisting: true // Flag to identify existing files
        }));
        setAttachments(existingAttachments);
      } else {
        setAttachments([]);
      }
    } else {
      // Generate new note number for new notes
      const initializeNewNote = async () => {
        const newNoteNumber = await generateNoteNumber('Credit Note');
        setNoteData({
          noteNumber: newNoteNumber,
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
            product: '',
            description: '',
            hsnCode: '',
            quantity: 1,
            unit: 'Nos',
            unitPrice: 0,
            discount: 0,
            taxableValue: 0,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 0,
            cessRate: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            cessAmount: 0,
            totalAmount: 0
          }],
          subtotal: 0,
          totalCGST: 0,
          totalSGST: 0,
          grandTotal: 0,
          notes: ''
        });
        setAttachments([]);
      };
      
      if (!editingNote) {
        initializeNewNote();
      }
    }
  }, [editingNote]);

  const [attachments, setAttachments] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      fileName: file.name,
      fileSize: file.size,
      file: file,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadAttachment = async (attachment) => {
    if (attachment.isExisting) {
      // For existing files, download from server
      try {
        const filename = attachment.fileUrl.split('/').pop();
        const response = await fetch(`http://localhost:5001/api/credit-debit-notes/download/${filename}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = attachment.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
      }
    } else {
      // For new files, use blob URL
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [noteData.items]);

  const calculateItemTotals = (item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const discountPercent = Math.max(0, Number(item.discount) || 0);
    const cgstRate = Math.max(0, Number(item.cgstRate) || 0);
    const sgstRate = Math.max(0, Number(item.sgstRate) || 0);
    
    const grossAmount = quantity * unitPrice;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const taxableValue = grossAmount - discountAmount;
    const cgstAmount = (taxableValue * cgstRate) / 100;
    const sgstAmount = (taxableValue * sgstRate) / 100;
    const totalAmount = taxableValue + cgstAmount + sgstAmount;

    return {
      ...item,
      discountAmount,
      taxableValue,
      cgstAmount,
      sgstAmount,
      totalAmount
    };
  };

  const calculateTotals = () => {
    if (!noteData.items || noteData.items.length === 0) return;
    
    const updatedItems = noteData.items.map(calculateItemTotals);
    
    const subtotal = updatedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const totalDiscount = updatedItems.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0);
    const totalTaxableValue = updatedItems.reduce((sum, item) => sum + Number(item.taxableValue), 0);
    const totalCGST = updatedItems.reduce((sum, item) => sum + Number(item.cgstAmount), 0);
    const totalSGST = updatedItems.reduce((sum, item) => sum + Number(item.sgstAmount), 0);
    const grandTotal = totalTaxableValue + totalCGST + totalSGST;

    setNoteData(prev => {
      const newData = {
        ...prev,
        items: updatedItems,
        subtotal,
        totalDiscount,
        totalTaxableValue,
        totalCGST,
        totalSGST,
        grandTotal
      };
      
      // Recalculate TDS if section is selected
      if (prev.tdsSection && prev.tdsPercentage > 0) {
        newData.tdsAmount = (totalTaxableValue * prev.tdsPercentage) / 100;
      }
      
      return newData;
    });
  };

  const handleInputChange = (field, value) => {
    if (field === 'tdsSection') {
      const selectedSection = tdsSection.find(s => s.code === value);
      if (selectedSection) {
        const currentTaxableValue = noteData.totalTaxableValue || 0;
        const calculatedTds = currentTaxableValue > 0 ? 
          (currentTaxableValue * selectedSection.rate) / 100 : 0;
        setNoteData(prev => ({
          ...prev,
          tdsSection: value,
          tdsPercentage: selectedSection.rate,
          tdsAmount: calculatedTds
        }));
        return;
      }
    }
    
    if (field === 'type') {
      // Generate new note number when type changes
      const generateNewNumber = async () => {
        const newNoteNumber = await generateNoteNumber(value);
        setNoteData(prev => ({
          ...prev,
          [field]: value,
          noteNumber: newNoteNumber
        }));
      };
      generateNewNumber();
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
        
        // Filter bills for this vendor - only approved and not fully paid
        const vendorBills = bills.filter(bill => 
          bill.vendorName === vendorName && 
          bill.approvalStatus === 'approved'
        );
        
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
      product: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'Nos',
      unitPrice: 0,
      discount: 0,
      taxableValue: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      cessRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cessAmount: 0,
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
    
    if (!attachments || attachments.length === 0) {
      alert('At least one attachment is required');
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
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all note data fields
      Object.keys(savedNote).forEach(key => {
        if (key !== 'attachments') {
          if (typeof savedNote[key] === 'object' && savedNote[key] !== null) {
            formData.append(key, JSON.stringify(savedNote[key]));
          } else {
            formData.append(key, savedNote[key] || '');
          }
        }
      });
      
      // Add attachment files (only new files)
      attachments.forEach((attachment) => {
        if (attachment.file && !attachment.isExisting) {
          formData.append('attachments', attachment.file);
        }
      });
      
      // Add existing attachment IDs to preserve them
      const existingAttachments = attachments.filter(att => att.isExisting);
      if (existingAttachments.length > 0) {
        formData.append('existingAttachments', JSON.stringify(existingAttachments));
      }
      
      const url = editingNote 
        ? `http://localhost:5001/api/credit-debit-notes/${editingNote._id}`
        : 'http://localhost:5001/api/credit-debit-notes';
      const method = editingNote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (onSave) {
          onSave(result);
        }
        
        if (userRole === 'manager') {
          alert(`${noteData.type} ${editingNote ? 'updated' : 'created'} successfully!`);
        } else {
          alert(`${noteData.type} ${editingNote ? 'updated' : 'created'} and sent for manager approval!`);
        }
        onClose();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Error saving note'));
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
          <div>
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
                            
                            // Populate items from selected invoice
                            if (invoice.items && invoice.items.length > 0) {
                              const invoiceItems = invoice.items.map(item => ({
                                description: item.description || '',
                                hsnCode: item.hsnCode || '',
                                quantity: item.quantity || 1,
                                unitPrice: item.unitPrice || 0,
                                discount: item.discount || 0,
                                cgstRate: item.cgstRate || 9,
                                sgstRate: item.sgstRate || 9,
                                cgstAmount: item.cgstAmount || 0,
                                sgstAmount: item.sgstAmount || 0,
                                totalAmount: item.totalAmount || 0
                              }));
                              setNoteData(prev => ({
                                ...prev,
                                items: invoiceItems
                              }));
                            }
                            
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
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Discount %</th>
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
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0"
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
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-medium text-red-600">-₹{(noteData.totalDiscount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxable Value:</span>
                  <span className="font-medium">₹{(noteData.totalTaxableValue || 0).toFixed(2)}</span>
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
                
                {/* TDS Section */}
                <hr className="my-2" />
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TDS Section</label>
                    <select
                      value={noteData.tdsSection}
                      onChange={(e) => handleInputChange('tdsSection', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select TDS Section</option>
                      {tdsSection.map((section, idx) => (
                        <option key={idx} value={section.code}>
                          {section.code} - {section.rate}% ({section.description})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">TDS ({noteData.tdsPercentage}%):</span>
                    <span className="font-medium text-red-600">-₹{(Number(noteData.tdsAmount) || 0).toFixed(2)}</span>
                  </div>
                  
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Net Amount:</span>
                    <span>₹{((noteData.grandTotal || 0) - (Number(noteData.tdsAmount) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload files</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB)</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Paperclip className="w-4 h-4 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">{(attachment.fileSize / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadAttachment(attachment)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
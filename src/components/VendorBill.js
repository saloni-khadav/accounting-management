import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, Trash2, ChevronDown, FileText, Upload, X, Paperclip } from 'lucide-react';
import { generateInvoiceNumber } from '../utils/numberGenerator';

const VendorBill = ({ isOpen, onClose, onSave, editingBill }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [vendors, setVendors] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [approvedPOs, setApprovedPOs] = useState([]);
  const [availablePOs, setAvailablePOs] = useState([]);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [poSearchTerm, setPOSearchTerm] = useState('');

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

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  const [billData, setBillData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    billSeries: 'BILL',
    referenceNumber: '',
    placeOfSupply: '',
    
    supplierName: 'ABC Enterprises',
    supplierAddress: '125 Business St., Bangalore, Karnataka - 550001',
    supplierGSTIN: '29ABCDE1234F1Z5',
    supplierPAN: 'ABCDE1234F',
    
    vendorName: '',
    vendorAddress: '',
    vendorGSTIN: '',
    vendorPAN: '',
    vendorPlace: '',
    contactPerson: '',
    contactDetails: '',
    
    paymentTerms: '30 Days',
    dueDate: '',
    
    tdsSection: '',
    tdsPercentage: 0,
    tdsAmount: 0,
    
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
    totalDiscount: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalCESS: 0,
    totalTax: 0,
    grandTotal: 0,
    
    notes: '',
    termsConditions: 'This is a vendor bill as per GST compliance requirements.',
    currency: 'INR'
  });

  useEffect(() => {
    if (editingBill) {
      console.log('Loading bill for editing:', editingBill);
      console.log('Bill vendorPAN:', editingBill.vendorPAN);
      
      setBillData({
        ...editingBill,
        vendorPAN: editingBill.vendorPAN || '', 
        billDate: editingBill.billDate ? new Date(editingBill.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: editingBill.dueDate ? new Date(editingBill.dueDate).toISOString().split('T')[0] : '',
        items: editingBill.items || [{
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
      setAttachments(editingBill.attachments || []);
      setVendorSearchTerm(editingBill.vendorName);
    } else {
      // Reset form for new bill
      setBillData({
        billNumber: generateInvoiceNumber(),
        billDate: new Date().toISOString().split('T')[0],
        billSeries: 'BILL',
        referenceNumber: '',
        placeOfSupply: '',
        
        supplierName: 'ABC Enterprises',
        supplierAddress: '125 Business St., Bangalore, Karnataka - 550001',
        supplierGSTIN: '29ABCDE1234F1Z5',
        supplierPAN: 'ABCDE1234F',
        
        vendorName: '',
        vendorAddress: '',
        vendorGSTIN: '',
        vendorPAN: '',
        vendorPlace: '',
        contactPerson: '',
        contactDetails: '',
        
        paymentTerms: '30 Days',
        dueDate: '',
        
        tdsSection: '',
        tdsPercentage: 0,
        tdsAmount: 0,
        
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
        totalDiscount: 0,
        totalTaxableValue: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalCESS: 0,
        totalTax: 0,
        grandTotal: 0,
        
        notes: '',
        termsConditions: 'This is a vendor bill as per GST compliance requirements.',
        currency: 'INR'
      });
      setAttachments([]);
      setVendorSearchTerm('');
    }
  }, [editingBill, isOpen]);

  useEffect(() => {
    calculateTotals();
  }, [billData.items]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/vendors');
        if (response.ok) {
          const vendorsData = await response.json();
          setVendors(vendorsData);
          
          // Auto-populate PAN if editing bill and PAN is missing
          if (editingBill && !billData.vendorPAN && editingBill.vendorName) {
            const vendor = vendorsData.find(v => v.vendorName === editingBill.vendorName);
            if (vendor && vendor.panNumber) {
              setBillData(prev => ({ ...prev, vendorPAN: vendor.panNumber }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchApprovedPOs = async () => {
      try {
        // Use the new available POs endpoint
        const response = await fetch('http://localhost:5001/api/purchase-orders/available');
        if (response.ok) {
          const availablePOsData = await response.json();
          setAvailablePOs(availablePOsData);
          
          // Also fetch all approved POs for reference
          const allPOsResponse = await fetch('http://localhost:5001/api/purchase-orders');
          if (allPOsResponse.ok) {
            const allPOsData = await allPOsResponse.json();
            const approved = allPOsData.filter(po => 
              po.approvalStatus === 'approved' || po.status === 'Approved'
            );
            setApprovedPOs(approved);
          }
        }
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };

    if (isOpen) {
      fetchVendors();
      fetchApprovedPOs();
    }
  }, [isOpen, editingBill, billData.vendorPAN]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const profile = userData.user.profile || {};
          
          let stateFromAddress = '';
          if (profile.address) {
            const addressParts = profile.address.split(',');
            for (let part of addressParts) {
              const trimmedPart = part.trim();
              const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'];
              if (states.includes(trimmedPart)) {
                stateFromAddress = trimmedPart;
                break;
              }
            }
          }
          
          setBillData(prev => ({
            ...prev,
            supplierName: userData.user.companyName || profile.tradeName || prev.supplierName,
            supplierAddress: profile.address || prev.supplierAddress,
            supplierGSTIN: profile.gstNumber || prev.supplierGSTIN,
            supplierPAN: profile.panNumber || prev.supplierPAN,
            placeOfSupply: stateFromAddress || prev.placeOfSupply
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (!event.target.closest('.vendor-dropdown-container')) {
        setShowVendorDropdown(false);
      }
      if (!event.target.closest('.po-dropdown-container')) {
        setShowPODropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateItemTotals = (item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const discountPercent = Math.max(0, Number(item.discount) || 0);
    const cgstRate = Math.max(0, Number(item.cgstRate) || 0);
    const sgstRate = Math.max(0, Number(item.sgstRate) || 0);
    const igstRate = Math.max(0, Number(item.igstRate) || 0);
    const cessRate = Math.max(0, Number(item.cessRate) || 0);
    
    const grossAmount = quantity * unitPrice;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const taxableValue = Math.max(0, grossAmount - discountAmount);
    const cgstAmount = Math.max(0, (taxableValue * cgstRate) / 100);
    const sgstAmount = Math.max(0, (taxableValue * sgstRate) / 100);
    const igstAmount = Math.max(0, (taxableValue * igstRate) / 100);
    const cessAmount = Math.max(0, (taxableValue * cessRate) / 100);
    const totalAmount = Math.max(0, taxableValue + cgstAmount + sgstAmount + igstAmount + cessAmount);

    return {
      ...item,
      taxableValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cessAmount,
      totalAmount
    };
  };

  const calculateTotals = () => {
    if (!billData.items || billData.items.length === 0) return;
    
    const updatedItems = billData.items.map(calculateItemTotals);
    
    const subtotal = Math.max(0, updatedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0));
    const totalDiscount = Math.max(0, updatedItems.reduce((sum, item) => {
      const grossAmount = Number(item.quantity) * Number(item.unitPrice);
      return sum + ((grossAmount * Number(item.discount)) / 100);
    }, 0));
    const totalTaxableValue = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.taxableValue), 0));
    const totalCGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.cgstAmount), 0));
    const totalSGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.sgstAmount), 0));
    const totalIGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.igstAmount), 0));
    const totalCESS = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.cessAmount), 0));
    const totalTax = Math.max(0, totalCGST + totalSGST + totalIGST + totalCESS);
    const grandTotal = Math.max(0, totalTaxableValue + totalTax);

    setBillData(prev => {
      const newData = {
        ...prev,
        items: updatedItems,
        subtotal,
        totalDiscount,
        totalTaxableValue,
        totalCGST,
        totalSGST,
        totalIGST,
        totalCESS,
        totalTax,
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
        // Use totalTaxableValue for TDS calculation
        const currentTaxableValue = billData.totalTaxableValue || 0;
        const calculatedTds = currentTaxableValue > 0 ? 
          (currentTaxableValue * selectedSection.rate) / 100 : 0;
        setBillData(prev => ({
          ...prev,
          tdsSection: value,
          tdsPercentage: selectedSection.rate,
          tdsAmount: calculatedTds
        }));
        return;
      }
    }
    
    setBillData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-apply tax based on place of supply
      if (field === 'placeOfSupply' || field === 'vendorPlace') {
        const supplierPlace = field === 'placeOfSupply' ? value : prev.placeOfSupply;
        const vendorPlace = field === 'vendorPlace' ? value : prev.vendorPlace;
        
        if (supplierPlace && vendorPlace) {
          const isSameState = supplierPlace === vendorPlace;
          updated.items = prev.items.map(item => ({
            ...item,
            cgstRate: isSameState ? item.cgstRate || 9 : 0,
            sgstRate: isSameState ? item.sgstRate || 9 : 0,
            igstRate: isSameState ? 0 : (item.cgstRate || 9) + (item.sgstRate || 9)
          }));
        }
      }
      
      return updated;
    });
  };

  const handleVendorSelect = (vendor) => {
    console.log('Selected vendor:', vendor); // Debug log
    console.log('Vendor PAN:', vendor.panNumber); // Debug PAN
    setBillData(prev => ({
      ...prev,
      vendorName: vendor.vendorName,
      vendorAddress: vendor.billingAddress || '',
      vendorGSTIN: vendor.gstNumber || '',
      vendorPAN: vendor.panNumber || '', // Map panNumber to vendorPAN
      contactPerson: vendor.contactPerson || '',
      contactDetails: vendor.contactDetails || '',
      paymentTerms: vendor.paymentTerms || '30 Days'
    }));
    setShowVendorDropdown(false);
    setVendorSearchTerm(vendor.vendorName);
  };

  const handlePOSelect = (po) => {
    // Prevent selection of fully utilized POs
    if (po.remainingAmount <= 0) {
      alert('This Purchase Order has been fully utilized. Please select another PO.');
      return;
    }
    
    setBillData(prev => ({
      ...prev,
      referenceNumber: po.poNumber,
      vendorName: po.supplier,
      items: po.items ? po.items.map(item => ({
        product: item.name || '',
        description: item.name || '',
        hsnCode: item.hsn || '',
        quantity: item.quantity || 1,
        unit: 'Nos',
        unitPrice: item.rate || 0,
        discount: item.discount || 0,
        taxableValue: 0,
        cgstRate: item.cgstRate || 9,
        sgstRate: item.sgstRate || 9,
        igstRate: item.igstRate || 0,
        cessRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cessAmount: 0,
        totalAmount: 0
      })) : prev.items
    }));
    
    // Find and auto-fill vendor details
    const vendor = vendors.find(v => v.vendorName === po.supplier);
    if (vendor) {
      setBillData(prev => ({
        ...prev,
        vendorAddress: vendor.billingAddress || '',
        vendorGSTIN: vendor.gstNumber || '',
        vendorPAN: vendor.panNumber || '',
        contactPerson: vendor.contactPerson || '',
        contactDetails: vendor.contactDetails || '',
        paymentTerms: vendor.paymentTerms || '30 Days'
      }));
    }
    
    setShowPODropdown(false);
    setPOSearchTerm(po.poNumber);
    setVendorSearchTerm(po.supplier);
  };

  const filteredPOs = availablePOs.filter(po =>
    po.poNumber.toLowerCase().includes(poSearchTerm.toLowerCase()) ||
    po.supplier.toLowerCase().includes(poSearchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  );

  const handleItemChange = (index, field, value) => {
    setBillData(prev => {
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
    
    setBillData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setTimeout(() => calculateTotals(), 0);
  };

  const removeItem = (index) => {
    if (billData.items.length > 1) {
      const updatedItems = billData.items.filter((_, i) => i !== index);
      setBillData(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      setTimeout(() => calculateTotals(), 0);
    }
  };

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

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!billData.vendorName || !billData.vendorName.trim()) {
      alert('Vendor name is required');
      return;
    }
    if (!billData.vendorAddress || !billData.vendorAddress.trim()) {
      alert('Vendor address is required');
      return;
    }
    if (!billData.placeOfSupply || !billData.placeOfSupply.trim()) {
      alert('Place of supply is required');
      return;
    }
    
    const hasValidItems = billData.items && billData.items.some(item => 
      item.description && item.description.trim() && 
      item.hsnCode && item.hsnCode.trim() && 
      item.quantity > 0 && item.unitPrice > 0
    );
    
    if (!hasValidItems) {
      alert('At least one valid item with description, HSN code, quantity, and unit price is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userResponse = await fetch('http://localhost:5001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      const userRole = userData.user.role;

      const cleanedData = {
        ...billData,
        vendorPAN: billData.vendorPAN || '', // Ensure vendorPAN is included
        status: editingBill ? editingBill.status : (userRole === 'manager' ? 'Draft' : 'Draft'), // Preserve existing status when editing
        approvalStatus: editingBill ? editingBill.approvalStatus : (userRole === 'manager' ? 'approved' : 'pending'), // Preserve existing approval status when editing
        createdBy: userData.user._id,
        attachments: attachments.map(att => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl || '',
          fileSize: att.fileSize,
          uploadedAt: att.uploadedAt
        })),
        items: (billData.items || []).filter(item => 
          item.description && item.description.trim() && 
          item.hsnCode && item.hsnCode.trim()
        ).map(item => ({
          ...item,
          id: undefined,
          _id: undefined
        }))
      };

      console.log('Saving bill with data:', {
        grandTotal: cleanedData.grandTotal,
        tdsAmount: cleanedData.tdsAmount,
        tdsSection: cleanedData.tdsSection,
        tdsPercentage: cleanedData.tdsPercentage
      });

      const isEditing = editingBill && editingBill._id;
      const url = isEditing 
        ? `http://localhost:5001/api/bills/${editingBill._id}`
        : 'http://localhost:5001/api/bills';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData),
      });
      
      if (response.ok) {
        const savedBill = await response.json();
        console.log('Bill saved successfully:', {
          grandTotal: savedBill.grandTotal,
          tdsAmount: savedBill.tdsAmount,
          tdsSection: savedBill.tdsSection
        });
        
        // Refresh available POs after saving bill
        if (billData.referenceNumber) {
          const availablePOsResponse = await fetch('http://localhost:5001/api/purchase-orders/available');
          if (availablePOsResponse.ok) {
            const availablePOsData = await availablePOsResponse.json();
            setAvailablePOs(availablePOsData);
          }
        }
        
        if (userRole === 'manager') {
          alert(isEditing ? 'Bill updated successfully!' : 'Bill created successfully!');
        } else {
          alert(isEditing ? 'Bill updated and sent for manager approval!' : 'Bill created and sent for manager approval!');
        }
        if (onSave) {
          onSave(savedBill);
        }
        onClose();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.message || 'Error saving bill');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error. Please check if backend is running.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{editingBill ? 'Edit Vendor Bill' : 'Vendor Bill'}</h1>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">

          {/* Supplier Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Details (Your Company)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Business Name *</label>
                <input
                  type="text"
                  value={billData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
                <input
                  type="text"
                  value={billData.supplierGSTIN}
                  onChange={(e) => handleInputChange('supplierGSTIN', e.target.value)}
                  maxLength="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN *</label>
                <input
                  type="text"
                  value={billData.supplierPAN}
                  onChange={(e) => handleInputChange('supplierPAN', e.target.value)}
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Supply *</label>
                <select
                  value={billData.placeOfSupply}
                  onChange={(e) => handleInputChange('placeOfSupply', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="Andaman and Nicobar Islands">35 - Andaman and Nicobar Islands</option>
                  <option value="Andhra Pradesh">28 - Andhra Pradesh</option>
                  <option value="Andhra Pradesh (New)">37 - Andhra Pradesh (New)</option>
                  <option value="Arunachal Pradesh">12 - Arunachal Pradesh</option>
                  <option value="Assam">18 - Assam</option>
                  <option value="Bihar">10 - Bihar</option>
                  <option value="Chandigarh">04 - Chandigarh</option>
                  <option value="Chhattisgarh">22 - Chhattisgarh</option>
                  <option value="Dadra and Nagar Haveli">26 - Dadra and Nagar Haveli</option>
                  <option value="Daman and Diu">25 - Daman and Diu</option>
                  <option value="Delhi">07 - Delhi</option>
                  <option value="Goa">30 - Goa</option>
                  <option value="Gujarat">24 - Gujarat</option>
                  <option value="Haryana">06 - Haryana</option>
                  <option value="Himachal Pradesh">02 - Himachal Pradesh</option>
                  <option value="Jammu and Kashmir">01 - Jammu and Kashmir</option>
                  <option value="Jharkhand">20 - Jharkhand</option>
                  <option value="Karnataka">29 - Karnataka</option>
                  <option value="Kerala">32 - Kerala</option>
                  <option value="Lakshadweep">31 - Lakshadweep</option>
                  <option value="Madhya Pradesh">23 - Madhya Pradesh</option>
                  <option value="Maharashtra">27 - Maharashtra</option>
                  <option value="Manipur">14 - Manipur</option>
                  <option value="Meghalaya">17 - Meghalaya</option>
                  <option value="Mizoram">15 - Mizoram</option>
                  <option value="Nagaland">13 - Nagaland</option>
                  <option value="Odisha">21 - Odisha</option>
                  <option value="Puducherry">34 - Puducherry</option>
                  <option value="Punjab">03 - Punjab</option>
                  <option value="Rajasthan">08 - Rajasthan</option>
                  <option value="Sikkim">11 - Sikkim</option>
                  <option value="Tamil Nadu">33 - Tamil Nadu</option>
                  <option value="Telangana">36 - Telangana</option>
                  <option value="Tripura">16 - Tripura</option>
                  <option value="Uttar Pradesh">09 - Uttar Pradesh</option>
                  <option value="Uttarakhand">05 - Uttarakhand</option>
                  <option value="West Bengal">19 - West Bengal</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address *</label>
              <textarea
                value={billData.supplierAddress}
                onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number *</label>
              <input
                type="text"
                value={billData.billNumber}
                onChange={(e) => handleInputChange('billNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date *</label>
              <input
                type="date"
                value={billData.billDate}
                onChange={(e) => handleInputChange('billDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference/PO Number</label>
              <div className="relative po-dropdown-container">
                <input
                  type="text"
                  value={poSearchTerm || billData.referenceNumber}
                  onChange={(e) => {
                    setPOSearchTerm(e.target.value);
                    setShowPODropdown(true);
                    handleInputChange('referenceNumber', e.target.value);
                  }}
                  onFocus={() => setShowPODropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search approved PO or enter manually"
                />
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                
                {showPODropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPOs.length > 0 ? (
                      filteredPOs.map((po) => (
                        <div
                          key={po._id}
                          onClick={() => handlePOSelect(po)}
                          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            po.remainingAmount <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{po.poNumber}</div>
                          <div className="text-sm text-gray-500">{po.supplier}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-blue-600">Total: ₹{po.totalAmount?.toLocaleString() || '0'}</div>
                            <div className={`text-xs font-medium ${
                              po.remainingAmount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Available: ₹{po.remainingAmount?.toLocaleString() || '0'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{po.items?.length || 0} items</div>
                          {po.usedAmount > 0 && (
                            <div className="text-xs text-orange-600">Used: ₹{po.usedAmount?.toLocaleString() || '0'}</div>
                          )}
                          {po.remainingAmount <= 0 && (
                            <div className="text-xs text-red-600 font-medium">Fully Utilized</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-gray-500">
                        {poSearchTerm ? 'No matching POs found' : 'No available POs with remaining amount'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={billData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vendor Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative vendor-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={vendorSearchTerm || billData.vendorName}
                    onChange={(e) => {
                      setVendorSearchTerm(e.target.value);
                      setShowVendorDropdown(true);
                      handleInputChange('vendorName', e.target.value);
                    }}
                    onFocus={() => setShowVendorDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search or enter vendor name"
                  />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  
                  {showVendorDropdown && filteredVendors.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredVendors.map((vendor) => (
                        <div
                          key={vendor._id}
                          onClick={() => handleVendorSelect(vendor)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                          <div className="text-sm text-gray-500">{vendor.vendorCode}</div>
                          {vendor.panNumber && (
                            <div className="text-xs text-blue-600">PAN: {vendor.panNumber}</div>
                          )}
                          {vendor.contactPerson && (
                            <div className="text-xs text-gray-400">{vendor.contactPerson}</div>
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
                  value={billData.vendorGSTIN}
                  onChange={(e) => handleInputChange('vendorGSTIN', e.target.value)}
                  maxLength="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor PAN *</label>
                <input
                  type="text"
                  value={billData.vendorPAN}
                  onChange={(e) => {
                    console.log('PAN field changed:', e.target.value); // Debug log
                    handleInputChange('vendorPAN', e.target.value);
                  }}
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Place</label>
                <select
                  value={billData.vendorPlace}
                  onChange={(e) => handleInputChange('vendorPlace', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="Andaman and Nicobar Islands">35 - Andaman and Nicobar Islands</option>
                  <option value="Andhra Pradesh">28 - Andhra Pradesh</option>
                  <option value="Andhra Pradesh (New)">37 - Andhra Pradesh (New)</option>
                  <option value="Arunachal Pradesh">12 - Arunachal Pradesh</option>
                  <option value="Assam">18 - Assam</option>
                  <option value="Bihar">10 - Bihar</option>
                  <option value="Chandigarh">04 - Chandigarh</option>
                  <option value="Chhattisgarh">22 - Chhattisgarh</option>
                  <option value="Dadra and Nagar Haveli">26 - Dadra and Nagar Haveli</option>
                  <option value="Daman and Diu">25 - Daman and Diu</option>
                  <option value="Delhi">07 - Delhi</option>
                  <option value="Goa">30 - Goa</option>
                  <option value="Gujarat">24 - Gujarat</option>
                  <option value="Haryana">06 - Haryana</option>
                  <option value="Himachal Pradesh">02 - Himachal Pradesh</option>
                  <option value="Jammu and Kashmir">01 - Jammu and Kashmir</option>
                  <option value="Jharkhand">20 - Jharkhand</option>
                  <option value="Karnataka">29 - Karnataka</option>
                  <option value="Kerala">32 - Kerala</option>
                  <option value="Lakshadweep">31 - Lakshadweep</option>
                  <option value="Madhya Pradesh">23 - Madhya Pradesh</option>
                  <option value="Maharashtra">27 - Maharashtra</option>
                  <option value="Manipur">14 - Manipur</option>
                  <option value="Meghalaya">17 - Meghalaya</option>
                  <option value="Mizoram">15 - Mizoram</option>
                  <option value="Nagaland">13 - Nagaland</option>
                  <option value="Odisha">21 - Odisha</option>
                  <option value="Puducherry">34 - Puducherry</option>
                  <option value="Punjab">03 - Punjab</option>
                  <option value="Rajasthan">08 - Rajasthan</option>
                  <option value="Sikkim">11 - Sikkim</option>
                  <option value="Tamil Nadu">33 - Tamil Nadu</option>
                  <option value="Telangana">36 - Telangana</option>
                  <option value="Tripura">16 - Tripura</option>
                  <option value="Uttar Pradesh">09 - Uttar Pradesh</option>
                  <option value="Uttarakhand">05 - Uttarakhand</option>
                  <option value="West Bengal">19 - West Bengal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={billData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
                <input
                  type="text"
                  value={billData.contactDetails}
                  onChange={(e) => handleInputChange('contactDetails', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
                <textarea
                  value={billData.vendorAddress}
                  onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Product/Service Details</h2>
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
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Product/Item</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Description *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Qty *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Rate *</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Discount (%)</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Taxable Value</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">CGST %</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">SGST %</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">IGST %</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Total</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.product || ''}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Product/Item"
                        />
                      </td>
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
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm">₹{(item.taxableValue || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.cgstRate}
                          onChange={(e) => handleItemChange(index, 'cgstRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="28"
                          step="0.01"
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
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.igstRate}
                          onChange={(e) => handleItemChange(index, 'igstRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="28"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium">₹{(item.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={billData.items.length === 1}
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

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={billData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="Advance">Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={billData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Computation</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{(billData.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-medium">₹{(billData.totalDiscount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxable Value:</span>
                  <span className="font-medium">₹{(billData.totalTaxableValue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST:</span>
                  <span className="font-medium">₹{(billData.totalCGST || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST:</span>
                  <span className="font-medium">₹{(billData.totalSGST || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST:</span>
                  <span className="font-medium">₹{(billData.totalIGST || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-medium">₹{(billData.totalTax || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>₹{(billData.grandTotal || 0).toFixed(2)}</span>
                </div>
                
                {/* TDS Section */}
                <hr className="my-2" />
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TDS Section</label>
                    <select
                      value={billData.tdsSection}
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
                    <span className="text-gray-600">TDS ({billData.tdsPercentage}%):</span>
                    <span className="font-medium text-red-600">-₹{(Number(billData.tdsAmount) || 0).toFixed(2)}</span>
                  </div>
                  
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Net Payable:</span>
                    <span>₹{((billData.grandTotal || 0) - (Number(billData.tdsAmount) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
            <textarea
              value={billData.termsConditions}
              onChange={(e) => handleInputChange('termsConditions', e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
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
                          onClick={() => downloadAttachment(attachment)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
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

          {/* GST Declaration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">GST Compliance Declaration:</span>
            </div>
            <p className="text-yellow-700 mt-2">
              This is a vendor bill issued in compliance with GST regulations. 
              All information provided is accurate and complete as per GST requirements.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end p-6 border-t bg-gray-50">
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              Cancel
            </button>
            
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBill;

import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, Trash2, ChevronDown, FileText, Upload, X, Paperclip, Eye } from 'lucide-react';
import { generateInvoiceNumber } from '../utils/numberGenerator';
import { determineGSTType, applyGSTRates } from '../utils/gstTaxUtils';

const VendorBill = ({ isOpen, onClose, onSave, editingBill }) => {
  console.log('🔵 VendorBill component loaded');
  
  // API URL - uses local from env, falls back to production
  const baseUrl = 'http://localhost:5001';
  
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showGSTDropdown, setShowGSTDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [approvedPOs, setApprovedPOs] = useState([]);
  const [availablePOs, setAvailablePOs] = useState([]);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [poSearchTerm, setPOSearchTerm] = useState('');
  const [companyGST, setCompanyGST] = useState('');
  const [isPOSelected, setIsPOSelected] = useState(false);

  // GST code to state mapping function
  const getStateFromGST = (gstNumber) => {
    if (!gstNumber || gstNumber.length < 2) return '';
    
    const gstStateCode = gstNumber.substring(0, 2);
    const gstStateMapping = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh', 
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '25': 'Daman and Diu',
      '26': 'Dadra and Nagar Haveli',
      '27': 'Maharashtra',
      '28': 'Andhra Pradesh',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Andhra Pradesh (New)'
    };
    
    return gstStateMapping[gstStateCode] || '';
  };

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
    
    supplierName: '',
    supplierAddress: '',
    supplierGSTIN: '',
    supplierPAN: '',
    
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
    const fetchUserProfile = async () => {
      if (!isOpen) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          const profile = userData.user.profile || {};
          const gstBasedState = getStateFromGST(profile.gstNumber);
          
          setCompanyGST(profile.gstNumber || '');
          
          setBillData(prev => ({
            ...prev,
            supplierName: profile.tradeName || userData.user.companyName || 'Your Company',
            supplierAddress: profile.address || 'Your Address',
            supplierGSTIN: profile.gstNumber || '',
            supplierPAN: profile.panNumber || '',
            placeOfSupply: gstBasedState || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [isOpen]);

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
      // Set attachments with proper structure for existing files
      const existingAttachments = (editingBill.attachments || []).map(att => ({
        fileName: att.fileName,
        fileSize: att.fileSize,
        fileUrl: att.fileUrl, // This is the filename stored in DB
        uploadedAt: att.uploadedAt || new Date()
      }));
      setAttachments(existingAttachments);
      setVendorSearchTerm(editingBill.vendorName);
    } else {
      // Reset form for new bill but keep supplier details
      const currentSupplierData = {
        supplierName: billData.supplierName,
        supplierAddress: billData.supplierAddress,
        supplierGSTIN: billData.supplierGSTIN,
        supplierPAN: billData.supplierPAN,
        placeOfSupply: billData.placeOfSupply
      };
      
      setBillData({
        billNumber: '',
        billDate: new Date().toISOString().split('T')[0],
        billSeries: 'BILL',
        referenceNumber: '',
        ...currentSupplierData,
        
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
  }, [billData.items, billData.tdsSection, billData.tdsPercentage]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/vendors`);
        if (response.ok) {
          const vendorsData = await response.json();
          setVendors(vendorsData);
          
          // Auto-populate PAN if editing bill and PAN is missing
          if (editingBill && !billData.vendorPAN && editingBill.vendorName) {
            const vendor = vendorsData.find(v => v.vendorName === editingBill.vendorName);
            if (vendor) {
              setSelectedVendor(vendor);
              if (vendor.panNumber) {
                setBillData(prev => ({ ...prev, vendorPAN: vendor.panNumber }));
              }
            }
          }
          
          // Set selected vendor if vendor name matches
          if (billData.vendorName) {
            const vendor = vendorsData.find(v => v.vendorName === billData.vendorName);
            if (vendor) {
              setSelectedVendor(vendor);
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
        const response = await fetch(`${baseUrl}/api/purchase-orders/available`);
        if (response.ok) {
          const availablePOsData = await response.json();
          setAvailablePOs(availablePOsData);
          
          // Also fetch all approved POs for reference
          const allPOsResponse = await fetch(`${baseUrl}/api/purchase-orders`);
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (!event.target.closest('.vendor-dropdown-container')) {
        setShowVendorDropdown(false);
      }
      if (!event.target.closest('.gst-dropdown-container')) {
        setShowGSTDropdown(false);
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

    // Calculate TDS if section is selected
    let tdsAmount = 0;
    if (billData.tdsSection && billData.tdsPercentage > 0) {
      tdsAmount = (totalTaxableValue * billData.tdsPercentage) / 100;
    }

    setBillData(prev => ({
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
      grandTotal,
      tdsAmount
    }));
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
    
    // Auto-set place of supply based on supplier GSTIN
    if (field === 'supplierGSTIN') {
      const placeOfSupply = getStateFromGST(value);
      setBillData(prev => ({
        ...prev,
        [field]: value,
        placeOfSupply: placeOfSupply
      }));
      return;
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
    
    // Set selected vendor for GST dropdown
    setSelectedVendor(vendor);
    
    // Get default GST or first available GST
    const defaultGST = vendor.gstNumbers && vendor.gstNumbers.length > 0 
      ? vendor.gstNumbers.find(gst => gst.isDefault) || vendor.gstNumbers[0]
      : null;
    
    const selectedGSTNumber = defaultGST ? defaultGST.gstNumber : (vendor.gstNumber || '');
    const vendorPlace = getStateFromGST(selectedGSTNumber);
    
    // Apply GST logic based on company and vendor GST
    let updatedItems = billData.items;
    if (companyGST && selectedGSTNumber) {
      const gstType = determineGSTType(companyGST, selectedGSTNumber);
      updatedItems = applyGSTRates(billData.items, gstType);
    }
    
    // Fill all vendor details including GST number and billing address
    setBillData(prev => ({
      ...prev,
      vendorName: vendor.vendorName,
      vendorAddress: vendor.billingAddress || '',
      vendorGSTIN: selectedGSTNumber,
      vendorPlace: vendorPlace,
      vendorPAN: vendor.panNumber || '',
      contactPerson: vendor.contactPerson || '',
      contactDetails: vendor.contactDetails || '',
      paymentTerms: vendor.paymentTerms || '30 Days',
      items: updatedItems
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
    
    // Get GST number and billing address from PO, not from vendor master
    const poGSTNumber = po.gstNumber || '';
    const poDeliveryAddress = po.deliveryAddress || '';
    const vendorPlace = getStateFromGST(poGSTNumber);
    
    // Determine GST type based on company and PO GST
    let gstType = { cgstRate: 9, sgstRate: 9, igstRate: 0 }; // default
    if (companyGST && poGSTNumber) {
      gstType = determineGSTType(companyGST, poGSTNumber);
    }
    
    // Find vendor for basic details (not GST/address)
    const vendor = vendors.find(v => v.vendorName === po.supplier);
    if (vendor) {
      setSelectedVendor(vendor);
    }
    
    // Mark that PO is selected to disable GST dropdown
    setIsPOSelected(true);
    
    setBillData(prev => ({
      ...prev,
      referenceNumber: po.poNumber,
      vendorName: po.supplier,
      // GST number and billing address from PO
      vendorGSTIN: poGSTNumber,
      vendorAddress: poDeliveryAddress,
      vendorPlace: vendorPlace,
      // Basic vendor details from vendor master (if available)
      vendorPAN: vendor ? (vendor.panNumber || '') : prev.vendorPAN,
      contactPerson: vendor ? (vendor.contactPerson || '') : prev.contactPerson,
      contactDetails: vendor ? (vendor.contactDetails || '') : prev.contactDetails,
      paymentTerms: vendor ? (vendor.paymentTerms || '30 Days') : prev.paymentTerms,
      items: po.items ? po.items.map(item => ({
        product: item.name || '',
        description: item.name || '',
        hsnCode: item.hsn || '',
        quantity: item.quantity || 1,
        unit: 'Nos',
        unitPrice: item.rate || 0,
        discount: item.discount || 0,
        taxableValue: 0,
        cgstRate: gstType.cgstRate,
        sgstRate: gstType.sgstRate,
        igstRate: gstType.igstRate,
        cessRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cessAmount: 0,
        totalAmount: 0
      })) : prev.items
    }));
    
    setShowPODropdown(false);
    setPOSearchTerm(po.poNumber);
    setVendorSearchTerm(po.supplier);
  };

  const handleGSTSelect = (gstNumber) => {
    const vendorPlace = getStateFromGST(gstNumber);
    
    // Find the billing address for this GST number from vendor master
    let billingAddress = '';
    if (selectedVendor && selectedVendor.gstNumbers) {
      const gstEntry = selectedVendor.gstNumbers.find(gst => gst.gstNumber === gstNumber);
      if (gstEntry && gstEntry.billingAddress) {
        billingAddress = gstEntry.billingAddress;
      } else {
        // Fallback to vendor's default billing address
        billingAddress = selectedVendor.billingAddress || '';
      }
    }
    
    // Apply GST logic based on company and selected GST
    let updatedItems = billData.items;
    if (companyGST && gstNumber) {
      const gstType = determineGSTType(companyGST, gstNumber);
      updatedItems = applyGSTRates(billData.items, gstType);
    }
    
    setBillData(prev => ({
      ...prev,
      vendorGSTIN: gstNumber,
      vendorPlace: vendorPlace,
      vendorAddress: billingAddress,
      items: updatedItems
    }));
    setShowGSTDropdown(false);
  };

  const filteredPOs = availablePOs.filter(po => {
    // First filter by selected vendor
    const matchesVendor = billData.vendorName ? po.supplier === billData.vendorName : true;
    
    // Then filter by search term
    const matchesSearch = po.poNumber.toLowerCase().includes(poSearchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(poSearchTerm.toLowerCase());
    
    return matchesVendor && matchesSearch;
  });

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
      
      // Auto-sync product to description
      if (field === 'product') {
        updatedItems[index].description = value;
      }
      
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
    console.log('📎 Files selected:', files.length, files.map(f => f.name));
    
    // Calculate total size including existing attachments
    const existingSize = attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);
    const newFilesSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalSize = existingSize + newFilesSize;
    const maxTotalSize = 10 * 1024 * 1024; // 10MB
    
    console.log('📎 File upload:', {
      existing: (existingSize / 1024 / 1024).toFixed(2) + 'MB',
      new: (newFilesSize / 1024 / 1024).toFixed(2) + 'MB',
      total: (totalSize / 1024 / 1024).toFixed(2) + 'MB',
      limit: '10MB'
    });
    
    if (totalSize > maxTotalSize) {
      alert(`Total attachments too large!\n\nCurrent: ${(existingSize / 1024 / 1024).toFixed(2)}MB\nAdding: ${(newFilesSize / 1024 / 1024).toFixed(2)}MB\nTotal: ${(totalSize / 1024 / 1024).toFixed(2)}MB\nMaximum: 10MB\n\nPlease remove some files.`);
      return;
    }
    
    const newAttachments = files.map(file => ({
      fileName: file.name,
      fileSize: file.size,
      file: file,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));
    console.log('📎 New attachments created:', newAttachments.length);
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    // Check if it's a new file (blob URL) or existing file (filename)
    if (attachment.fileUrl.startsWith('blob:')) {
      // New file - use blob URL
      link.href = attachment.fileUrl;
    } else {
      // Existing file - use backend download endpoint
      link.href = `${baseUrl}/api/bills/download/${attachment.fileUrl}`;
    }
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    console.log('📤 Save button clicked');
    
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

    if (!attachments || attachments.length === 0) {
      alert('At least one attachment is required');
      return;
    }

    // Check total attachment size (max 10MB total)
    const totalSize = attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);
    const maxTotalSize = 10 * 1024 * 1024; // 10MB
    if (totalSize > maxTotalSize) {
      alert(`Total attachments: ${(totalSize / 1024 / 1024).toFixed(2)}MB\nMaximum: 10MB\n\nPlease remove some files.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userResponse = await fetch(`${baseUrl}/api/auth/me`, {
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
        ? `${baseUrl}/api/bills/${editingBill._id}`
        : `${baseUrl}/api/bills`;
      const method = isEditing ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all bill data fields
      Object.keys(cleanedData).forEach(key => {
        if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
          formData.append(key, JSON.stringify(cleanedData[key]));
        } else {
          formData.append(key, cleanedData[key] || '');
        }
      });
      
      // Separate existing attachments from new files
      const existingAttachments = [];
      const newFiles = [];
      
      attachments.forEach((attachment) => {
        if (attachment.file) {
          // New file with File object
          newFiles.push(attachment);
        } else {
          // Existing attachment (already saved in DB)
          existingAttachments.push({
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileSize: attachment.fileSize,
            uploadedAt: attachment.uploadedAt
          });
        }
      });
      
      console.log('📤 Sending to backend:', {
        existingAttachments: existingAttachments.length,
        newFiles: newFiles.length,
        newFileNames: newFiles.map(f => f.fileName)
      });
      
      // Add existing attachments as JSON
      if (existingAttachments.length > 0) {
        formData.append('existingAttachments', JSON.stringify(existingAttachments));
      }
      
      // Add new attachment files
      newFiles.forEach((attachment) => {
        console.log('📤 Adding file to FormData:', attachment.fileName, attachment.file);
        formData.append('attachments', attachment.file);
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
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
          const availablePOsResponse = await fetch(`${baseUrl}/api/purchase-orders/available`);
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
      } else if (response.status === 413) {
        alert('Files too large! Total attachment size exceeds server limit.\n\nPlease remove some files and try again.');
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.message || 'Error saving bill');
      }
    } catch (error) {
      console.error('Save error:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Request too large or network error.\n\nTotal attachment size may exceed limit. Please remove some files and try again.');
      } else {
        alert('Network error. Please check if backend is running.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{editingBill ? 'Edit Vendor Bill' : 'Create Vendor Bill'}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">

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
                    // Reset PO selection flag when manually typing
                    if (e.target.value === '') {
                      setIsPOSelected(false);
                    }
                  }}
                  onFocus={() => setShowPODropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search approved PO or enter manually"
                />
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                
                {showPODropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {billData.vendorName ? (
                      filteredPOs.length > 0 ? (
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
                          {poSearchTerm ? `No matching POs found for ${billData.vendorName}` : `No available POs for ${billData.vendorName}`}
                        </div>
                      )
                    ) : (
                      <div className="px-3 py-4 text-center text-gray-500">
                        Please select a vendor first to see their POs
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
              <div className="relative gst-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor GSTIN</label>
                <div className="relative">
                  <input
                    type="text"
                    value={billData.vendorGSTIN}
                    onChange={(e) => handleInputChange('vendorGSTIN', e.target.value)}
                    onFocus={() => {
                      if (!isPOSelected && selectedVendor && selectedVendor.gstNumbers && selectedVendor.gstNumbers.length > 0) {
                        setShowGSTDropdown(true);
                      }
                    }}
                    maxLength="15"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPOSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder={isPOSelected ? "GST from PO (cannot change)" : "Select from dropdown or enter manually"}
                    disabled={isPOSelected}
                  />
                  {!isPOSelected && selectedVendor && selectedVendor.gstNumbers && selectedVendor.gstNumbers.length > 0 && (
                    <ChevronDown 
                      className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer" 
                      onClick={() => setShowGSTDropdown(!showGSTDropdown)}
                    />
                  )}
                  
                  {showGSTDropdown && !isPOSelected && selectedVendor && selectedVendor.gstNumbers && selectedVendor.gstNumbers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {selectedVendor.gstNumbers.map((gst, index) => (
                        <div
                          key={index}
                          onClick={() => handleGSTSelect(gst.gstNumber)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-900">{gst.gstNumber}</span>
                          {gst.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload files</span>
                  <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB total)</span>
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
                          onClick={() => {
                            if (attachment.file) {
                              const url = URL.createObjectURL(attachment.file);
                              window.open(url, '_blank');
                            } else {
                              window.open(`${baseUrl}/api/bills/download/${attachment.fileUrl}`, '_blank');
                            }
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
          <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button 
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Save Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBill;





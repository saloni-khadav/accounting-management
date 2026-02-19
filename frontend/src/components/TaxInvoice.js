import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, Trash2, Calculator, FileText, ChevronDown, Bell, CheckCircle, Clock, Upload, X, Paperclip, Eye } from 'lucide-react';
import { generateInvoiceNumber } from '../utils/numberGenerator';
import { exportToExcel } from '../utils/excelExport';
import { generateTaxInvoicePDF } from '../utils/pdfGenerator';

const TaxInvoice = ({ isOpen, onClose, onSave, editingInvoice }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showGSTDropdown, setShowGSTDropdown] = useState(false);
  const [approvedProformas, setApprovedProformas] = useState([]);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'PO-001',
      customer: 'ABC Enterprises',
      amount: '₹ 25,000',
      items: [{ name: 'Product A', qty: 5, rate: 5000 }],
      date: '2024-01-15',
      status: 'pending'
    },
    {
      id: 'PO-002', 
      customer: 'XYZ Corp',
      amount: '₹ 15,000',
      items: [{ name: 'Product B', qty: 3, rate: 5000 }],
      date: '2024-01-16',
      status: 'pending'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      onClose();
    }
  };
  // Mock function to simulate receiving purchase order
  const handleAutoFillFromOrder = (order) => {
    setAutoFillData({
      customer: order.customer,
      orderNo: order.id,
      items: order.items,
      amount: order.amount
    });
    
    // Auto-fill customer name and reference number
    setInvoiceData(prev => ({
      ...prev,
      customerName: order.customer,
      referenceNumber: order.id
    }));
    
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const [invoiceData, setInvoiceData] = useState({
    // Invoice Details
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceSeries: 'INV',
    referenceNumber: '',
    poDate: '',
    placeOfSupply: '',
    
    // Supplier Details
    supplierName: 'ABC Enterprises',
    supplierAddress: '125 Business St., Bangalore, Karnataka - 550001',
    supplierGSTIN: '29ABCDE1234F1Z5',
    supplierPAN: 'ABCDE1234F',
    supplierEmail: 'info@abcenterprises.com',
    supplierPhone: '+91 80 1234 5678',
    supplierWebsite: 'www.abcenterprises.com',
    
    // Customer Details
    customerName: '',
    customerAddress: '',
    customerGSTIN: '',
    customerPlace: '',
    contactPerson: '',
    contactDetails: '',
    
    // Payment Terms
    paymentTerms: '30 Days',
    dueDate: '',
    
    // Items
    items: [{
      product: '',
      description: '',
      hsnCode: '',
      quantity: 1,
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
    totalDiscount: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalCESS: 0,
    totalTax: 0,
    grandTotal: 0,
    
    // Additional Details
    notes: '',
    termsConditions: 'This is a tax invoice as per GST compliance requirements.',
    currency: 'INR',
    eInvoiceIRN: '',
    qrCode: ''
  });

  useEffect(() => {
    if (editingInvoice) {
      // Pre-fill form with editing invoice data
      setInvoiceData({
        ...editingInvoice,
        invoiceDate: editingInvoice.invoiceDate ? new Date(editingInvoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: editingInvoice.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : '',
        items: editingInvoice.items || [{
          product: '',
          description: '',
          hsnCode: '',
          quantity: 1,
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
      setAttachments(editingInvoice.attachments || []);
    } else {
      // Reset to default for new invoice
      setInvoiceData({
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceSeries: 'INV',
        referenceNumber: '',
        placeOfSupply: '',
        
        supplierName: 'ABC Enterprises',
        supplierAddress: '125 Business St., Bangalore, Karnataka - 550001',
        supplierGSTIN: '29ABCDE1234F1Z5',
        supplierPAN: 'ABCDE1234F',
        supplierEmail: 'info@abcenterprises.com',
        supplierPhone: '+91 80 1234 5678',
        supplierWebsite: 'www.abcenterprises.com',
        
        customerName: '',
        customerAddress: '',
        customerGSTIN: '',
        customerPlace: '',
        contactPerson: '',
        contactDetails: '',
        
        paymentTerms: '30 Days',
        dueDate: '',
        
        items: [{
          product: '',
          description: '',
          hsnCode: '',
          quantity: 1,
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
        termsConditions: 'This is a tax invoice as per GST compliance requirements.',
        currency: 'INR',
        eInvoiceIRN: '',
        qrCode: ''
      });
      setAttachments([]);
    }
  }, [editingInvoice]);

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items.length, invoiceData.items.map(item => `${item.quantity}-${item.unitPrice}-${item.discount}-${item.cgstRate}-${item.sgstRate}-${item.igstRate}`).join(',')]);

  // Auto-apply GST based on Place of Supply and Customer Place
  useEffect(() => {
    if (invoiceData.placeOfSupply && invoiceData.customerPlace) {
      const isSameState = invoiceData.placeOfSupply === invoiceData.customerPlace;
      
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (isSameState) {
            // Same state: Apply CGST + SGST, set IGST to 0
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            const halfRate = totalGST / 2;
            return {
              ...item,
              cgstRate: halfRate,
              sgstRate: halfRate,
              igstRate: 0
            };
          } else {
            // Different state: Apply IGST, set CGST and SGST to 0
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            return {
              ...item,
              cgstRate: 0,
              sgstRate: 0,
              igstRate: totalGST
            };
          }
        })
      }));
    }
  }, [invoiceData.placeOfSupply, invoiceData.customerPlace]);

  // Fetch clients data
  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    const fetchClients = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/clients`);
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  // Fetch approved proforma invoices for selected client
  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    const fetchApprovedProformas = async () => {
      if (!selectedClient) {
        setApprovedProformas([]);
        return;
      }
      
      try {
        const response = await fetch(`${baseUrl}/api/proforma-invoices?customerName=${encodeURIComponent(selectedClient.clientName)}&status=Approved`);
        if (response.ok) {
          const proformas = await response.json();
          setApprovedProformas(proformas);
        }
      } catch (error) {
        console.error('Error fetching proforma invoices:', error);
        setApprovedProformas([]);
      }
    };

    fetchApprovedProformas();
  }, [selectedClient]);

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

  // Fetch user profile data
  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    const fetchUserProfile = async () => {
      if (!isOpen) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const profile = userData.user.profile || {};
          const gstBasedState = getStateFromGST(profile.gstNumber);
          
          setInvoiceData(prev => ({
            ...prev,
            supplierName: profile.tradeName || userData.user.companyName || prev.supplierName,
            supplierAddress: profile.address || prev.supplierAddress,
            supplierGSTIN: profile.gstNumber || prev.supplierGSTIN,
            supplierPAN: profile.panNumber || prev.supplierPAN,
            placeOfSupply: gstBasedState || prev.placeOfSupply
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (!event.target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
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
    const discount = Math.max(0, Number(item.discount) || 0);
    const cgstRate = Math.max(0, Number(item.cgstRate) || 0);
    const sgstRate = Math.max(0, Number(item.sgstRate) || 0);
    const igstRate = Math.max(0, Number(item.igstRate) || 0);
    const cessRate = Math.max(0, Number(item.cessRate) || 0);
    
    const grossAmount = quantity * unitPrice;
    const taxableValue = Math.max(0, grossAmount - discount);
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
    if (!invoiceData.items || invoiceData.items.length === 0) return;
    
    const updatedItems = invoiceData.items.map(calculateItemTotals);
    
    const subtotal = Math.max(0, updatedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0));
    const totalDiscount = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.discount), 0));
    const totalTaxableValue = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.taxableValue), 0));
    const totalCGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.cgstAmount), 0));
    const totalSGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.sgstAmount), 0));
    const totalIGST = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.igstAmount), 0));
    const totalCESS = Math.max(0, updatedItems.reduce((sum, item) => sum + Number(item.cessAmount), 0));
    const totalTax = Math.max(0, totalCGST + totalSGST + totalIGST + totalCESS);
    const grandTotal = Math.max(0, totalTaxableValue + totalTax);

    // Only update if values have actually changed
    if (invoiceData.subtotal !== subtotal || 
        invoiceData.totalDiscount !== totalDiscount ||
        invoiceData.totalTaxableValue !== totalTaxableValue ||
        invoiceData.totalCGST !== totalCGST ||
        invoiceData.totalSGST !== totalSGST ||
        invoiceData.totalIGST !== totalIGST ||
        invoiceData.totalCESS !== totalCESS ||
        invoiceData.totalTax !== totalTax ||
        invoiceData.grandTotal !== grandTotal) {
      
      setInvoiceData(prev => ({
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
      }));
    }
  };

  const handleInputChange = (field, value) => {
    // Auto-set place of supply based on supplier GSTIN
    if (field === 'supplierGSTIN') {
      const placeOfSupply = getStateFromGST(value);
      setInvoiceData(prev => ({
        ...prev,
        [field]: value,
        placeOfSupply: placeOfSupply
      }));
      return;
    }
    
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientSelect = (client) => {
    // Set selected client for GST dropdown
    setSelectedClient(client);
    
    // Get default GST or first available GST
    const defaultGST = client.gstNumbers && client.gstNumbers.length > 0 
      ? client.gstNumbers.find(gst => gst.isDefault) || client.gstNumbers[0]
      : null;
    
    const selectedGSTNumber = defaultGST ? defaultGST.gstNumber : (client.gstNumber || '');
    const customerPlace = getStateFromGST(selectedGSTNumber);
    
    // Get billing address for the default GST
    let billingAddress = '';
    if (defaultGST && defaultGST.billingAddress) {
      billingAddress = defaultGST.billingAddress;
    } else {
      billingAddress = client.billingAddress || '';
    }
    
    setInvoiceData(prev => {
      const isSameState = prev.placeOfSupply && customerPlace && prev.placeOfSupply === customerPlace;
      
      return {
        ...prev,
        customerName: client.clientName,
        customerAddress: billingAddress,
        customerGSTIN: selectedGSTNumber,
        customerPlace: customerPlace,
        contactPerson: client.contactPerson || '',
        contactDetails: client.contactDetails || '',
        paymentTerms: client.paymentTerms || '30 Days',
        referenceNumber: '',
        poDate: '',
        items: prev.items.map(item => {
          if (isSameState) {
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            const halfRate = totalGST / 2;
            return { ...item, cgstRate: halfRate, sgstRate: halfRate, igstRate: 0 };
          } else if (customerPlace) {
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            return { ...item, cgstRate: 0, sgstRate: 0, igstRate: totalGST };
          }
          return item;
        })
      };
    });
    setShowClientDropdown(false);
    setClientSearchTerm(client.clientName);
  };

  const handlePOSelect = (proforma) => {
    const isSameState = invoiceData.placeOfSupply && invoiceData.customerPlace && 
                        invoiceData.placeOfSupply === invoiceData.customerPlace;
    
    setInvoiceData(prev => ({
      ...prev,
      referenceNumber: proforma.proformaNumber,
      poDate: proforma.proformaDate ? new Date(proforma.proformaDate).toISOString().split('T')[0] : '',
      items: proforma.items && proforma.items.length > 0 ? proforma.items.map(item => ({
        product: item.name || '',
        description: item.name || '',
        hsnCode: item.hsn || '',
        quantity: item.quantity || 1,
        unitPrice: item.rate || 0,
        discount: item.discount || 0,
        taxableValue: 0,
        cgstRate: isSameState ? (item.cgstRate || 9) : 0,
        sgstRate: isSameState ? (item.sgstRate || 9) : 0,
        igstRate: isSameState ? 0 : (item.igstRate || 18),
        cessRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cessAmount: 0,
        totalAmount: 0
      })) : prev.items
    }));
    setShowPODropdown(false);
  };

  const handleGSTSelect = (gstNumber) => {
    const customerPlace = getStateFromGST(gstNumber);
    
    // Find the billing address for this GST number from client master
    let billingAddress = '';
    if (selectedClient && selectedClient.gstNumbers) {
      const gstEntry = selectedClient.gstNumbers.find(gst => gst.gstNumber === gstNumber);
      if (gstEntry && gstEntry.billingAddress) {
        billingAddress = gstEntry.billingAddress;
      } else {
        billingAddress = selectedClient.billingAddress || '';
      }
    }
    
    setInvoiceData(prev => {
      const isSameState = prev.placeOfSupply && customerPlace && prev.placeOfSupply === customerPlace;
      
      return {
        ...prev,
        customerGSTIN: gstNumber,
        customerPlace: customerPlace,
        customerAddress: billingAddress,
        items: prev.items.map(item => {
          if (isSameState) {
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            const halfRate = totalGST / 2;
            return { ...item, cgstRate: halfRate, sgstRate: halfRate, igstRate: 0 };
          } else if (customerPlace) {
            const totalGST = (item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0);
            return { ...item, cgstRate: 0, sgstRate: 0, igstRate: totalGST };
          }
          return item;
        })
      };
    });
    setShowGSTDropdown(false);
  };

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.clientCode.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleItemChange = (index, field, value) => {
    setInvoiceData(prev => {
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
    const isSameState = invoiceData.placeOfSupply && invoiceData.customerPlace && 
                        invoiceData.placeOfSupply === invoiceData.customerPlace;
    
    const newItem = {
      product: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxableValue: 0,
      cgstRate: isSameState ? 9 : 0,
      sgstRate: isSameState ? 9 : 0,
      igstRate: isSameState ? 0 : 18,
      cessRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cessAmount: 0,
      totalAmount: 0
    };
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setTimeout(() => calculateTotals(), 0);
  };

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter((_, i) => i !== index);
      setInvoiceData(prev => ({
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
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    if (attachment.file) {
      // New file - use local URL
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (attachment.fileUrl) {
      // Existing file from backend
      const filename = attachment.fileUrl.split('/').pop();
      window.open(`${baseUrl}/api/invoices/download/${filename}`, '_blank');
    }
  };

  const viewAttachment = (attachment) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    if (attachment.file) {
      // New file - use local URL
      window.open(attachment.fileUrl, '_blank');
    } else if (attachment.fileUrl) {
      // Existing file from backend
      const filename = attachment.fileUrl.split('/').pop();
      window.open(`${baseUrl}/api/invoices/view/${filename}`, '_blank');
    }
  };

  const handleSave = async () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    // Validate required fields
    if (!invoiceData.customerName || !invoiceData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }
    if (!invoiceData.customerAddress || !invoiceData.customerAddress.trim()) {
      alert('Customer address is required');
      return;
    }
    if (!invoiceData.placeOfSupply || !invoiceData.placeOfSupply.trim()) {
      alert('Place of supply is required');
      return;
    }
    
    // Validate items
    const hasValidItems = invoiceData.items && invoiceData.items.some(item => 
      item.product && item.product.trim() && 
      item.hsnCode && item.hsnCode.trim() && 
      item.quantity > 0 && item.unitPrice > 0
    );
    
    if (!hasValidItems) {
      alert('At least one valid item with product name, HSN code, quantity, and unit price is required');
      return;
    }

    try {
      // Clean the data before sending
      const cleanedData = {
        ...invoiceData,
        status: editingInvoice ? invoiceData.status : 'Not Received',
        approvalStatus: editingInvoice ? invoiceData.approvalStatus : 'Pending',
        items: (invoiceData.items || []).filter(item => 
          item.product && item.product.trim() && 
          item.hsnCode && item.hsnCode.trim()
        ).map(item => ({
          ...item,
          description: item.product,
          id: undefined,
          _id: undefined
        }))
      };

      const isEditing = editingInvoice && editingInvoice._id;
      const url = isEditing 
        ? `${baseUrl}/api/invoices/${editingInvoice._id}`
        : `${baseUrl}/api/invoices`;
      const method = isEditing ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all invoice data fields
      Object.keys(cleanedData).forEach(key => {
        if (key === 'items') {
          formData.append(key, JSON.stringify(cleanedData[key]));
        } else if (key === 'attachments') {
          // Skip attachments here, we'll handle them separately
        } else if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
          formData.append(key, JSON.stringify(cleanedData[key]));
        } else {
          formData.append(key, cleanedData[key] || '');
        }
      });
      
      // Add only new attachment files (not existing ones)
      attachments.forEach((attachment) => {
        if (attachment.file) {
          formData.append('attachments', attachment.file);
        }
      });

      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (response.ok) {
        const savedInvoice = await response.json();
        alert(isEditing ? 'Invoice updated successfully!' : 'Invoice saved successfully!');
        if (onSave) {
          onSave(savedInvoice);
        }
        onClose();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.message || 'Error saving invoice');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error. Please check if backend is running.');
    }
  };

  const handleExportPDF = () => {
    generateTaxInvoicePDF(invoiceData);
    setShowExportDropdown(false);
  };

  const handleExportExcel = () => {
    const exportData = [{
      'Invoice Number': invoiceData.invoiceNumber,
      'Date': invoiceData.invoiceDate,
      'Customer Name': invoiceData.customerName,
      'Customer Address': invoiceData.customerAddress,
      'Customer GSTIN': invoiceData.customerGSTIN || 'N/A',
      'Reference Number': invoiceData.referenceNumber || 'N/A',
      'Place of Supply': invoiceData.placeOfSupply,
      'Payment Terms': invoiceData.paymentTerms,
      'Subtotal': invoiceData.subtotal,
      'Total Discount': invoiceData.totalDiscount,
      'Taxable Value': invoiceData.totalTaxableValue,
      'CGST': invoiceData.totalCGST,
      'SGST': invoiceData.totalSGST,
      'IGST': invoiceData.totalIGST,
      'Total Tax': invoiceData.totalTax,
      'Grand Total': invoiceData.grandTotal,
      'Notes': invoiceData.notes || 'N/A'
    }];
    
    exportToExcel(exportData, `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}`);
    setShowExportDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{editingInvoice ? 'Edit Tax Invoice' : 'Tax Invoice'}</h1>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Business Name *</label>
            <input
              type="text"
              value={invoiceData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
            <input
              type="text"
              value={invoiceData.supplierGSTIN}
              onChange={(e) => handleInputChange('supplierGSTIN', e.target.value)}
              maxLength="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN *</label>
            <input
              type="text"
              value={invoiceData.supplierPAN}
              onChange={(e) => handleInputChange('supplierPAN', e.target.value)}
              maxLength="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of Supply *</label>
            <select
              value={invoiceData.placeOfSupply}
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
            value={invoiceData.supplierAddress}
            onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
          <input
            type="text"
            value={invoiceData.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
          <input
            type="date"
            value={invoiceData.invoiceDate}
            onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative po-dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference/PI Number</label>
          <div className="relative">
            <input
              type="text"
              value={invoiceData.referenceNumber}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              onFocus={() => {
                if (approvedProformas.length > 0) {
                  setShowPODropdown(true);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select from approved proformas"
            />
            {approvedProformas.length > 0 && (
              <ChevronDown 
                className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer" 
                onClick={() => setShowPODropdown(!showPODropdown)}
              />
            )}
            
            {showPODropdown && approvedProformas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {approvedProformas.map((proforma) => (
                  <div
                    key={proforma._id}
                    onClick={() => handlePOSelect(proforma)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{proforma.proformaNumber}</div>
                    <div className="text-sm text-gray-500">
                      Date: {proforma.proformaDate ? new Date(proforma.proformaDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Amount: ₹{(proforma.grandTotal || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PI Date</label>
          <input
            type="date"
            value={invoiceData.poDate}
            onChange={(e) => handleInputChange('poDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={invoiceData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative client-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <div className="relative">
              <input
                type="text"
                value={clientSearchTerm || invoiceData.customerName}
                onChange={(e) => {
                  setClientSearchTerm(e.target.value);
                  setShowClientDropdown(true);
                  handleInputChange('customerName', e.target.value);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search or enter customer name"
              />
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client._id}
                      onClick={() => handleClientSelect(client)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{client.clientName}</div>
                      <div className="text-sm text-gray-500">{client.clientCode}</div>
                      {client.contactPerson && (
                        <div className="text-xs text-gray-400">{client.contactPerson}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="relative gst-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer GSTIN</label>
            <div className="relative">
              <input
                type="text"
                value={invoiceData.customerGSTIN}
                onChange={(e) => handleInputChange('customerGSTIN', e.target.value)}
                onFocus={() => {
                  if (selectedClient && selectedClient.gstNumbers && selectedClient.gstNumbers.length > 0) {
                    setShowGSTDropdown(true);
                  }
                }}
                maxLength="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select from dropdown or enter manually"
              />
              {selectedClient && selectedClient.gstNumbers && selectedClient.gstNumbers.length > 0 && (
                <ChevronDown 
                  className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer" 
                  onClick={() => setShowGSTDropdown(!showGSTDropdown)}
                />
              )}
              
              {showGSTDropdown && selectedClient && selectedClient.gstNumbers && selectedClient.gstNumbers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {selectedClient.gstNumbers.map((gst, index) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Place</label>
            <select
              value={invoiceData.customerPlace}
              onChange={(e) => handleInputChange('customerPlace', e.target.value)}
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
              value={invoiceData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
            <input
              type="text"
              value={invoiceData.contactDetails}
              onChange={(e) => handleInputChange('contactDetails', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
            <textarea
              value={invoiceData.customerAddress}
              onChange={(e) => handleInputChange('customerAddress', e.target.value)}
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
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Product/Item *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Qty *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Rate *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Discount</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Taxable Value</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">CGST %</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">SGST %</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">IGST %</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Total</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
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
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                      disabled={invoiceData.items.length === 1}
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
                value={invoiceData.paymentTerms}
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
                value={invoiceData.notes}
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
              <span className="font-medium">₹{(invoiceData.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Discount:</span>
              <span className="font-medium">₹{(invoiceData.totalDiscount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxable Value:</span>
              <span className="font-medium">₹{(invoiceData.totalTaxableValue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST:</span>
              <span className="font-medium">₹{(invoiceData.totalCGST || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST:</span>
              <span className="font-medium">₹{(invoiceData.totalSGST || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IGST:</span>
              <span className="font-medium">₹{(invoiceData.totalIGST || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tax:</span>
              <span className="font-medium">₹{(invoiceData.totalTax || 0).toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span>₹{(invoiceData.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
        <textarea
          value={invoiceData.termsConditions}
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
                      onClick={() => viewAttachment(attachment)}
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
          This is a tax invoice issued in compliance with GST regulations. 
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
        
        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          
          {showExportDropdown && (
            <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Invoice
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoice;
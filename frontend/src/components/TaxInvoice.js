import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, Trash2, Calculator, FileText, ChevronDown, Bell, CheckCircle, Clock, Upload, X, Paperclip, Eye, Users } from 'lucide-react';
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
  
  // Format number with Indian comma style
  const formatIndianNumber = (num) => {
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
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
    piDate: '',
    placeOfSupply: '',
    
    // Supplier Details
    supplierName: '',
    supplierAddress: '',
    supplierGSTIN: '',
    supplierPAN: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierWebsite: '',
    
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
    const fetchInvoiceNumber = async () => {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      try {
        const token = localStorage.getItem('token');
        const [settingsRes, invoicesRes] = await Promise.all([
          fetch(`${baseUrl}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/api/invoices`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (settingsRes.ok && invoicesRes.ok) {
          const settings = await settingsRes.json();
          const invoices = await invoicesRes.json();
          const prefix = settings.invoicePrefix || 'INV';
          const startNumber = String(settings.invoiceStartNumber || '1');
          
          // Extract numbers from existing invoices
          const existingNumbers = invoices
            .map(inv => inv.invoiceNumber)
            .filter(num => num && num.startsWith(prefix))
            .map(num => {
              // Remove prefix and extract only the numeric part at the end
              const withoutPrefix = num.substring(prefix.length);
              const numericPart = withoutPrefix.match(/\d+$/);
              return numericPart ? parseInt(numericPart[0]) : 0;
            })
            .filter(num => num > 0);
          
          const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : parseInt(startNumber);
          const paddedNumber = nextNumber.toString().padStart(startNumber.length, '0');
          return `${prefix}${paddedNumber}`;
        }
      } catch (error) {
        console.error('Error fetching invoice number:', error);
      }
      return generateInvoiceNumber();
    };

    if (editingInvoice) {
      // Pre-fill form with editing invoice data
      setInvoiceData({
        ...editingInvoice,
        invoiceDate: editingInvoice.invoiceDate ? new Date(editingInvoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: editingInvoice.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : '',
        piDate: editingInvoice.piDate ? new Date(editingInvoice.piDate).toISOString().split('T')[0] : '',
        referenceNumber: editingInvoice.piNumber || editingInvoice.referenceNumber || '',
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
      setClientSearchTerm(editingInvoice.customerName || '');
      // Set selectedClient as a dummy object for editing mode
      setSelectedClient({ clientName: editingInvoice.customerName });
    } else {
      // Reset to default for new invoice
      fetchInvoiceNumber().then(invoiceNumber => {
        setInvoiceData({
          invoiceNumber,
          invoiceDate: new Date().toISOString().split('T')[0],
          invoiceSeries: 'INV',
          referenceNumber: '',
          placeOfSupply: '',
          
          supplierName: '',
          supplierAddress: '',
          supplierGSTIN: '',
          supplierPAN: '',
          supplierEmail: '',
          supplierPhone: '',
          supplierWebsite: '',
          
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
      });
      setAttachments([]);
      setClientSearchTerm('');
      setSelectedClient(null);
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
    if (!invoiceData.items || invoiceData.items.length === 0) return;
    
    const updatedItems = invoiceData.items.map(calculateItemTotals);
    
    const subtotal = Math.max(0, updatedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0));
    const totalDiscount = Math.max(0, updatedItems.reduce((sum, item) => {
      const grossAmount = Number(item.quantity) * Number(item.unitPrice);
      const discountAmount = (grossAmount * Number(item.discount)) / 100;
      return sum + discountAmount;
    }, 0));
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
        piDate: '',
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
      piDate: proforma.proformaDate ? new Date(proforma.proformaDate).toISOString().split('T')[0] : '',
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
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    
    // Calculate existing attachments size
    const existingSize = attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);
    
    // Calculate new files size
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    
    // Check total size
    const totalSize = existingSize + newFilesSize;
    
    if (totalSize > MAX_TOTAL_SIZE) {
      const remainingSize = MAX_TOTAL_SIZE - existingSize;
      alert(`Total attachment size cannot exceed 10MB. You have ${(existingSize / (1024 * 1024)).toFixed(2)}MB already uploaded. Only ${(remainingSize / (1024 * 1024)).toFixed(2)}MB remaining.`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Only PDF, JPG, JPEG, and PNG files are allowed.');
      e.target.value = ''; // Reset file input
      return;
    }
    
    const newAttachments = files.map(file => ({
      fileName: file.name,
      fileSize: file.size,
      file: file,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset file input for next upload
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
    
    // Validate customer selected from dropdown
    if (!selectedClient) {
      alert('Please select a customer from the dropdown. Manual entry is not allowed.');
      return;
    }
    
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
    
    // Validate attachment is required
    if (!attachments || attachments.length === 0) {
      alert('At least one attachment is required');
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

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
        if (error.isPastDateError) {
          alert(error.message || 'Past date entry not allowed. Contact manager for permission.');
        } else {
          alert(error.message || 'Error saving invoice');
        }
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
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{editingInvoice ? 'Edit Tax Invoice' : 'Create Tax Invoice'}</h1>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6">

          {/* Supplier Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Supplier Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Legal Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={invoiceData.supplierName}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  placeholder="Auto-filled from profile"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={invoiceData.supplierGSTIN}
                  maxLength="15"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  placeholder="Auto-filled from profile"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={invoiceData.supplierPAN}
                  maxLength="10"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  placeholder="Auto-filled from profile"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place of Supply <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={invoiceData.placeOfSupply}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  placeholder="Auto-filled from Supplier GSTIN"
                  readOnly
                />
              </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Registered Address <span className="text-red-500">*</span></label>
          <textarea
            value={invoiceData.supplierAddress}
            rows="2"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            placeholder="Auto-filled from profile"
            readOnly
          />
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Invoice Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative po-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference/PI Number</label>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">PI Date</label>
            <input
              type="date"
              value={invoiceData.piDate}
              onChange={(e) => handleInputChange('piDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Customer Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative client-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <div className="relative">
              <input
                type="text"
                value={clientSearchTerm}
                onChange={(e) => {
                  setClientSearchTerm(e.target.value);
                  setShowClientDropdown(true);
                  setSelectedClient(null);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search customer name..."
              />
              <ChevronDown 
                className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer" 
                onClick={() => setShowClientDropdown(!showClientDropdown)}
              />
              
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
                onFocus={() => {
                  if (selectedClient && selectedClient.gstNumbers && selectedClient.gstNumbers.length > 0) {
                    setShowGSTDropdown(true);
                  }
                }}
                maxLength="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                placeholder="Select from dropdown"
                readOnly
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
            <input
              type="text"
              value={invoiceData.customerPlace}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from GST"
              readOnly
            />
          </div>
          <div style={{display: 'none'}}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from customer"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
            <input
              type="text"
              value={invoiceData.contactDetails}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from customer"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
            <textarea
              value={invoiceData.customerAddress}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from GST"
              readOnly
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
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Discount %</th>
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
                      type="text"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleItemChange(index, 'quantity', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unitPrice && item.unitPrice > 0 ? parseInt(item.unitPrice).toLocaleString('en-IN') : item.unitPrice}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
                        handleItemChange(index, 'unitPrice', parseInt(value) || 0);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.discount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleItemChange(index, 'discount', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm">₹{(item.taxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.cgstRate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleItemChange(index, 'cgstRate', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.sgstRate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleItemChange(index, 'sgstRate', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.igstRate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleItemChange(index, 'igstRate', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
              <span className="font-medium">₹{formatIndianNumber(invoiceData.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Discount:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalDiscount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxable Value:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalTaxableValue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalCGST || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalSGST || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IGST:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalIGST || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tax:</span>
              <span className="font-medium">₹{formatIndianNumber(invoiceData.totalTax || 0)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span>₹{formatIndianNumber(invoiceData.grandTotal || 0)}</span>
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
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Attachments *</label>
          <span className="text-xs text-gray-500">
            Total: {((attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0)) / (1024 * 1024)).toFixed(2)}MB / 10MB
          </span>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload files</span>
              <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Total max 10MB)</span>
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
      <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex gap-3 justify-end">
        <button 
          onClick={handleClose}
          className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        
        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4" />
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
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Save Invoice
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoice;

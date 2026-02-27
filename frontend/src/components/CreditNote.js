import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Plus, Trash2, FileText, Bell, CheckCircle, RotateCcw, ChevronDown, X } from 'lucide-react';
import { generateCreditNoteNumber } from '../utils/numberGenerator';
import { exportToExcel } from '../utils/excelExport';
import { generateCreditNotePDF } from '../utils/pdfGenerator';

const CreditNote = ({ isOpen, onClose, onSave, editingCreditNote }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [creditNoteData, setCreditNoteData] = useState({
    // Credit Note Details
    creditNoteNumber: '',
    creditNoteDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    originalInvoiceNumber: '',
    originalInvoiceDate: '',
    reason: '',
    
    // Supplier Details
    supplierName: 'ABC Enterprises',
    supplierAddress: '125 Business St., Bangalore, Karnataka - 550001',
    supplierGSTIN: '29ABCDE1234F1Z5',
    supplierPAN: 'ABCDE1234F',
    
    // Customer Details
    customerName: '',
    customerAddress: '',
    customerGSTIN: '',
    customerPlace: '',
    
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
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    }],
    
    // Totals
    subtotal: 0,
    totalDiscount: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalTax: 0,
    grandTotal: 0,
    
    // Additional Details
    notes: '',
    termsConditions: 'This is a credit note issued as per GST compliance requirements.'
  });
  const [returnRequests, setReturnRequests] = useState([
    {
      id: 'RET-001',
      customer: 'XYZ Ltd',
      originalInvoice: 'INV-00250',
      amount: '₹ 6,000',
      items: [{ name: 'Product B', qty: 2, rate: 3000 }],
      reason: 'Product Returned',
      date: '2024-01-15'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [autoFillData, setAutoFillData] = useState(null);
  const [creditNoteNumber, setCreditNoteNumber] = useState('');
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [maxRemainingAmount, setMaxRemainingAmount] = useState(0);
  const skipCalculation = useRef(false);

  // Format number with Indian comma style
  const formatIndianNumber = (num) => {
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const fetchCreditNoteNumber = async () => {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      try {
        const token = localStorage.getItem('token');
        const [settingsRes, creditNotesRes] = await Promise.all([
          fetch(`${baseUrl}/api/settings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/api/credit-notes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (settingsRes.ok && creditNotesRes.ok) {
          const settings = await settingsRes.json();
          const creditNotes = await creditNotesRes.json();
          
          const prefix = settings.creditNotePrefix || 'CN';
          const startNumber = String(settings.creditNoteStartNumber || '1');
          
          // Extract numbers from existing credit notes
          const existingNumbers = creditNotes
            .map(cn => cn.creditNoteNumber)
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
          const finalNumber = `${prefix}${paddedNumber}`;
          
          return finalNumber;
        }
      } catch (error) {
        console.error('Error fetching credit note number:', error);
      }
      return generateCreditNoteNumber();
    };

    if (editingCreditNote) {
      setCreditNoteData({
        ...editingCreditNote,
        creditNoteDate: editingCreditNote.creditNoteDate ? new Date(editingCreditNote.creditNoteDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        originalInvoiceDate: editingCreditNote.originalInvoiceDate ? new Date(editingCreditNote.originalInvoiceDate).toISOString().split('T')[0] : '',
        items: editingCreditNote.items || [{
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
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0
        }]
      });
    } else {
      fetchCreditNoteNumber().then(creditNoteNumber => {
        setCreditNoteData({
          creditNoteNumber,
        creditNoteDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        originalInvoiceNumber: '',
        originalInvoiceDate: '',
        reason: '',
        supplierName: '',
        supplierAddress: '',
        supplierGSTIN: '',
        supplierPAN: '',
        customerName: '',
        customerAddress: '',
        customerGSTIN: '',
        customerPlace: '',
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
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0
        }],
        subtotal: 0,
        totalDiscount: 0,
        totalTaxableValue: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalTax: 0,
        grandTotal: 0,
        notes: '',
        termsConditions: 'This is a credit note issued as per GST compliance requirements.'
        });
      });
    }
  }, [editingCreditNote]);

  useEffect(() => {
    if (skipCalculation.current) {
      skipCalculation.current = false;
      return;
    }
    calculateTotals();
  }, [creditNoteData.items.length, JSON.stringify(creditNoteData.items.map(i => ({ qty: i.quantity, unitPrice: i.unitPrice, disc: i.discount, cgst: i.cgstRate, sgst: i.sgstRate, igst: i.igstRate })))]);

  // Fetch user profile data - runs for both new and edit
  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    const fetchUserProfile = async () => {
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
          
          setCreditNoteData(prev => ({
            ...prev,
            supplierName: profile.tradeName || userData.user.companyName || prev.supplierName,
            supplierAddress: profile.address || prev.supplierAddress,
            supplierGSTIN: profile.gstNumber || prev.supplierGSTIN,
            supplierPAN: profile.panNumber || prev.supplierPAN
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

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

  const calculateItemTotals = (item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const discountPercent = Math.max(0, Number(item.discount) || 0);
    const cgstRate = Math.max(0, Number(item.cgstRate) || 0);
    const sgstRate = Math.max(0, Number(item.sgstRate) || 0);
    const igstRate = Math.max(0, Number(item.igstRate) || 0);
    
    const grossAmount = quantity * unitPrice;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const taxableValue = Math.max(0, grossAmount - discountAmount);
    const cgstAmount = Math.max(0, (taxableValue * cgstRate) / 100);
    const sgstAmount = Math.max(0, (taxableValue * sgstRate) / 100);
    const igstAmount = Math.max(0, (taxableValue * igstRate) / 100);
    const totalAmount = Math.max(0, taxableValue + cgstAmount + sgstAmount + igstAmount);

    return {
      ...item,
      taxableValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount
    };
  };

  const calculateTotals = () => {
    console.log('calculateTotals called, current items:', creditNoteData.items);
    if (!creditNoteData.items || creditNoteData.items.length === 0) return;
    
    const updatedItems = creditNoteData.items.map(calculateItemTotals);
    console.log('Updated items after calculation:', updatedItems);
    
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
    const totalTax = Math.max(0, totalCGST + totalSGST + totalIGST);
    const grandTotal = Math.max(0, totalTaxableValue + totalTax);

    setCreditNoteData(prev => {
      console.log('Setting new creditNoteData with totals:', { subtotal, totalDiscount, totalTaxableValue, totalCGST, totalSGST, totalIGST, totalTax, grandTotal });
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        totalDiscount,
        totalTaxableValue,
        totalCGST,
        totalSGST,
        totalIGST,
        totalTax,
        grandTotal
      };
    });
  };

  const handleClientSelect = (client) => {
    setCreditNoteData(prev => ({
      ...prev,
      customerName: client.clientName,
      customerAddress: client.billingAddress || '',
      customerGSTIN: client.gstNumber || '',
      customerPlace: client.customerPlace || '',
      originalInvoiceNumber: '',
      originalInvoiceDate: ''
    }));
    setShowClientDropdown(false);
    setClientSearchTerm(client.clientName);
    fetchInvoicesForClient(client.clientName);
  };

  const fetchInvoicesForClient = async (clientName) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/invoices`);
      if (response.ok) {
        const allInvoices = await response.json();
        
        // Fetch collections
        const collectionsResponse = await fetch(`${baseUrl}/api/collections`);
        let collections = [];
        if (collectionsResponse.ok) {
          collections = await collectionsResponse.json();
        }
        
        // Fetch credit notes
        const creditNotesResponse = await fetch(`${baseUrl}/api/credit-notes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let creditNotes = [];
        if (creditNotesResponse.ok) {
          creditNotes = await creditNotesResponse.json();
        }
        
        // Filter invoices: same customer and approved
        const filteredInvoices = allInvoices.filter(invoice => 
          invoice.customerName === clientName &&
          invoice.approvalStatus === 'Approved'
        );
        
        // Calculate remaining amounts for each invoice
        const invoicesWithRemaining = filteredInvoices.map((invoice) => {
          // Calculate total received from collections
          const invoiceCollections = collections.filter(collection => 
            collection.invoiceNumber?.includes(invoice.invoiceNumber) && 
            collection.approvalStatus === 'Approved'
          );
          const totalReceived = invoiceCollections.reduce((sum, collection) => 
            sum + (parseFloat(collection.netAmount) || parseFloat(collection.amount) || 0), 0
          );
          
          // Get credit notes for this invoice
          const invoiceCreditNotes = creditNotes.filter(cn => 
            cn.originalInvoiceNumber === invoice.invoiceNumber && 
            cn.approvalStatus === 'Approved'
          );
          
          // Calculate TDS from collections
          const totalTDS = invoiceCollections.reduce((sum, col) => 
            sum + (parseFloat(col.tdsAmount) || 0), 0
          );
          
          // Calculate remaining amount (subtract TDS)
          const totalSettled = totalReceived + invoiceCreditNotes.reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);
          const remainingAmount = (invoice.grandTotal || 0) - totalSettled - totalTDS;
          
          // Calculate invoice's subtotal from items (qty × rate)
          const invoiceSubtotal = invoice.items?.reduce((sum, item) => 
            sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
          ) || 0;
          
          // Calculate remaining subtotal proportionally
          const remainingSubtotal = invoiceSubtotal > 0 
            ? (remainingAmount * invoiceSubtotal) / (invoice.grandTotal || 1)
            : 0;
          
          // Calculate remaining rate per item
          const itemsWithRemaining = invoice.items?.map(item => {
            const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
            const itemRemainingRate = invoiceSubtotal > 0 
              ? (remainingSubtotal * itemSubtotal) / invoiceSubtotal
              : 0;
            return {
              ...item,
              remainingRate: itemRemainingRate > 0 ? itemRemainingRate : 0
            };
          }) || [];
          
          return { 
            ...invoice,
            items: itemsWithRemaining,
            remainingAmount: remainingAmount > 0 ? remainingAmount : 0 
          };
        }).filter(invoice => invoice.remainingAmount > 0); // Only show invoices with remaining amount
        
        setInvoices(invoicesWithRemaining);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const handleInvoiceSelect = (invoice) => {
    console.log('Selected invoice:', invoice);
    const remainingAmount = invoice.remainingAmount || 0;
    setMaxRemainingAmount(remainingAmount);

    console.log('Invoice items:', invoice.items);

    // Map items from invoice with remaining rates
    const mappedItems = invoice.items && invoice.items.length > 0 ? invoice.items.map(item => {
      const originalQuantity = item.quantity || 1;
      const remainingRate = item.remainingRate || 0;
      const unitPrice = remainingRate / originalQuantity;
      const discount = item.discount || 0;
      const cgstRate = item.cgstRate || 0;
      const sgstRate = item.sgstRate || 0;
      const igstRate = item.igstRate || 0;
      
      const grossAmount = originalQuantity * unitPrice;
      const discountAmount = (grossAmount * discount) / 100;
      const itemTaxableValue = grossAmount - discountAmount;
      const cgstAmount = Math.max(0, (itemTaxableValue * cgstRate) / 100);
      const sgstAmount = Math.max(0, (itemTaxableValue * sgstRate) / 100);
      const igstAmount = Math.max(0, (itemTaxableValue * igstRate) / 100);
      const totalAmount = Math.max(0, itemTaxableValue + cgstAmount + sgstAmount + igstAmount);
      
      return {
        product: item.product || item.description || '',
        description: item.description || item.product || '',
        hsnCode: item.hsnCode || '',
        quantity: originalQuantity,
        unitPrice: unitPrice,
        maxUnitPrice: unitPrice,
        discount: discount,
        taxableValue: itemTaxableValue,
        cgstRate: cgstRate,
        sgstRate: sgstRate,
        igstRate: igstRate,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        igstAmount: igstAmount,
        totalAmount: totalAmount
      };
    }) : [{
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
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    }];

    console.log('Mapped items:', mappedItems);

    skipCalculation.current = true;
    
    const subtotal = mappedItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const totalDiscount = mappedItems.reduce((sum, item) => {
      const grossAmount = Number(item.quantity) * Number(item.unitPrice);
      return sum + (grossAmount * Number(item.discount)) / 100;
    }, 0);
    const totalTaxableValue = mappedItems.reduce((sum, item) => sum + Number(item.taxableValue), 0);
    const totalCGST = mappedItems.reduce((sum, item) => sum + Number(item.cgstAmount), 0);
    const totalSGST = mappedItems.reduce((sum, item) => sum + Number(item.sgstAmount), 0);
    const totalIGST = mappedItems.reduce((sum, item) => sum + Number(item.igstAmount), 0);
    const totalTax = totalCGST + totalSGST + totalIGST;
    const grandTotal = totalTaxableValue + totalTax;

    setCreditNoteData(prev => ({
      ...prev,
      originalInvoiceNumber: invoice.invoiceNumber,
      originalInvoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
      items: mappedItems,
      subtotal,
      totalDiscount,
      totalTaxableValue,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      grandTotal
    }));
    setShowInvoiceDropdown(false);
  };

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.clientCode.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    if (field === 'creditNoteDate' && creditNoteData.originalInvoiceDate) {
      if (value < creditNoteData.originalInvoiceDate) {
        alert('Credit Note date cannot be earlier than the original invoice date');
        return;
      }
    }
    setCreditNoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    if (field === 'unitPrice') {
      const newValue = parseFloat(value) || 0;
      const item = creditNoteData.items[index];
      const maxUnitPrice = item.maxUnitPrice || 0;
      
      if (maxUnitPrice > 0 && newValue > maxUnitPrice) {
        alert(`Rate cannot exceed remaining rate of ₹${maxUnitPrice.toFixed(2)}`);
        return;
      }
    }
    
    setCreditNoteData(prev => {
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
      unitPrice: 0,
      discount: 0,
      taxableValue: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    };
    
    setCreditNoteData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    if (creditNoteData.items.length > 1) {
      const updatedItems = creditNoteData.items.filter((_, i) => i !== index);
      setCreditNoteData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const handleSave = async () => {
    if (!creditNoteData.customerName || !creditNoteData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }
    
    // Validate customer exists in client master
    const customerExists = clients.some(client => 
      client.clientName.toLowerCase() === creditNoteData.customerName.toLowerCase()
    );
    
    if (!customerExists) {
      alert('Customer not found in Client Master. Please select a valid customer from the dropdown or add them in Client Master first.');
      return;
    }
    
    if (!creditNoteData.originalInvoiceNumber || !creditNoteData.originalInvoiceNumber.trim()) {
      alert('Original invoice number is required');
      return;
    }
    
    // Validate invoice exists
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      const response = await fetch(`${baseUrl}/api/invoices`);
      if (response.ok) {
        const allInvoices = await response.json();
        const invoiceExists = allInvoices.some(inv => 
          inv.invoiceNumber === creditNoteData.originalInvoiceNumber
        );
        
        if (!invoiceExists) {
          alert(`Invoice number "${creditNoteData.originalInvoiceNumber}" does not exist. Please select a valid invoice from the dropdown.`);
          return;
        }
      }
    } catch (error) {
      console.error('Error validating invoice:', error);
      alert('Error validating invoice. Please try again.');
      return;
    }
    
    if (creditNoteData.originalInvoiceDate && creditNoteData.creditNoteDate < creditNoteData.originalInvoiceDate) {
      alert('Credit Note date cannot be earlier than the original invoice date');
      return;
    }
    
    const savedCreditNote = {
      ...creditNoteData,
      status: 'Draft',
      approvalStatus: editingCreditNote ? creditNoteData.approvalStatus : 'Pending'
    };
    
    if (onSave) {
      onSave(savedCreditNote);
    }
  };



  const handleAutoFillFromReturn = (returnReq) => {
    setCreditNoteData(prev => ({
      ...prev,
      customerName: returnReq.customer,
      originalInvoiceNumber: returnReq.originalInvoice,
      reason: returnReq.reason,
      referenceNumber: returnReq.id
    }));
    setReturnRequests(prev => prev.filter(r => r.id !== returnReq.id));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  const handleExportPDF = () => {
    generateCreditNotePDF(creditNoteData);
    setShowExportDropdown(false);
  };

  const handleExportExcel = () => {
    // Main Credit Note Data
    const mainData = {
      'Credit Note Number': creditNoteData.creditNoteNumber,
      'Credit Note Date': creditNoteData.creditNoteDate,
      'Reference Number': creditNoteData.referenceNumber || '',
      'Original Invoice Number': creditNoteData.originalInvoiceNumber,
      'Original Invoice Date': creditNoteData.originalInvoiceDate || '',
      'Reason': creditNoteData.reason || '',
      
      // Supplier Details
      'Supplier Name': creditNoteData.supplierName,
      'Supplier Address': creditNoteData.supplierAddress,
      'Supplier GSTIN': creditNoteData.supplierGSTIN,
      'Supplier PAN': creditNoteData.supplierPAN,
      
      // Customer Details
      'Customer Name': creditNoteData.customerName,
      'Customer Address': creditNoteData.customerAddress,
      'Customer GSTIN': creditNoteData.customerGSTIN || '',
      'Customer Place': creditNoteData.customerPlace || '',
      
      // Totals
      'Subtotal': creditNoteData.subtotal || 0,
      'Total Discount': creditNoteData.totalDiscount || 0,
      'Taxable Value': creditNoteData.totalTaxableValue || 0,
      'CGST Amount': creditNoteData.totalCGST || 0,
      'SGST Amount': creditNoteData.totalSGST || 0,
      'IGST Amount': creditNoteData.totalIGST || 0,
      'Total Tax': creditNoteData.totalTax || 0,
      'Grand Total': creditNoteData.grandTotal || 0,
      
      // Additional Info
      'Notes': creditNoteData.notes || '',
      'Terms & Conditions': creditNoteData.termsConditions || '',
      'Status': 'Draft'
    };
    
    // Items Data
    const itemsData = creditNoteData.items.map((item, index) => ({
      'Item No': index + 1,
      'Product': item.product || '',
      'Description': item.description || '',
      'HSN/SAC Code': item.hsnCode || '',
      'Quantity': item.quantity || 0,
      'Unit Price': item.unitPrice || 0,
      'Discount': item.discount || 0,
      'Taxable Value': item.taxableValue || 0,
      'CGST Rate (%)': item.cgstRate || 0,
      'CGST Amount': item.cgstAmount || 0,
      'SGST Rate (%)': item.sgstRate || 0,
      'SGST Amount': item.sgstAmount || 0,
      'IGST Rate (%)': item.igstRate || 0,
      'IGST Amount': item.igstAmount || 0,
      'Total Amount': item.totalAmount || 0
    }));
    
    // Create workbook with multiple sheets
    const workbook = {
      'Credit Note Summary': [mainData],
      'Items Details': itemsData
    };
    
    exportToExcel(workbook, `CreditNote_${creditNoteData.creditNoteNumber}_${new Date().toISOString().split('T')[0]}`);
    setShowExportDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (!event.target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
      }
      if (!event.target.closest('.invoice-dropdown-container')) {
        setShowInvoiceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{editingCreditNote ? 'Edit Credit Note' : 'Create Credit Note'}</h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Business Name *</label>
            <input
              type="text"
              value={creditNoteData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
            <input
              type="text"
              value={creditNoteData.supplierGSTIN}
              onChange={(e) => handleInputChange('supplierGSTIN', e.target.value)}
              maxLength="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address *</label>
          <textarea
            value={creditNoteData.supplierAddress}
            onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Credit Note Details */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Credit Note Details
        </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note Number *</label>
          <input
            type="text"
            value={creditNoteData.creditNoteNumber}
            onChange={(e) => handleInputChange('creditNoteNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note Date *</label>
          <input
            type="date"
            value={creditNoteData.creditNoteDate}
            onChange={(e) => handleInputChange('creditNoteDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative invoice-dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Invoice Number *</label>
          <div className="relative">
            <input
              type="text"
              value={creditNoteData.originalInvoiceNumber}
              onChange={(e) => handleInputChange('originalInvoiceNumber', e.target.value)}
              onFocus={() => {
                if (invoices.length > 0) {
                  setShowInvoiceDropdown(true);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={creditNoteData.customerName ? "Select from approved invoices" : "Select customer first"}
              readOnly={!creditNoteData.customerName}
            />
            {invoices.length > 0 && (
              <ChevronDown 
                className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer" 
                onClick={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
              />
            )}
            
            {showInvoiceDropdown && invoices.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {invoices.map((invoice) => {
                  return (
                    <div
                      key={invoice._id}
                      onClick={() => handleInvoiceSelect(invoice)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">
                        Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Total: ₹{(invoice.grandTotal || 0).toFixed(2)} | Remaining: ₹{(invoice.remainingAmount || invoice.grandTotal || 0).toFixed(2)}
                      </div>
                      {invoice.items && invoice.items.length > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {invoice.items.map((item, idx) => 
                            `${item.product || 'Item'} @ ₹${(item.unitPrice || 0).toFixed(2)} (Rem Rate: ₹${(item.remainingRate || 0).toFixed(2)})`
                          ).join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-blue-600">
                        Status: {invoice.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Invoice Date</label>
          <input
            type="date"
            value={creditNoteData.originalInvoiceDate}
            onChange={(e) => handleInputChange('originalInvoiceDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input
            type="text"
            value={creditNoteData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      </div>

      {/* Customer Details */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Customer Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative client-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <div className="relative">
              <input
                type="text"
                value={clientSearchTerm || creditNoteData.customerName}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer GSTIN</label>
            <input
              type="text"
              value={creditNoteData.customerGSTIN}
              onChange={(e) => handleInputChange('customerGSTIN', e.target.value)}
              maxLength="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
            <textarea
              value={creditNoteData.customerAddress}
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
              {creditNoteData.items.map((item, index) => (
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
                      value={item.unitPrice && item.unitPrice > 0 ? parseFloat(item.unitPrice).toLocaleString('en-IN') : item.unitPrice}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        handleItemChange(index, 'unitPrice', value);
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
                      disabled={creditNoteData.items.length === 1}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={creditNoteData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Discount:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalDiscount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxable Value:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalTaxableValue || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CGST:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalCGST || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SGST:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalSGST || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">IGST:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalIGST || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Tax:</span>
            <span className="font-medium">₹{formatIndianNumber(creditNoteData.totalTax || 0)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total:</span>
            <span>₹{formatIndianNumber(creditNoteData.grandTotal || 0)}</span>
          </div>
        </div>
      </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Credit Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditNote;

import React, { useState, useEffect } from 'react';
import { Save, Download, Printer, Plus, Trash2, Calculator, FileText } from 'lucide-react';
import { generateInvoiceNumber } from '../utils/numberGenerator';
import { exportToExcel } from '../utils/excelExport';

const TaxInvoice = ({ isOpen, onClose, onSave, editingInvoice }) => {
  const [invoiceData, setInvoiceData] = useState({
    // Invoice Details
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceSeries: 'INV',
    referenceNumber: '',
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
    contactPerson: '',
    contactDetails: '',
    
    // Payment Terms
    paymentTerms: '30 Days',
    dueDate: '',
    
    // Items
    items: [{
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
        dueDate: editingInvoice.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : ''
      });
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
        contactPerson: '',
        contactDetails: '',
        
        paymentTerms: '30 Days',
        dueDate: '',
        
        items: [{
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
        termsConditions: 'This is a tax invoice as per GST compliance requirements.',
        currency: 'INR',
        eInvoiceIRN: '',
        qrCode: ''
      });
    }
  }, [editingInvoice]);

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items]);

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
  };

  const handleInputChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    const newItem = {
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

  const handleSave = async () => {
    // Validate required fields
    if (!invoiceData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }
    if (!invoiceData.customerAddress.trim()) {
      alert('Customer address is required');
      return;
    }
    if (!invoiceData.placeOfSupply.trim()) {
      alert('Place of supply is required');
      return;
    }
    
    // Validate items
    const hasValidItems = invoiceData.items.some(item => 
      item.description.trim() && item.hsnCode.trim() && item.quantity > 0 && item.unitPrice > 0
    );
    
    if (!hasValidItems) {
      alert('At least one valid item with description, HSN code, quantity, and unit price is required');
      return;
    }

    try {
      // Clean the data before sending
      const cleanedData = {
        ...invoiceData,
        items: invoiceData.items.filter(item => 
          item.description.trim() && item.hsnCode.trim()
        ).map(item => ({
          ...item,
          id: undefined,
          _id: undefined
        }))
      };

      const isEditing = editingInvoice && editingInvoice._id;
      const url = isEditing 
        ? `http://localhost:5001/api/invoices/${editingInvoice._id}`
        : 'http://localhost:5001/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
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

  const handlePrint = () => {
    window.print();
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{editingInvoice ? 'Edit Tax Invoice' : 'Tax Invoice'}</h1>
          <button
            onClick={onClose}
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
            <input
              type="text"
              value={invoiceData.placeOfSupply}
              onChange={(e) => handleInputChange('placeOfSupply', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference/PO Number</label>
          <input
            type="text"
            value={invoiceData.referenceNumber}
            onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              type="text"
              value={invoiceData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer GSTIN</label>
            <input
              type="text"
              value={invoiceData.customerGSTIN}
              onChange={(e) => handleInputChange('customerGSTIN', e.target.value)}
              maxLength="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
          <textarea
            value={invoiceData.customerAddress}
            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Description *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Qty *</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Unit</th>
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
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Product/Service"
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
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Liters">Liters</option>
                      <option value="Hours">Hours</option>
                      <option value="Pieces">Pieces</option>
                    </select>
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
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
        >
          Cancel
        </button>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </button>
        <button 
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </button>
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
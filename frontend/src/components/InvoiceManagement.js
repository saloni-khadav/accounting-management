import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, Filter, FileText, Bell, CheckCircle, Clock } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { generateTaxInvoicePDF } from '../utils/pdfGenerator';
import TaxInvoice from './TaxInvoice';
import MetricsCard from './ui/MetricsCard';

const InvoiceManagement = ({ setActivePage }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleDownloadAttachment = async (fileUrl, fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      // Extract filename from fileUrl
      const filename = fileUrl.split('/').pop();
      const downloadUrl = `${baseUrl}/api/invoices/download/${filename}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const handleViewAttachment = async (fileUrl, fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      // Extract filename from fileUrl
      const filename = fileUrl.split('/').pop();
      const viewUrl = `${baseUrl}/api/invoices/view/${filename}`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error viewing file');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    const handleInvoicesUpdate = () => {
      console.log('invoicesUpdated event received!');
      fetchInvoices();
    };
    
    window.addEventListener('invoicesUpdated', handleInvoicesUpdate);
    window.addEventListener('focus', handleInvoicesUpdate);
    
    return () => {
      window.removeEventListener('invoicesUpdated', handleInvoicesUpdate);
      window.removeEventListener('focus', handleInvoicesUpdate);
    };
  }, []);

  const fetchInvoices = async () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    setLoading(true);
    console.log('Fetching invoices...');
    try {
      const token = localStorage.getItem('token');
      let url = `${baseUrl}/api/invoices`;
      const params = new URLSearchParams();
      
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter.start) params.append('startDate', dateFilter.start);
      if (dateFilter.end) params.append('endDate', dateFilter.end);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Invoices fetched:', data.length);
      
      // Fetch collections and credit notes to calculate received amounts
      const collectionsResponse = await fetch(`${baseUrl}/api/collections`);
      let collections = [];
      if (collectionsResponse.ok) {
        collections = await collectionsResponse.json();
        console.log('Collections fetched:', collections.length);
      }
      
      const creditNotesResponse = await fetch(`${baseUrl}/api/credit-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let creditNotes = [];
      if (creditNotesResponse.ok) {
        creditNotes = await creditNotesResponse.json();
        console.log('Credit notes fetched:', creditNotes.length);
      }
      
      // Calculate received amounts for each invoice
      const invoicesWithReceivedAmounts = data.map(invoice => {
        // Calculate total received from collections
        const invoiceCollections = collections.filter(collection => 
          collection.invoiceNumber?.includes(invoice.invoiceNumber) && 
          collection.approvalStatus === 'Approved'
        );
        const totalReceived = invoiceCollections.reduce((sum, collection) => 
          sum + (parseFloat(collection.netAmount) || parseFloat(collection.amount) || 0), 0
        );
        
        // Calculate total credit notes
        const invoiceCreditNotes = creditNotes.filter(cn => 
          cn.originalInvoiceNumber === invoice.invoiceNumber && 
          cn.approvalStatus === 'Approved'
        );
        const totalCreditNotes = invoiceCreditNotes.reduce((sum, cn) => 
          sum + (cn.grandTotal || 0), 0
        );
        
        console.log(`Invoice ${invoice.invoiceNumber}: GrandTotal=${invoice.grandTotal}, Received=${totalReceived}, CreditNotes=${totalCreditNotes}, TotalSettled=${totalReceived + totalCreditNotes}`);
        
        return {
          ...invoice,
          receivedAmount: totalReceived,
          creditNoteAmount: totalCreditNotes
        };
      });
      
      setInvoices(invoicesWithReceivedAmounts);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
    setLoading(false);
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDownloadPDF = (invoice) => {
    generateTaxInvoicePDF(invoice);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setInvoices(invoices.filter(invoice => invoice._id !== invoiceId));
          alert('Invoice deleted successfully!');
        }
      } catch (error) {
        alert('Error deleting invoice');
      }
    }
  };

  const handleApprovalChange = async (invoiceId, newApprovalStatus) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
    try {
      const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvalStatus: newApprovalStatus }),
      });
      
      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(invoices.map(invoice => 
          invoice._id === invoiceId ? updatedInvoice : invoice
        ));
        alert('Invoice approval status updated successfully!');
      }
    } catch (error) {
      alert('Error updating invoice approval status');
    }
  };

  // Calculate invoice status based on collections and credit notes
  const calculateInvoiceStatus = (invoice) => {
    // If invoice is not approved, show hyphen
    if (invoice.approvalStatus !== 'Approved') {
      return '-';
    }
    
    const grandTotal = invoice.grandTotal || 0;
    const receivedAmount = invoice.receivedAmount || 0;
    const creditNoteAmount = invoice.creditNoteAmount || 0;
    
    // Total settled amount = collections + credit notes
    const totalSettled = receivedAmount + creditNoteAmount;
    
    // Check if fully settled
    if (totalSettled >= grandTotal) {
      return 'Fully Received';
    }
    
    // Check if partially settled
    if (totalSettled > 0 && totalSettled < grandTotal) {
      return 'Partially Received';
    }
    
    // Default status when nothing is settled
    return 'Not Received';
  };

  const handleExportToExcel = () => {
    if (invoices.length === 0) {
      alert('No invoice data to export');
      return;
    }
    
    const exportData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Date': new Date(invoice.invoiceDate).toLocaleDateString(),
      'Customer': invoice.customerName,
      'Reference': invoice.referenceNumber || '',
      'Taxable Value': invoice.totalTaxableValue,
      'Total Tax': invoice.totalTax,
      'Grand Total': invoice.grandTotal,
      'Status': calculateInvoiceStatus(invoice),
      'Due Date': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, `invoices_${new Date().toISOString().split('T')[0]}`);
    alert('Invoice data exported successfully!');
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.referenceNumber && invoice.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const calculatedStatus = calculateInvoiceStatus(invoice);
    const matchesStatus = statusFilter === '' || calculatedStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Received': return 'bg-red-100 text-red-800';
      case 'Partially Received': return 'bg-yellow-100 text-yellow-800';
      case 'Fully Received': return 'bg-green-100 text-green-800';
      case '-': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <FileText className="mr-3" size={28} />
                Invoice Management
              </h1>
              <p className="text-blue-100 mt-1">Manage tax invoices and GST compliance</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Fully Received"
            value={invoices.filter(inv => inv.approvalStatus === 'Approved' && calculateInvoiceStatus(inv) === 'Fully Received').length}
            icon={CheckCircle}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Partially Received"
            value={invoices.filter(inv => inv.approvalStatus === 'Approved' && calculateInvoiceStatus(inv) === 'Partially Received').length}
            icon={Clock}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Not Received"
            value={invoices.filter(inv => inv.approvalStatus === 'Approved' && calculateInvoiceStatus(inv) === 'Not Received').length}
            icon={Bell}
            color="danger"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Not Received">Not Received</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Fully Received">Fully Received</option>
            </select>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                placeholder="From Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                placeholder="To Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Invoice List</h2>
            <span className="text-blue-100 text-sm">{filteredInvoices.length} Invoices</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice No.</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Reference</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Approval</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300 animate-pulse" />
                    <p className="text-lg font-medium">Loading invoices...</p>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm">Create your first invoice to get started</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <tr key={invoice._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 text-blue-600 font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{invoice.customerName}</td>
                    <td className="py-4 px-6 text-gray-600">{invoice.referenceNumber || '-'}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{invoice.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        invoice.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.approvalStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(calculateInvoiceStatus(invoice))}`}>
                        {calculateInvoiceStatus(invoice)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditInvoice(invoice)}
                          className={`p-2 rounded-lg transition-colors ${
                            invoice.approvalStatus === 'Approved' 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={invoice.approvalStatus === 'Approved' ? 'Cannot edit approved invoice' : 'Edit'}
                          disabled={invoice.approvalStatus === 'Approved'}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            invoice.approvalStatus === 'Approved' 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={invoice.approvalStatus === 'Approved' ? 'Cannot delete approved invoice' : 'Delete'}
                          disabled={invoice.approvalStatus === 'Approved'}
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(invoice)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {isViewModalOpen && viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Invoice Details - {viewingInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Supplier Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Supplier Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Name:</span> {viewingInvoice.supplierName || 'N/A'}</div>
                  <div><span className="font-medium">GSTIN:</span> {viewingInvoice.supplierGSTIN || 'N/A'}</div>
                  <div><span className="font-medium">PAN:</span> {viewingInvoice.supplierPAN || 'N/A'}</div>
                  <div><span className="font-medium">Place of Supply:</span> {viewingInvoice.placeOfSupply || 'N/A'}</div>
                  <div className="md:col-span-2"><span className="font-medium">Address:</span> {viewingInvoice.supplierAddress || 'N/A'}</div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="font-medium">Invoice Number:</span> {viewingInvoice.invoiceNumber}</div>
                  <div><span className="font-medium">Invoice Date:</span> {new Date(viewingInvoice.invoiceDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">Reference/PI Number:</span> {viewingInvoice.referenceNumber || 'N/A'}</div>
                  <div><span className="font-medium">PI Date:</span> {viewingInvoice.poDate ? new Date(viewingInvoice.poDate).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-medium">Due Date:</span> {viewingInvoice.dueDate ? new Date(viewingInvoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-medium">Payment Terms:</span> {viewingInvoice.paymentTerms || 'N/A'}</div>
                  <div><span className="font-medium">Approval Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      viewingInvoice.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      viewingInvoice.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingInvoice.approvalStatus || 'Pending'}
                    </span>
                  </div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(calculateInvoiceStatus(viewingInvoice))}`}>
                      {calculateInvoiceStatus(viewingInvoice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Name:</span> {viewingInvoice.customerName}</div>
                  <div><span className="font-medium">GSTIN:</span> {viewingInvoice.customerGSTIN || 'N/A'}</div>
                  <div><span className="font-medium">Customer Place:</span> {viewingInvoice.customerPlace || 'N/A'}</div>
                  <div><span className="font-medium">Contact Person:</span> {viewingInvoice.contactPerson || 'N/A'}</div>
                  <div><span className="font-medium">Contact Details:</span> {viewingInvoice.contactDetails || 'N/A'}</div>
                  <div className="md:col-span-2"><span className="font-medium">Billing Address:</span> {viewingInvoice.customerAddress}</div>
                </div>
              </div>

              {/* Items Table */}
              {viewingInvoice.items && viewingInvoice.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Product/Service Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 border text-left">Product</th>
                          <th className="px-3 py-2 border text-left">HSN/SAC</th>
                          <th className="px-3 py-2 border text-right">Qty</th>
                          <th className="px-3 py-2 border text-right">Rate</th>
                          <th className="px-3 py-2 border text-right">Discount</th>
                          <th className="px-3 py-2 border text-right">Taxable Value</th>
                          <th className="px-3 py-2 border text-right">CGST</th>
                          <th className="px-3 py-2 border text-right">SGST</th>
                          <th className="px-3 py-2 border text-right">IGST</th>
                          <th className="px-3 py-2 border text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 border">{item.product || item.description || '-'}</td>
                            <td className="px-3 py-2 border">{item.hsnCode || '-'}</td>
                            <td className="px-3 py-2 border text-right">{item.quantity || 0}</td>
                            <td className="px-3 py-2 border text-right">₹{(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 border text-right">₹{(item.discount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 border text-right">₹{(item.taxableValue || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 border text-right">{item.cgstRate || 0}% (₹{(item.cgstAmount || 0).toFixed(2)})</td>
                            <td className="px-3 py-2 border text-right">{item.sgstRate || 0}% (₹{(item.sgstAmount || 0).toFixed(2)})</td>
                            <td className="px-3 py-2 border text-right">{item.igstRate || 0}% (₹{(item.igstAmount || 0).toFixed(2)})</td>
                            <td className="px-3 py-2 border text-right font-medium">₹{(item.totalAmount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Financial Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Tax Computation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.subtotal || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Discount</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalDiscount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxable Value</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalTaxableValue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CGST</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalCGST || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SGST</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalSGST || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IGST</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalIGST || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Tax</p>
                      <p className="text-lg font-semibold">₹{(viewingInvoice.totalTax || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grand Total</p>
                      <p className="text-xl font-bold text-blue-600">₹{(viewingInvoice.grandTotal || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              {(viewingInvoice.notes || viewingInvoice.termsConditions) && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingInvoice.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{viewingInvoice.notes}</p>
                    </div>
                  )}
                  {viewingInvoice.termsConditions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{viewingInvoice.termsConditions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {viewingInvoice.attachments && viewingInvoice.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {viewingInvoice.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{attachment.fileName || `Attachment ${index + 1}`}</span>
                          <span className="text-xs text-gray-500 ml-2">{attachment.fileSize ? `(${(attachment.fileSize / 1024).toFixed(2)} KB)` : ''}</span>
                        </div>
                        {attachment.fileUrl && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAttachment(attachment.fileUrl, attachment.fileName)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(attachment.fileUrl, attachment.fileName)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => handleDownloadPDF(viewingInvoice)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditInvoice(viewingInvoice);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TaxInvoice
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingInvoice(null);
        }}
        onSave={(savedInvoice) => {
          if (editingInvoice) {
            // Update existing invoice in list
            setInvoices(invoices.map(inv => 
              inv._id === editingInvoice._id ? savedInvoice : inv
            ));
          } else {
            // Add new invoice to list
            setInvoices([savedInvoice, ...invoices]);
          }
          setIsFormOpen(false);
          setEditingInvoice(null);
        }}
        editingInvoice={editingInvoice}
      />
    </div>
  );
};

export default InvoiceManagement;
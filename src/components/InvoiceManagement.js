import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, Filter, FileText, Bell, CheckCircle, Clock } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { generateTaxInvoicePDF } from '../utils/pdfGenerator';
import TaxInvoice from './TaxInvoice';

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

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, dateFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5001/api/invoices';
      const params = new URLSearchParams();
      
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter.start) params.append('startDate', dateFilter.start);
      if (dateFilter.end) params.append('endDate', dateFilter.end);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setInvoices(data);
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
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/invoices/${invoiceId}`, {
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

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(invoices.map(invoice => 
          invoice._id === invoiceId ? updatedInvoice : invoice
        ));
        alert('Invoice status updated successfully!');
      }
    } catch (error) {
      alert('Error updating invoice status');
    }
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
      'Status': invoice.status,
      'Due Date': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, `invoices_${new Date().toISOString().split('T')[0]}`);
    alert('Invoice data exported successfully!');
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.referenceNumber && invoice.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <FileText className="mr-2" />
            Invoice Management
          </h2>
          <p className="text-gray-600">Manage tax invoices and GST compliance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">FROM:</span>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">TO:</span>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Invoice No.</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Customer</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Reference</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Loading invoices...
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {invoice.referenceNumber || '-'}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    ₹{invoice.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(invoice.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-green-600 hover:text-green-800 p-1" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(invoice)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Invoices</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredInvoices.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-900">
            ₹{filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Pending Amount</h3>
          <p className="text-2xl font-bold text-yellow-900">
            ₹{filteredInvoices
              .filter(inv => ['Sent', 'Overdue'].includes(inv.status))
              .reduce((sum, inv) => sum + inv.grandTotal, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Overdue</h3>
          <p className="text-2xl font-bold text-red-900">
            {filteredInvoices.filter(inv => inv.status === 'Overdue').length}
          </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Invoice Number:</span> {viewingInvoice.invoiceNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(viewingInvoice.invoiceDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Reference:</span> {viewingInvoice.referenceNumber || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(viewingInvoice.status)}`}>
                        {viewingInvoice.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {viewingInvoice.customerName}</p>
                    <p><span className="font-medium">Address:</span> {viewingInvoice.customerAddress}</p>
                    <p><span className="font-medium">GSTIN:</span> {viewingInvoice.customerGSTIN || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Taxable Value</p>
                      <p className="text-lg font-semibold">₹{viewingInvoice.totalTaxableValue?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Tax</p>
                      <p className="text-lg font-semibold">₹{viewingInvoice.totalTax?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="text-lg font-semibold">₹{viewingInvoice.totalDiscount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grand Total</p>
                      <p className="text-xl font-bold text-blue-600">₹{viewingInvoice.grandTotal?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
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
import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, Bell, CheckCircle, RotateCcw } from 'lucide-react';
import CreditNote from './CreditNote';

const CreditNoteManagement = ({ setActivePage }) => {
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState(null);
  const [returnRequests, setReturnRequests] = useState([
    {
      id: 'RET-001',
      customer: 'XYZ Ltd',
      originalInvoice: 'INV-00250',
      amount: '₹ 6,000',
      items: [{ name: 'Product B', qty: 2, rate: 3000 }],
      reason: 'Product Returned',
      date: '2024-01-15'
    },
    {
      id: 'RET-002',
      customer: 'ABC Corp',
      originalInvoice: 'INV-00251',
      amount: '₹ 8,500',
      items: [{ name: 'Product C', qty: 1, rate: 8500 }],
      reason: 'Defective Item',
      date: '2024-01-16'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);

  // Handle auto-fill from return request
  const handleAutoFillFromReturn = (returnReq) => {
    // Create pre-filled credit note data
    setEditingCreditNote({
      customerName: returnReq.customer,
      originalInvoiceNumber: returnReq.originalInvoice,
      reason: returnReq.reason,
      referenceNumber: returnReq.id,
      creditNoteNumber: '',
      creditNoteDate: new Date().toISOString().split('T')[0],
    });
    
    setReturnRequests(prev => prev.filter(r => r.id !== returnReq.id));
    setShowNotification(true);
    setIsFormOpen(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleEditCreditNote = (creditNote) => {
    setEditingCreditNote(creditNote);
    setIsFormOpen(true);
  };

  const handleDeleteCreditNote = (creditNoteId) => {
    if (window.confirm('Are you sure you want to delete this credit note?')) {
      setCreditNotes(creditNotes.filter(cn => cn._id !== creditNoteId));
      alert('Credit Note deleted successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Issued': return 'bg-blue-100 text-blue-800';
      case 'Applied': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <FileText className="mr-2" />
            Credit Note Management
          </h2>
          <p className="text-gray-600">Manage credit notes and returns</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Credit Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search credit notes..."
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
          <option value="Issued">Issued</option>
          <option value="Applied">Applied</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Credit Notes List */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Credit Note No.</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Customer</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Original Invoice</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditNotes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No credit notes found
                </td>
              </tr>
            ) : (
              creditNotes.map((creditNote) => (
                <tr key={creditNote._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    {creditNote.creditNoteNumber}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {new Date(creditNote.creditNoteDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {creditNote.customerName}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {creditNote.originalInvoiceNumber || '-'}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    ₹{creditNote.grandTotal?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(creditNote.status || 'Draft')}`}>
                      {creditNote.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCreditNote(creditNote)}
                        className="text-green-600 hover:text-green-800 p-1" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCreditNote(creditNote._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="mt-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 text-sm">Credit Note form opened with return request details!</span>
        </div>
      )}

      {/* Return Requests Alert */}
      {returnRequests.length > 0 && (
        <div className="mt-6 mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-orange-800">Pending Return Requests ({returnRequests.length})</h3>
          </div>
          <div className="space-y-2">
            {returnRequests.map(returnReq => (
              <div key={returnReq.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-white rounded border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">{returnReq.id}</span>
                    <span className="text-sm text-gray-600">- {returnReq.customer}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{returnReq.originalInvoice} • {returnReq.amount} • {returnReq.reason}</div>
                </div>
                <button 
                  onClick={() => handleAutoFillFromReturn(returnReq)}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Create Credit Note
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreditNote
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCreditNote(null);
        }}
        onSave={(savedCreditNote) => {
          if (editingCreditNote) {
            setCreditNotes(creditNotes.map(cn => 
              cn._id === editingCreditNote._id ? savedCreditNote : cn
            ));
          } else {
            setCreditNotes([savedCreditNote, ...creditNotes]);
          }
          setIsFormOpen(false);
          setEditingCreditNote(null);
        }}
        editingCreditNote={editingCreditNote}
      />
    </div>
  );
};

export default CreditNoteManagement;
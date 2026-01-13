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

  // Filter credit notes based on search and status
  const filteredCreditNotes = creditNotes.filter(creditNote => {
    const matchesSearch = creditNote.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.originalInvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || creditNote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


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
            {filteredCreditNotes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  {creditNotes.length === 0 ? 'No credit notes found' : 'No credit notes match your filters'}
                </td>
              </tr>
            ) : (
              filteredCreditNotes.map((creditNote) => (
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
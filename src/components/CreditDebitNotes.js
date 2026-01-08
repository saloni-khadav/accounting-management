import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, Bell, CheckCircle, RotateCcw } from 'lucide-react';
import CreditDebitNoteForm from './CreditDebitNoteForm';

const CreditDebitNotes = () => {
  const [creditDebitNotes, setCreditDebitNotes] = useState([
    { 
      id: 'CN-0008', 
      date: '2024-04-09', 
      vendor: 'Ace Solutions', 
      type: 'Credit Note', 
      amount: 8400, 
      status: 'Open',
      originalInvoice: 'INV-001',
      reason: 'Product Return'
    },
    { 
      id: 'CN-0007', 
      date: '2024-04-07', 
      vendor: 'Beacon Industries', 
      type: 'Credit Note', 
      amount: 17200, 
      status: 'Closed',
      originalInvoice: 'INV-002',
      reason: 'Billing Error'
    },
    { 
      id: 'DN-0005', 
      date: '2024-04-05', 
      vendor: 'Omni Enterprises', 
      type: 'Debit Note', 
      amount: 12800, 
      status: 'Closed',
      originalInvoice: 'INV-003',
      reason: 'Additional Charges'
    },
    { 
      id: 'CN-0006', 
      date: '2024-04-02', 
      vendor: 'Vision Trade Ltd.', 
      type: 'Credit Note', 
      amount: 4000, 
      status: 'Closed',
      originalInvoice: 'INV-004',
      reason: 'Discount Adjustment'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'REQ-001',
      vendor: 'ABC Suppliers',
      originalInvoice: 'INV-00250',
      amount: '₹ 6,000',
      type: 'Credit Note',
      reason: 'Goods Returned',
      date: '2024-01-15'
    },
    {
      id: 'REQ-002',
      vendor: 'XYZ Corp',
      originalInvoice: 'INV-00251',
      amount: '₹ 8,500',
      type: 'Debit Note',
      reason: 'Additional Service Charges',
      date: '2024-01-16'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);

  const handleAutoFillFromRequest = (request) => {
    setEditingNote({
      vendorName: request.vendor,
      originalInvoiceNumber: request.originalInvoice,
      reason: request.reason,
      referenceNumber: request.id,
      noteNumber: '',
      noteDate: new Date().toISOString().split('T')[0],
      type: request.type
    });
    
    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    setShowNotification(true);
    setIsFormOpen(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setCreditDebitNotes(creditDebitNotes.filter(note => note.id !== noteId));
      alert('Note deleted successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'Credit Note' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const filteredNotes = creditDebitNotes.filter(note => {
    const matchesSearch = note.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || note.status === statusFilter;
    const matchesType = !typeFilter || note.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCredit = creditDebitNotes
    .filter(note => note.type === 'Credit Note')
    .reduce((sum, note) => sum + note.amount, 0);

  const totalDebit = creditDebitNotes
    .filter(note => note.type === 'Debit Note')
    .reduce((sum, note) => sum + note.amount, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <FileText className="mr-2" />
            Credit/Debit Notes Management
          </h2>
          <p className="text-gray-600">Manage vendor credit and debit notes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg text-green-600 mb-2">Credit Amount</h3>
          <p className="text-4xl font-bold text-green-700">₹{totalCredit.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg text-orange-600 mb-2">Debit Amount</h3>
          <p className="text-4xl font-bold text-orange-700">₹{totalDebit.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg text-blue-600 mb-2">Net Amount</h3>
          <p className="text-4xl font-bold text-blue-700">₹{Math.abs(totalCredit - totalDebit).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
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
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Credit Note">Credit Note</option>
          <option value="Debit Note">Debit Note</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Note No.</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Vendor</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Type</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Original Invoice</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No notes found
                </td>
              </tr>
            ) : (
              filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    {note.id}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {new Date(note.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {note.vendor}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                      {note.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {note.originalInvoice || '-'}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    ₹{note.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                      {note.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditNote(note)}
                        className="text-green-600 hover:text-green-800 p-1" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
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
          <span className="text-green-800 text-sm">Note form opened with request details!</span>
        </div>
      )}

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="mt-6 mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-orange-800">Pending Requests ({pendingRequests.length})</h3>
          </div>
          <div className="space-y-2">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-white rounded border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">{request.id}</span>
                    <span className="text-sm text-gray-600">- {request.vendor}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{request.originalInvoice} • {request.amount} • {request.reason}</div>
                </div>
                <button 
                  onClick={() => handleAutoFillFromRequest(request)}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Create {request.type}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <CreditDebitNoteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNote(null);
        }}
        onSave={(savedNote) => {
          if (editingNote) {
            setCreditDebitNotes(creditDebitNotes.map(note => 
              note.id === editingNote.id ? savedNote : note
            ));
          } else {
            setCreditDebitNotes([savedNote, ...creditDebitNotes]);
          }
          setIsFormOpen(false);
          setEditingNote(null);
        }}
        editingNote={editingNote}
      />
    </div>
  );
};

export default CreditDebitNotes;
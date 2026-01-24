import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import CreditDebitNoteForm from './CreditDebitNoteForm';

const CreditDebitNotes = () => {
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchCreditDebitNotes();
  }, []);

  const fetchCreditDebitNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/credit-debit-notes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCreditDebitNotes(data);
      }
    } catch (error) {
      console.error('Error fetching credit/debit notes:', error);
    }
    setLoading(false);
  };


  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/credit-debit-notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          fetchCreditDebitNotes();
          alert('Note deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
      }
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

  const getApprovalStatusColor = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'Credit Note' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const filteredNotes = creditDebitNotes.filter(note => {
    const matchesSearch = (note.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.noteNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || note.status === statusFilter;
    const matchesType = !typeFilter || note.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCredit = creditDebitNotes
    .filter(note => note.type === 'Credit Note')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);

  const totalDebit = creditDebitNotes
    .filter(note => note.type === 'Debit Note')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);

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
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Approval</th>
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
                <tr key={note._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    {note.noteNumber}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {new Date(note.noteDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {note.vendorName}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                      {note.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {note.originalInvoiceNumber || '-'}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium">
                    ₹{(note.grandTotal || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                      {note.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(note.approvalStatus)}`}>
                      {note.approvalStatus === 'approved' ? 'Approved' : 
                       note.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
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
                        onClick={() => handleDeleteNote(note._id)}
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


      {/* Form Modal */}
      <CreditDebitNoteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNote(null);
        }}
        onSave={async (savedNote) => {
          try {
            const method = editingNote ? 'PUT' : 'POST';
            const url = editingNote 
              ? `http://localhost:5001/api/credit-debit-notes/${editingNote._id}`
              : 'http://localhost:5001/api/credit-debit-notes';
            
            // Format the data properly
            const formattedNote = {
              ...savedNote,
              noteDate: new Date(savedNote.noteDate).toISOString(),
              invoiceDate: savedNote.invoiceDate ? new Date(savedNote.invoiceDate).toISOString() : null
            };
            
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(formattedNote)
            });
            
            if (response.ok) {
              fetchCreditDebitNotes();
              setIsFormOpen(false);
              setEditingNote(null);
              alert(`${savedNote.type} ${editingNote ? 'updated' : 'created'} successfully!`);
            } else {
              const errorData = await response.json();
              console.error('Server error:', errorData);
              alert(`Error: ${errorData.message || 'Failed to save note'}`);
            }
          } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note');
          }
        }}
        editingNote={editingNote}
      />
    </div>
  );
};

export default CreditDebitNotes;
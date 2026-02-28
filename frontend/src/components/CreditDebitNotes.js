import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, CreditCard, TrendingUp, Calculator } from 'lucide-react';
import CreditDebitNoteForm from './CreditDebitNoteForm';
import { generateCreditDebitNotePDF } from '../utils/pdfGenerator';
import MetricsCard from './ui/MetricsCard';

const CreditDebitNotes = () => {
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchCreditDebitNotes();
  }, []);

  const fetchCreditDebitNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes', {
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


  const handleViewNote = (note) => {
    setViewingNote(note);
    setIsViewModalOpen(true);
  };

  const handleDownloadPDF = () => {
    if (viewingNote) {
      generateCreditDebitNotePDF(viewingNote);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes/${noteId}`, {
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
    const matchesType = !typeFilter || note.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCredit = creditDebitNotes
    .filter(note => note.type === 'Credit Note')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);

  const totalDebit = creditDebitNotes
    .filter(note => note.type === 'Debit Note')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <FileText className="mr-3" size={28} />
                Credit/Debit Notes Management
              </h1>
              <p className="text-blue-100 mt-1">Manage vendor credit and debit notes</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Create Note
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Credit Amount"
            value={`₹${totalCredit.toLocaleString()}`}
            icon={TrendingUp}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Debit Amount"
            value={`₹${totalDebit.toLocaleString()}`}
            icon={CreditCard}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Net Amount"
            value={`₹${Math.abs(totalCredit - totalDebit).toLocaleString()}`}
            icon={Calculator}
            color="primary"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Note Number or Vendor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
            >
              <option value="">All Types</option>
              <option value="Credit Note">Credit Note</option>
              <option value="Debit Note">Debit Note</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <h2 className="text-lg font-semibold">Notes List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Note No. ↓</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Original Invoice</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Approval</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No notes found</p>
                    <p className="text-sm">Create your first credit/debit note to get started</p>
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note, index) => (
                  <tr key={note._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-blue-600 font-medium">{note.noteNumber}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {new Date(note.noteDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                      {note.invoiceDate ? new Date(note.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-900 whitespace-nowrap">{note.vendorName}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getTypeColor(note.type)}`}>
                        {note.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{note.originalInvoiceNumber || '-'}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900 whitespace-nowrap">
                      ₹{((note.grandTotal || 0) - (note.tdsAmount || 0)).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(note.approvalStatus)}`}>
                        {note.approvalStatus === 'approved' ? 'Approved' : 
                         note.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewNote(note)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => note.approvalStatus === 'pending' ? handleEditNote(note) : null}
                          disabled={note.approvalStatus !== 'pending'}
                          className={`p-2 rounded-lg transition-colors ${
                            note.approvalStatus === 'pending'
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={note.approvalStatus === 'pending' ? 'Edit' : 'Cannot edit after manager response'}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => note.approvalStatus === 'pending' ? handleDeleteNote(note._id) : null}
                          disabled={note.approvalStatus !== 'pending'}
                          className={`p-2 rounded-lg transition-colors ${
                            note.approvalStatus === 'pending'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={note.approvalStatus === 'pending' ? 'Delete' : 'Cannot delete after manager response'}
                        >
                          <Trash2 size={18} />
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


      {/* View Modal */}
      {isViewModalOpen && viewingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{viewingNote.type} Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Note Number:</strong> {viewingNote.noteNumber}</div>
                <div><strong>Date:</strong> {new Date(viewingNote.noteDate).toLocaleDateString()}</div>
                <div><strong>Type:</strong> <span className={`px-2 py-1 rounded text-xs ${getTypeColor(viewingNote.type)}`}>{viewingNote.type}</span></div>
              </div>
              
              {/* Vendor Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Vendor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {viewingNote.vendorName}</div>
                  <div><strong>GSTIN:</strong> {viewingNote.vendorGSTIN || 'N/A'}</div>
                  <div className="col-span-2"><strong>Address:</strong> {viewingNote.vendorAddress || 'N/A'}</div>
                </div>
              </div>
              
              {/* Items */}
              {viewingNote.items && viewingNote.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left border-b">Product</th>
                          <th className="px-3 py-2 text-left border-b">Description</th>
                          <th className="px-3 py-2 text-left border-b">HSN</th>
                          <th className="px-3 py-2 text-left border-b">Qty</th>
                          <th className="px-3 py-2 text-left border-b">Rate</th>
                          <th className="px-3 py-2 text-left border-b">Discount</th>
                          <th className="px-3 py-2 text-left border-b">CGST</th>
                          <th className="px-3 py-2 text-left border-b">SGST</th>
                          <th className="px-3 py-2 text-left border-b">IGST</th>
                          <th className="px-3 py-2 text-right border-b">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingNote.items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-3 py-2">{item.product || '-'}</td>
                            <td className="px-3 py-2">{item.description || '-'}</td>
                            <td className="px-3 py-2">{item.hsnCode || '-'}</td>
                            <td className="px-3 py-2">{item.quantity || 0}</td>
                            <td className="px-3 py-2">₹{(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2">{item.discount || 0}%</td>
                            <td className="px-3 py-2">{item.cgstRate || 0}%</td>
                            <td className="px-3 py-2">{item.sgstRate || 0}%</td>
                            <td className="px-3 py-2">{item.igstRate || 0}%</td>
                            <td className="px-3 py-2 text-right">₹{(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₹{(viewingNote.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>Total Discount:</span><span>₹{(viewingNote.totalDiscount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>Taxable Value:</span><span>₹{(viewingNote.totalTaxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>CGST:</span><span>₹{(viewingNote.totalCGST || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>SGST:</span><span>₹{(viewingNote.totalSGST || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  {(viewingNote.totalIGST || 0) > 0 && (
                    <div className="flex justify-between"><span>IGST:</span><span>₹{(viewingNote.totalIGST || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  )}
                  {(viewingNote.totalCESS || 0) > 0 && (
                    <div className="flex justify-between"><span>CESS:</span><span>₹{(viewingNote.totalCESS || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  )}
                  {viewingNote.tdsAmount > 0 && (
                    <div className="flex justify-between text-red-600"><span>TDS ({viewingNote.tdsPercentage}%):</span><span>-₹{(viewingNote.tdsAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Grand Total:</span><span>₹{(viewingNote.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  {viewingNote.tdsAmount > 0 && (
                    <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2"><span>Net Amount:</span><span>₹{((viewingNote.grandTotal || 0) - (viewingNote.tdsAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  )}
                </div>
              </div>
              
              {viewingNote.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="bg-gray-50 p-3 rounded">{viewingNote.notes}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
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
        onSave={async (savedNote) => {
          try {
            const method = editingNote ? 'PUT' : 'POST';
            const url = editingNote 
              ? `https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes/${editingNote._id}`
              : 'https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes';
            
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
              if (errorData.isPastDateError) {
                alert('Past date entry not allowed. Contact manager for permission.');
              } else {
                console.error('Server error:', errorData);
                alert(`Error: ${errorData.message || 'Failed to save note'}`);
              }
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


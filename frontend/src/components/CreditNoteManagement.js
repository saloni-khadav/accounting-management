import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, Bell, CheckCircle, RotateCcw, X } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { generateCreditNotePDF } from '../utils/pdfGenerator';
import CreditNote from './CreditNote';

const CreditNoteManagement = ({ setActivePage }) => {
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchCreditNotes();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.user.role || '');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchCreditNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCreditNotes(data);
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error);
    }
    setLoading(false);
  };

  // Filter credit notes based on search
  const filteredCreditNotes = creditNotes.filter(creditNote => {
    const matchesSearch = creditNote.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.originalInvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });


  const handleDownloadPDF = (creditNote) => {
    generateCreditNotePDF(creditNote);
  };

  const handleExportToExcel = () => {
    if (filteredCreditNotes.length === 0) {
      alert('No credit note data to export');
      return;
    }
    
    const exportData = filteredCreditNotes.map(creditNote => ({
      'Credit Note Number': creditNote.creditNoteNumber,
      'Date': new Date(creditNote.creditNoteDate).toLocaleDateString(),
      'Customer': creditNote.customerName,
      'Original Invoice': creditNote.originalInvoiceNumber || '',
      'Original Invoice Date': creditNote.originalInvoiceDate ? new Date(creditNote.originalInvoiceDate).toLocaleDateString() : '',
      'Reason': creditNote.reason || '',
      'Taxable Value': creditNote.totalTaxableValue || 0,
      'Total Tax': creditNote.totalTax || 0,
      'Grand Total': creditNote.grandTotal || 0,
      'Status': creditNote.status || 'Draft',
      'Approval': creditNote.approvalStatus || 'Pending'
    }));
    
    exportToExcel(exportData, `credit_notes_${new Date().toISOString().split('T')[0]}`);
    alert('Credit Note data exported successfully!');
  };

  const handleEditCreditNote = (creditNote) => {
    setEditingCreditNote(creditNote);
    setIsFormOpen(true);
  };

  const handleDeleteCreditNote = async (creditNoteId) => {
    if (window.confirm('Are you sure you want to delete this credit note?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/credit-notes/${creditNoteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setCreditNotes(creditNotes.filter(cn => cn._id !== creditNoteId));
          window.dispatchEvent(new Event('invoicesUpdated'));
          alert('Credit Note deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting credit note:', error);
        alert('Error deleting credit note');
      }
    }
  };

  const handleApprovalChange = async (creditNoteId, approvalStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/credit-notes/${creditNoteId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approvalStatus })
      });
      if (response.ok) {
        const updatedCreditNote = await response.json();
        setCreditNotes(creditNotes.map(cn => 
          cn._id === creditNoteId ? updatedCreditNote : cn
        ));
        console.log('Triggering invoicesUpdated event from credit note approval');
        window.dispatchEvent(new Event('invoicesUpdated'));
        alert(`Credit Note ${approvalStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Error updating approval status');
    }
  };

  const getApprovalColor = (approval) => {
    switch (approval) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
            Create Credit Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search credit notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Approval</th>
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
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(creditNote.approvalStatus || 'Pending')}`}>
                        {creditNote.approvalStatus || 'Pending'}
                      </span>
                      {userRole === 'manager' && creditNote.approvalStatus === 'Pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprovalChange(creditNote._id, 'Approved')}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleApprovalChange(creditNote._id, 'Rejected')}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownloadPDF(creditNote)}
                        className="text-blue-600 hover:text-blue-800 p-1" 
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
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
        onSave={async (savedCreditNote) => {
          try {
            const token = localStorage.getItem('token');
            if (editingCreditNote) {
              const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/credit-notes/${editingCreditNote._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(savedCreditNote)
              });
              if (response.ok) {
                const updatedCreditNote = await response.json();
                setCreditNotes(creditNotes.map(cn => 
                  cn._id === editingCreditNote._id ? updatedCreditNote : cn
                ));
              }
            } else {
              const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(savedCreditNote)
              });
              if (response.ok) {
                const newCreditNote = await response.json();
                setCreditNotes([newCreditNote, ...creditNotes]);
              }
            }
            setIsFormOpen(false);
            setEditingCreditNote(null);
            console.log('Triggering invoicesUpdated event from credit note save');
            window.dispatchEvent(new Event('invoicesUpdated'));
            alert('Credit Note saved successfully!');
            fetchCreditNotes();
          } catch (error) {
            console.error('Error saving credit note:', error);
            alert('Error saving credit note');
          }
        }}
        editingCreditNote={editingCreditNote}
      />
    </div>
  );
};

export default CreditNoteManagement;
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Bell, Search, Eye, Download } from 'lucide-react';

const Approvals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDetailsItem, setViewDetailsItem] = useState(null);

  const handleDownloadAttachment = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPendingApprovals();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching payments directly from payments API');
      
      // Try direct payments API with proper authentication
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Direct payments API response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Payments data from direct API:', data);
          
          const pendingPaymentApprovals = data
            .filter(payment => {
              const approvalStatus = payment.approvalStatus;
              console.log(`Payment ${payment._id}: approvalStatus = ${approvalStatus}`);
              // Show payments with pending approval status OR latest payment if no approvalStatus
              if (approvalStatus === 'pending') return true;
              // Show latest payment as pending if it has no approvalStatus (new payment)
              if (!approvalStatus) {
                const paymentDate = new Date(payment.createdAt || payment.paymentDate);
                const now = new Date();
                const timeDiff = now - paymentDate;
                // Show if created within last 5 minutes
                if (timeDiff < 5 * 60 * 1000) {
                  console.log('Showing recent payment as pending:', payment._id);
                  return true;
                }
              }
              return false;
            })
            .map(payment => ({
              id: payment._id,
              type: 'Payment',
              amount: `₹${payment.netAmount?.toLocaleString('en-IN') || '0'}`,
              description: `Payment to ${payment.vendor} - ${payment.referenceNumber || 'No Reference'}`,
              requestedBy: payment.createdBy || 'User',
              requestDate: new Date(payment.createdAt || payment.paymentDate).toLocaleDateString(),
              status: 'pending',
              reminderSent: false
            }));
          
          console.log('Filtered pending payments:', pendingPaymentApprovals);
          setPendingPayments(pendingPaymentApprovals);
        } else {
          console.error('Response is not JSON:', await response.text());
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch payments:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching approvals with token:', token);
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Approvals response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approvals data received:', data);
        
        // Separate bills, payments, purchase orders, and proforma invoices from the response
        const allApprovals = data.approvals || [];
        const bills = allApprovals.filter(item => item.type !== 'Payment' && item.type !== 'Purchase Order' && item.type !== 'Proforma Invoice' && item.type !== 'Tax Invoice');
        const payments = allApprovals.filter(item => item.type === 'Payment');
        const purchaseOrders = allApprovals.filter(item => item.type === 'Purchase Order');
        const proformaInvoices = allApprovals.filter(item => item.type === 'Proforma Invoice');
        const taxInvoices = allApprovals.filter(item => item.type === 'Tax Invoice');
        
        // Combine all approvals for display
        setPendingApprovals([...bills, ...purchaseOrders, ...proformaInvoices, ...taxInvoices]);
        setPendingPayments(payments);
      } else {
        const errorData = await response.json();
        console.error('Approvals fetch error:', errorData);
        setError('Failed to fetch approvals');
      }
    } catch (error) {
      console.error('Network error fetching approvals:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      
      if (type === 'Payment') {
        // Use same manager action endpoint as bills
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId: id, action: 'approve', type: 'Payment' })
        });
        
        if (response.ok) {
          alert('Payment approved successfully!');
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error approving payment: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (type === 'Proforma Invoice') {
        // Handle Proforma Invoice approval
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId: id, action: 'approve', type: 'Proforma Invoice' })
        });
        
        if (response.ok) {
          alert('Proforma Invoice approved successfully!');
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error approving Proforma Invoice: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (type === 'Tax Invoice') {
        // Handle Tax Invoice approval
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId: id, action: 'approve', type: 'Tax Invoice' })
        });
        
        if (response.ok) {
          alert('Tax Invoice approved successfully!');
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error approving Tax Invoice: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (type === 'Purchase Order') {
        // Handle Purchase Order approval
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId: id, action: 'approve', type: 'Purchase Order' })
        });
        
        if (response.ok) {
          alert('Purchase Order approved successfully!');
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error approving Purchase Order: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      // Handle other approvals (bills, etc.)
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: id, action: 'approve', type })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`${type} approved successfully!`);
        fetchPendingApprovals();
      } else {
        alert(data.message || 'Failed to approve item');
      }
    } catch (error) {
      alert('Error approving item');
    }
  };

  const handleReject = async (id, type) => {
    setRejectItem({ id, type });
    setShowRejectModal(true);
  };

  const handleViewDetails = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (type === 'Bill') endpoint = `https://nextbook-backend.nextsphere.co.in/api/bills/${id}`;
      else if (type === 'Payment') endpoint = `https://nextbook-backend.nextsphere.co.in/api/payments/${id}`;
      else if (type === 'Purchase Order') endpoint = `https://nextbook-backend.nextsphere.co.in/api/purchase-orders/${id}`;
      else if (type === 'Proforma Invoice') endpoint = `https://nextbook-backend.nextsphere.co.in/api/proforma-invoices/${id}`;
      else if (type === 'Tax Invoice') endpoint = `https://nextbook-backend.nextsphere.co.in/api/invoices/${id}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setViewDetailsItem({ ...data, type });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (rejectItem.type === 'Payment') {
        // Use same manager action endpoint as bills
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            itemId: rejectItem.id, 
            action: 'reject', 
            type: 'Payment',
            rejectionReason: rejectionReason.trim()
          })
        });
        
        if (response.ok) {
          alert('Payment rejected successfully!');
          setShowRejectModal(false);
          setRejectionReason('');
          setRejectItem(null);
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error rejecting payment: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (rejectItem.type === 'Proforma Invoice') {
        // Handle Proforma Invoice rejection
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            itemId: rejectItem.id, 
            action: 'reject', 
            type: 'Proforma Invoice',
            rejectionReason: rejectionReason.trim()
          })
        });
        
        if (response.ok) {
          alert('Proforma Invoice rejected successfully!');
          setShowRejectModal(false);
          setRejectionReason('');
          setRejectItem(null);
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error rejecting Proforma Invoice: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (rejectItem.type === 'Tax Invoice') {
        // Handle Tax Invoice rejection
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            itemId: rejectItem.id, 
            action: 'reject', 
            type: 'Tax Invoice',
            rejectionReason: rejectionReason.trim()
          })
        });
        
        if (response.ok) {
          alert('Tax Invoice rejected successfully!');
          setShowRejectModal(false);
          setRejectionReason('');
          setRejectItem(null);
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error rejecting Tax Invoice: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      if (rejectItem.type === 'Purchase Order') {
        // Handle Purchase Order rejection
        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            itemId: rejectItem.id, 
            action: 'reject', 
            type: 'Purchase Order',
            rejectionReason: rejectionReason.trim()
          })
        });
        
        if (response.ok) {
          alert('Purchase Order rejected successfully!');
          setShowRejectModal(false);
          setRejectionReason('');
          setRejectItem(null);
          fetchPendingApprovals();
          return;
        } else {
          const errorData = await response.json();
          alert('Error rejecting Purchase Order: ' + (errorData.message || 'Unknown error'));
          return;
        }
      }
      
      // Handle other rejections
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/manager/action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          itemId: rejectItem.id, 
          action: 'reject', 
          type: rejectItem.type,
          rejectionReason: rejectionReason.trim()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`${rejectItem.type} rejected successfully!`);
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectItem(null);
        fetchPendingApprovals();
      } else {
        alert(data.message || 'Failed to reject item');
      }
    } catch (error) {
      alert('Error rejecting item');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          <span className="ml-2 text-gray-600">Loading approvals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchPendingApprovals}
            className="mt-2 text-red-800 hover:text-red-600 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Manager Approvals</h1>
            <p className="text-gray-600">Review and approve pending requests</p>
          </div>
          <button
            onClick={() => {
              fetchPendingApprovals();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-600 mt-1">
            {[...pendingApprovals, ...pendingPayments].filter(item => item.status === 'pending').length} items awaiting your approval
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {[...pendingApprovals, ...pendingPayments]
            .filter(item => {
              if (!searchTerm) return true;
              const search = searchTerm.toLowerCase();
              return item.description?.toLowerCase().includes(search) ||
                     item.requestedBy?.toLowerCase().includes(search);
            })
            .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
            .map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock size={12} className="mr-1" />
                      {item.type}
                    </span>
                    <span className="ml-3 text-lg font-medium text-gray-900">{item.amount}</span>
                  </div>
                  
                  <h3 className="text-base font-medium text-gray-900 mb-2">{item.description}</h3>
                  
                  {item.reminderSent && item.status === 'pending' && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        <Bell size={12} className="mr-1" />
                        Reminder Received
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      {item.requestedBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {item.requestDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleViewDetails(item.id, item.type)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleReject(item.id, item.type)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={16} className="mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, item.type)}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Approve
                      </button>
                    </>
                  )}
                  {item.status === 'approved' && (
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                      <CheckCircle size={16} className="mr-1" />
                      Approved
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md">
                      <XCircle size={16} className="mr-1" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {[...pendingApprovals, ...pendingPayments].length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-600">All requests have been processed.</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this request:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRejectItem(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{viewDetailsItem.type} Details</h2>
              <button
                onClick={() => setViewDetailsItem(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Tax Invoice View */}
              {viewDetailsItem.type === 'Tax Invoice' && (
                <>
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Supplier Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Name:</span> {viewDetailsItem.supplierName || 'N/A'}</div>
                      <div><span className="font-medium">GSTIN:</span> {viewDetailsItem.supplierGSTIN || 'N/A'}</div>
                      <div><span className="font-medium">PAN:</span> {viewDetailsItem.supplierPAN || 'N/A'}</div>
                      <div><span className="font-medium">Place of Supply:</span> {viewDetailsItem.placeOfSupply || 'N/A'}</div>
                      <div className="md:col-span-2"><span className="font-medium">Address:</span> {viewDetailsItem.supplierAddress || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-medium">Invoice Number:</span> {viewDetailsItem.invoiceNumber}</div>
                      <div><span className="font-medium">Invoice Date:</span> {new Date(viewDetailsItem.invoiceDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">Reference/PI Number:</span> {viewDetailsItem.referenceNumber || 'N/A'}</div>
                      <div><span className="font-medium">PI Date:</span> {viewDetailsItem.poDate ? new Date(viewDetailsItem.poDate).toLocaleDateString() : 'N/A'}</div>
                      <div><span className="font-medium">Due Date:</span> {viewDetailsItem.dueDate ? new Date(viewDetailsItem.dueDate).toLocaleDateString() : 'N/A'}</div>
                      <div><span className="font-medium">Payment Terms:</span> {viewDetailsItem.paymentTerms || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Name:</span> {viewDetailsItem.customerName}</div>
                      <div><span className="font-medium">GSTIN:</span> {viewDetailsItem.customerGSTIN || 'N/A'}</div>
                      <div><span className="font-medium">Customer Place:</span> {viewDetailsItem.customerPlace || 'N/A'}</div>
                      <div><span className="font-medium">Contact Person:</span> {viewDetailsItem.contactPerson || 'N/A'}</div>
                      <div><span className="font-medium">Contact Details:</span> {viewDetailsItem.contactDetails || 'N/A'}</div>
                      <div className="md:col-span-2"><span className="font-medium">Billing Address:</span> {viewDetailsItem.customerAddress}</div>
                    </div>
                  </div>

                  {viewDetailsItem.items && viewDetailsItem.items.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Product/Service Details</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 border text-left">Product</th>
                              <th className="px-3 py-2 border text-left">Description</th>
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
                            {viewDetailsItem.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 border">{item.product || '-'}</td>
                                <td className="px-3 py-2 border">{item.description || '-'}</td>
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

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Tax Computation</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.subtotal || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Discount</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalDiscount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Taxable Value</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalTaxableValue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CGST</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalCGST || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">SGST</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalSGST || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">IGST</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalIGST || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Tax</p>
                          <p className="text-lg font-semibold">₹{(viewDetailsItem.totalTax || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grand Total</p>
                          <p className="text-xl font-bold text-blue-600">₹{(viewDetailsItem.grandTotal || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(viewDetailsItem.notes || viewDetailsItem.termsConditions) && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewDetailsItem.notes && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Notes</h3>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{viewDetailsItem.notes}</p>
                        </div>
                      )}
                      {viewDetailsItem.termsConditions && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{viewDetailsItem.termsConditions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {viewDetailsItem.attachments && viewDetailsItem.attachments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                      <div className="space-y-2">
                        {viewDetailsItem.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div>
                              <span className="text-sm font-medium">{attachment.fileName || `Attachment ${index + 1}`}</span>
                              <span className="text-xs text-gray-500 ml-2">{attachment.fileSize ? `(${(attachment.fileSize / 1024).toFixed(2)} KB)` : ''}</span>
                            </div>
                            {attachment.fileUrl && (
                              <button
                                onClick={() => handleDownloadAttachment(attachment.fileUrl, attachment.fileName)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Proforma Invoice View */}
              {viewDetailsItem.type === 'Proforma Invoice' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">PI Number:</span> {viewDetailsItem.poNumber}</p>
                        <p><span className="font-medium">Date:</span> {new Date(viewDetailsItem.poDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Delivery Date:</span> {viewDetailsItem.deliveryDate ? new Date(viewDetailsItem.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                        <p><span className="font-medium">GST Number:</span> {viewDetailsItem.gstNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Client Details</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {viewDetailsItem.supplierName}</p>
                        {viewDetailsItem.deliveryAddress && (
                          <div>
                            <span className="font-medium">Delivery Address:</span>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{viewDetailsItem.deliveryAddress}</p>
                          </div>
                        )}
                        {viewDetailsItem.createdBy && (
                          <p><span className="font-medium">Created By:</span> {viewDetailsItem.createdBy}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {viewDetailsItem.items && viewDetailsItem.items.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Items</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Item Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Qty</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Rate</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Discount%</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">CGST%</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">SGST%</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">IGST%</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewDetailsItem.items.map((item, idx) => {
                              const itemTotal = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                                               (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * ((item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0)) / 100);
                              return (
                                <tr key={idx} className="border-b">
                                  <td className="px-4 py-3">{item.name}</td>
                                  <td className="px-4 py-3">{item.hsn}</td>
                                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right">₹{item.rate?.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right">{item.discount}%</td>
                                  <td className="px-4 py-3 text-right">{item.cgstRate || 0}%</td>
                                  <td className="px-4 py-3 text-right">{item.sgstRate || 0}%</td>
                                  <td className="px-4 py-3 text-right">{item.igstRate || 0}%</td>
                                  <td className="px-4 py-3 text-right font-semibold">₹{itemTotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Sub Total</p>
                        <p className="text-lg font-semibold">₹{viewDetailsItem.subTotal?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Discount</p>
                        <p className="text-lg font-semibold">₹{viewDetailsItem.totalDiscount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tax</p>
                        <p className="text-lg font-semibold">₹{viewDetailsItem.totalTax?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{viewDetailsItem.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Purchase Order View */}
              {viewDetailsItem.type === 'Purchase Order' && (
                <>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Purchase Order Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-medium">PO Number:</span> {viewDetailsItem.poNumber}</div>
                      <div><span className="font-medium">PO Date:</span> {new Date(viewDetailsItem.poDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">Vendor:</span> {viewDetailsItem.vendor}</div>
                      <div><span className="font-medium">Delivery Date:</span> {viewDetailsItem.deliveryDate ? new Date(viewDetailsItem.deliveryDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  {viewDetailsItem.items && viewDetailsItem.items.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Items</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 border text-left">Product</th>
                              <th className="px-3 py-2 border text-right">Qty</th>
                              <th className="px-3 py-2 border text-right">Rate</th>
                              <th className="px-3 py-2 border text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewDetailsItem.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 border">{item.product || '-'}</td>
                                <td className="px-3 py-2 border text-right">{item.quantity || 0}</td>
                                <td className="px-3 py-2 border text-right">₹{(item.unitPrice || 0).toFixed(2)}</td>
                                <td className="px-3 py-2 border text-right font-medium">₹{(item.totalAmount || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{(viewDetailsItem.totalAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Payment View */}
              {viewDetailsItem.type === 'Payment' && (
                <>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-medium">Reference Number:</span> {viewDetailsItem.referenceNumber || 'N/A'}</div>
                      <div><span className="font-medium">Payment Date:</span> {new Date(viewDetailsItem.paymentDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">Vendor:</span> {viewDetailsItem.vendor}</div>
                      <div><span className="font-medium">Payment Mode:</span> {viewDetailsItem.paymentMode || 'N/A'}</div>
                      <div><span className="font-medium">Bank:</span> {viewDetailsItem.bank || 'N/A'}</div>
                      <div><span className="font-medium">Transaction ID:</span> {viewDetailsItem.transactionId || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Amount Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-medium">Gross Amount:</span> ₹{(viewDetailsItem.grossAmount || 0).toLocaleString()}</div>
                      <div><span className="font-medium">TDS:</span> ₹{(viewDetailsItem.tdsAmount || 0).toLocaleString()}</div>
                      <div><span className="font-medium">Net Amount:</span> ₹{(viewDetailsItem.netAmount || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {viewDetailsItem.remarks && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Remarks</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{viewDetailsItem.remarks}</p>
                    </div>
                  )}
                </>
              )}

              {/* Bill View */}
              {viewDetailsItem.type === 'Bill' && (
                <>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Bill Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-medium">Bill Number:</span> {viewDetailsItem.billNumber}</div>
                      <div><span className="font-medium">Bill Date:</span> {new Date(viewDetailsItem.billDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">Vendor:</span> {viewDetailsItem.vendor}</div>
                      <div><span className="font-medium">Due Date:</span> {viewDetailsItem.dueDate ? new Date(viewDetailsItem.dueDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{(viewDetailsItem.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
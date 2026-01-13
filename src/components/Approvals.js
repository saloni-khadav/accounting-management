import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Bell } from 'lucide-react';

const Approvals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.approvals);
      } else {
        setError('Failed to fetch approvals');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/action', {
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
        fetchPendingApprovals(); // Refresh data
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

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/action', {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manager Approvals</h1>
        <p className="text-gray-600">Review and approve pending requests</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingApprovals.filter(item => item.status === 'pending').length} items awaiting your approval
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingApprovals.map((item) => (
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

        {pendingApprovals.length === 0 && (
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
    </div>
  );
};

export default Approvals;
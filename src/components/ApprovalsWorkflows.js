import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

const ApprovalsWorkflows = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userRole, setUserRole] = useState('user');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  const showRejectionReason = async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/manager/rejection-reason/${itemId}/${itemType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedReason(data.rejectionReason);
        setShowReasonModal(true);
      } else {
        setSelectedReason('Failed to fetch rejection reason');
        setShowReasonModal(true);
      }
    } catch (error) {
      setSelectedReason('Error fetching rejection reason');
      setShowReasonModal(true);
    }
  };

  const sendReminder = async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/send-reminder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, type: itemType })
      });
      
      if (response.ok) {
        alert('Reminder sent to manager successfully!');
        // Refresh data
        if (userRole === 'manager') {
          fetchPendingApprovals();
        } else {
          fetchMyRequests();
        }
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      alert('Error sending reminder');
    }
  };

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'user');
    
    if (user.role === 'manager') {
      fetchPendingApprovals();
    } else {
      fetchMyRequests();
    }

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (user.role === 'manager') {
        fetchPendingApprovals();
      } else {
        fetchMyRequests();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.requests);
      } else {
        setError('Failed to fetch your requests');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };
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
      
      if (response.ok) {
        // Refresh data based on user role
        if (userRole === 'manager') {
          fetchPendingApprovals();
        } else {
          fetchMyRequests();
        }
      } else {
        alert('Failed to approve item');
      }
    } catch (error) {
      alert('Error approving item');
    }
  };

  const handleReject = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/manager/action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: id, action: 'reject', type })
      });
      
      if (response.ok) {
        // Refresh data based on user role
        if (userRole === 'manager') {
          fetchPendingApprovals();
        } else {
          fetchMyRequests();
        }
      } else {
        alert('Failed to reject item');
      }
    } catch (error) {
      alert('Error rejecting item');
    }
  };

  // Calculate stats from real data based on user role
  const dataToUse = userRole === 'manager' ? pendingApprovals : myRequests;
  const pendingCount = dataToUse.filter(item => 
    item.status === 'pending' || item.status === 'Draft' || item.status === 'Pending'
  ).length;
  const approvedCount = dataToUse.filter(item => 
    item.status === 'approved' || item.status === 'Approved'
  ).length;
  const rejectedCount = dataToUse.filter(item => 
    item.status === 'rejected' || item.status === 'Rejected'
  ).length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Approvals & Workflows</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 font-medium ${activeTab === 'approvals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Approvals
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 font-medium ${activeTab === 'workflows' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Workflows
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6">
        {userRole === 'manager' ? 'Pending Approvals' : 'My Requests'}
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Pending Requests</p>
          <p className="text-4xl font-bold">{loading ? '-' : pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-4xl font-bold">{loading ? '-' : approvedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Rejected</p>
          <p className="text-4xl font-bold">{loading ? '-' : rejectedCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading approvals...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg border p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => userRole === 'manager' ? fetchPendingApprovals() : fetchMyRequests()}
              className="mt-2 text-red-800 hover:text-red-600 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Type</th>
                <th className="text-left p-4 font-semibold">Description</th>
                <th className="text-left p-4 font-semibold">Amount</th>
                <th className="text-left p-4 font-semibold">Requested By</th>
                <th className="text-left p-4 font-semibold">Request Date</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Action Date</th>
                <th className="text-left p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {dataToUse.map((item, index) => (
                <tr key={item.id || index} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{item.description}</td>
                  <td className="p-4 font-semibold text-green-600">{item.amount}</td>
                  <td className="p-4">{item.requestedBy || 'You'}</td>
                  <td className="p-4">{item.requestDate}</td>
                  <td className="p-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (item.status === 'pending' || item.status === 'Draft' || item.status === 'Pending') ? 'bg-yellow-100 text-yellow-800' :
                        (item.status === 'approved' || item.status === 'Approved') ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <Clock size={12} className="inline mr-1" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {(item.status === 'Approved' || item.status === 'approved') && item.approvedAt ? (
                      <span className="text-green-600 font-medium">{item.approvedAt}</span>
                    ) : (item.status === 'Rejected' || item.status === 'rejected') && item.rejectedAt ? (
                      <span className="text-red-600 font-medium">{item.rejectedAt}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {(item.status === 'Rejected' || item.status === 'rejected') ? (
                      <button
                        onClick={() => showRejectionReason(item.id, item.type)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        View Reason
                      </button>
                    ) : (item.status === 'Pending' || item.status === 'pending') && userRole === 'user' ? (
                      <button
                        onClick={() => sendReminder(item.id, item.type)}
                        disabled={item.reminderSent}
                        className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                          item.reminderSent 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <Bell size={12} />
                        {item.reminderSent ? 'Reminded' : 'Remind'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {dataToUse.length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === 'manager' ? 'No pending approvals' : 'No requests found'}
              </h3>
              <p className="text-gray-600">
                {userRole === 'manager' ? 'All requests have been processed.' : 'You haven\'t made any requests yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{selectedReason}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsWorkflows;

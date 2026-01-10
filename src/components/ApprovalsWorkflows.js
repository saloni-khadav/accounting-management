import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

const ApprovalsWorkflows = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      
      if (response.ok) {
        fetchPendingApprovals(); // Refresh data
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
        fetchPendingApprovals(); // Refresh data
      } else {
        alert('Failed to reject item');
      }
    } catch (error) {
      alert('Error rejecting item');
    }
  };

  // Calculate stats from real data
  const pendingCount = pendingApprovals.filter(item => item.status === 'pending').length;
  const approvedCount = pendingApprovals.filter(item => item.status === 'approved').length;
  const rejectedCount = pendingApprovals.filter(item => item.status === 'rejected').length;

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

      <h2 className="text-2xl font-semibold mb-6">My Approvals</h2>

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
              onClick={fetchPendingApprovals}
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
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item, index) => (
                <tr key={item.id || index} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{item.description}</td>
                  <td className="p-4 font-semibold text-green-600">{item.amount}</td>
                  <td className="p-4">{item.requestedBy}</td>
                  <td className="p-4">{item.requestDate}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <Clock size={12} className="inline mr-1" />
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReject(item.id, item.type)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <XCircle size={12} className="mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(item.id, item.type)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle size={12} className="mr-1" />
                          Approve
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pendingApprovals.length === 0 && (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
              <p className="text-gray-600">All requests have been processed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalsWorkflows;

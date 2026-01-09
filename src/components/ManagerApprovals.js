import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ManagerApprovals = () => {
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/purchase-orders');
        const data = await response.json();
        setPendingRequests(data);
      } catch (error) {
        console.error('Error loading POs:', error);
      }
    };
    
    loadPendingRequests();
    const interval = setInterval(loadPendingRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved', approvedBy: 'Manager' })
      });
      
      if (response.ok) {
        setPendingRequests(prev => 
          prev.map(req => 
            req._id === id ? { ...req, status: 'approved' } : req
          )
        );
        alert('Request approved successfully!');
      }
    } catch (error) {
      alert('Error approving request');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected', rejectedBy: 'Manager' })
      });
      
      if (response.ok) {
        setPendingRequests(prev => 
          prev.map(req => 
            req._id === id ? { ...req, status: 'rejected' } : req
          )
        );
        alert('Request rejected!');
      }
    } catch (error) {
      alert('Error rejecting request');
    }
  };

  const pendingCount = pendingRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manager Approvals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Clock className="text-yellow-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Approval Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Requested By</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{request.supplier ? 'Purchase Order' : request.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">₹{request.amount?.toLocaleString() || request.amount}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{request.requestedBy}</td>
                  <td className="py-4 px-6 text-gray-700">{request.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center"
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovals;
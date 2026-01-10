import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from 'lucide-react';

const Approvals = () => {
  const [pendingApprovals] = useState([
    {
      id: 1,
      type: 'Invoice',
      description: 'Invoice #INV-2024-001 - ABC Corp',
      amount: '$5,250.00',
      requestedBy: 'John Doe',
      requestDate: '2024-01-15',
      status: 'pending'
    },
    {
      id: 2,
      type: 'Payment',
      description: 'Payment to XYZ Vendor',
      amount: '$3,800.00',
      requestedBy: 'Jane Smith',
      requestDate: '2024-01-14',
      status: 'pending'
    },
    {
      id: 3,
      type: 'Purchase Order',
      description: 'PO #PO-2024-005 - Office Supplies',
      amount: '$1,200.00',
      requestedBy: 'Mike Johnson',
      requestDate: '2024-01-13',
      status: 'pending'
    }
  ]);

  const handleApprove = (id) => {
    alert(`Approved item with ID: ${id}`);
  };

  const handleReject = (id) => {
    alert(`Rejected item with ID: ${id}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manager Approvals</h1>
        <p className="text-gray-600">Review and approve pending requests</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-600 mt-1">{pendingApprovals.length} items awaiting your approval</p>
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
                  <button
                    onClick={() => handleReject(item.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </button>
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
    </div>
  );
};

export default Approvals;
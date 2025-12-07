import React, { useState } from 'react';
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react';

const Bills = () => {
  const [activeFilter, setActiveFilter] = useState('Status');

  const billsData = [
    { id: 'BIL-0081', vendor: 'Acme Corp.', billDate: '26 Mar', dueDate: 'Jul 1 Feb', status: 'Overdue', amount: '₹12,500' },
    { id: 'BIL-0080', vendor: 'Global Supplies', billDate: '24 Mar', dueDate: 'Jul 8 Feb', status: 'Due Soon', amount: '₹7,800' },
    { id: 'BIL-0079', vendor: 'Acme Corp.', billDate: '23 Mar', dueDate: 'Jul 2 Feb', status: 'Draft', amount: '₹10,200' },
    { id: 'BIL-0078', vendor: 'Vertex Solutions', billDate: '20 Mar', dueDate: 'Jul 8 Feb', status: 'Overdue', amount: '₹10,500' },
    { id: 'BIL-0077', vendor: 'Tech Innovations', billDate: '18 Mar', dueDate: 'Jul 1 Feb', status: 'Draft', amount: '₹9,800' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Overdue': return 'bg-red-500 text-white';
      case 'Due Soon': return 'bg-orange-400 text-white';
      case 'Draft': return 'bg-orange-300 text-white';
      default: return 'bg-blue-400 text-white';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium">
            Upload Bills
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Create New
          </button>
          <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Overdue</div>
          <div className="text-5xl font-bold">12</div>
        </div>
        <div className="bg-blue-400 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Due Soon</div>
          <div className="text-5xl font-bold">8</div>
        </div>
        <div className="bg-gray-200 text-gray-700 rounded-xl p-6">
          <div className="text-sm mb-2">Draft</div>
          <div className="text-5xl font-bold">3</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={() => setActiveFilter('Status')}
            className={`px-4 py-2 rounded-lg font-medium ${activeFilter === 'Status' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Status
          </button>
          <button 
            onClick={() => setActiveFilter('Awaiting Approval')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Awaiting Approval' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Awaiting Approval
          </button>
          <button 
            onClick={() => setActiveFilter('Draft')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Draft' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Draft
          </button>
          <button 
            onClick={() => setActiveFilter('Overdue')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Overdue' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Overdue
          </button>
          <button 
            onClick={() => setActiveFilter('Due Soon')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Due Soon' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Due Soon
          </button>
          <button 
            onClick={() => setActiveFilter('Partially Paid')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Partially Paid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Partially Paid
          </button>
          <button 
            onClick={() => setActiveFilter('Vendor')}
            className={`px-4 py-2 rounded-lg font-medium ${activeFilter === 'Vendor' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Vendor
          </button>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">
                Bill ID ↓
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Bill Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Due Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billsData.map((bill, index) => (
              <tr key={bill.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-4 px-6">
                  <span className="text-blue-600 font-medium">{bill.id}</span>
                </td>
                <td className="py-4 px-6 text-gray-900">{bill.vendor}</td>
                <td className="py-4 px-6 text-gray-600">{bill.billDate}</td>
                <td className="py-4 px-6 text-gray-600">{bill.dueDate}</td>
                <td className="py-4 px-6">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-semibold text-gray-900">{bill.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">2</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">3</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">4</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">5</button>
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Bills;

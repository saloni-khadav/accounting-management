import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const VendorMaster = () => {
  const [activeFilter, setActiveFilter] = useState('All (120)');

  const vendorsData = [
    { name: 'Bernard Ltd', phone: '+91 62848 94267', email: 'info@bernarditd.com', city: 'Bangalore', status: 'Active' },
    { name: 'Capsule Pharmaceuticals', phone: '+91 83230 89146', email: 'support@capsulepharma', city: 'Mumbai', status: 'Active' },
    { name: 'Irwin & Sons', phone: '+91 72816 46332', email: 'contact@irwinandsons.in', city: 'Delhi', status: 'Active' },
    { name: 'Wolf Corp', phone: '+91 84627 11430', email: 'billing@wolfcorp.com', city: 'Hyderabad', status: 'Inactive' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Vendor Master</h1>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Add Vendor
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Filter</span>
            <button 
              onClick={() => setActiveFilter('All (120)')}
              className={`px-4 py-2 rounded-lg ${activeFilter === 'All (120)' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All (120)
            </button>
            <button 
              onClick={() => setActiveFilter('Active')}
              className={`px-4 py-2 rounded-lg ${activeFilter === 'Active' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveFilter('Inactive')}
              className={`px-4 py-2 rounded-lg ${activeFilter === 'Inactive' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Inactive
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-gray-700"
            />
            <Search size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Vendor Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Phone</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">City</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Status</th>
            </tr>
          </thead>
          <tbody>
            {vendorsData.map((vendor, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-5 px-6">
                  <span className="text-blue-600 font-medium">{vendor.name}</span>
                </td>
                <td className="py-5 px-6 text-gray-900">{vendor.phone}</td>
                <td className="py-5 px-6 text-gray-900">{vendor.email}</td>
                <td className="py-5 px-6 text-gray-900">{vendor.city}</td>
                <td className="py-5 px-6">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                    vendor.status === 'Active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {vendor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium">1</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">2</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">3</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">4</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">5</button>
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default VendorMaster;

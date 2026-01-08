import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const APReport = () => {
  const vendorData = [
    { name: 'Ace\nSolutions', value: 35 },
    { name: 'Beacon\nIndustries', value: 27 },
    { name: 'Omni\nEnterprises', value: 22 },
    { name: 'Spectra\nLtd.', value: 19 },
    { name: 'Vision\nTrade Ltd.', value: 17 },
    { name: 'Westbay\nTraders', value: 15 },
    { name: 'Zenith\nGlobal', value: 13 }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AP Report</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Period:</label>
          <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer">
            <span className="font-medium">This Quarter</span>
            <ChevronDown size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Vendor:</label>
          <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer">
            <span className="font-medium">All Vendors</span>
            <ChevronDown size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Invoices Processed</p>
          <p className="text-4xl font-bold">120</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Invoices Paid</p>
          <p className="text-4xl font-bold">95</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 mb-2">Total Paid</p>
          <p className="text-4xl font-bold">₹2,00,500</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-6">Invoices by Vendor</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vendorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#5ebbbb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default APReport;

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TaxReport = () => {
  const chartData = [
    { name: 'GST', value: 400000 },
    { name: 'TDS', value: 250000 },
    { name: 'Income Tax', value: 300000 },
    { name: 'Advance Tax', value: 150000 }
  ];

  const taxDetails = [
    { date: '10/04/2024', taxType: 'GSST', category: 'CGST', amount: '₹25,000' },
    { date: '25/03/2024', taxType: 'TDS', category: 'Interest', amount: '₹30,000' },
    { date: '21/03/2024', taxType: 'Income Tax', category: 'Income Tax', amount: '₹30,000' },
    { date: '01/02/2024', taxType: 'Advance Tax', category: 'Utilities', amount: '₹15,000' }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tax Report</h1>

      {/* Filters Section */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="relative">
            <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Summary</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <div className="relative">
            <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>This Financial Year</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹7,50,000</div>
          <div className="text-sm text-gray-500">Total GST</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹2,50,000</div>
          <div className="text-sm text-gray-500">Total TDS</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹3,00,000</div>
          <div className="text-sm text-gray-500">Total Ancome Tax</div>
        </div>
      </div>

      {/* Tax Summary Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              tickFormatter={(value) => `${value / 100000} Lakh`}
              ticks={[0, 100000, 200000, 400000]}
            />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tax Details Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tax Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {taxDetails.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700">{item.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.taxType}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxReport;

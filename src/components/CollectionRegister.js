import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CollectionRegister = () => {
  const chartData = [
    { name: 'Collected', value: 75 },
    { name: 'Pending', value: 25 }
  ];

  const COLORS = ['#4f46e5', '#a5b4fc'];

  const collections = [
    { date: '25 Apr 2024', customer: 'Sun Corporation', invoice: 'INV-0378', amount: '₹14,200', mode: 'Online' },
    { date: '22 Apr 2024', customer: 'Global Solutions', invoice: 'INV-0346', amount: '₹28,000', mode: 'Cheque' },
    { date: '19 Apr 2024', customer: 'Green Power Ltd.', invoice: 'INV-0315', amount: '₹31,600', mode: 'Bank Transfer' },
    { date: '10 Apr 2024', customer: 'Sun Corporation', invoice: 'INV-0267', amount: '₹45,800', mode: 'UPI' },
    { date: '02 Apr 2024', customer: 'Rajan Exports', invoice: 'INV-0234', amount: '₹68,400', mode: 'Online' },
    { date: '29 Mar 2024', customer: 'Alpha Enterprises', invoice: 'INV-0207', amount: '₹98,200', mode: 'Bank Transfer' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Collection Register</h1>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Collections with Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total collec</p>
              <p className="text-3xl font-bold text-gray-900">200</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-4">Total Collections</p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Pending Invoices</h3>
          <p className="text-5xl font-bold text-gray-900">65</p>
        </div>

        {/* Collected This Month */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Collected This Month</h3>
          <p className="text-5xl font-bold text-gray-900">₹76,800</p>
        </div>
      </div>

      {/* Add Collection Button */}
      <div className="flex justify-end mb-6">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          ADD COLLECTION
        </button>
      </div>

      {/* Collections Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Invoice</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Mode</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900">{collection.date}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.customer}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.invoice}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.amount}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollectionRegister;

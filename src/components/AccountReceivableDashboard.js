import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AccountReceivableDashboard = () => {
  const revenueData = [
    { month: 'Jan', Revenue: 5, Receivables: 3 },
    { month: 'Feb', Revenue: 7, Receivables: 3.5 },
    { month: 'Mar', Revenue: 6, Receivables: 3 },
    { month: 'Apr', Revenue: 8, Receivables: 3.2 },
    { month: 'May', Revenue: 9, Receivables: 3.5 },
    { month: 'Jun', Revenue: 10, Receivables: 3.8 },
    { month: 'Jul', Revenue: 11, Receivables: 4 },
    { month: 'Aug', Revenue: 13, Receivables: 4.2 },
    { month: 'Sep', Revenue: 14, Receivables: 4.5 },
    { month: 'Oct', Revenue: 16, Receivables: 4.8 },
  ];

  const overdueInvoices = [
    { name: 'Kumar & Co.', due: '4 25,000', amount: '₹ 42,700' },
    { name: 'Nexa Solutions', due: '6 46,000', amount: '₹ 64,800' },
    { name: 'Innovation Works', due: '118,500', amount: '₹ 18,500' },
    { name: 'Star Traders', due: '', amount: '' },
  ];

  const salesSummary = [
    { category: 'B2B Sales', value: 6020000, percentage: 67 },
    { category: 'B2C Sales', value: 2010500, percentage: 22 },
    { category: 'Exports', value: 1015000, percentage: 11 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Accounts Receivable Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <div className="text-sm mb-2">Total Receivable</div>
          <div className="text-3xl font-bold">₹ 8,45,200</div>
        </div>
        <div className="bg-red-400 text-white p-6 rounded-lg">
          <div className="text-sm mb-2">Overdue Receivable</div>
          <div className="text-3xl font-bold">₹ 3,12,800</div>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg">
          <div className="text-sm mb-2 text-gray-600">0-30 Days</div>
          <div className="text-3xl font-bold">4,25,000</div>
        </div>
        <div className="bg-blue-100 p-6 rounded-lg">
          <div className="text-sm mb-2 text-gray-600">31-60 Days</div>
          <div className="text-3xl font-bold">1,07,600</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue vs Receivables Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue vs Receivables</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Receivables" stroke="#93c5fd" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pending & Orenedu Invoices */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Invoices</h2>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="20" 
                    strokeDasharray="314" strokeDashoffset="94" transform="rotate(-90 60 60)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">18</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Orenedu Invoices</h2>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">18</span>
              <span className="text-sm">/4</span>
              <div className="ml-auto">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-indigo-500 rounded" />
                  <span className="text-sm">35%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Invoices Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Overdue Invoices</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2"></th>
                <th className="text-right py-2">Due</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {overdueInvoices.map((invoice, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-3">{invoice.name}</td>
                  <td className="text-right">{invoice.due}</td>
                  <td className="text-right">{invoice.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Unapplied Credits</h2>
            <div className="text-3xl font-bold">₹ 15,000</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
            <div className="space-y-3">
              {salesSummary.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.category}</span>
                    <span>{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableDashboard;

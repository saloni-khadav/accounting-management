import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AccountsReceivable = ({ setActivePage }) => {
  const salesData = [
    { month: 'Jan', receivable: 65000, revenue: 75000 },
    { month: 'Feb', receivable: 72000, revenue: 82000 },
    { month: 'Mar', receivable: 68000, revenue: 78000 },
    { month: 'Apr', receivable: 85000, revenue: 95000 },
    { month: 'May', receivable: 78000, revenue: 88000 },
    { month: 'Jun', receivable: 92000, revenue: 102000 }
  ];

  const clientOutstanding = [
    { client: 'Suresh Traders', invoiceDate: '15-Jan-2024', dueDate: '15-Feb-2024', amount: '₹12,500' },
    { client: 'ABC Enterprises', invoiceDate: '20-Jan-2024', dueDate: '20-Feb-2024', amount: '₹18,750' },
    { client: 'Bright Solutions', invoiceDate: '25-Jan-2024', dueDate: '25-Feb-2024', amount: '₹9,200' },
    { client: 'Global Services', invoiceDate: '28-Jan-2024', dueDate: '28-Feb-2024', amount: '₹15,600' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts Receivable</h1>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Sales Entry Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Sales Entry</h3>
          <p className="text-2xl font-bold text-gray-900 mb-4">₹82,350</p>
          <button 
            onClick={() => setActivePage && setActivePage('Create PO')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create PO
          </button>
        </div>

        {/* 0-30 Days Overdue */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">0–30 Days Overdue</h3>
          <p className="text-2xl font-bold text-orange-600">₹45,700</p>
        </div>

        {/* 31-60 Days Overdue */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">31–60 Days Overdue</h3>
          <p className="text-2xl font-bold text-red-600">₹23,150</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Report Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Report</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'receivable' ? 'Receivable' : 'Revenue']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="receivable" stroke="#3b82f6" strokeWidth={2} name="Receivable" />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="space-y-6">
          {/* Aging Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold">₹1,51,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">0–30 Days</span>
                <span className="font-semibold text-green-600">₹45,700</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">31–80 Days</span>
                <span className="font-semibold text-orange-600">₹82,350</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">91+ Days</span>
                <span className="font-semibold text-red-600">₹23,150</span>
              </div>
            </div>
          </div>

          {/* Debtors Aging */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debtors Aging</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">0–50 Days</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Suresh Traders</div>
                    <div className="text-gray-600">₹12,500</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">ABC Enterprises</div>
                    <div className="text-gray-600">₹18,750</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">51–80 Days</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Bright Solutions</div>
                    <div className="text-gray-600">₹9,200</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Global Services</div>
                    <div className="text-gray-600">₹15,600</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Outstanding Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Outstanding</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Client Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Invoice Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {clientOutstanding.map((client, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{client.client}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.invoiceDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.dueDate}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{client.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Report Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Report</h3>
        <div className="flex space-x-8">
          <div>
            <p className="text-sm text-gray-600">Client Amount</p>
            <p className="text-xl font-bold text-gray-900">₹25,400</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-xl font-bold text-gray-900">₹20,400</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivable;
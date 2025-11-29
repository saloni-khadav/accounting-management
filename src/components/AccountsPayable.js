import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AccountsPayable = () => {
  const purchaseData = [
    { month: 'Jan', purchases: 35000, payments: 28000 },
    { month: 'May', purchases: 42000, payments: 38000 },
    { month: 'Jun', purchases: 48000, payments: 45000 }
  ];

  const overduePayables = [
    { vendor: 'Bright Solutions', dueDate: '15-Jan-2024', amount: '$13,040', status: 'Overdue' },
    { vendor: 'Anderson Supplies', dueDate: '20-Jan-2024', amount: '$30,840', status: 'Overdue' },
    { vendor: 'Northwest Traders', dueDate: '25-Jan-2024', amount: '$8,750', status: 'Overdue' },
    { vendor: 'Metro Manufacturing', dueDate: '28-Jan-2024', amount: '$18,640', status: 'Overdue' },
    { vendor: 'Summit Enterprises', dueDate: '30-Jan-2024', amount: '$12,500', status: 'Overdue' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts Payable</h1>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Payable</h3>
          <p className="text-2xl font-bold text-gray-900">$45,200</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Overdue Payable</h3>
          <p className="text-2xl font-bold text-red-600">$12,800</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Due in 30 Days</h3>
          <p className="text-2xl font-bold text-yellow-600">$24,600</p>
        </div>
      </div>

      {/* Chart and Aging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Purchases & Payments Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchases & Payments</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'purchases' ? 'Purchases' : 'Payments']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="purchases" fill="#3b82f6" name="Purchases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payments" fill="#10b981" name="Payments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payable Aging */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payable Aging</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Over 80 Days</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Anderson Supplies</div>
                  <div className="text-gray-600">$30,840</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Metro Manufacturing</div>
                  <div className="text-gray-600">$18,640</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">1–30 Days</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Bright Solutions</div>
                  <div className="text-gray-600">$13,040</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Global Distributors</div>
                  <div className="text-gray-600">$21,600</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Payables Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Payables</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {overduePayables.map((payable, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{payable.vendor}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{payable.dueDate}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{payable.amount}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {payable.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Overdue Payables Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Payables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900">Bright Solutions</div>
            <div className="text-gray-600">Due: 15-Jan-2024</div>
            <div className="font-semibold text-red-600">$13,040</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Anderson Supplies</div>
            <div className="text-gray-600">Due: 20-Jan-2024</div>
            <div className="font-semibold text-red-600">$30,840</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Northwest Traders</div>
            <div className="text-gray-600">Due: 25-Jan-2024</div>
            <div className="font-semibold text-red-600">$8,750</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Metro Manufacturing</div>
            <div className="text-gray-600">Due: 28-Jan-2024</div>
            <div className="font-semibold text-red-600">$18,640</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPayable;
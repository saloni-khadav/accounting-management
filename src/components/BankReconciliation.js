import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Filter, MoreHorizontal } from 'lucide-react';

const BankReconciliation = () => {
  const reconciliationData = [
    { day: '01', progress: 65 },
    { day: '02', progress: 72 },
    { day: '03', progress: 78 },
    { day: '04', progress: 85 }
  ];

  const transactionData = [
    { type: 'Reconciled', amount: 272000 },
    { type: 'Unreconciled', amount: 48000 }
  ];

  const unreconciled = [
    { date: '4 Nov 2', description: 'Paying Jonm', withdrawals: '₹30,000', deposits: '10,000', utp: 'URCSC' },
    { date: '2 Nov 2', description: 'Credit Crante', withdrawals: '₹25,000', deposits: '32,000', utp: 'WZFTT' },
    { date: '2 Nov 3', description: 'Bonder Account', withdrawals: '50,000', deposits: '10,000', utp: 'UUSRB' },
    { date: '1 Nov 4', description: 'Bank Account', withdrawals: '₹60,000', deposits: '30,000', utp: 'A2B7W' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bank Reconciliation</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Import Bank Statement!
        </button>
      </div>

      {/* Bank Account and Reconciled Status */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Bank Account</label>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>HDFC Bank</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">Reconciled 85%</div>
        </div>
      </div>

      {/* Unreconciled Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Unreconciled Transactions</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>All</option>
                </select>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal size={16} />
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Match
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Withdrawals</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Deposits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">UTP</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Auto-Match</th>
              </tr>
            </thead>
            <tbody>
              {unreconciled.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.withdrawals}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.deposits}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{transaction.utp}</td>
                  <td className="py-3 px-4">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700">
                      Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Bulk Match</button>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Rule-Based Auto-Match</button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reconciliation Progress Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Reconciliation Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reconciliationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Progress']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards and Reconcile Button */}
      <div className="flex justify-between items-end">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mr-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Closing Balance</h4>
            <p className="text-xl font-bold text-gray-900">₹3,20,000</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Reconciled Balance</h4>
            <p className="text-xl font-bold text-green-600">₹2,72,000</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Uncleared Deposits</h4>
            <p className="text-xl font-bold text-orange-600">₹30,000</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Outstanding Cheques</h4>
            <p className="text-xl font-bold text-red-600">₹18,000</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
          Reconcile
        </button>
      </div>
    </div>
  );
};

export default BankReconciliation;
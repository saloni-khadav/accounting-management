import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Download, RefreshCw, Calendar } from 'lucide-react';

const BankDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const cashFlowData = [
    { month: 'Jan', inflow: 450000, outflow: 320000 },
    { month: 'Feb', inflow: 520000, outflow: 380000 },
    { month: 'Mar', inflow: 480000, outflow: 350000 },
    { month: 'Apr', inflow: 550000, outflow: 400000 },
    { month: 'May', inflow: 600000, outflow: 420000 },
    { month: 'Jun', inflow: 580000, outflow: 390000 }
  ];

  const transactions = [
    { id: 1, date: '2024-01-15', description: 'Client Payment - ABC Corp', type: 'Credit', amount: 125000, balance: 850000 },
    { id: 2, date: '2024-01-14', description: 'Vendor Payment - XYZ Ltd', type: 'Debit', amount: 45000, balance: 725000 },
    { id: 3, date: '2024-01-13', description: 'Salary Payment', type: 'Debit', amount: 180000, balance: 770000 }
  ];

  const stats = [
    { title: 'Total Balance', value: '₹8,50,000', change: '+12.5%', trend: 'up', icon: Wallet, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Cash Inflow', value: '₹6,00,000', change: '+8.3%', trend: 'up', icon: TrendingUp, gradient: 'from-green-500 to-green-600' },
    { title: 'Cash Outflow', value: '₹4,20,000', change: '-5.2%', trend: 'down', icon: TrendingDown, gradient: 'from-red-500 to-red-600' },
    { title: 'Net Cash Flow', value: '₹1,80,000', change: '+15.7%', trend: 'up', icon: DollarSign, gradient: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bank Dashboard
            </span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">Monitor your bank accounts and cash flow</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-5 w-5 text-white opacity-75" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-white opacity-75" />
                )}
              </div>
              <p className="text-white text-opacity-90 text-sm font-semibold mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white text-opacity-75 text-xs font-medium">{stat.change} vs last month</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb', fontWeight: 600 }} />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={3} fill="url(#colorInflow)" />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={3} fill="url(#colorOutflow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e5e7eb', fontWeight: 600 }} />
              <Bar dataKey="inflow" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="outflow" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">Latest bank transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">{txn.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{txn.description}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                      txn.type === 'Credit' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold text-lg ${txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900 text-lg">₹{txn.balance.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BankDashboard;
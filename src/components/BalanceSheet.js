import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, Scale, Percent, Download, Calendar, RefreshCw, ArrowUpRight } from 'lucide-react';

const BalanceSheet = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Year');

  const stats = [
    { title: 'Total Assets', value: '₹82,00,000', icon: DollarSign, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Total Liabilities', value: '₹40,00,000', icon: TrendingUp, gradient: 'from-red-500 to-red-600' },
    { title: 'Equity', value: '₹42,00,000', icon: Scale, gradient: 'from-green-500 to-green-600' },
    { title: 'Current Ratio', value: '1.80', icon: Percent, gradient: 'from-purple-500 to-purple-600' }
  ];

  const assetsData = [
    { category: 'Current Assets', current: 5000000, previous: 2500000 },
    { category: 'Accounts Receivable', current: 12000000, previous: 13000000 },
    { category: 'Inventory', current: 9000000, previous: 8000000 }
  ];

  const liabilitiesData = [
    { category: 'Accounts Payable', current: 13000000, previous: 13000000 },
    { category: 'Short-term Loans', current: 13000000, previous: 13000000 }
  ];

  const equityData = [
    { category: 'Share Capital', current: 23000000, previous: 25000000 },
    { category: 'Retained Earnings', current: 17000000, previous: 17000000 }
  ];

  const pieData = [
    { name: 'Assets', value: 82000000, color: '#3b82f6' },
    { name: 'Liabilities', value: 40000000, color: '#ef4444' },
    { name: 'Equity', value: 42000000, color: '#10b981' }
  ];

  const comparisonData = [
    { name: 'Assets', current: 82000000, previous: 75000000 },
    { name: 'Liabilities', current: 40000000, previous: 38000000 },
    { name: 'Equity', current: 42000000, previous: 37000000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Balance Sheet
            </span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">Financial position statement</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option>This Year</option>
            <option>Last Year</option>
            <option>This Quarter</option>
          </select>
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
                <ArrowUpRight className="h-5 w-5 text-white opacity-75" />
              </div>
              <p className="text-white text-opacity-90 text-sm font-semibold mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Assets vs Liabilities</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${(value / 10000000).toFixed(2)} Cr`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {pieData.map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                <p className="text-xs font-semibold text-gray-600 mb-1">{item.name}</p>
                <p className="text-sm font-bold text-gray-900">₹{(item.value / 10000000).toFixed(2)} Cr</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Period Comparison</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
              <Tooltip formatter={(value) => [`₹${(value / 10000000).toFixed(2)} Cr`, '']} />
              <Bar dataKey="current" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Current" />
              <Bar dataKey="previous" fill="#93c5fd" radius={[8, 8, 0, 0]} name="Previous" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Assets</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">Particulars</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Current</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assetsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="py-3 text-sm font-semibold text-gray-900">{item.category}</td>
                    <td className="py-3 text-right text-sm font-bold text-gray-900">₹{(item.current / 100000).toFixed(0)}L</td>
                    <td className="py-3 text-right text-sm text-gray-600">₹{(item.previous / 100000).toFixed(0)}L</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="py-3 text-sm text-gray-900">Total Assets</td>
                  <td className="py-3 text-right text-sm text-blue-600">₹260L</td>
                  <td className="py-3 text-right text-sm text-gray-600">₹280L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Liabilities</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">Particulars</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Current</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liabilitiesData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50 transition-colors duration-150">
                    <td className="py-3 text-sm font-semibold text-gray-900">{item.category}</td>
                    <td className="py-3 text-right text-sm font-bold text-gray-900">₹{(item.current / 100000).toFixed(0)}L</td>
                    <td className="py-3 text-right text-sm text-gray-600">₹{(item.previous / 100000).toFixed(0)}L</td>
                  </tr>
                ))}
                <tr className="bg-red-50 font-bold">
                  <td className="py-3 text-sm text-gray-900">Total Liabilities</td>
                  <td className="py-3 text-right text-sm text-red-600">₹330L</td>
                  <td className="py-3 text-right text-sm text-gray-600">₹255L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Equity */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Equity</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase">Particulars</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Current</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase">Previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equityData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-green-50 transition-colors duration-150">
                    <td className="py-3 text-sm font-semibold text-gray-900">{item.category}</td>
                    <td className="py-3 text-right text-sm font-bold text-gray-900">₹{(item.current / 100000).toFixed(0)}L</td>
                    <td className="py-3 text-right text-sm text-gray-600">₹{(item.previous / 100000).toFixed(0)}L</td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-bold">
                  <td className="py-3 text-sm text-gray-900">Total Equity</td>
                  <td className="py-3 text-right text-sm text-green-600">₹420L</td>
                  <td className="py-3 text-right text-sm text-gray-600">₹420L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, FileText, Calendar, Download, Filter, RefreshCw } from 'lucide-react';

const GSTDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [gstData, setGstData] = useState({});

  const monthlyGSTData = [
    { month: 'Jan', input: 45000, output: 52000, liability: 7000 },
    { month: 'Feb', input: 38000, output: 48000, liability: 10000 },
    { month: 'Mar', input: 42000, output: 55000, liability: 13000 },
    { month: 'Apr', input: 47000, output: 58000, liability: 11000 },
    { month: 'May', input: 51000, output: 62000, liability: 11000 },
    { month: 'Jun', input: 49000, output: 59000, liability: 10000 }
  ];

  const gstTypeData = [
    { name: 'CGST', value: 35, amount: 35000, color: '#3b82f6' },
    { name: 'SGST', value: 35, amount: 35000, color: '#10b981' },
    { name: 'IGST', value: 30, amount: 30000, color: '#f59e0b' }
  ];

  const returnStatus = [
    { return: 'GSTR-1', status: 'Filed', dueDate: '2024-02-11', amount: 52000 },
    { return: 'GSTR-3B', status: 'Pending', dueDate: '2024-02-20', amount: 11000 },
    { return: 'GSTR-2A', status: 'Available', dueDate: '2024-02-12', amount: 45000 },
    { return: 'GSTR-2B', status: 'Available', dueDate: '2024-02-14', amount: 45000 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Filed': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-red-600 bg-red-100';
      case 'Available': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const summaryCards = [
    {
      title: 'Input Tax Credit',
      value: '₹45,000',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Output Tax',
      value: '₹52,000',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Tax Liability',
      value: '₹7,000',
      change: '-15%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600',
      bgGradient: 'from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    {
      title: 'Returns Filed',
      value: '2/4',
      change: '50%',
      trend: 'up',
      icon: FileText,
      color: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GST Dashboard</h1>
            <p className="text-gray-600 text-lg">Monitor GST compliance and tax positions</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="2024-01">Jan 2024</option>
              <option value="2024-02">Feb 2024</option>
              <option value="2024-03">Mar 2024</option>
            </select>
            <button className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div key={index} className={`bg-gradient-to-br ${card.bgGradient} p-6 rounded-xl shadow-md border ${card.borderColor} hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <card.icon className={`h-4 w-4 ${card.color} mr-1`} />
                    <span className={`text-sm font-semibold ${card.color}`}>{card.change}</span>
                  </div>
                </div>
                <card.icon className={`h-12 w-12 ${card.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly GST Trend */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly GST Trend</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyGSTData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="input" fill="#3b82f6" name="Input Tax" radius={[8, 8, 0, 0]} />
                <Bar dataKey="output" fill="#10b981" name="Output Tax" radius={[8, 8, 0, 0]} />
                <Bar dataKey="liability" fill="#f59e0b" name="Tax Liability" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* GST Type Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">GST Type Distribution</h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={320}>
                <PieChart>
                  <Pie
                    data={gstTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gstTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-45% space-y-4">
                {gstTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">₹{item.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{item.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Returns Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">GST Returns Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Return Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnStatus.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.return}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.status === 'Pending' ? (
                        <button className="text-blue-600 hover:text-blue-900 font-semibold">File Return</button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900 font-semibold">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors duration-200">
                File GSTR-3B Return
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors duration-200">
                Download GSTR-2A
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold transition-colors duration-200">
                Reconcile Returns
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Compliance Alerts</h4>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <p className="text-sm font-semibold text-red-800">GSTR-3B due in 3 days</p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
                <p className="text-sm font-semibold text-yellow-800">ITC mismatch detected</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">GSTR-1 filed successfully</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">GSTR-2A downloaded</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">ITC reconciliation pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTDashboard;
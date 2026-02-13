import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Calendar, FileText, TrendingUp, Calculator, Eye, Printer, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TaxReport = () => {
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState({ fromDate: '2024-01-01', toDate: '2024-03-31' });
  const [filters, setFilters] = useState({ taxType: '', period: 'quarterly', format: 'detailed' });

  const taxSummaryData = [
    { month: 'Jan', gst: 25000, tds: 8000, advance: 15000, total: 48000 },
    { month: 'Feb', gst: 28000, tds: 9500, advance: 12000, total: 49500 },
    { month: 'Mar', gst: 32000, tds: 11000, advance: 18000, total: 61000 }
  ];

  const taxTypeDistribution = [
    { name: 'GST', value: 85000, percentage: 53.8, color: '#3b82f6' },
    { name: 'TDS', value: 28500, percentage: 18.0, color: '#10b981' },
    { name: 'Advance Tax', value: 45000, percentage: 28.2, color: '#f59e0b' }
  ];

  const detailedTaxData = [
    { id: 1, taxType: 'GST', description: 'Output GST - Sales', period: 'Jan 2024', taxableAmount: 500000, taxRate: 18, taxAmount: 90000, status: 'Paid' },
    { id: 2, taxType: 'TDS', description: 'TDS on Professional Services', period: 'Jan 2024', taxableAmount: 100000, taxRate: 10, taxAmount: 10000, status: 'Deducted' },
    { id: 3, taxType: 'Advance Tax', description: 'Quarterly Advance Tax', period: 'Q4 2023-24', taxableAmount: 200000, taxRate: 30, taxAmount: 60000, status: 'Paid' }
  ];

  const reportTypes = [
    { id: 'summary', label: 'Tax Summary', icon: Calculator },
    { id: 'gst', label: 'GST Report', icon: FileText },
    { id: 'tds', label: 'TDS Report', icon: FileText },
    { id: 'advance', label: 'Advance Tax', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: TrendingUp }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'text-green-700 bg-green-100 border-green-200',
      'Pending': 'text-red-700 bg-red-100 border-red-200',
      'Deducted': 'text-blue-700 bg-blue-100 border-blue-200',
      'Overdue': 'text-orange-700 bg-orange-100 border-orange-200'
    };
    return colors[status] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const summaryCards = [
    { title: 'Total Tax Liability', value: '₹1,58,500', change: '+12%', trend: 'up', icon: Calculator, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { title: 'GST Collected', value: '₹85,000', change: '+8%', trend: 'up', icon: FileText, color: 'green', gradient: 'from-green-500 to-green-600' },
    { title: 'TDS Deducted', value: '₹28,500', change: '+15%', trend: 'up', icon: TrendingUp, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
    { title: 'Advance Tax Paid', value: '₹45,000', change: '+5%', trend: 'up', icon: Calendar, color: 'orange', gradient: 'from-orange-500 to-orange-600' }
  ];

  const renderSummaryReport = () => (
    <div className="space-y-8">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                {card.trend === 'up' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              <div className="flex items-center">
                <span className={`text-sm font-bold ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Monthly Tax Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">GST</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">TDS</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Advance</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={taxSummaryData}>
              <defs>
                <linearGradient id="colorGst" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line type="monotone" dataKey="gst" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="tds" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="advance" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Type Distribution</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="45%" height={320}>
              <PieChart>
                <Pie
                  data={taxTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taxTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-50% space-y-3">
              {taxTypeDistribution.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-bold text-gray-700">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-xl font-bold text-gray-900">₹{item.value.toLocaleString()}</div>
                    <div className="text-sm font-semibold text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedReport = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">Detailed Tax Report</h3>
        <p className="text-sm text-gray-600 mt-1">Comprehensive breakdown of all tax transactions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tax Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Period</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Taxable Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tax Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {detailedTaxData.map((item) => (
              <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">{item.taxType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.period}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{item.taxableAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                    {item.taxRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{item.taxAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="w-full">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Tax Reports</h1>
            <p className="text-gray-600 text-lg">Comprehensive tax reporting and analysis</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl hover:shadow-lg border border-gray-200 transition-all duration-200 font-semibold">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <nav className="flex space-x-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  selectedReport === type.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <type.icon className="h-4 w-4 mr-2" />
                {type.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tax Type</label>
              <select
                value={filters.taxType}
                onChange={(e) => setFilters({...filters, taxType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="">All Types</option>
                <option value="GST">GST</option>
                <option value="TDS">TDS</option>
                <option value="Advance">Advance Tax</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Report Format</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({...filters, format: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="comparative">Comparative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {selectedReport === 'summary' && filters.format === 'summary' && renderSummaryReport()}
        {selectedReport === 'summary' && filters.format === 'detailed' && renderDetailedReport()}
        {selectedReport !== 'summary' && renderDetailedReport()}
      </div>
    </div>
  );
};

export default TaxReport;
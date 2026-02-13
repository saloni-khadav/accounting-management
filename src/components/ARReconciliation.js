import React, { useState } from 'react';
import { Search, Download, Filter, RefreshCw, CheckCircle, AlertCircle, XCircle, FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const ARReconciliation = () => {
  const [reconciliations, setReconciliations] = useState([
    { id: 1, client: 'ABC Corp Ltd', invoiceNo: 'INV-001', invoiceAmount: 125000, receivedAmount: 125000, difference: 0, status: 'Matched', date: '2024-01-15' },
    { id: 2, client: 'XYZ Industries', invoiceNo: 'INV-002', invoiceAmount: 85000, receivedAmount: 80000, difference: 5000, status: 'Partial', date: '2024-01-18' },
    { id: 3, client: 'Tech Solutions', invoiceNo: 'INV-003', invoiceAmount: 150000, receivedAmount: 0, difference: 150000, status: 'Unmatched', date: '2024-01-20' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const matched = reconciliations.filter(r => r.status === 'Matched').length;
  const partial = reconciliations.filter(r => r.status === 'Partial').length;
  const unmatched = reconciliations.filter(r => r.status === 'Unmatched').length;
  const totalDifference = reconciliations.reduce((sum, r) => sum + r.difference, 0);

  const stats = [
    { title: 'Matched', value: matched.toString(), icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
    { title: 'Partial Match', value: partial.toString(), icon: AlertCircle, gradient: 'from-orange-500 to-orange-600' },
    { title: 'Unmatched', value: unmatched.toString(), icon: XCircle, gradient: 'from-red-500 to-red-600' },
    { title: 'Total Difference', value: `₹${totalDifference.toLocaleString()}`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      'Matched': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      'Partial': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
      'Unmatched': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    };
    return configs[status] || configs['Unmatched'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AR Reconciliation
            </span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">Reconcile accounts receivable with payments</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold">
            <TrendingUp className="h-4 w-4" />
            Auto Reconcile
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
          <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl p-6`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm font-semibold mb-2">{stat.title}</p>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              <option value="">All Status</option>
              <option value="Matched">Matched</option>
              <option value="Partial">Partial Match</option>
              <option value="Unmatched">Unmatched</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
              <Filter className="h-4 w-4" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Reconciliation Records</h3>
          <p className="text-sm text-gray-600 mt-1">Match invoices with received payments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Received Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Difference</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reconciliations.map((record) => {
                const statusConfig = getStatusConfig(record.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={record.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{record.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{record.client}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700 font-medium">{record.invoiceNo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-bold text-gray-900">₹{record.invoiceAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-bold text-green-600">₹{record.receivedAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-bold ${record.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.difference === 0 ? '₹0' : `₹${record.difference.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <FileText className="h-4 w-4" />
                        </button>
                        {record.status !== 'Matched' && (
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ARReconciliation;
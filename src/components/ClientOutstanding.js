import React, { useState } from 'react';
import { Search, Download, Filter, RefreshCw, AlertCircle, DollarSign, Calendar, TrendingUp, Users, Eye, Mail, Phone } from 'lucide-react';

const ClientOutstanding = () => {
  const [clients, setClients] = useState([
    { id: 1, name: 'ABC Corp Ltd', totalOutstanding: 250000, current: 150000, days30: 50000, days60: 30000, days90: 20000, contact: 'john@abc.com', phone: '+91 98765 43210' },
    { id: 2, name: 'XYZ Industries', totalOutstanding: 180000, current: 100000, days30: 50000, days60: 20000, days90: 10000, contact: 'info@xyz.com', phone: '+91 98765 43211' },
    { id: 3, name: 'Tech Solutions', totalOutstanding: 320000, current: 200000, days30: 70000, days60: 30000, days90: 20000, contact: 'contact@tech.com', phone: '+91 98765 43212' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const totalStats = {
    totalOutstanding: clients.reduce((sum, c) => sum + c.totalOutstanding, 0),
    current: clients.reduce((sum, c) => sum + c.current, 0),
    days30: clients.reduce((sum, c) => sum + c.days30, 0),
    days60: clients.reduce((sum, c) => sum + c.days60, 0),
    days90: clients.reduce((sum, c) => sum + c.days90, 0)
  };

  const stats = [
    { title: 'Total Outstanding', value: `₹${totalStats.totalOutstanding.toLocaleString()}`, icon: DollarSign, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Current', value: `₹${totalStats.current.toLocaleString()}`, icon: TrendingUp, gradient: 'from-green-500 to-green-600' },
    { title: '30+ Days', value: `₹${totalStats.days30.toLocaleString()}`, icon: Calendar, gradient: 'from-orange-500 to-orange-600' },
    { title: '60+ Days', value: `₹${totalStats.days60.toLocaleString()}`, icon: AlertCircle, gradient: 'from-red-500 to-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Client Outstanding
            </span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">Track outstanding payments from clients</p>
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
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Search Client</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
              <Filter className="h-4 w-4" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Outstanding Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Client Outstanding Details</h3>
          <p className="text-sm text-gray-600 mt-1">Aging analysis of outstanding receivables</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total Outstanding</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Current</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">30+ Days</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">60+ Days</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">90+ Days</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-gray-900">{client.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {client.contact}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900 text-lg">₹{client.totalOutstanding.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-green-600">₹{client.current.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-orange-600">₹{client.days30.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-red-600">₹{client.days60.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-red-700">₹{client.days90.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan="2" className="px-6 py-4 text-left font-bold text-gray-900 text-lg">Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">₹{totalStats.totalOutstanding.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">₹{totalStats.current.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-orange-600 text-lg">₹{totalStats.days30.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600 text-lg">₹{totalStats.days60.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-red-700 text-lg">₹{totalStats.days90.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientOutstanding;
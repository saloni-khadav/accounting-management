import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, FileText, AlertCircle, DollarSign, Calendar, Users, ArrowUpRight, ChevronDown, RefreshCw, Download, Filter } from 'lucide-react';

const AccountReceivableDashboard = () => {
  const [stats, setStats] = useState({
    totalReceivable: 0, outstanding: 0, overdueAmount: 0, days0to30: 0,
    days31to60: 0, pendingInvoices: 0, overdueCount: 0, unappliedCredits: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('This Quarter');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchClients();
  }, [selectedPeriod, selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/clients');
      if (response.ok) setClients(await response.json());
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriod !== 'This Quarter') params.append('period', selectedPeriod);
      if (selectedClient !== 'All Clients') params.append('client', selectedClient);
      
      const queryString = params.toString();
      const baseUrl = 'http://localhost:5001/api/ar-dashboard';
      
      const [statsRes, revenueRes, overdueRes] = await Promise.all([
        fetch(`${baseUrl}/stats?${queryString}`),
        fetch(`${baseUrl}/monthly-revenue?${queryString}`),
        fetch(`${baseUrl}/overdue-invoices?${queryString}`)
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (revenueRes.ok) setRevenueData(await revenueRes.json());
      if (overdueRes.ok) setOverdueInvoices(await overdueRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const periods = ['This Month', 'Last Month', 'First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter', 'Last Quarter', 'This Year', 'Last Year'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Accounts Receivable Dashboard
              </span>
            </h1>
            <p className="text-gray-600 text-lg font-medium">Monitor your receivables and cash flow in real-time</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 font-semibold">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              Period
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl px-5 py-3.5 hover:border-blue-400 transition-all duration-200 group-hover:shadow-md"
              >
                <span className="font-bold text-gray-900">{selectedPeriod}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showPeriodDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => { setSelectedPeriod(period); setShowPeriodDropdown(false); }}
                      className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold text-gray-700 hover:text-blue-600 transition-all duration-150 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Users className="h-4 w-4 text-indigo-600" />
              Client
            </label>
            <div className="relative">
              <button
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-gray-50 to-indigo-50 border-2 border-gray-200 rounded-xl px-5 py-3.5 hover:border-indigo-400 transition-all duration-200 group-hover:shadow-md"
              >
                <span className="font-bold text-gray-900">{selectedClient}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${showClientDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showClientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedClient('All Clients'); setShowClientDropdown(false); }}
                    className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold text-gray-700 hover:text-indigo-600 transition-all duration-150 rounded-t-xl"
                  >
                    All Clients
                  </button>
                  {clients.map((client) => (
                    <button
                      key={client._id}
                      onClick={() => { setSelectedClient(client.clientName); setShowClientDropdown(false); }}
                      className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold text-gray-700 hover:text-indigo-600 transition-all duration-150 last:rounded-b-xl"
                    >
                      {client.clientName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative group overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-white opacity-75" />
              </div>
              <p className="text-blue-100 text-sm font-semibold mb-2">Total Receivable</p>
              <p className="text-4xl font-bold text-white mb-1">₹ {stats.totalReceivable.toLocaleString('en-IN')}</p>
              <p className="text-blue-100 text-xs font-medium">Outstanding payments</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <TrendingDown className="h-5 w-5 text-white opacity-75" />
              </div>
              <p className="text-red-100 text-sm font-semibold mb-2">Overdue Receivable</p>
              <p className="text-4xl font-bold text-white mb-1">₹ {stats.overdueAmount.toLocaleString('en-IN')}</p>
              <p className="text-red-100 text-xs font-medium">Requires immediate attention</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
              <p className="text-emerald-100 text-sm font-semibold mb-2">0-30 Days</p>
              <p className="text-4xl font-bold text-white mb-1">₹ {stats.days0to30.toLocaleString('en-IN')}</p>
              <p className="text-emerald-100 text-xs font-medium">Current period</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
              <p className="text-purple-100 text-sm font-semibold mb-2">31-60 Days</p>
              <p className="text-4xl font-bold text-white mb-1">₹ {stats.days31to60.toLocaleString('en-IN')}</p>
              <p className="text-purple-100 text-xs font-medium">Extended period</p>
            </div>
          </div>
        </div>

        {/* Charts and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Revenue vs Receivables</h3>
                <p className="text-sm text-gray-500 mt-1">Monthly comparison in Lakhs</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-semibold text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                  <span className="text-sm font-semibold text-gray-600">Receivables</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceivables" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '2px solid #e5e7eb', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 600
                  }} 
                />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="Receivables" stroke="#818cf8" strokeWidth={3} fill="url(#colorReceivables)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                </div>
                <p className="text-indigo-100 text-sm font-semibold mb-2">Pending Invoices</p>
                <p className="text-6xl font-bold text-white mb-2">{stats.pendingInvoices}</p>
                <p className="text-indigo-100 text-sm font-medium">Awaiting payment</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-2xl shadow-xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
                <p className="text-red-100 text-sm font-semibold mb-2">Overdue Invoices</p>
                <p className="text-6xl font-bold text-white mb-2">{stats.overdueCount}</p>
                <p className="text-red-100 text-sm font-medium">Past due date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Overdue Invoices</h3>
              <p className="text-sm text-gray-600 mt-1">Invoices requiring immediate follow-up</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Days Overdue</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overdueInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-gray-500 font-semibold text-lg">No overdue invoices</p>
                          <p className="text-gray-400 text-sm mt-1">All payments are up to date</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    overdueInvoices.map((invoice, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">{invoice.customerName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700 font-medium">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            {invoice.daysOverdue} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-bold text-gray-900 text-lg">₹ {invoice.amount.toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                </div>
                <p className="text-blue-100 text-sm font-semibold mb-2">Unapplied Credits</p>
                <p className="text-5xl font-bold text-white mb-2">₹ {stats.unappliedCredits.toLocaleString('en-IN')}</p>
                <p className="text-blue-100 text-sm font-medium">Available credit notes</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl shadow-xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
                <p className="text-orange-100 text-sm font-semibold mb-2">Outstanding</p>
                <p className="text-5xl font-bold text-white mb-2">₹ {Math.abs(stats.outstanding).toLocaleString('en-IN')}</p>
                <p className="text-orange-100 text-sm font-medium">Total outstanding amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableDashboard;
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, IndianRupee, AlertTriangle, Clock, FileText, Users } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';

const AccountReceivableDashboard = () => {
  const [stats, setStats] = useState({
    totalReceivable: 0,
    outstanding: 0,
    overdueAmount: 0,
    days0to30: 0,
    days31to60: 0,
    pendingInvoices: 0,
    overdueCount: 0,
    unappliedCredits: 0
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
      const response = await fetch(`${baseUrl}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
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
      const apiUrl = `${baseUrl}/api/ar-dashboard`;
      
      const [statsRes, revenueRes, overdueRes] = await Promise.all([
        fetch(`${apiUrl}/stats?${queryString}`),
        fetch(`${apiUrl}/monthly-revenue?${queryString}`),
        fetch(`${apiUrl}/overdue-invoices?${queryString}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('Stats Data:', statsData);
        setStats(statsData);
      } else {
        console.error('Failed to fetch stats:', statsRes.status);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData);
      }

      if (overdueRes.ok) {
        const overdueData = await overdueRes.json();
        console.log('Overdue Invoices Data:', overdueData);
        setOverdueInvoices(overdueData);
      } else {
        console.error('Failed to fetch overdue invoices:', overdueRes.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const periods = ['This Month', 'Last Month', 'First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter', 'Last Quarter', 'This Year', 'Last Year'];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <h1 className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-3" size={28} />
            Accounts Receivable Dashboard
          </h1>
          <p className="text-blue-100 mt-1">Track receivables, revenue, and overdue invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 font-medium mb-2 block">Period:</label>
              <div className="relative">
                <div 
                  className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                >
                  <span className="font-medium">{selectedPeriod}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {showPeriodDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                    {periods.map((period) => (
                      <div
                        key={period}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSelectedPeriod(period);
                          setShowPeriodDropdown(false);
                        }}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-gray-700 font-medium mb-2 block">Client:</label>
              <div className="relative">
                <div 
                  className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <span className="font-medium">{selectedClient}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {showClientDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => {
                        setSelectedClient('All Clients');
                        setShowClientDropdown(false);
                      }}
                    >
                      All Clients
                    </div>
                    {clients.map((client) => (
                      <div
                        key={client._id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSelectedClient(client.clientName);
                          setShowClientDropdown(false);
                        }}
                      >
                        {client.clientName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Total Receivable"
            value={`₹${stats.totalReceivable.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Overdue Receivable"
            value={`₹${stats.overdueAmount.toLocaleString('en-IN')}`}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="0-30 Days"
            value={`₹${stats.days0to30.toLocaleString('en-IN')}`}
            icon={Clock}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="31-60 Days"
            value={`₹${stats.days31to60.toLocaleString('en-IN')}`}
            icon={Clock}
            color="warning"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue vs Receivables Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
            <h2 className="text-lg font-semibold">Revenue vs Receivables (in Lakhs)</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Receivables" stroke="#93c5fd" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending & Overdue Invoices */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
              <h2 className="text-lg font-semibold">Pending Invoices</h2>
            </div>
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">{stats.pendingInvoices}</div>
                <div className="text-sm text-gray-600 mt-2">Invoices Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
              <h2 className="text-lg font-semibold">Overdue Invoices</h2>
            </div>
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-red-600">{stats.overdueCount}</div>
                <div className="text-sm text-gray-600 mt-2">Invoices Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Invoices Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
            <h2 className="text-lg font-semibold">Overdue Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Days Overdue</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No overdue invoices</p>
                    </td>
                  </tr>
                ) : (
                  overdueInvoices.map((invoice, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-6 text-gray-900 font-medium">{invoice.customerName}</td>
                      <td className="py-4 px-6 text-blue-600 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-4 px-6 text-right text-red-600 font-semibold">{invoice.daysOverdue} days</td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{invoice.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
              <h2 className="text-lg font-semibold">Unapplied Credits</h2>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600">₹{stats.unappliedCredits.toLocaleString('en-IN')}</div>
              <p className="text-sm text-gray-600 mt-2">Available credit notes</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
              <h2 className="text-lg font-semibold">Outstanding</h2>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-600">₹{Math.abs(stats.outstanding).toLocaleString('en-IN')}</div>
              <p className="text-sm text-gray-600 mt-2">Total outstanding amount</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableDashboard;


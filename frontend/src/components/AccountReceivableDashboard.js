import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/clients');
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
      const baseUrl = 'https://nextbook-backend.nextsphere.co.in/api/ar-dashboard';
      
      const [statsRes, revenueRes, overdueRes] = await Promise.all([
        fetch(`${baseUrl}/stats?${queryString}`),
        fetch(`${baseUrl}/monthly-revenue?${queryString}`),
        fetch(`${baseUrl}/overdue-invoices?${queryString}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData);
      }

      if (overdueRes.ok) {
        const overdueData = await overdueRes.json();
        setOverdueInvoices(overdueData);
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
      <h1 className="text-3xl font-bold mb-6">Accounts Receivable Dashboard</h1>

      {/* Period and Client Filters */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Period:</label>
          <div className="relative">
            <div 
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <span className="font-medium">{selectedPeriod}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showPeriodDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10">
                {periods.map((period) => (
                  <div
                    key={period}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
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
        <div className="bg-white p-4 rounded-lg border">
          <label className="text-gray-600 mb-2 block">Client:</label>
          <div className="relative">
            <div 
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowClientDropdown(!showClientDropdown)}
            >
              <span className="font-medium">{selectedClient}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showClientDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                <div
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
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
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <div className="text-sm mb-2">Total Receivable</div>
          <div className="text-3xl font-bold">₹ {stats.totalReceivable.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-red-400 text-white p-6 rounded-lg">
          <div className="text-sm mb-2">Overdue Receivable</div>
          <div className="text-3xl font-bold">₹ {stats.overdueAmount.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg">
          <div className="text-sm mb-2 text-gray-600">0-30 Days</div>
          <div className="text-3xl font-bold">₹ {stats.days0to30.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-blue-100 p-6 rounded-lg">
          <div className="text-sm mb-2 text-gray-600">31-60 Days</div>
          <div className="text-3xl font-bold">₹ {stats.days31to60.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue vs Receivables Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue vs Receivables (in Lakhs)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Receivables" stroke="#93c5fd" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pending & Overdue Invoices */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Invoices</h2>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600">{stats.pendingInvoices}</div>
                <div className="text-sm text-gray-600 mt-2">Invoices Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Overdue Invoices</h2>
            <div className="flex items-center justify-center">
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
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Overdue Invoices</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Invoice</th>
                <th className="text-right py-2">Days Overdue</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No overdue invoices
                  </td>
                </tr>
              ) : (
                overdueInvoices.map((invoice, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3">{invoice.customerName}</td>
                    <td className="py-3">{invoice.invoiceNumber}</td>
                    <td className="text-right text-red-600 font-medium">{invoice.daysOverdue} days</td>
                    <td className="text-right font-semibold">₹ {invoice.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Unapplied Credits</h2>
            <div className="text-4xl font-bold text-blue-600">₹ {stats.unappliedCredits.toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 mt-2">Available credit notes</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Outstanding</h2>
            <div className="text-4xl font-bold text-orange-600">₹ {Math.abs(stats.outstanding).toLocaleString('en-IN')}</div>
            <p className="text-sm text-gray-600 mt-2">Total outstanding amount</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReceivableDashboard;

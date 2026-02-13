import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const TaxReport = () => {
  const [taxData, setTaxData] = useState(null);
  const [taxDetails, setTaxDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('current_financial_year');

  useEffect(() => {
    fetchTaxData();
  }, [timePeriod]);

  const fetchTaxData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://nextbook-backend.nextsphere.co.in/api/tax-report/summary?timePeriod=${timePeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaxData(response.data.data);
      setTaxDetails(response.data.details || []);
    } catch (error) {
      console.error('Error fetching tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 bg-gray-50 min-h-screen">Loading...</div>;
  }

  const chartData = [
    { name: 'Total GST', value: taxData?.totalGST || 0 },
    { name: 'GSTR1', value: taxData?.gstr1AccountReceivable || 0 },
    { name: 'GSTR2B', value: taxData?.gstr2b || 0 },
    { name: 'Mismatched', value: taxData?.mismatchedAmount || 0 },
    { name: 'TDS Payable', value: taxData?.totalTDSPayable || 0 },
    { name: 'TDS Received', value: taxData?.totalTDSReceived || 0 },
    { name: 'TDS Receivable', value: taxData?.totalTDSReceivable || 0 }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tax Report</h1>

      {/* Filters Section */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="relative">
            <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Summary</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <div className="relative">
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_financial_year">Current Financial Year</option>
              <option value="previous_financial_year">Previous Financial Year</option>
              <option value="current_month">Current Month</option>
              <option value="previous_month">Previous Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="previous_quarter">Previous Quarter</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Summary Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 break-words">₹{taxData?.totalGST?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total GST</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">₹{taxData?.gstr1AccountReceivable?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total GSTR1</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">₹{taxData?.gstr2b?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total GSTR2B</div>
        </div>
      </div>

      {/* Additional Cards - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-red-600 mb-1 break-words">₹{taxData?.mismatchedAmount?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Mismatched Amount (GSTR1 & GSTR2B)</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">₹{taxData?.totalTDSPayable?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total TDS Payable</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">₹{taxData?.totalTDSReceived?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total TDS Received</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-gray-400 mb-1 break-words">₹{taxData?.totalTDSReceivable?.toLocaleString('en-IN') || '0'}</div>
          <div className="text-sm text-gray-500">Total TDS Receivable</div>
        </div>
      </div>

      {/* Tax Summary Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Summary</h3>
        <div className="w-full" style={{ height: '550px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                interval={0}
              />
              <YAxis 
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
                width={80}
              />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} maxBarSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tax Details Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tax Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {taxDetails.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-700">{item.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.taxType}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">₹{item.amount?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxReport;

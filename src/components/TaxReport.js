import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
import axios from 'axios';

const TaxReport = () => {
  const [taxData, setTaxData] = useState(null);
  const [taxDetails, setTaxDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('current_financial_year');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTaxData();
  }, [timePeriod]);

  const fetchTaxData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/tax-report/summary?timePeriod=${timePeriod}`, {
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
    { name: 'Total GST', value: taxData?.totalGST || 0, type: 'positive' },
    { name: 'GSTR1', value: taxData?.gstr1AccountReceivable || 0, type: 'positive' },
    { name: 'GSTR2B', value: taxData?.gstr2b || 0, type: 'positive' },
    { name: 'Mismatched', value: taxData?.mismatchedAmount || 0, type: 'positive' },
    { name: 'TDS Payable', value: taxData?.totalTDSPayable || 0, type: 'positive' },
    { name: 'TDS Received', value: taxData?.totalTDSReceived || 0, type: 'positive' },
    { name: 'TDS Receivable', value: taxData?.totalTDSReceivable || 0, type: 'positive' }
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
        <div className="w-full overflow-auto" style={{ height: '550px' }}>
          <div style={{ minWidth: isSmallScreen ? '800px' : '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 40, right: 30, left: 60, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={false}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#374151', fontWeight: 500 }}
                tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
                width={80}
                axisLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
              />
              <Tooltip 
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <ReferenceLine y={0} stroke="#1F2937" strokeWidth={3} />
              <Bar dataKey="value" maxBarSize={60} fill="#3B82F6" radius={[8, 8, 0, 0]}>
                <LabelList 
                  dataKey="name" 
                  position="bottom"
                  style={{ fill: '#374151', fontSize: isSmallScreen ? '9px' : '11px', fontWeight: 500 }}
                  offset={5}
                  angle={isSmallScreen ? -45 : 0}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
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

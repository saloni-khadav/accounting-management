import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText, Receipt, AlertCircle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
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
    setLoading(true);
    try {
      const response = await axios.get(`https://nextbook-backend.nextsphere.co.in/api/tax-report/summary?timePeriod=${timePeriod}`);
      
      if (response.data.success) {
        setTaxData(response.data.data);
        setTaxDetails(response.data.details || []);
      } else {
        setTaxData({
          totalGST: 0,
          gstr1AccountReceivable: 0,
          gstr2b: 0,
          mismatchedAmount: 0,
          totalTDSPayable: 0,
          totalTDSReceived: 0,
          totalTDSReceivable: 0
        });
        setTaxDetails([]);
      }
    } catch (error) {
      console.error('Error fetching tax data:', error.response?.data || error.message);
      setTaxData({
        totalGST: 0,
        gstr1AccountReceivable: 0,
        gstr2b: 0,
        mismatchedAmount: 0,
        totalTDSPayable: 0,
        totalTDSReceived: 0,
        totalTDSReceivable: 0
      });
      setTaxDetails([]);
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Tax Report</h1>
          <p className="text-gray-500 text-sm sm:text-base">Comprehensive tax summary and analysis</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                <select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white">
                  <option>Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
                <select 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="current_financial_year">Current Financial Year</option>
                  <option value="previous_financial_year">Previous Financial Year</option>
                  <option value="current_month">Current Month</option>
                  <option value="previous_month">Previous Month</option>
                  <option value="current_quarter">Current Quarter</option>
                  <option value="previous_quarter">Previous Quarter</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total GST</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.totalGST?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total GSTR1</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.gstr1AccountReceivable?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total GSTR2B</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.gstr2b?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Cards - Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Mismatched Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">₹{taxData?.mismatchedAmount?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total TDS Payable</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.totalTDSPayable?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingDown className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total TDS Received</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.totalTDSReceived?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total TDS Receivable</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{taxData?.totalTDSReceivable?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tax Summary Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Tax Summary</h3>
          </div>
          <div className="p-4 sm:p-6">
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
        </div>

        {/* Tax Details Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Tax Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Tax Type</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxDetails.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">{item.date}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900">{item.taxType}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900">{item.category}</td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{item.amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxReport;

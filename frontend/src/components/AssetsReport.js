import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AssetsReport = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [reportData, setReportData] = useState({
    categoryData: [],
    locationData: [],
    summary: {
      totalAssets: 0,
      totalValue: 0,
      currentValue: 0,
      totalDepreciation: 0
    }
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, dateRange, selectedCategory]);

  const applyFilters = () => {
    let filtered = [...assets];

    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    if (dateRange.start) {
      filtered = filtered.filter(asset => new Date(asset.purchaseDate) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(asset => new Date(asset.purchaseDate) <= new Date(dateRange.end));
    }

    setFilteredAssets(filtered);
    generateReportData(filtered);
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
      const data = await response.json();
      setAssets(data);
      setFilteredAssets(data);
      generateReportData(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  const generateReportData = (assetsData) => {
    const categoryTotals = assetsData.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = { count: 0, value: 0, active: 0, disposed: 0 };
      }
      acc[asset.category].count++;
      acc[asset.category].value += asset.purchaseValue;
      if (asset.status === 'Active') acc[asset.category].active++;
      if (asset.status === 'Disposed') acc[asset.category].disposed++;
      return acc;
    }, {});

    const totalValue = assetsData.reduce((sum, asset) => sum + asset.purchaseValue, 0);
    const colors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    const categoryData = Object.entries(categoryTotals).map(([category, data], index) => ({
      name: category,
      value: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
      amount: data.value,
      count: data.count,
      active: data.active,
      disposed: data.disposed,
      color: colors[index % colors.length]
    }));

    const locationTotals = assetsData.reduce((acc, asset) => {
      const location = asset.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = { count: 0, value: 0 };
      }
      acc[location].count++;
      acc[location].value += asset.purchaseValue;
      return acc;
    }, {});

    const locationData = Object.entries(locationTotals).map(([location, data]) => ({
      location,
      assets: data.count,
      value: data.value
    }));

    const totalDepreciation = assetsData.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0);
    
    setReportData({
      categoryData,
      locationData,
      summary: {
        totalAssets: assetsData.length,
        totalValue,
        currentValue: totalValue - totalDepreciation,
        totalDepreciation
      }
    });
  };

  const reportTypes = [
    { value: 'summary', label: 'Asset Summary Report' },
    { value: 'depreciation', label: 'Depreciation Report' },
    { value: 'category', label: 'Category-wise Report' },
    { value: 'location', label: 'Location-wise Report' },
    { value: 'valuation', label: 'Asset Valuation Report' },
    { value: 'disposal', label: 'Asset Disposal Report' }
  ];

  const categories = ['All Categories', 'IT Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Buildings'];

  const depreciationTrend = [
    { month: 'Jan', depreciation: 8000, accumulated: 50000 },
    { month: 'Feb', depreciation: 8200, accumulated: 58200 },
    { month: 'Mar', depreciation: 8100, accumulated: 66300 },
    { month: 'Apr', depreciation: 8300, accumulated: 74600 },
    { month: 'May', depreciation: 8150, accumulated: 82750 },
    { month: 'Jun', depreciation: 8400, accumulated: 91150 }
  ];

  const handleExportReport = () => {
    const reportName = reportTypes.find(r => r.value === reportType)?.label;
    let csv = 'Asset Name,Asset Code,Category,Purchase Date,Purchase Value,Status,Accumulated Depreciation,Net Value\n';
    filteredAssets.forEach(asset => {
      const netValue = asset.purchaseValue - (asset.accumulatedDepreciation || 0);
      csv += `"${asset.assetName}","${asset.assetCode}","${asset.category}","${new Date(asset.purchaseDate).toLocaleDateString()}","${asset.purchaseValue}","${asset.status}","${asset.accumulatedDepreciation || 0}","${netValue}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderSummaryReport = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading report data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-700">Total Assets</h3>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{reportData.summary.totalAssets}</p>
              <p className="text-sm text-blue-600 mt-2">Across all categories</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-green-700">Total Value</h3>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-900">₹{reportData.summary.totalValue.toLocaleString('en-IN')}</p>
              <p className="text-sm text-green-600 mt-2">Original purchase value</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-purple-700">Current Value</h3>
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-purple-900">₹{reportData.summary.currentValue.toLocaleString('en-IN')}</p>
              <p className="text-sm text-purple-600 mt-2">After depreciation</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-red-700">Depreciation</h3>
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-red-900">₹{reportData.summary.totalDepreciation.toLocaleString('en-IN')}</p>
              <p className="text-sm text-red-600 mt-2">Accumulated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Asset Distribution by Category</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={reportData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={true}
                    >
                      {reportData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {reportData.categoryData.map((item, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="w-4 h-4 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 block truncate">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Asset Value by Category</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value/100000}L`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Category Summary</h3>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{reportData.categoryData.length} Categories</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Total Assets</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Active</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Disposed</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.categoryData.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{item.count}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {item.active}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          {item.disposed}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderDepreciationReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Depreciation Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={depreciationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="depreciation" stroke="#ef4444" strokeWidth={2} name="Monthly Depreciation" />
              <Line type="monotone" dataKey="accumulated" stroke="#3b82f6" strokeWidth={2} name="Accumulated Depreciation" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderLocationReport = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Location</h3>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading location data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Number of Assets</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportData.locationData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.location}</td>
                  <td className="py-3 px-4 text-gray-600">{item.assets}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">₹{item.value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-blue-600">
                    {reportData.summary.totalValue > 0 
                      ? ((item.value / reportData.summary.totalValue) * 100).toFixed(1)
                      : 0
                    }%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'summary':
        return renderSummaryReport();
      case 'depreciation':
        return renderDepreciationReport();
      case 'location':
        return renderLocationReport();
      default:
        return renderSummaryReport();
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center tracking-tight">
          <FileText className="mr-3 text-blue-600" size={32} />
          Assets Report
        </h1>
        <p className="text-gray-600 text-lg">Generate comprehensive reports on your asset portfolio</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="mr-2 text-blue-600" />
            Report Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExportReport}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {renderReportContent()}
    </div>
  );
};

export default AssetsReport;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total Assets</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">{reportData.summary.totalAssets}</p>
                  <p className="text-xs text-gray-400 mt-1">Across all categories</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{reportData.summary.totalValue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">Original purchase value</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Current Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{reportData.summary.currentValue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">After depreciation</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <PieChart size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Depreciation</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{reportData.summary.totalDepreciation.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">Accumulated</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6" strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
                <h3 className="text-base sm:text-lg font-semibold text-white">Asset Distribution by Category</h3>
              </div>
              <div className="p-4 sm:p-6">
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
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
                <h3 className="text-base sm:text-lg font-semibold text-white">Asset Value by Category</h3>
              </div>
              <div className="p-4 sm:p-6">
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Category Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Total Assets</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Active</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Disposed</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.categoryData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                          <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium text-sm">{item.count}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {item.active}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          {item.disposed}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 text-sm">₹{item.amount.toLocaleString()}</td>
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Assets Report</h1>
            <p className="text-white text-sm sm:text-base">Generate comprehensive reports on your asset portfolio</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleExportReport}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {renderReportContent()}
      </div>
    </div>
  );
};

export default AssetsReport;

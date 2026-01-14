import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AssetsReport = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
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

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/assets');
      const data = await response.json();
      setAssets(data);
      generateReportData(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  const generateReportData = (assetsData) => {
    // Category-wise data
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

    // Location-wise data
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

  // Sample depreciation trend data (would need proper calculation)
  const depreciationTrend = [
    { month: 'Jan', depreciation: 8000, accumulated: 50000 },
    { month: 'Feb', depreciation: 8200, accumulated: 58200 },
    { month: 'Mar', depreciation: 8100, accumulated: 66300 },
    { month: 'Apr', depreciation: 8300, accumulated: 74600 },
    { month: 'May', depreciation: 8150, accumulated: 82750 },
    { month: 'Jun', depreciation: 8400, accumulated: 91150 }
  ];

  const handleExportReport = () => {
    alert(`Exporting ${reportTypes.find(r => r.value === reportType)?.label}...`);
  };

  const renderSummaryReport = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading report data...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-600 mb-2">Total Assets</h3>
              <p className="text-3xl font-bold text-blue-900">{reportData.summary.totalAssets}</p>
              <p className="text-sm text-blue-600 mt-1">Across all categories</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-green-600 mb-2">Total Value</h3>
              <p className="text-3xl font-bold text-green-900">₹{(reportData.summary.totalValue/100000).toFixed(1)}L</p>
              <p className="text-sm text-green-600 mt-1">Original purchase value</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-purple-600 mb-2">Current Value</h3>
              <p className="text-3xl font-bold text-purple-900">₹{(reportData.summary.currentValue/100000).toFixed(1)}L</p>
              <p className="text-sm text-purple-600 mt-1">After depreciation</p>
            </div>
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-red-600 mb-2">Depreciation</h3>
              <p className="text-3xl font-bold text-red-900">₹{(reportData.summary.totalDepreciation/100000).toFixed(1)}L</p>
              <p className="text-sm text-red-600 mt-1">Accumulated</p>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution by Category</h3>
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
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {reportData.categoryData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Value by Category</h3>
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

          {/* Summary Table */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Assets</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Active</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Disposed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categoryData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-gray-600">{item.count}</td>
                      <td className="py-3 px-4 text-green-600">{item.active}</td>
                      <td className="py-3 px-4 text-red-600">{item.disposed}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">₹{item.amount.toLocaleString()}</td>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
          <FileText className="mr-2 text-blue-600" />
          Assets Report
        </h1>
        <p className="text-gray-600">Generate comprehensive reports on your asset portfolio</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
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
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default AssetsReport;
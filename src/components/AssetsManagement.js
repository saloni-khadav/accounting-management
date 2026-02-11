import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const AssetsManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [topAssets, setTopAssets] = useState([]);
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalDepreciation: 0,
    netValue: 0,
    monthlyDepreciation: 0
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
      calculateSummary(data);
      calculateChartData(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  const calculateSummary = async (assetsData) => {
    const totalValue = assetsData.reduce((sum, asset) => sum + asset.purchaseValue, 0);
    const totalDepreciation = assetsData.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0);
    const netValue = totalValue - totalDepreciation;
    
    // Fetch real monthly depreciation from API
    let monthlyDepreciation = 0;
    try {
      const response = await fetch('http://localhost:5001/api/depreciation/summary');
      const data = await response.json();
      monthlyDepreciation = data.monthlyTotal || 0;
    } catch (error) {
      console.error('Error fetching depreciation summary:', error);
    }
    
    setSummary({
      totalValue,
      totalDepreciation,
      netValue,
      monthlyDepreciation
    });
  };

  const calculateChartData = (assetsData) => {
    // Calculate asset allocation by category
    const categoryTotals = assetsData.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + asset.purchaseValue;
      return acc;
    }, {});
    
    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
    const colors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    const allocation = Object.entries(categoryTotals).map(([category, value], index) => ({
      name: category,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
    
    setAssetAllocation(allocation);
    
    // Get top 5 assets by value
    const sortedAssets = [...assetsData]
      .sort((a, b) => b.purchaseValue - a.purchaseValue)
      .slice(0, 5)
      .map(asset => ({
        name: asset.assetName.length > 15 ? asset.assetName.substring(0, 15) + '...' : asset.assetName,
        value: asset.purchaseValue
      }));
    
    setTopAssets(sortedAssets);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Asset Value</h3>
          <p className="text-2xl font-bold text-blue-600">₹{summary.totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Accumulated Depreciation</h3>
          <p className="text-2xl font-bold text-green-600">₹{summary.totalDepreciation.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Asset Value</h3>
          <p className="text-2xl font-bold text-purple-600">₹{summary.netValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Assets</h3>
          <p className="text-2xl font-bold text-red-600">{assets.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Asset Allocation Donut Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {assetAllocation.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets Bar Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Assets by Value</h3>
          <div className="h-80">
            {topAssets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAssets} layout="vertical" margin={{ left: 100, right: 20, top: 10, bottom: 10 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={90} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No assets data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Asset List Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assets</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Purchase Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 10).map((asset) => (
                  <tr key={asset._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{asset.assetName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{asset.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{asset.purchaseValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsManagement;
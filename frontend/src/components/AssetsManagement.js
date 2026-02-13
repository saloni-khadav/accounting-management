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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
      const data = await response.json();
      setAssets(data);
      calculateSummary(data);
      calculateChartData(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  const calculateDepreciation = (asset) => {
    const purchaseValue = asset.purchaseValue;
    const salvageValue = asset.salvageValue || 0;
    const usefulLife = asset.usefulLife || 5;
    const depreciableAmount = purchaseValue - salvageValue;
    
    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = new Date();
    const monthsElapsed = (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - purchaseDate.getMonth());
    
    const monthlyDepreciation = depreciableAmount / (usefulLife * 12);
    const calculatedDepreciation = Math.min(monthlyDepreciation * monthsElapsed, depreciableAmount);
    
    return Math.max(0, calculatedDepreciation);
  };

  const calculateSummary = async (assetsData) => {
    const totalValue = assetsData.reduce((sum, asset) => sum + asset.purchaseValue, 0);
    
    // Calculate real-time depreciation
    const totalDepreciation = assetsData.reduce((sum, asset) => {
      if (asset.status === 'Active') {
        return sum + calculateDepreciation(asset);
      }
      return sum + (asset.accumulatedDepreciation || 0);
    }, 0);
    
    const netValue = totalValue - totalDepreciation;
    
    // Calculate monthly depreciation
    const monthlyDepreciation = assetsData
      .filter(asset => asset.status === 'Active')
      .reduce((sum, asset) => {
        const purchaseValue = asset.purchaseValue;
        const salvageValue = asset.salvageValue || 0;
        const usefulLife = asset.usefulLife || 5;
        const depreciableAmount = purchaseValue - salvageValue;
        return sum + (depreciableAmount / (usefulLife * 12));
      }, 0);
    
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assets Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage your organization's assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-700">Total Asset Value</h3>
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-blue-900">₹{summary.totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-orange-700">Accumulated Depreciation</h3>
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-orange-900">₹{summary.totalDepreciation.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-green-700">Net Asset Value</h3>
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-900">₹{summary.netValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-indigo-700">Total Assets</h3>
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-indigo-900">{assets.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Allocation Donut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900">Asset Allocation</h3>
          </div>
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
          <div className="grid grid-cols-2 gap-3 mt-6">
            {assetAllocation.map((item, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0`} style={{ backgroundColor: item.color }}></div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 block truncate">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900">Top Assets by Value</h3>
          </div>
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
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900">Recent Assets</h3>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{assets.length} Total</span>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Asset Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Purchase Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Asset Value</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets.slice(0, 10).map((asset, index) => (
                  <tr key={asset._id} className="hover:bg-blue-50 transition-colors duration-150 group">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-3 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                          <span className="text-blue-700 font-bold text-sm">{asset.assetName.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{asset.assetName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">₹{asset.purchaseValue.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                        asset.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          asset.status === 'Active' ? 'bg-green-500' :
                          asset.status === 'Under Maintenance' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></span>
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
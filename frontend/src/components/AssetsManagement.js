import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingDown, CheckCircle, Package } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Assets Management</h1>
            <p className="text-white text-sm sm:text-base">Monitor and manage your organization's assets</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total Asset Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{summary.totalValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <DollarSign size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Accumulated Depreciation</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{summary.totalDepreciation.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <TrendingDown size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Net Asset Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{summary.netValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <CheckCircle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total Assets</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">{assets.length}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <Package size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {/* Asset Allocation Donut Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Asset Allocation</h3>
            </div>
            <div className="p-4 sm:p-6">
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
          </div>

          {/* Top Assets Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Top Assets by Value</h3>
            </div>
            <div className="p-4 sm:p-6">
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
        </div>

        {/* Asset List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Recent Assets</h3>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading assets...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Asset Name</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Purchase Date</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Asset Value</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.slice(0, 10).map((asset, index) => (
                    <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">{asset.assetName}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {asset.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">{new Date(asset.purchaseDate).toLocaleDateString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{asset.purchaseValue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
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
    </div>
  );
};

export default AssetsManagement;

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Calendar, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Depreciation = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [calculationMethod, setCalculationMethod] = useState('straight-line');
  const [isCalculating, setIsCalculating] = useState(false);
  const [depreciationData, setDepreciationData] = useState({
    monthlyTotal: 0,
    ytdTotal: 0,
    accumulatedTotal: 0,
    netBookValue: 0
  });
  const [depreciationSchedule, setDepreciationSchedule] = useState([]);
  const [monthlyDepreciation, setMonthlyDepreciation] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      fetchDepreciationSummary();
      fetchMonthlyTrend();
    }
  }, [assets, selectedAsset]);

  useEffect(() => {
    if (selectedAsset) {
      fetchDepreciationSchedule(selectedAsset);
    } else {
      setDepreciationSchedule([]);
    }
  }, [selectedAsset]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/assets');
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      showNotification('Error fetching assets', 'error');
    }
    setLoading(false);
  };

  const calculateRealTimeDepreciation = (asset) => {
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

  const fetchDepreciationSummary = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/assets');
      const assetsData = await response.json();
      
      // Filter assets based on selection
      const filteredAssets = selectedAsset 
        ? assetsData.filter(a => a._id === selectedAsset)
        : assetsData.filter(a => a.status === 'Active');
      
      let monthlyTotal = 0;
      let accumulatedTotal = 0;
      let totalValue = 0;
      
      filteredAssets.forEach(asset => {
        const purchaseValue = asset.purchaseValue;
        const salvageValue = asset.salvageValue || 0;
        const usefulLife = asset.usefulLife || 5;
        const depreciableAmount = purchaseValue - salvageValue;
        monthlyTotal += depreciableAmount / (usefulLife * 12);
        accumulatedTotal += calculateRealTimeDepreciation(asset);
        totalValue += purchaseValue;
      });
      
      const currentMonth = new Date().getMonth() + 1;
      const ytdTotal = monthlyTotal * currentMonth;
      
      setDepreciationData({
        monthlyTotal: Math.round(monthlyTotal),
        ytdTotal: Math.round(ytdTotal),
        accumulatedTotal: Math.round(accumulatedTotal),
        netBookValue: Math.round(totalValue - accumulatedTotal)
      });
    } catch (error) {
      console.error('Error fetching depreciation summary:', error);
    }
  };

  const fetchMonthlyTrend = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/depreciation/trend');
      const data = await response.json();
      setMonthlyDepreciation(data);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const fetchDepreciationSchedule = async (assetId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/depreciation/schedule/${assetId}`);
      const data = await response.json();
      setDepreciationSchedule(data.schedule || []);
    } catch (error) {
      console.error('Error fetching depreciation schedule:', error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const depreciationMethods = [
    { value: 'straight-line', label: 'Straight Line Method' },
    { value: 'declining-balance', label: 'Declining Balance Method' },
    { value: 'sum-of-years', label: 'Sum of Years Digits' },
    { value: 'units-of-production', label: 'Units of Production' }
  ];

  const sampleSchedule = [
    { year: 'Year 1', opening: 500000, depreciation: 25000, accumulated: 25000, closing: 475000, rate: '5.00' },
    { year: 'Year 2', opening: 475000, depreciation: 25000, accumulated: 50000, closing: 450000, rate: '5.00' },
    { year: 'Year 3', opening: 450000, depreciation: 25000, accumulated: 75000, closing: 425000, rate: '5.00' },
    { year: 'Year 4', opening: 425000, depreciation: 25000, accumulated: 100000, closing: 400000, rate: '5.00' },
    { year: 'Year 5', opening: 400000, depreciation: 25000, accumulated: 125000, closing: 375000, rate: '5.00' }
  ];

  const displaySchedule = depreciationSchedule.length > 0 ? depreciationSchedule : sampleSchedule;

  const handleCalculateDepreciation = async () => {
    setIsCalculating(true);
    try {
      // Recalculate and refresh the summary
      await fetchDepreciationSummary();
      await fetchAssets();
      if (selectedAsset) {
        await fetchDepreciationSchedule(selectedAsset);
      }
      showNotification('Depreciation calculated successfully', 'success');
    } catch (error) {
      console.error('Error calculating depreciation:', error);
      showNotification('Error calculating depreciation', 'error');
    }
    setIsCalculating(false);
  };

  const handleRunMonthlyDepreciation = async () => {
    if (!window.confirm('Run monthly depreciation for all active assets? This will update accumulated depreciation values.')) {
      return;
    }
    
    setIsCalculating(true);
    try {
      const response = await fetch('http://localhost:5001/api/depreciation/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to run monthly depreciation');
      }
      
      const data = await response.json();
      showNotification(`Monthly depreciation completed: ${data.processed} assets processed`, 'success');
      
      // Refresh all data
      await fetchDepreciationSummary();
      await fetchAssets();
      await fetchMonthlyTrend();
    } catch (error) {
      console.error('Error running monthly depreciation:', error);
      showNotification('Error running monthly depreciation', 'error');
    }
    setIsCalculating(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center tracking-tight">
          <Calculator className="mr-3 text-blue-600" size={32} />
          Depreciation Management
        </h1>
        <p className="text-gray-600 text-lg">Calculate and manage asset depreciation schedules</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-2 text-blue-600" />
            Depreciation Controls
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assets</option>
              {assets.map(asset => (
                <option key={asset._id} value={asset._id}>{asset.assetName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {depreciationMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateDepreciation}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              Calculate
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunMonthlyDepreciation}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-700">Monthly Depreciation</h3>
            <TrendingDown className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-900">₹{depreciationData.monthlyTotal.toLocaleString()}</p>
          <p className="text-sm text-blue-600 mt-2">Current month</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-green-700">YTD Depreciation</h3>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900">₹{depreciationData.ytdTotal.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">Year to date</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-purple-700">Accumulated</h3>
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-900">₹{depreciationData.accumulatedTotal.toLocaleString()}</p>
          <p className="text-sm text-purple-600 mt-2">Total accumulated</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-orange-700">Net Book Value</h3>
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-orange-900">₹{depreciationData.netBookValue.toLocaleString()}</p>
          <p className="text-sm text-orange-600 mt-2">Current value</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Depreciation Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-red-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingDown className="mr-2 text-red-600" />
              Monthly Depreciation
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDepreciation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Depreciation']} />
                <Bar dataKey="depreciation" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Depreciation Trend */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900">Accumulated Depreciation Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displaySchedule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="accumulated" stroke="#3b82f6" strokeWidth={2} name="Accumulated Depreciation" />
                <Line type="monotone" dataKey="closing" stroke="#10b981" strokeWidth={2} name="Net Book Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Depreciation Schedule Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900">Depreciation Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Period</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Opening Value</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Depreciation</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Accumulated</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Closing Value</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displaySchedule.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="py-4 px-6 font-semibold text-gray-900">{item.year}</td>
                  <td className="py-4 px-6 text-gray-700 font-medium">₹{item.opening.toLocaleString()}</td>
                  <td className="py-4 px-6 text-red-600 font-bold">₹{item.depreciation.toLocaleString()}</td>
                  <td className="py-4 px-6 text-orange-600 font-bold">₹{item.accumulated.toLocaleString()}</td>
                  <td className="py-4 px-6 text-green-600 font-bold">₹{item.closing.toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-700 font-medium">{item.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset-wise Depreciation */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-900">Asset-wise Depreciation Summary</h3>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{assets.length} Assets</span>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Asset Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Asset Code</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Original Value</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Method</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Useful Life</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Monthly Dep.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Accumulated</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets
                  .filter(asset => selectedAsset ? asset._id === selectedAsset : true)
                  .map((asset) => {
                  const salvageValue = asset.salvageValue || 0;
                  const depreciableAmount = asset.purchaseValue - salvageValue;
                  const monthlyDep = asset.usefulLife ? Math.round(depreciableAmount / (asset.usefulLife * 12)) : 0;
                  const accumulated = Math.round(calculateRealTimeDepreciation(asset));
                  const netValue = asset.purchaseValue - accumulated;
                  
                  return (
                    <tr key={asset._id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold text-gray-900">{asset.assetName}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {asset.assetCode}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-bold">₹{asset.purchaseValue.toLocaleString()}</td>
                      <td className="py-4 px-6 text-gray-700 capitalize">{asset.depreciationMethod?.replace('-', ' ') || 'straight line'}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{asset.usefulLife ? `${asset.usefulLife} years` : '5 years'}</td>
                      <td className="py-4 px-6 text-red-600 font-bold">₹{monthlyDep.toLocaleString()}</td>
                      <td className="py-4 px-6 text-orange-600 font-bold">₹{accumulated.toLocaleString()}</td>
                      <td className="py-4 px-6 text-green-600 font-bold">₹{netValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Depreciation;

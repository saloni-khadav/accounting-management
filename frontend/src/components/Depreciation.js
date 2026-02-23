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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/depreciation/trend');
      const data = await response.json();
      setMonthlyDepreciation(data);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const fetchDepreciationSchedule = async (assetId) => {
    try {
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/depreciation/schedule/${assetId}`);
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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/depreciation/run-monthly', {
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {notification.show && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        )}

        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Depreciation Management</h1>
            <p className="text-white text-sm sm:text-base">Calculate and manage asset depreciation schedules</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="">All Assets</option>
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>{asset.assetName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Calculation Method</label>
                <select
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
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
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
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
                  className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Monthly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Monthly Depreciation</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{depreciationData.monthlyTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Current month</p>
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">YTD Depreciation</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{depreciationData.ytdTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Year to date</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <Calendar size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Accumulated</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{depreciationData.accumulatedTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total accumulated</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <Calculator size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Net Book Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{depreciationData.netBookValue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Current value</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <TrendingDown size={20} className="sm:w-6 sm:h-6" strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Monthly Depreciation</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDepreciation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Depreciation']} />
                <Bar dataKey="depreciation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Accumulated Depreciation Trend</h3>
            </div>
            <div className="p-4 sm:p-6">
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
        </div>

        {/* Depreciation Schedule Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Depreciation Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Period</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Opening Value</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Depreciation</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Accumulated</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Closing Value</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displaySchedule.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 text-sm">{item.year}</td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium text-sm">₹{item.opening.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-red-600 font-semibold text-sm">₹{item.depreciation.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-orange-600 font-semibold text-sm">₹{item.accumulated.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-green-600 font-semibold text-sm">₹{item.closing.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium text-sm">{item.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset-wise Depreciation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">Asset-wise Depreciation Summary</h3>
              <span className="text-xs sm:text-sm text-white bg-white/20 px-3 py-1 rounded-full">{assets.length} Assets</span>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading assets...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Asset Name</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Asset Code</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Original Value</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Method</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Useful Life</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Dep.</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Accumulated</th>
                    <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Net Value</th>
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
                      <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 text-sm">{asset.assetName}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {asset.assetCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-900 font-semibold text-sm">₹{asset.purchaseValue.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-gray-700 capitalize text-sm">{asset.depreciationMethod?.replace('-', ' ') || 'straight line'}</td>
                        <td className="py-3.5 px-4 text-gray-700 font-medium text-sm">{asset.usefulLife ? `${asset.usefulLife} years` : '5 years'}</td>
                        <td className="py-3.5 px-4 text-red-600 font-semibold text-sm">₹{monthlyDep.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-orange-600 font-semibold text-sm">₹{accumulated.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-green-600 font-semibold text-sm">₹{netValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Depreciation;


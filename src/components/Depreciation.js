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
    fetchDepreciationSummary();
    fetchMonthlyTrend();
  }, []);

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

  const fetchDepreciationSummary = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/depreciation/summary');
      const data = await response.json();
      setDepreciationData(data);
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
      const response = await fetch('http://localhost:5001/api/depreciation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset || null,
          method: calculationMethod
        })
      });
      const data = await response.json();
      showNotification(`Depreciation calculated for ${data.count} asset(s)`, 'success');
      await fetchDepreciationSummary();
      await fetchAssets();
    } catch (error) {
      console.error('Error calculating depreciation:', error);
      showNotification('Error calculating depreciation', 'error');
    }
    setIsCalculating(false);
  };

  const handleRunMonthlyDepreciation = async () => {
    if (!window.confirm('Are you sure you want to run monthly depreciation for all active assets?')) {
      return;
    }
    
    setIsCalculating(true);
    try {
      const response = await fetch('http://localhost:5001/api/depreciation/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      showNotification(`Monthly depreciation completed: ${data.processed} assets processed`, 'success');
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
          <Calculator className="mr-2 text-blue-600" />
          Depreciation Management
        </h1>
        <p className="text-gray-600">Calculate and manage asset depreciation schedules</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2 text-blue-600" />
          Depreciation Controls
        </h3>
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
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
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
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Depreciation</h3>
          <p className="text-2xl font-bold text-blue-600">₹{depreciationData.monthlyTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Current month</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">YTD Depreciation</h3>
          <p className="text-2xl font-bold text-green-600">₹{depreciationData.ytdTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Year to date</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Accumulated</h3>
          <p className="text-2xl font-bold text-purple-600">₹{depreciationData.accumulatedTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total accumulated</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Book Value</h3>
          <p className="text-2xl font-bold text-orange-600">₹{depreciationData.netBookValue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Current value</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Depreciation Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="mr-2 text-red-600" />
            Monthly Depreciation
          </h3>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accumulated Depreciation Trend</h3>
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
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Period</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Opening Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Depreciation</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Accumulated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Closing Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rate %</th>
              </tr>
            </thead>
            <tbody>
              {displaySchedule.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.year}</td>
                  <td className="py-3 px-4 text-gray-600">₹{item.opening.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-600 font-medium">₹{item.depreciation.toLocaleString()}</td>
                  <td className="py-3 px-4 text-orange-600 font-medium">₹{item.accumulated.toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600 font-medium">₹{item.closing.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{item.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset-wise Depreciation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset-wise Depreciation Summary</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading assets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Asset Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Asset Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Original Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Useful Life</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Monthly Dep.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Accumulated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Net Value</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const monthlyDep = asset.usefulLife ? Math.round(asset.purchaseValue / (asset.usefulLife * 12)) : 0;
                  const accumulated = asset.accumulatedDepreciation || 0;
                  const netValue = asset.purchaseValue - accumulated;
                  
                  return (
                    <tr key={asset._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{asset.assetName}</td>
                      <td className="py-3 px-4 text-gray-600">{asset.assetCode}</td>
                      <td className="py-3 px-4 text-gray-900">₹{asset.purchaseValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{asset.depreciationMethod?.replace('-', ' ') || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{asset.usefulLife ? `${asset.usefulLife} years` : 'N/A'}</td>
                      <td className="py-3 px-4 text-red-600">₹{monthlyDep.toLocaleString()}</td>
                      <td className="py-3 px-4 text-orange-600">₹{accumulated.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-600 font-medium">₹{netValue.toLocaleString()}</td>
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

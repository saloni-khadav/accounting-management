import React, { useState, useRef } from 'react';
import { Plus, FileText, Upload, Banknote, Wallet, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricsCard from './ui/MetricsCard';

const BankDashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const inflowOutflowData = [
    { month: 'May', inflow: 1.5, outflow: 0.8 },
    { month: 'Jun', inflow: 1.2, outflow: 1.0 },
    { month: 'Jul', inflow: 1.8, outflow: 0.6 },
    { month: 'Aug', inflow: 2.5, outflow: 0.5 },
    { month: 'Sep', inflow: 2.2, outflow: 1.2 },
    { month: 'Oct', inflow: 1.8, outflow: 0.8 },
    { month: 'Nov', inflow: 2.3, outflow: 1.0 },
    { month: 'Apr', inflow: 2.6, outflow: 0.9 },
  ];

  const cashFlowData = [
    { day: 1, value: 5 },
    { day: 2, value: 3.5 },
    { day: 3, value: 4 },
    { day: 4, value: 5.5 },
    { day: 5, value: 4.5 },
    { day: 6, value: 6 },
    { day: 7, value: 6.5 },
  ];

  const reconciliationData = [
    { name: 'Matched', value: 79, color: '#1e40af' },
    { name: 'Unmatched', value: 15, color: '#3b82f6' },
    { name: 'Suggested', value: 6, color: '#93c5fd' },
  ];

  const metricsData = [
    {
      title: 'Total Bank Balance',
      value: '₹5,23,000',
      icon: Banknote,
      color: 'primary'
    },
    {
      title: 'Cash Balance',
      value: '₹54,000',
      icon: Wallet,
      color: 'success'
    },
    {
      title: 'Uncleared Cheques',
      value: '12',
      icon: CreditCard,
      color: 'warning'
    }
  ];

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('bankName', 'Default Bank');
    formData.append('period', new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));

    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      const response = await fetch(`${baseUrl}/api/bank-statements/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Bank statement uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFile(null);
        window.location.href = '/bank-statement-upload';
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      alert('Error uploading file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bank Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Monitor your bank accounts, cash flow, and reconciliation status.</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          {metricsData.map((metric, index) => (
            <div key={index} className="transform transition-all duration-200 hover:-translate-y-1">
              <MetricsCard {...metric} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {/* Monthly Bank Inflow vs Outflow */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Monthly Bank Inflow vs Outflow</h3>
            </div>
            <div className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={inflowOutflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${value} L`} />
                  <Tooltip formatter={(value) => `₹${value}L`} />
                  <Line type="monotone" dataKey="inflow" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="outflow" stroke="#93c5fd" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reconciliation Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Reconciliation Status</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={reconciliationData}
                      cx={100}
                      cy={100}
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {reconciliationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-bold text-gray-900">79%</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {reconciliationData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cash Flow Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Cash Flow Trend</h3>
            </div>
            <div className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cashFlowData}>
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Last 7 days</span>
                </div>
                <span className="text-gray-600">Last 7 Days</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-900">7</span>
                <span className="text-gray-900">Today</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <button onClick={() => window.location.href = '/payments'} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900">Add Payment</span>
                </button>
                <button onClick={() => window.location.href = '/collections'} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900">Add Receipt</span>
                </button>
                <button onClick={() => setShowUploadModal(true)} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900">Upload Bank Statement</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Recent Transactions</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">₹4,97,300</span>
                  <span className="text-green-600 text-sm">+70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">₹74,000</span>
                  <span className="text-orange-600 text-sm">+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">₹57,700</span>
                  <span className="text-blue-600 text-sm">+6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Bank Statement</h3>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf" 
              onChange={handleFileSelect}
              className="w-full mb-4 p-2 border rounded" 
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mb-4">Selected: {selectedFile.name}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpload} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDashboard;

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const AssetsManagement = () => {
  const assetAllocation = [
    { name: 'Machinery', value: 35, color: '#1e40af' },
    { name: 'Vehicles', value: 30, color: '#3b82f6' },
    { name: 'Buildings', value: 35, color: '#60a5fa' }
  ];

  const topAssets = [
    { name: 'Delivery Truck', value: 25000 },
    { name: 'Office Building', value: 300000 },
    { name: 'Forklift', value: 20000 },
    { name: 'Computer Equip.', value: 10000 },
    { name: 'Warehouse', value: 145000 }
  ];

  const assetList = [
    { name: 'Forklift', type: 'Machinery', date: '04/10/2022', value: '$20,000', depreciation: '$4,000' },
    { name: 'Delivery Truck', type: 'Vehicle', date: '12/05/2021', value: '$25,000', depreciation: '$7,000' },
    { name: 'Office Building', type: 'Buildings', date: '08/20/2018', value: '$300,000', depreciation: '$20,000' },
    { name: 'Computer Equipment', type: 'Machinery', date: '03/15/2023', value: '$10,000', depreciation: '$1,000' },
    { name: 'Warehouse', type: 'Buildings', date: '11/30/2017', value: '$145,000', depreciation: '$3,000' }
  ];

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
          <p className="text-2xl font-bold text-blue-600">$500,000</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Accumulated</h3>
          <p className="text-2xl font-bold text-green-600">$50,000</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Asset Value</h3>
          <p className="text-2xl font-bold text-purple-600">$450,000</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Current Month</h3>
          <p className="text-2xl font-bold text-red-600">$2,000</p>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAssets} layout="horizontal" margin={{ left: 80 }}>
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" fill="url(#blueGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset List Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset List</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Purchase Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Accum. Depreciation</th>
              </tr>
            </thead>
            <tbody>
              {assetList.map((asset, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{asset.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{asset.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{asset.date}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{asset.value}</td>
                  <td className="py-3 px-4 text-sm text-red-600 font-medium">{asset.depreciation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsManagement;
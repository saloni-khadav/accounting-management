import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, FileText, Calendar, Filter, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const TDSReconciliation = () => {
  const [tdsData, setTdsData] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: '',
    deductorType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const mockTdsData = [
    {
      id: 1,
      challanNo: 'TDS001',
      deductorName: 'ABC Corp Ltd',
      deductorTAN: 'ABCD12345E',
      deductionDate: '2024-01-15',
      amount: 50000,
      tdsDeducted: 5000,
      section: '194C',
      status: 'Matched',
      certificateNo: 'CERT001'
    },
    {
      id: 2,
      challanNo: 'TDS002',
      deductorName: 'XYZ Industries',
      deductorTAN: 'XYZA98765B',
      deductionDate: '2024-01-20',
      amount: 75000,
      tdsDeducted: 7500,
      section: '194J',
      status: 'Unmatched',
      certificateNo: 'CERT002'
    }
  ];

  useEffect(() => {
    setTdsData(mockTdsData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Matched': return 'text-green-600 bg-green-100';
      case 'Unmatched': return 'text-red-600 bg-red-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredData = tdsData.filter(item =>
    item.deductorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.challanNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TDS Reconciliation</h1>
            <p className="text-gray-600 text-lg">Reconcile TDS deductions with certificates and challans</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">FY 2023-24</span>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Matched">Matched</option>
                <option value="Unmatched">Unmatched</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deductor or challan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Upload className="h-4 w-4 mr-2" />
              Import TDS Data
            </button>
            <button className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button className="flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto Reconcile
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Matched</p>
                <p className="text-3xl font-bold text-green-900">1</p>
                <p className="text-xs text-green-600 mt-1">100% accuracy</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md border border-red-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Unmatched</p>
                <p className="text-3xl font-bold text-red-900">1</p>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Total TDS</p>
                <p className="text-3xl font-bold text-blue-900">₹12,500</p>
                <p className="text-xs text-blue-600 mt-1">Current period</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-900">₹12,500</p>
                <p className="text-xs text-purple-600 mt-1">+15% vs last month</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* TDS Data Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">TDS Reconciliation Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Challan No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deductor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">TAN</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">TDS</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.challanNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deductorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deductorTAN}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deductionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.tdsDeducted.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold mr-4">View</button>
                      <button className="text-green-600 hover:text-green-900 font-semibold">Match</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDSReconciliation;
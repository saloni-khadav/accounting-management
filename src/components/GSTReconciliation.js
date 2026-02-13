import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, FileText, AlertCircle, CheckCircle, RefreshCw, Filter } from 'lucide-react';

const GSTReconciliation = () => {
  const [gstData, setGstData] = useState([]);
  const [filters, setFilters] = useState({
    period: '',
    gstType: '',
    status: '',
    returnType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('2A-2B');

  const mockGstData = [
    {
      id: 1,
      gstin: '27AABCU9603R1ZX',
      supplierName: 'ABC Suppliers Ltd',
      invoiceNo: 'INV001',
      invoiceDate: '2024-01-15',
      invoiceValue: 118000,
      taxableValue: 100000,
      cgst: 9000,
      sgst: 9000,
      igst: 0,
      status: 'Matched',
      returnPeriod: '012024'
    },
    {
      id: 2,
      gstin: '29AABCU9603R1ZY',
      supplierName: 'XYZ Trading Co',
      invoiceNo: 'INV002',
      invoiceDate: '2024-01-20',
      invoiceValue: 59000,
      taxableValue: 50000,
      cgst: 4500,
      sgst: 4500,
      igst: 0,
      status: 'Mismatched',
      returnPeriod: '012024'
    }
  ];

  useEffect(() => {
    setGstData(mockGstData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Matched': return 'text-green-600 bg-green-100';
      case 'Mismatched': return 'text-red-600 bg-red-100';
      case 'Missing': return 'text-yellow-600 bg-yellow-100';
      case 'Pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: '2A-2B', label: 'GSTR-2A vs 2B', count: 2 },
    { id: '1-3B', label: 'GSTR-1 vs 3B', count: 0 },
    { id: 'books', label: 'Books vs Returns', count: 1 }
  ];

  const filteredData = gstData.filter(item =>
    item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GST Reconciliation</h1>
          <p className="text-gray-600 text-lg">Reconcile GST returns and identify discrepancies</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-300">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-2 border-b-2 font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Return Period</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Period</option>
                <option value="012024">Jan 2024</option>
                <option value="022024">Feb 2024</option>
                <option value="032024">Mar 2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GST Type</label>
              <select
                value={filters.gstType}
                onChange={(e) => setFilters({...filters, gstType: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
              </select>
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
                <option value="Mismatched">Mismatched</option>
                <option value="Missing">Missing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search GSTIN, supplier..."
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
              Import GSTR Data
            </button>
            <button className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export Reconciliation
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
                <p className="text-xs text-green-600 mt-1">Perfect match</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md border border-red-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Mismatched</p>
                <p className="text-3xl font-bold text-red-900">1</p>
                <p className="text-xs text-red-600 mt-1">Requires review</p>
              </div>
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-blue-900">₹1,77,000</p>
                <p className="text-xs text-blue-600 mt-1">Invoice value</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-1">Tax Difference</p>
                <p className="text-3xl font-bold text-orange-900">₹4,500</p>
                <p className="text-xs text-orange-600 mt-1">Needs attention</p>
              </div>
              <Filter className="h-12 w-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* GST Data Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">GST Reconciliation Data - {tabs.find(t => t.id === activeTab)?.label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">GSTIN</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">CGST</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">SGST</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">IGST</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.gstin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.invoiceNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.invoiceDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.invoiceValue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.cgst.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.sgst.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.igst.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold mr-4">View</button>
                      <button className="text-green-600 hover:text-green-900 font-semibold">Reconcile</button>
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

export default GSTReconciliation;
import React, { useState } from 'react';
import { Upload, Download, FileText, Database, Users, CreditCard, ShoppingCart, CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const ImportExportData = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedDataType, setSelectedDataType] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const importOptions = [
    { id: 'bills', label: 'Import Bills', icon: FileText, color: 'from-blue-500 to-blue-600', description: 'Upload bills and invoices' },
    { id: 'vendors', label: 'Import Vendor List', icon: Users, color: 'from-green-500 to-green-600', description: 'Bulk vendor data import' },
    { id: 'statements', label: 'Import Bank Statement', icon: CreditCard, color: 'from-purple-500 to-purple-600', description: 'Upload bank statements' },
    { id: 'orders', label: 'Import Purchase Orders', icon: ShoppingCart, color: 'from-orange-500 to-orange-600', description: 'Import PO data' }
  ];

  const exportOptions = [
    { id: 'bills', label: 'Export Bills', icon: FileText, color: 'from-blue-500 to-blue-600', description: 'Download all bills' },
    { id: 'vendors', label: 'Export Vendors', icon: Users, color: 'from-green-500 to-green-600', description: 'Export vendor list' },
    { id: 'transactions', label: 'Export Transactions', icon: Database, color: 'from-purple-500 to-purple-600', description: 'Download transactions' },
    { id: 'reports', label: 'Export Reports', icon: FileText, color: 'from-orange-500 to-orange-600', description: 'Export financial reports' }
  ];

  const templates = [
    { name: 'Import Bills Template', icon: FileText, format: 'Excel', size: '25 KB' },
    { name: 'Import Vendor List Template', icon: Users, format: 'Excel', size: '18 KB' },
    { name: 'Import Bank Statement Template', icon: CreditCard, format: 'CSV', size: '12 KB' },
    { name: 'Import Purchase Orders Template', icon: ShoppingCart, format: 'Excel', size: '30 KB' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Import & Export Data
          </span>
        </h1>
        <p className="text-gray-600 text-lg font-medium">Manage your accounting data with bulk import and export operations</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ArrowUpCircle className="h-5 w-5" />
            Import Data
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ArrowDownCircle className="h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>

      {activeTab === 'import' ? (
        <>
          {/* Import Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Important Information</h3>
                <p className="text-blue-800 text-sm">Ensure your data follows the required format. Download templates below.</p>
              </div>
            </div>
          </div>

          {/* Import Options */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Data Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {importOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedDataType(option.id)}
                  className={`relative overflow-hidden bg-gradient-to-br ${option.color} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 text-left group`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm inline-block mb-4">
                      <option.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{option.label}</h4>
                    <p className="text-white text-opacity-90 text-sm">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload File</h3>
            <div
              className={`relative border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Drop your files here</h4>
                <p className="text-gray-600 mb-8 text-lg">or click to browse from your computer</p>
                <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg">
                  Choose Files
                </button>
                <p className="text-sm text-gray-500 mt-6">Supported formats: Excel (.xlsx, .xls), CSV (.csv) • Max file size: 10MB</p>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Download Templates</h3>
              <p className="text-sm text-gray-600 mt-1">Use these templates to format your data correctly</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template, idx) => (
                  <div key={idx} className="group bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                          <template.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">{template.format}</span>
                            <span>•</span>
                            <span>{template.size}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Export Options */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Data to Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {exportOptions.map((option) => (
                <button
                  key={option.id}
                  className={`relative overflow-hidden bg-gradient-to-br ${option.color} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 text-left group`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm inline-block mb-4">
                      <option.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{option.label}</h4>
                    <p className="text-white text-opacity-90 text-sm mb-4">{option.description}</p>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Download className="h-4 w-4" />
                      <span>Export Now</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Settings */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Export Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Date Range</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">File Format</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium">
                  <option>Excel (.xlsx)</option>
                  <option>CSV (.csv)</option>
                  <option>PDF (.pdf)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-bold">
                  <Download className="h-5 w-5" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportExportData;
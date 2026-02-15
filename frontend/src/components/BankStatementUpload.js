import React, { useState } from 'react';
import { Upload, ChevronDown, Check, FileText, Trash2, Eye, Download, Calendar, Search, Filter } from 'lucide-react';

const BankStatementUpload = () => {
  const currentYear = new Date().getFullYear();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedPeriod, setSelectedPeriod] = useState(`April ${currentYear}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBank, setFilterBank] = useState('All Banks');
  const [filterPeriod, setFilterPeriod] = useState('All Periods');

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        bank: selectedBank,
        period: selectedPeriod,
        uploadDate: new Date().toLocaleDateString('en-IN'),
        file: file
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
    } else {
      alert('Please upload a PDF file under 5MB');
    }
  };

  const deleteFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const viewFile = (file) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
  };

  const filteredFiles = uploadedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBank = filterBank === 'All Banks' || file.bank === filterBank;
    const matchesPeriod = filterPeriod === 'All Periods' || file.period === filterPeriod;
    return matchesSearch && matchesBank && matchesPeriod;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Statement Upload</h1>
        <p className="text-gray-600 mb-8">Upload and manage your bank statements</p>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Statement</h2>
          
          {/* Dropdowns and Upload Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
              <div className="relative">
                <select 
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>SBI Bank</option>
                  <option>Axis Bank</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <div className="relative">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>January {currentYear}</option>
                  <option>February {currentYear}</option>
                  <option>March {currentYear}</option>
                  <option>April {currentYear}</option>
                  <option>May {currentYear}</option>
                  <option>June {currentYear}</option>
                  <option>July {currentYear}</option>
                  <option>August {currentYear}</option>
                  <option>September {currentYear}</option>
                  <option>October {currentYear}</option>
                  <option>November {currentYear}</option>
                  <option>December {currentYear}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
            
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all h-[52px] flex items-center justify-center ${
                  dragActive ? 'border-blue-600 bg-blue-700' : 'border-blue-600 bg-blue-600 hover:bg-blue-700'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">Drag & drop or</span>
                  <span className="text-sm font-medium text-white hover:text-gray-200">Browse</span>
                  <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                </label>
              </div>
              
              {/* Instructions under Upload File */}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">PDF only</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">Max 5MB</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">Match period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter by Bank */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterBank}
                  onChange={(e) => setFilterBank(e.target.value)}
                  className="appearance-none w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>All Banks</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>SBI Bank</option>
                  <option>Axis Bank</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
            
            {/* Filter by Period */}
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="appearance-none w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>All Periods</option>
                  <option>January {currentYear}</option>
                  <option>February {currentYear}</option>
                  <option>March {currentYear}</option>
                  <option>April {currentYear}</option>
                  <option>May {currentYear}</option>
                  <option>June {currentYear}</option>
                  <option>July {currentYear}</option>
                  <option>August {currentYear}</option>
                  <option>September {currentYear}</option>
                  <option>October {currentYear}</option>
                  <option>November {currentYear}</option>
                  <option>December {currentYear}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Uploaded Statements</h2>
              <p className="text-sm text-gray-600 mt-1">{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} {searchQuery || filterBank !== 'All Banks' || filterPeriod !== 'All Periods' ? 'found' : 'uploaded'}</p>
            </div>
          </div>

          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">{file.name}</h3>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{file.period}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-medium">Bank:</span>
                      <span>{file.bank}</span>
                    </div>
                    <div className="text-xs text-gray-500">Uploaded: {file.uploadDate}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewFile(file)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => downloadFile(file)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {uploadedFiles.length === 0 ? 'No Documents Uploaded' : 'No Documents Found'}
              </h3>
              <p className="text-gray-500 text-sm">
                {uploadedFiles.length === 0 
                  ? 'Upload your first bank statement to get started' 
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

export default BankStatementUpload;

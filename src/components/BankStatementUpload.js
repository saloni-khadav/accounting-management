import React, { useState } from 'react';
import { Upload, ChevronDown, Check } from 'lucide-react';

const BankStatementUpload = () => {
  const [dragActive, setDragActive] = useState(false);

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
    // Handle file upload logic here
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8">Bank Statement Upload</h1>

      {/* Dropdowns */}
      <div className="flex gap-6 mb-8">
        <div>
          <label className="block text-sm text-gray-600 mb-2">Bank Account</label>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-64">
              <option>HDFC Bank</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">Period</label>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-64">
              <option>April 2024</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-16 mb-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Drag and drop your file here</h3>
          <p className="text-gray-600 mb-6">or</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Browse Files
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Accepted file format: .pdf</span>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Ensure the statement matches sthe selected period</span>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Maximum file size: 5 MB</span>
        </div>
      </div>
    </div>
  );
};

export default BankStatementUpload;

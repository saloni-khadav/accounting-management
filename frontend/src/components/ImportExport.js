import React, { useState } from 'react';
import { Upload, Download, FileText, Database, AlertCircle } from 'lucide-react';
import { generateTemplate, exportToCSV, parseCSV, validateImportData } from '../utils/importExportHelpers';

const ImportExport = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedDataType, setSelectedDataType] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const importTypes = [
    { id: 'bills', label: 'Import Bills', icon: FileText },
    { id: 'vendors', label: 'Import Vendor List', icon: Database },
    { id: 'bankstatements', label: 'Import Bank Statement', icon: FileText },
    { id: 'purchaseorders', label: 'Import Purchase Orders', icon: FileText }
  ];

  const exportTypes = [
    { id: 'bills', label: 'Export Bills', icon: FileText },
    { id: 'vendors', label: 'Export Vendor Master', icon: Database },
    { id: 'apreports', label: 'Export AP Reports', icon: FileText },
    { id: 'tdsreports', label: 'Export TDS Reports', icon: FileText },
    { id: 'paymentruns', label: 'Export Payment Run File', icon: FileText }
  ];

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedDataType) return;
    
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const data = parseCSV(text);
        const validation = validateImportData(data, selectedDataType);
        
        if (validation.isValid) {
          console.log('Imported Data:', data);
          alert(`Successfully imported ${data.length} records from ${file.name}`);
          // Yahan actual database save karna hai
        } else {
          alert(`Import failed: ${validation.errors.join(', ')}`);
        }
        
        setIsProcessing(false);
        setFile(null);
      };
      reader.readAsText(file);
    } catch (error) {
      setIsProcessing(false);
      alert(`Import failed: ${error.message}`);
    }
  };

  const getExportDescription = (type) => {
    const descriptions = {
      bills: 'Export bills with filters (Date, Vendor, Status)',
      vendors: 'Export vendor master with contact & payment details',
      apreports: 'Export AP reports, aging, payment trends',
      tdsreports: 'Export TDS summary for return filings',
      paymentruns: 'Export payment files for bank upload'
    };
    return descriptions[type] || 'Export data';
  };

  const handleExport = async (dataType, format = 'excel') => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const sampleData = generateTemplate(dataType);
      const fileName = `${dataType}_export_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'excel') {
        exportToCSV(sampleData, `${fileName}.csv`);
      } else {
        alert(`PDF export for ${dataType} - Feature coming soon!`);
      }
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Import & Export Data</h2>
        <p className="text-gray-600">Manage your accounting data with bulk import and export operations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'import'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="inline w-4 h-4 mr-2" />
          Import Data
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Download className="inline w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                Ensure your data follows the required format. Download templates below.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Data Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedDataType(type.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedDataType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2 text-gray-600" />
                    <div className="font-medium text-gray-900">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDataType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload File (CSV, Excel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">CSV, XLSX up to 10MB</p>
                </label>
              </div>
            </div>
          )}

          {file && selectedDataType && (
            <button
              onClick={handleImport}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Import Data'}
            </button>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Export your data in CSV format for backup or analysis purposes.
            </p>
          </div>

          <div className="grid gap-4">
            {exportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">
                        {getExportDescription(type.id)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(type.id, 'excel')}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport(type.id, 'pdf')}
                      disabled={isProcessing}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Download Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {importTypes.map((type) => (
            <button
              key={`template-${type.id}`}
              className="p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50"
              onClick={() => {
                const templateData = generateTemplate(type.id);
                exportToCSV(templateData, `${type.id}_template.csv`);
              }}
            >
              <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">{type.label}</div>
              <div className="text-xs text-gray-500">Template</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
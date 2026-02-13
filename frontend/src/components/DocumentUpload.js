import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const DocumentUpload = ({ onDataExtracted, documentType, label }) => {
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('userId', 'current-user');

      const response = await fetch('http://localhost:5001/api/ocr/process-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setExtractedData(result.extractedData);
        onDataExtracted(result.extractedData);
      } else {
        setError(result.message || 'Failed to process document');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      <input
        type="file"
        id={`upload-${documentType}`}
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />
      
      <label 
        htmlFor={`upload-${documentType}`} 
        className="cursor-pointer flex flex-col items-center"
      >
        {uploading ? (
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {uploading ? 'Processing...' : `Upload ${label}`}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          {uploading ? 'Extracting data using OCR...' : 'JPG, PNG, or PDF (max 10MB)'}
        </p>
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {extractedData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">Data Extracted Successfully</span>
          </div>
          
          <div className="text-left space-y-2">
            {extractedData.gstNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">GST Number:</span>
                <span className="text-sm font-medium">{extractedData.gstNumber}</span>
              </div>
            )}
            {extractedData.accountNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account Number:</span>
                <span className="text-sm font-medium">{extractedData.accountNumber}</span>
              </div>
            )}
            {extractedData.ifsc && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IFSC Code:</span>
                <span className="text-sm font-medium">{extractedData.ifsc}</span>
              </div>
            )}
            {extractedData.aadharNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Aadhar Number:</span>
                <span className="text-sm font-medium">{extractedData.aadharNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
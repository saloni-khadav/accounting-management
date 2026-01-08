import React, { useState } from 'react';
import { X, Save, Building, Phone, Mail, MapPin, Download, FileText } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const ClientForm = ({ isOpen, onClose, onSave, editingClient }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientCode: '',
    contactPerson: '',
    contactDetails: '',
    email: '',
    website: '',
    billingAddress: '',
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    paymentTerms: '',
    creditLimit: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    industryType: '',
    clientCategory: '',
    contractDates: '',
    contractStartDate: '',
    contractEndDate: '',
    currency: 'INR',
    status: 'Active',
    accountManager: '',
    documents: {
      panCard: null,
      aadharCard: null,
      gstCertificate: null,
      bankStatement: null,
      otherDocuments: []
    }
  });

  const [uploadingStates, setUploadingStates] = useState({
    gstCertificate: false,
    bankStatement: false,
    aadharCard: false
  });

  const [extractionErrors, setExtractionErrors] = useState({
    gstCertificate: '',
    bankStatement: '',
    aadharCard: ''
  });

  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    try {
      setFormError(''); // Clear any previous errors
      if (editingClient) {
        console.log('Loading client for editing:', editingClient);
        // Safely merge editingClient with default structure
        setFormData({
          clientName: editingClient.clientName || '',
          clientCode: editingClient.clientCode || '',
          contactPerson: editingClient.contactPerson || '',
          contactDetails: editingClient.contactDetails || '',
          email: editingClient.email || '',
          website: editingClient.website || '',
          billingAddress: editingClient.billingAddress || '',
          gstNumber: editingClient.gstNumber || '',
          panNumber: editingClient.panNumber || '',
          aadharNumber: editingClient.aadharNumber || '',
          paymentTerms: editingClient.paymentTerms || '',
          creditLimit: editingClient.creditLimit || '',
          accountNumber: editingClient.accountNumber || editingClient.bankDetails || '',
          ifscCode: editingClient.ifscCode || '',
          bankName: editingClient.bankName || '',
          industryType: editingClient.industryType || '',
          clientCategory: editingClient.clientCategory || '',
          contractDates: editingClient.contractDates || '',
          contractStartDate: editingClient.contractStartDate ? 
            (editingClient.contractStartDate.split('T')[0] || editingClient.contractStartDate) : '',
          contractEndDate: editingClient.contractEndDate ? 
            (editingClient.contractEndDate.split('T')[0] || editingClient.contractEndDate) : '',
          currency: editingClient.currency || 'INR',
          status: editingClient.status || 'Active',
          accountManager: editingClient.accountManager || '',
          documents: editingClient.documents || {
            panCard: null,
            aadharCard: null,
            gstCertificate: null,
            bankStatement: null,
            otherDocuments: []
          }
        });
      } else {
        setFormData({
          clientName: '',
          clientCode: '',
          contactPerson: '',
          contactDetails: '',
          email: '',
          website: '',
          billingAddress: '',
          gstNumber: '',
          panNumber: '',
          aadharNumber: '',
          paymentTerms: '',
          creditLimit: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          industryType: '',
          clientCategory: '',
          contractDates: '',
          contractStartDate: '',
          contractEndDate: '',
          currency: 'INR',
          status: 'Active',
          accountManager: '',
          documents: {
            panCard: null,
            aadharCard: null,
            gstCertificate: null,
            bankStatement: null,
            otherDocuments: []
          }
        });
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setFormError('Error loading client data. Please try again.');
    }
  }, [editingClient]);

  const handleInputChange = (e) => {
    try {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    } catch (error) {
      console.error('Error in handleInputChange:', error);
    }
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Store file in documents
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [documentType]: file
        }
      });

      // Perform OCR if it's GST, Bank, or Aadhar document
      if (['gstCertificate', 'bankStatement', 'aadharCard'].includes(documentType)) {
        await performOCR(file, documentType);
      }
    }
  };

  const performOCR = async (file, documentType) => {
    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    setExtractionErrors(prev => ({ ...prev, [documentType]: '' }));
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch('http://localhost:5001/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const extracted = result.data;
        let hasData = false;
        
        // Check if any relevant data was extracted
        if (documentType === 'gstCertificate' && extracted.gstNumber) {
          hasData = true;
        } else if (documentType === 'bankStatement' && (extracted.accountNumber || extracted.ifscCode)) {
          hasData = true;
        } else if (documentType === 'aadharCard' && extracted.aadharNumber) {
          hasData = true;
        }
        
        if (hasData) {
          // Auto-fill extracted data
          setFormData(prev => ({
            ...prev,
            gstNumber: extracted.gstNumber || prev.gstNumber,
            accountNumber: extracted.accountNumber || prev.accountNumber,
            ifscCode: extracted.ifscCode || prev.ifscCode,
            bankName: extracted.bankName || prev.bankName,
            aadharNumber: extracted.aadharNumber || prev.aadharNumber
          }));
          
          alert('Document processed! Data auto-filled successfully.');
        } else {
          // No relevant data found
          const errorMessages = {
            'gstCertificate': 'Cannot find GST number in this document',
            'bankStatement': 'Cannot find account number or IFSC code in this document',
            'aadharCard': 'Cannot find Aadhar number in this document'
          };
          
          setExtractionErrors(prev => ({
            ...prev,
            [documentType]: errorMessages[documentType]
          }));
        }
      } else {
        setExtractionErrors(prev => ({
          ...prev,
          [documentType]: 'Failed to process document. Please try again.'
        }));
      }
    } catch (error) {
      setExtractionErrors(prev => ({
        ...prev,
        [documentType]: 'Network error. Please check your connection.'
      }));
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleOtherDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        otherDocuments: [...formData.documents.otherDocuments, ...files]
      }
    });
  };

  const removeOtherDocument = (index) => {
    const updatedDocs = formData.documents.otherDocuments.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        otherDocuments: updatedDocs
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      setFormError('');
      
      // Clean up documents for submission
      const cleanedFormData = {
        ...formData,
        documents: {
          panCard: formData.documents.panCard ? 'uploaded' : null,
          aadharCard: formData.documents.aadharCard ? 'uploaded' : null,
          gstCertificate: formData.documents.gstCertificate ? 'uploaded' : null,
          bankStatement: formData.documents.bankStatement ? 'uploaded' : null,
          otherDocuments: formData.documents.otherDocuments.map(doc => 
            typeof doc === 'string' ? doc : 'uploaded'
          )
        }
      };
      
      console.log('Submitting form data:', cleanedFormData);
      onSave(cleanedFormData);
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setFormError('Error saving client data. Please try again.');
    }
  };

  const handleExportTemplate = () => {
    const templateData = [{
      'Client Name': '',
      'Client Code': '',
      'Contact Person': '',
      'Contact Details': '',
      'Email': '',
      'Website': '',
      'Billing Address': '',
      'GST Number': '',
      'PAN Number': '',
      'Payment Terms': '',
      'Credit Limit': '',
      'Account Number': '',
      'IFSC Code': '',
      'Bank Name': '',
      'Industry Type': '',
      'Client Category': '',
      'Contract Start Date': '',
      'Contract End Date': '',
      'Currency': 'INR',
      'Status': 'Active',
      'Account Manager': ''
    }];
    exportToExcel(templateData, 'client_template');
    alert('Client template exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleExportTemplate}
              className="text-green-600 hover:text-green-800 flex items-center"
              title="Export Excel Template"
            >
              <Download size={20} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name / Company Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code *
              </label>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Details
              </label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address with PIN Code
            </label>
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  maxLength="15"
                  placeholder="15 characters GST number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'gstCertificate')}
                    className="hidden"
                    id="gstFile"
                  />
                  <label
                    htmlFor="gstFile"
                    className={`px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm ${
                      uploadingStates.gstCertificate ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingStates.gstCertificate ? 'Processing...' : 'Upload'}
                  </label>
                  {formData.documents.gstCertificate && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
              {extractionErrors.gstCertificate && (
                <div className="mt-1 text-sm text-red-600">
                  {extractionErrors.gstCertificate}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  maxLength="10"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  placeholder="10 characters PAN number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'panCard')}
                    className="hidden"
                    id="panFile"
                  />
                  <label
                    htmlFor="panFile"
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm"
                  >
                    Upload
                  </label>
                  {formData.documents.panCard && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Payment Terms</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="45 Days">45 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="Advance">Advance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry Type
              </label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry Type</option>
                <option value="Company">Company</option>
                <option value="Firm">Firm</option>
                <option value="Partnership">Partnership</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="LLP">LLP</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Category
              </label>
              <select
                name="clientCategory"
                value={formData.clientCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                maxLength="11"
                placeholder="11 characters IFSC code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'bankStatement')}
                    className="hidden"
                    id="bankFile"
                  />
                  <label
                    htmlFor="bankFile"
                    className={`px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm ${
                      uploadingStates.bankStatement ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingStates.bankStatement ? 'Processing...' : 'Upload'}
                  </label>
                  {formData.documents.bankStatement && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
              {extractionErrors.bankStatement && (
                <div className="mt-1 text-sm text-red-600">
                  {extractionErrors.bankStatement}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract End Date
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Account Manager
            </label>
            <input
              type="text"
              name="accountManager"
              value={formData.accountManager}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Other Documents
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    maxLength="12"
                    pattern="[0-9]{12}"
                    placeholder="12 digits Aadhar number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'aadharCard')}
                      className="hidden"
                      id="aadharFile"
                    />
                    <label
                      htmlFor="aadharFile"
                      className={`px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm ${
                        uploadingStates.aadharCard ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingStates.aadharCard ? 'Processing...' : 'Upload'}
                    </label>
                    {formData.documents.aadharCard && (
                      <span className="ml-2 text-green-600 text-sm">✓</span>
                    )}
                  </div>
                </div>
                {extractionErrors.aadharCard && (
                  <div className="mt-1 text-sm text-red-600">
                    {extractionErrors.aadharCard}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleOtherDocumentUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.documents.otherDocuments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Uploaded Documents:</p>
                <div className="space-y-1">
                  {formData.documents.otherDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeOtherDocument(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
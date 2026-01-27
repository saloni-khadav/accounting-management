import React, { useState } from 'react';
import { X, Save, FileText, Upload, Download, Plus } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import DocumentUpload from './DocumentUpload';

const VendorForm = ({ isOpen, onClose, onSave, editingVendor }) => {
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    contactPerson: '',
    contactDetails: '',
    email: '',
    website: '',
    billingAddress: '',
    gstNumber: '',
    gstNumbers: [{ gstNumber: '', isDefault: true }],
    panNumber: '',
    paymentTerms: '',
    creditLimit: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    industryType: '',
    vendorCategory: '',
    contractDates: '',
    contractStartDate: '',
    contractEndDate: '',
    currency: 'INR',
    status: 'Active',
    accountManager: '',
    aadharNumber: '',
    documents: {
      panCard: null,
      aadharCard: null,
      gstCertificate: null,
      bankStatement: null,
      otherDocuments: []
    }
  });

  const [uploadStates, setUploadStates] = useState({
    gst: { loading: false, error: null },
    pan: { loading: false, error: null },
    bank: { loading: false, error: null },
    aadhar: { loading: false, error: null }
  });

  React.useEffect(() => {
    try {
      if (editingVendor) {
        console.log('Loading vendor for editing:', editingVendor);
        setFormData({
          vendorCode: editingVendor.vendorCode || '',
          vendorName: editingVendor.vendorName || '',
          contactPerson: editingVendor.contactPerson || '',
          contactDetails: editingVendor.contactDetails || '',
          email: editingVendor.email || '',
          website: editingVendor.website || '',
          billingAddress: editingVendor.billingAddress || '',
          gstNumber: editingVendor.gstNumber || '',
          gstNumbers: editingVendor.gstNumbers && editingVendor.gstNumbers.length > 0 
            ? editingVendor.gstNumbers 
            : editingVendor.gstNumber 
              ? [{ gstNumber: editingVendor.gstNumber, isDefault: true }]
              : [{ gstNumber: '', isDefault: true }],
          panNumber: editingVendor.panNumber || '',
          paymentTerms: editingVendor.paymentTerms || '',
          creditLimit: editingVendor.creditLimit || '',
          accountNumber: editingVendor.accountNumber || editingVendor.bankDetails || '',
          ifscCode: editingVendor.ifscCode || '',
          bankName: editingVendor.bankName || '',
          industryType: editingVendor.industryType || '',
          vendorCategory: editingVendor.vendorCategory || editingVendor.clientCategory || '',
          contractDates: editingVendor.contractDates || '',
          contractStartDate: editingVendor.contractStartDate ? 
            (editingVendor.contractStartDate.split('T')[0] || editingVendor.contractStartDate) : '',
          contractEndDate: editingVendor.contractEndDate ? 
            (editingVendor.contractEndDate.split('T')[0] || editingVendor.contractEndDate) : '',
          currency: editingVendor.currency || 'INR',
          status: editingVendor.status || 'Active',
          accountManager: editingVendor.accountManager || '',
          aadharNumber: editingVendor.aadharNumber || '',
          documents: editingVendor.documents || {
            panCard: null,
            aadharCard: null,
            gstCertificate: null,
            bankStatement: null,
            otherDocuments: []
          }
        });
      } else {
        setFormData({
          vendorCode: '',
          vendorName: '',
          contactPerson: '',
          contactDetails: '',
          email: '',
          website: '',
          billingAddress: '',
          gstNumber: '',
          gstNumbers: [{ gstNumber: '', isDefault: true }],
          panNumber: '',
          paymentTerms: '',
          creditLimit: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          industryType: '',
          vendorCategory: '',
          contractDates: '',
          contractStartDate: '',
          contractEndDate: '',
          currency: 'INR',
          status: 'Active',
          accountManager: '',
          aadharNumber: '',
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
      alert('Error loading vendor data. Please try again.');
    }
  }, [editingVendor]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGSTChange = (index, value) => {
    const updatedGSTNumbers = [...formData.gstNumbers];
    updatedGSTNumbers[index].gstNumber = value;
    setFormData({
      ...formData,
      gstNumbers: updatedGSTNumbers,
      gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || ''
    });
  };

  const addGSTNumber = () => {
    setFormData({
      ...formData,
      gstNumbers: [...formData.gstNumbers, { gstNumber: '', isDefault: false }]
    });
  };

  const removeGSTNumber = (index) => {
    if (formData.gstNumbers.length > 1) {
      const updatedGSTNumbers = formData.gstNumbers.filter((_, i) => i !== index);
      if (formData.gstNumbers[index].isDefault && updatedGSTNumbers.length > 0) {
        updatedGSTNumbers[0].isDefault = true;
      }
      setFormData({
        ...formData,
        gstNumbers: updatedGSTNumbers,
        gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || ''
      });
    }
  };

  const setDefaultGST = (index) => {
    const updatedGSTNumbers = formData.gstNumbers.map((gst, i) => ({
      ...gst,
      isDefault: i === index
    }));
    setFormData({
      ...formData,
      gstNumbers: updatedGSTNumbers,
      gstNumber: updatedGSTNumbers[index].gstNumber
    });
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [documentType]: file
        }
      });
    }
  };

  const handleOCRUpload = async (file, documentType) => {
    const stateKey = documentType === 'gstCertificate' ? 'gst' : 
                     documentType === 'panCard' ? 'pan' : 
                     documentType === 'bankStatement' ? 'bank' : 'aadhar';
    
    setUploadStates(prev => ({
      ...prev,
      [stateKey]: { loading: true, error: null }
    }));

    const formDataUpload = new FormData();
    formDataUpload.append('document', file);
    formDataUpload.append('documentType', documentType);

    try {
      const response = await fetch('http://localhost:5001/api/ocr/extract', {
        method: 'POST',
        body: formDataUpload
      });

      const result = await response.json();

      if (result.success) {
        const updates = {};
        
        if (documentType === 'gstCertificate' && result.data.gstNumber) {
          // Find the first empty GST number field or update the first one
          const updatedGSTNumbers = [...formData.gstNumbers];
          const emptyIndex = updatedGSTNumbers.findIndex(gst => !gst.gstNumber);
          if (emptyIndex !== -1) {
            updatedGSTNumbers[emptyIndex].gstNumber = result.data.gstNumber;
          } else {
            updatedGSTNumbers[0].gstNumber = result.data.gstNumber;
          }
          updates.gstNumbers = updatedGSTNumbers;
          updates.gstNumber = updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || '';
        }
        if (documentType === 'bankStatement') {
          if (result.data.accountNumber) updates.accountNumber = result.data.accountNumber;
          if (result.data.ifscCode) updates.ifscCode = result.data.ifscCode;
          if (result.data.bankName) updates.bankName = result.data.bankName;
        }
        if (documentType === 'aadharCard' && result.data.aadharNumber) {
          updates.aadharNumber = result.data.aadharNumber;
        }

        setFormData(prev => ({
          ...prev,
          ...updates,
          documents: {
            ...prev.documents,
            [documentType]: file
          }
        }));

        setUploadStates(prev => ({
          ...prev,
          [stateKey]: { loading: false, error: null }
        }));
      } else {
        setUploadStates(prev => ({
          ...prev,
          [stateKey]: { loading: false, error: result.message || 'Could not extract data from document' }
        }));
      }
    } catch (error) {
      setUploadStates(prev => ({
        ...prev,
        [stateKey]: { loading: false, error: 'Upload failed. Please try again.' }
      }));
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

  const downloadDocument = (file, index) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (typeof file === 'string') {
      // Handle existing uploaded files (file paths)
      window.open(`http://localhost:5001/api/vendors/download/${file}`, '_blank');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const defaultGST = formData.gstNumbers.find(gst => gst.isDefault);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          // Handle documents separately
          if (formData.documents.panCard) {
            formDataToSend.append('panCard', formData.documents.panCard);
          }
          if (formData.documents.aadharCard) {
            formDataToSend.append('aadharCard', formData.documents.aadharCard);
          }
          if (formData.documents.gstCertificate) {
            formDataToSend.append('gstCertificate', formData.documents.gstCertificate);
          }
          if (formData.documents.bankStatement) {
            formDataToSend.append('bankStatement', formData.documents.bankStatement);
          }
          // Add other documents as files
          formData.documents.otherDocuments.forEach((file) => {
            if (file instanceof File) {
              formDataToSend.append('otherDocuments', file);
            }
          });
        } else if (key === 'gstNumbers') {
          formDataToSend.append('gstNumbers', JSON.stringify(formData.gstNumbers));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('gstNumber', defaultGST?.gstNumber || formData.gstNumbers[0]?.gstNumber || '');
      
      const url = editingVendor 
        ? `http://localhost:5001/api/vendors/${editingVendor._id}`
        : 'http://localhost:5001/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      if (response.ok) {
        const savedVendor = await response.json();
        onSave(savedVendor);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving vendor');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Code *
              </label>
              <input
                type="text"
                name="vendorCode"
                value={formData.vendorCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name / Company Name *
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Name
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
                Contact Details (Mobile, Landline)
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  GST Numbers
                </label>
                <button
                  type="button"
                  onClick={addGSTNumber}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add GST Number
                </button>
              </div>
              <div className="space-y-2">
                {formData.gstNumbers.map((gstItem, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={gstItem.gstNumber}
                      onChange={(e) => handleGSTChange(index, e.target.value)}
                      maxLength="15"
                      placeholder="15 characters GST number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setDefaultGST(index)}
                      className={`px-2 py-1 text-xs rounded ${
                        gstItem.isDefault 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                      }`}
                      title={gstItem.isDefault ? 'Default GST' : 'Set as Default'}
                    >
                      {gstItem.isDefault ? 'Default' : 'Set Default'}
                    </button>
                    {formData.gstNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGSTNumber(index)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 border border-red-300 rounded hover:bg-red-200"
                        title="Remove GST Number"
                      >
                        Remove
                      </button>
                    )}
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleOCRUpload(file, 'gstCertificate');
                        }}
                        className="hidden"
                        id={`gstFile${index}`}
                      />
                      <label
                        htmlFor={`gstFile${index}`}
                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm flex items-center"
                      >
                        {uploadStates.gst.loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                        ) : (
                          <Upload className="w-4 h-4 mr-1" />
                        )}
                        Upload
                      </label>
                      {formData.documents.gstCertificate && (
                        <span className="ml-2 text-green-600 text-sm">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {uploadStates.gst.error && (
                <p className="text-red-500 text-sm mt-1">{uploadStates.gst.error}</p>
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleOCRUpload(file, 'panCard');
                    }}
                    className="hidden"
                    id="panFile"
                  />
                  <label
                    htmlFor="panFile"
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm flex items-center"
                  >
                    {uploadStates.pan.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Upload
                  </label>
                  {formData.documents.panCard && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
              {uploadStates.pan.error && (
                <p className="text-red-500 text-sm mt-1">{uploadStates.pan.error}</p>
              )}
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleOCRUpload(file, 'bankStatement');
                    }}
                    className="hidden"
                    id="bankFile"
                  />
                  <label
                    htmlFor="bankFile"
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm flex items-center"
                  >
                    {uploadStates.bank.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Upload
                  </label>
                  {formData.documents.bankStatement && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
              {uploadStates.bank.error && (
                <p className="text-red-500 text-sm mt-1">{uploadStates.bank.error}</p>
              )}
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
                Vendor Category
              </label>
              <select
                name="vendorCategory"
                value={formData.vendorCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
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

          {/* Documents Section */}
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
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleOCRUpload(file, 'aadharCard');
                      }}
                      className="hidden"
                      id="aadharFile"
                    />
                    <label
                      htmlFor="aadharFile"
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm flex items-center"
                    >
                      {uploadStates.aadhar.loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                      ) : (
                        <Upload className="w-4 h-4 mr-1" />
                      )}
                      Upload
                    </label>
                    {formData.documents.aadharCard && (
                      <span className="ml-2 text-green-600 text-sm">✓</span>
                    )}
                  </div>
                </div>
                {uploadStates.aadhar.error && (
                  <p className="text-red-500 text-sm mt-1">{uploadStates.aadhar.error}</p>
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
                      <span className="text-sm text-gray-700">
                        {file instanceof File ? file.name : file}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => downloadDocument(file, index)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          title="Download"
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOtherDocument(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
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
              {editingVendor ? 'Update Vendor' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
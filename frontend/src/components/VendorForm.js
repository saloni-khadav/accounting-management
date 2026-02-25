import React, { useState } from 'react';
import { API_URL } from '../utils/apiConfig';
import { X, Save, FileText, Upload, Download, Plus, Users, CreditCard, Building } from 'lucide-react';
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
    gstNumbers: [{ gstNumber: '', billingAddress: '', isDefault: true, hasDocument: false }],
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
    gst: {},
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
            ? editingVendor.gstNumbers.map(gst => ({ ...gst, billingAddress: gst.billingAddress || '', hasDocument: !!editingVendor.documents?.gstCertificate, isExisting: !!gst.gstNumber }))
            : editingVendor.gstNumber 
              ? [{ gstNumber: editingVendor.gstNumber, billingAddress: editingVendor.billingAddress || '', isDefault: true, hasDocument: !!editingVendor.documents?.gstCertificate, isExisting: !!editingVendor.gstNumber }]
              : [{ gstNumber: '', billingAddress: '', isDefault: true, hasDocument: false, isExisting: false }],
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
        // Generate vendor code for new vendor
        generateVendorCode();
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      alert('Error loading vendor data. Please try again.');
    }
  }, [editingVendor]);

  const generateVendorCode = async () => {
    try {
      // First try to get existing vendors to calculate next code
      const response = await fetch(`${API_URL}/api/vendors`);
      if (response.ok) {
        const vendors = await response.json();
        
        // Extract vendor codes and find the highest number
        const vendorCodes = vendors
          .map(vendor => vendor.vendorCode)
          .filter(code => code && code.startsWith('VC'))
          .map(code => {
            const num = parseInt(code.substring(2));
            return isNaN(num) ? 0 : num;
          });
        
        const maxNumber = vendorCodes.length > 0 ? Math.max(...vendorCodes) : 0;
        const nextNumber = maxNumber + 1;
        const nextCode = `VC${nextNumber.toString().padStart(3, '0')}`;
        
        setFormData({
          vendorCode: nextCode,
          vendorName: '',
          contactPerson: '',
          contactDetails: '',
          email: '',
          website: '',
          billingAddress: '',
          gstNumber: '',
          gstNumbers: [{ gstNumber: '', billingAddress: '', isDefault: true, hasDocument: false, isExisting: false }],
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
      } else {
        throw new Error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error generating vendor code:', error);
      // Fallback to VC001 if API fails
      setFormData(prev => ({ ...prev, vendorCode: 'VC001' }));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGSTChange = (index, field, value) => {
    const updatedGSTNumbers = [...formData.gstNumbers];
    updatedGSTNumbers[index][field] = value;
    
    const newFormData = {
      ...formData,
      gstNumbers: updatedGSTNumbers,
      gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || ''
    };
    
    // Update main billing address if default GST's billing address changed
    if (field === 'billingAddress' && updatedGSTNumbers[index].isDefault) {
      newFormData.billingAddress = value;
    }
    
    setFormData(newFormData);
  };

  const addGSTNumber = () => {
    setFormData({
      ...formData,
      gstNumbers: [...formData.gstNumbers, { gstNumber: '', billingAddress: '', isDefault: false, hasDocument: false, isExisting: false }]
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
        gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || '',
        billingAddress: updatedGSTNumbers.find(gst => gst.isDefault)?.billingAddress || updatedGSTNumbers[0]?.billingAddress || ''
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
      gstNumber: updatedGSTNumbers[index].gstNumber,
      billingAddress: updatedGSTNumbers[index].billingAddress
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

  const handleOCRUpload = async (file, documentType, gstIndex = null) => {
    const stateKey = documentType === 'gstCertificate' ? `gst_${gstIndex}` : 
                     documentType === 'panCard' ? 'pan' : 
                     documentType === 'bankStatement' ? 'bank' : 'aadhar';
    
    // Clear previous data first (but not for GST to preserve existing data)
    if (documentType === 'panCard') {
      setFormData(prev => ({ ...prev, panNumber: '' }));
    } else if (documentType === 'bankStatement') {
      setFormData(prev => ({
        ...prev,
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      }));
    } else if (documentType === 'aadharCard') {
      setFormData(prev => ({ ...prev, aadharNumber: '' }));
    }
    
    setUploadStates(prev => ({
      ...prev,
      [stateKey]: { loading: true, error: null }
    }));

    const formDataUpload = new FormData();
    formDataUpload.append('document', file);
    formDataUpload.append('documentType', documentType);

    try {
      const response = await fetch(`${API_URL}/api/ocr/extract`, {
        method: 'POST',
        body: formDataUpload
      });

      const result = await response.json();

      if (result.success) {
        const updates = {};
        let dataFound = false;
        
        // Handle PAN card extraction
        if (documentType === 'panCard') {
          if (result.data.panNumber) {
            updates.panNumber = result.data.panNumber;
            dataFound = true;
          } else if (result.data.pan) {
            updates.panNumber = result.data.pan;
            dataFound = true;
          } else if (result.data.PAN) {
            updates.panNumber = result.data.PAN;
            dataFound = true;
          } else if (result.data.extractedText) {
            const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
            const panMatch = result.data.extractedText.match(panPattern);
            if (panMatch && panMatch[0]) {
              updates.panNumber = panMatch[0];
              dataFound = true;
            }
          }
        }
        
        if (documentType === 'gstCertificate') {
          if (result.data.gstNumber) {
            const updatedGSTNumbers = [...formData.gstNumbers];
            if (gstIndex !== null) {
              updatedGSTNumbers[gstIndex].gstNumber = result.data.gstNumber;
              updatedGSTNumbers[gstIndex].hasDocument = true;
            }
            updates.gstNumbers = updatedGSTNumbers;
            updates.gstNumber = updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || '';
            dataFound = true;
          }
        }
        
        if (documentType === 'bankStatement') {
          if (result.data.accountNumber || result.data.ifscCode || result.data.bankName) {
            if (result.data.accountNumber) updates.accountNumber = result.data.accountNumber;
            if (result.data.ifscCode) updates.ifscCode = result.data.ifscCode;
            if (result.data.bankName) updates.bankName = result.data.bankName;
            dataFound = true;
          }
        }
        
        if (documentType === 'aadharCard') {
          if (result.data.aadharNumber) {
            updates.aadharNumber = result.data.aadharNumber;
            dataFound = true;
          }
        }

        if (dataFound) {
          setFormData(prev => {
            const newFormData = {
              ...prev,
              ...updates
            };
            
            // Handle document storage for GST
            if (documentType === 'gstCertificate' && gstIndex !== null) {
              // Don't update the shared gstCertificate document
              // Individual GST tracking is handled by hasDocument flag
            } else {
              // For other document types, update normally
              newFormData.documents = {
                ...prev.documents,
                [documentType]: file
              };
            }
            
            return newFormData;
          });

          setUploadStates(prev => ({
            ...prev,
            [stateKey]: { loading: false, error: null }
          }));
          
          alert('Document uploaded and data extracted successfully!');
        } else {
          setUploadStates(prev => ({
            ...prev,
            [stateKey]: { loading: false, error: `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document.` }
          }));
          
          alert(`${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document. Please upload the correct document.`);
        }
      } else {
        setUploadStates(prev => ({
          ...prev,
          [stateKey]: { loading: false, error: `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document.` }
        }));
        
        alert(`${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document. Please upload the correct document.`);
      }
    } catch (error) {
      console.error('OCR error:', error);
      setUploadStates(prev => ({
        ...prev,
        [stateKey]: { loading: false, error: `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document.` }
      }));
      
      alert(`${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document. Please upload the correct document.`);
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
      window.open(`${API_URL}/api/vendors/download/${file}`, '_blank');
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
        ? `${API_URL}/api/vendors/${editingVendor._id}`
        : `${API_URL}/api/vendors`;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorCode"
                value={formData.vendorCode}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 font-medium"
                readOnly
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  editingVendor ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                readOnly={editingVendor}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Details (Mobile, Landline) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          </div>

          {/* Address & Tax Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Address & Tax Information
            </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Address with PIN Code <span className="text-red-500">*</span>
            </label>
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from default GST number - cannot be edited manually"
              readOnly
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                  <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={gstItem.gstNumber}
                        onChange={(e) => handleGSTChange(index, 'gstNumber', e.target.value)}
                        maxLength="15"
                        placeholder="15 characters GST number"
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          (gstItem.isExisting && gstItem.gstNumber) ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        readOnly={gstItem.isExisting && gstItem.gstNumber}
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
                      {!gstItem.isExisting && formData.gstNumbers.length > 1 && (
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
                            if (file) handleOCRUpload(file, 'gstCertificate', index);
                          }}
                          className="hidden"
                          id={`gstFile${index}`}
                          disabled={gstItem.isExisting && gstItem.gstNumber}
                        />
                        <label
                          htmlFor={`gstFile${index}`}
                          className={`px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center ${
                            (gstItem.isExisting && gstItem.gstNumber)
                              ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                              : 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                          }`}
                        >
                          {uploadStates[`gst_${index}`]?.loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                          ) : (
                            <Upload className="w-4 h-4 mr-1" />
                          )}
                          Upload
                        </label>
                        {gstItem.hasDocument && (
                          <span className="ml-2 text-green-600 text-sm">✓</span>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={gstItem.billingAddress}
                      onChange={(e) => handleGSTChange(index, 'billingAddress', e.target.value)}
                      placeholder="Billing address for this GST number"
                      rows="2"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        (gstItem.isExisting && gstItem.gstNumber) ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      readOnly={gstItem.isExisting && gstItem.gstNumber}
                    />
                  </div>
                ))}
              </div>
              {uploadStates[`gst_0`]?.error && (
                <p className="text-red-500 text-sm mt-1">{uploadStates[`gst_0`]?.error}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number *
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
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editingVendor ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  readOnly={editingVendor}
                  required
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
                    disabled={editingVendor}
                  />
                  <label
                    htmlFor="panFile"
                    className={`px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center ${
                      editingVendor
                        ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                        : 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    }`}
                  >
                    {uploadStates.pan.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Upload
                  </label>
                  {(formData.documents.panCard || editingVendor?.documents?.panCard) && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
              {uploadStates.pan.error && (
                <p className="text-red-500 text-sm mt-1">{uploadStates.pan.error}</p>
              )}
            </div>
          </div>
          </div>

          {/* Payment & Banking Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Payment & Banking Information
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                maxLength="11"
                placeholder="11 characters IFSC code"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                    className="px-3 py-2.5 bg-blue-50 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-blue-100 text-sm font-medium flex items-center gap-1 text-blue-600"
                  >
                    {uploadStates.bank.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload
                  </label>
                  {formData.documents.bankStatement && (
                    <span className="ml-2 text-green-600 text-lg font-bold">✓</span>
                  )}
                </div>
              </div>
              {uploadStates.bank.error && (
                <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded">{uploadStates.bank.error}</p>
              )}
            </div>
          </div>
          </div>

          {/* Business Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Business Information
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Type <span className="text-red-500">*</span>
              </label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Category <span className="text-red-500">*</span>
              </label>
              <select
                name="vendorCategory"
                value={formData.vendorCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Account Manager <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountManager"
              value={formData.accountManager}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          </div>

          {/* Documents Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
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
          </div>

          {/* Form Actions */}
          <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              {editingVendor ? 'Update Vendor' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
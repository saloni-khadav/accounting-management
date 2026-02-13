import React, { useState } from 'react';
import { X, Save, FileText, Upload, Download, Plus } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const ClientForm = ({ isOpen, onClose, onSave, editingClient }) => {
  const [formData, setFormData] = useState({
    clientCode: '',
    clientName: '',
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
    clientCategory: '',
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
      if (editingClient) {
        console.log('Loading client for editing:', editingClient);
        console.log('Client gstNumbers:', editingClient.gstNumbers);
        console.log('Client documents:', editingClient.documents);
        
        setFormData({
          clientCode: editingClient.clientCode || '',
          clientName: editingClient.clientName || '',
          contactPerson: editingClient.contactPerson || '',
          contactDetails: editingClient.contactDetails || '',
          email: editingClient.email || '',
          website: editingClient.website || '',
          billingAddress: editingClient.billingAddress || '',
          gstNumber: editingClient.gstNumber || '',
          gstNumbers: editingClient.gstNumbers && editingClient.gstNumbers.length > 0 
            ? editingClient.gstNumbers.map(gst => ({ 
                ...gst, 
                billingAddress: gst.billingAddress || '', 
                hasDocument: !!editingClient.documents?.gstCertificate, 
                isExisting: !!gst.gstNumber 
              }))
            : editingClient.gstNumber 
              ? [{ 
                  gstNumber: editingClient.gstNumber, 
                  billingAddress: editingClient.billingAddress || '', 
                  isDefault: true, 
                  hasDocument: !!editingClient.documents?.gstCertificate, 
                  isExisting: !!editingClient.gstNumber 
                }]
              : [{ gstNumber: '', billingAddress: '', isDefault: true, hasDocument: false, isExisting: false }],
          panNumber: editingClient.panNumber || '',
          paymentTerms: editingClient.paymentTerms || '',
          creditLimit: editingClient.creditLimit || '',
          accountNumber: editingClient.accountNumber || editingClient.bankDetails || '',
          ifscCode: editingClient.ifscCode || '',
          bankName: editingClient.bankName || '',
          industryType: editingClient.industryType || '',
          clientCategory: editingClient.clientCategory || '',
          contractDates: editingClient.contractDates || '',
          contractStartDate: editingClient.contractStartDate ? 
            (editingClient.contractStartDate.includes('T') ? editingClient.contractStartDate.split('T')[0] : editingClient.contractStartDate) : '',
          contractEndDate: editingClient.contractEndDate ? 
            (editingClient.contractEndDate.includes('T') ? editingClient.contractEndDate.split('T')[0] : editingClient.contractEndDate) : '',
          currency: editingClient.currency || 'INR',
          status: editingClient.status || 'Active',
          accountManager: editingClient.accountManager || '',
          aadharNumber: editingClient.aadharNumber || '',
          documents: {
            panCard: editingClient.documents?.panCard || null,
            aadharCard: editingClient.documents?.aadharCard || null,
            gstCertificate: editingClient.documents?.gstCertificate || null,
            bankStatement: editingClient.documents?.bankStatement || null,
            otherDocuments: editingClient.documents?.otherDocuments || []
          }
        });
        
        console.log('Form data set for editing client');
      } else {
        // Generate client code for new client
        generateClientCode();
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      alert('Error loading client data. Please try again.');
    }
  }, [editingClient]);

  const generateClientCode = async () => {
    try {
      // First try to get existing clients to calculate next code
      const response = await fetch('http://localhost:5001/api/clients');
      if (response.ok) {
        const clients = await response.json();
        
        // Extract client codes and find the highest number
        const clientCodes = clients
          .map(client => client.clientCode)
          .filter(code => code && code.startsWith('CC'))
          .map(code => {
            const num = parseInt(code.substring(2));
            return isNaN(num) ? 0 : num;
          });
        
        const maxNumber = clientCodes.length > 0 ? Math.max(...clientCodes) : 0;
        const nextNumber = maxNumber + 1;
        const nextCode = `CC${nextNumber.toString().padStart(3, '0')}`;
        
        setFormData({
          clientCode: nextCode,
          clientName: '',
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
          clientCategory: '',
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
        throw new Error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error generating client code:', error);
      // Fallback to CC001 if API fails
      setFormData(prev => ({ ...prev, clientCode: 'CC001' }));
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
      const response = await fetch('http://localhost:5001/api/ocr/extract', {
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
      window.open(`http://localhost:5001/api/clients/download/${file}`, '_blank');
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
    
    // Validate GST numbers
    for (let i = 0; i < formData.gstNumbers.length; i++) {
      const gst = formData.gstNumbers[i];
      if (gst.gstNumber && gst.gstNumber.length !== 15) {
        alert(`GST Number ${i + 1} must be exactly 15 characters. Current length: ${gst.gstNumber.length}`);
        return;
      }
    }
    
    // Validate contact details (mobile number)
    const digits = formData.contactDetails.replace(/[^0-9]/g, '');
    if (digits.length !== 10) {
      alert(`Contact Details must contain exactly 10 digits. Current: ${digits.length} digits`);
      return;
    }
    
    // Validate account number (9-18 digits)
    const accountDigits = formData.accountNumber.replace(/[^0-9]/g, '');
    if (formData.accountNumber !== accountDigits || accountDigits.length < 9 || accountDigits.length > 18) {
      alert(`Account Number must contain only numbers and be between 9 to 18 digits. Current: ${accountDigits.length} digits`);
      return;
    }
    
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
      
      const url = editingClient 
        ? `http://localhost:5001/api/clients/${editingClient._id}`
        : 'http://localhost:5001/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      if (response.ok) {
        const savedClient = await response.json();
        onSave(savedClient);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving client');
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code *
              </label>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                readOnly
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name / Company Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  editingClient ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                readOnly={editingClient}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Details (Mobile, Landline) *
              </label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
              Billing Address with PIN Code *
            </label>
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              placeholder="Auto-filled from default GST number - cannot be edited manually"
              readOnly
              required
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
                    editingClient ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  readOnly={editingClient}
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
                    disabled={editingClient}
                  />
                  <label
                    htmlFor="panFile"
                    className={`px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center ${
                      editingClient
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
                  {(formData.documents.panCard || editingClient?.documents?.panCard) && (
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
                Payment Terms *
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit *
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code *
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
                Bank Name *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Industry Type *
              </label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Category *
              </label>
              <select
                name="clientCategory"
                value={formData.clientCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                Contract Start Date *
              </label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract End Date *
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
              Assigned Account Manager *
            </label>
            <input
              type="text"
              name="accountManager"
              value={formData.accountManager}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
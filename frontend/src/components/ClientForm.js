import React, { useState } from 'react';
import { X, Save, FileText, Upload, Download, Plus, Users, CreditCard, Building } from 'lucide-react';
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
    const baseUrl = 'https://nextbook-backend.nextsphere.co.in';
    try {
      // First try to get existing clients to calculate next code
      const response = await fetch(`${baseUrl}/api/clients`);
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
    const baseUrl = 'https://nextbook-backend.nextsphere.co.in';
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
      const response = await fetch(`${baseUrl}/api/ocr/extract`, {
        method: 'POST',
        body: formDataUpload
      });

      const result = await response.json();
      console.log('OCR API Response:', result);
      console.log('Document Type:', documentType);
      console.log('Result Success:', result.success);
      console.log('Result Data:', result.data);

      if (result.success && result.data) {
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
            const extractedGST = result.data.gstNumber;
            const extractedPAN = extractedGST.substring(2, 12);
            
            // Validate PAN matches existing GST entries
            const existingPANs = formData.gstNumbers
              .filter((gst, idx) => idx !== gstIndex && gst.gstNumber)
              .map(gst => gst.gstNumber.substring(2, 12));
            
            if (existingPANs.length > 0 && !existingPANs.includes(extractedPAN)) {
              setUploadStates(prev => ({
                ...prev,
                [stateKey]: { loading: false, error: 'This GST belongs to a different company. All GST numbers must belong to the same company (same PAN).' }
              }));
              alert('Error: This GST belongs to a different company. All GST numbers must belong to the same company (same PAN).');
              return;
            }
            
            // If PAN field is empty, fill it from GST
            if (!formData.panNumber) {
              updates.panNumber = extractedPAN;
            } else if (formData.panNumber !== extractedPAN) {
              // If PAN already exists but doesn't match
              setUploadStates(prev => ({
                ...prev,
                [stateKey]: { loading: false, error: 'GST PAN does not match the existing PAN number.' }
              }));
              alert('Error: GST PAN does not match the existing PAN number.');
              return;
            }
            
            const updatedGSTNumbers = [...formData.gstNumbers];
            if (gstIndex !== null) {
              updatedGSTNumbers[gstIndex].gstNumber = result.data.gstNumber;
              if (result.data.billingAddress) {
                updatedGSTNumbers[gstIndex].billingAddress = result.data.billingAddress;
              }
              updatedGSTNumbers[gstIndex].hasDocument = true;
            }
            updates.gstNumbers = updatedGSTNumbers;
            updates.gstNumber = updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || '';
            if (updatedGSTNumbers[gstIndex]?.isDefault && result.data.billingAddress) {
              updates.billingAddress = result.data.billingAddress;
            }
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
            [stateKey]: { loading: false, error: result.message || `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document.` }
          }));
          
          alert(result.message || `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document. Please upload the correct document.`);
        }
      } else {
        console.log('OCR failed - result.success is false');
        console.log('Result message:', result.message);
        setUploadStates(prev => ({
          ...prev,
          [stateKey]: { loading: false, error: result.message || `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document.` }
        }));
        
        alert(result.message || `${documentType === 'panCard' ? 'PAN number' : documentType === 'gstCertificate' ? 'GST number' : documentType === 'aadharCard' ? 'Aadhar number' : 'Bank details'} not found in this document. Please upload the correct document.`);
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
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    
    // Calculate existing documents size
    const existingSize = formData.documents.otherDocuments.reduce((sum, doc) => {
      if (doc instanceof File) {
        return sum + doc.size;
      }
      return sum;
    }, 0);
    
    // Calculate new files size
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    
    // Check total size
    const totalSize = existingSize + newFilesSize;
    
    if (totalSize > MAX_TOTAL_SIZE) {
      const remainingSize = MAX_TOTAL_SIZE - existingSize;
      alert(`Total document size cannot exceed 10MB. You have ${(existingSize / (1024 * 1024)).toFixed(2)}MB already uploaded. Only ${(remainingSize / (1024 * 1024)).toFixed(2)}MB remaining.`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Only PDF, JPG, JPEG, PNG, DOC, and DOCX files are allowed.');
      e.target.value = ''; // Reset file input
      return;
    }
    
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        otherDocuments: [...formData.documents.otherDocuments, ...files]
      }
    });
    e.target.value = ''; // Reset file input for next upload
  };

  const downloadDocument = (file, index) => {
    const baseUrl = 'https://nextbook-backend.nextsphere.co.in';
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
      window.open(`${baseUrl}/api/clients/download/${file}`, '_blank');
    }
  };

  const viewDocument = (file) => {
    const baseUrl = 'https://nextbook-backend.nextsphere.co.in';
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else if (typeof file === 'string') {
      window.open(`${baseUrl}/api/clients/download/${file}`, '_blank');
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
    const baseUrl = 'https://nextbook-backend.nextsphere.co.in'; // Hard-coded for testing
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
        ? `${baseUrl}/api/clients/${editingClient._id}`
        : `${baseUrl}/api/clients`;
      const method = editingClient ? 'PUT' : 'POST';
      
      console.log('=== SENDING CLIENT REQUEST ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('contractStartDate:', formData.contractStartDate);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const savedClient = await response.json();
        onSave(savedClient);
        onClose();
        alert(editingClient ? 'Client updated successfully!' : 'Client added successfully!');
      } else {
        const errorData = await response.json();
        if (errorData.isPastDateError) {
          alert(errorData.message);
        } else {
          alert(errorData.message || 'Error saving client');
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
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
                    Client Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientCode"
                    value={formData.clientCode}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 font-medium"
                    readOnly
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name / Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editingClient ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    readOnly={editingClient}
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add GST
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.gstNumbers.map((gstItem, index) => (
                      <div key={index} className="space-y-2 p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={gstItem.gstNumber}
                            onChange={(e) => handleGSTChange(index, 'gstNumber', e.target.value)}
                            maxLength="15"
                            placeholder="15 characters GST number"
                            className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              (gstItem.isExisting && gstItem.gstNumber) ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            readOnly={gstItem.isExisting && gstItem.gstNumber}
                          />
                          <button
                            type="button"
                            onClick={() => setDefaultGST(index)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                              gstItem.isDefault 
                                ? 'bg-green-500 text-white border-2 border-green-600' 
                                : 'bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50'
                            }`}
                            title={gstItem.isDefault ? 'Default GST' : 'Set as Default'}
                          >
                            {gstItem.isDefault ? '✓ Default' : 'Set Default'}
                          </button>
                          {!gstItem.isExisting && formData.gstNumbers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGSTNumber(index)}
                              className="px-3 py-2 text-xs font-medium bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
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
                              className={`px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                (gstItem.isExisting && gstItem.gstNumber)
                                  ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                                  : 'bg-blue-50 cursor-pointer hover:bg-blue-100 text-blue-600'
                              }`}
                            >
                              {uploadStates[`gst_${index}`]?.loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              Upload
                            </label>
                            {gstItem.hasDocument && (
                              <span className="ml-2 text-green-600 text-lg font-bold">✓</span>
                            )}
                          </div>
                        </div>
                        <textarea
                          value={gstItem.billingAddress}
                          onChange={(e) => handleGSTChange(index, 'billingAddress', e.target.value)}
                          placeholder="Billing address for this GST number"
                          rows="2"
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            (gstItem.isExisting && gstItem.gstNumber) ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          readOnly={gstItem.isExisting && gstItem.gstNumber}
                        />
                        {uploadStates[`gst_${index}`]?.error && (
                          <p className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded">{uploadStates[`gst_${index}`]?.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number <span className="text-red-500">*</span>
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
                      className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                        className={`px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          editingClient
                            ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                            : 'bg-blue-50 cursor-pointer hover:bg-blue-100 text-blue-600'
                        }`}
                      >
                        {uploadStates.pan.loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Upload
                      </label>
                      {(formData.documents.panCard || editingClient?.documents?.panCard) && (
                        <span className="ml-2 text-green-600 text-lg font-bold">✓</span>
                      )}
                    </div>
                  </div>
                  {uploadStates.pan.error && (
                    <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded">{uploadStates.pan.error}</p>
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
                    Client Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientCategory"
                    value={formData.clientCategory}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-3 py-2.5 bg-blue-50 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-blue-100 text-sm font-medium flex items-center gap-1 text-blue-600"
                      >
                        {uploadStates.aadhar.loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Upload
                      </label>
                      {formData.documents.aadharCard && (
                        <span className="ml-2 text-green-600 text-lg font-bold">✓</span>
                      )}
                    </div>
                  </div>
                  {uploadStates.aadhar.error && (
                    <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded">{uploadStates.aadhar.error}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Other Documents
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {((formData.documents.otherDocuments.reduce((sum, doc) => sum + (doc instanceof File ? doc.size : 0), 0)) / (1024 * 1024)).toFixed(2)}MB / 10MB
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleOtherDocumentUpload}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {formData.documents.otherDocuments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents:</p>
                  <div className="space-y-2">
                    {formData.documents.otherDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border-2 border-gray-200 px-4 py-3 rounded-lg hover:border-blue-300 transition-colors">
                        <span className="text-sm text-gray-700 font-medium flex items-center">
                          <FileText size={16} className="mr-2 text-blue-600" />
                          {file instanceof File ? file.name : file}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => viewDocument(file)}
                            className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            title="View"
                          >
                            <FileText size={16} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocument(file, index)}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOtherDocument(index)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;


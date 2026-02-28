import React, { useState, useEffect } from 'react';
import { Upload, Building, Save, Eye, EyeOff, Plus, Trash2, Download, FileText } from 'lucide-react';
import { validateGST } from '../utils/gstUtils';

const Profile = () => {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
  
  const [profileData, setProfileData] = useState({
    companyLogo: null,
    companyLogoUrl: null,
    gstNumber: '',
    gstNumbers: [{ gstNumber: '', address: '', tradeName: '', panNumber: '', isDefault: true, gstCertificate: null }],
    tradeName: '',
    address: '',
    panNumber: '',
    tanNumber: '',
    mcaNumber: '',
    msmeStatus: 'No',
    msmeNumber: '',
    msmeFile: null,
    bankAccounts: [{ bankName: '', accountNumber: '', ifscCode: '', branchName: '', bankStatement: null }]
  });

  const [showPanFull, setShowPanFull] = useState(false);
  const [uploadStates, setUploadStates] = useState({
    gst: false,
    mca: false,
    msme: false,
    tan: false
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.profile && Object.keys(result.profile).length > 0) {
            const profile = result.profile;
            setProfileData(prev => ({
              ...prev,
              gstNumber: profile.gstNumber || '',
              gstNumbers: profile.gstNumbers && profile.gstNumbers.length > 0 
                ? profile.gstNumbers.map(gst => ({
                    ...gst,
                    gstCertificate: gst.gstCertificate ? `${baseUrl}/${gst.gstCertificate}` : null,
                    gstCertificateName: gst.gstCertificateName
                  }))
                : profile.gstNumber 
                  ? [{ gstNumber: profile.gstNumber, address: profile.address || '', tradeName: profile.tradeName || '', panNumber: profile.panNumber || '', isDefault: true }]
                  : [{ gstNumber: '', address: '', tradeName: '', panNumber: '', isDefault: true }],
              tradeName: profile.tradeName || '',
              panNumber: profile.panNumber || '',
              tanNumber: profile.tanNumber || '',
              address: profile.address || '',
              mcaNumber: profile.mcaNumber || '',
              msmeStatus: profile.msmeStatus || 'No',
              msmeNumber: profile.msmeNumber || '',
              companyLogoUrl: profile.companyLogo ? `${baseUrl}/${profile.companyLogo}` : null,
              tanFile: profile.tanCertificate ? { name: profile.tanCertificateName || 'TAN Certificate', url: `${baseUrl}/${profile.tanCertificate}` } : null,
              mcaFile: profile.mcaCertificate ? { name: profile.mcaCertificateName || 'MCA Certificate', url: `${baseUrl}/${profile.mcaCertificate}` } : null,
              msmeFile: profile.msmeCertificate ? { name: profile.msmeCertificateName || 'MSME Certificate', url: `${baseUrl}/${profile.msmeCertificate}` } : null,
              bankAccounts: profile.bankAccounts && profile.bankAccounts.length > 0 
                ? profile.bankAccounts.map(bank => ({
                    ...bank,
                    bankStatement: bank.bankStatement ? `${baseUrl}/${bank.bankStatement}` : null,
                    bankStatementName: bank.bankStatementName
                  }))
                : [{ bankName: '', accountNumber: '', ifscCode: '', branchName: '', bankStatement: null }]
            }));
          }
        }
      } catch (error) {
        console.log('No saved profile data found');
      }
    };
    loadProfileData();
  }, [baseUrl]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleGSTChange = (index, field, value) => {
    const updatedGSTNumbers = [...profileData.gstNumbers];
    updatedGSTNumbers[index][field] = value;
    
    const newFormData = {
      ...profileData,
      gstNumbers: updatedGSTNumbers,
      gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || ''
    };
    
    if (field === 'address' && updatedGSTNumbers[index].isDefault) {
      newFormData.address = value;
    }
    
    setProfileData(newFormData);
    
    if (field === 'gstNumber' && value && value.length === 15) {
      const validation = validateGST(value);
      if (validation.isValid) fetchGSTDetails(validation.cleanGST, index);
    }
  };

  const addGSTNumber = () => {
    setProfileData({
      ...profileData,
      gstNumbers: [...profileData.gstNumbers, { gstNumber: '', address: '', tradeName: '', panNumber: '', isDefault: false, gstCertificate: null }]
    });
  };

  const removeGSTNumber = (index) => {
    if (profileData.gstNumbers.length > 1) {
      const updatedGSTNumbers = profileData.gstNumbers.filter((_, i) => i !== index);
      if (profileData.gstNumbers[index].isDefault && updatedGSTNumbers.length > 0) {
        updatedGSTNumbers[0].isDefault = true;
      }
      setProfileData({
        ...profileData,
        gstNumbers: updatedGSTNumbers,
        gstNumber: updatedGSTNumbers.find(gst => gst.isDefault)?.gstNumber || updatedGSTNumbers[0]?.gstNumber || '',
        address: updatedGSTNumbers.find(gst => gst.isDefault)?.address || updatedGSTNumbers[0]?.address || ''
      });
    }
  };

  const setDefaultGST = (index) => {
    const updatedGSTNumbers = profileData.gstNumbers.map((gst, i) => ({
      ...gst,
      isDefault: i === index
    }));
    const selectedGST = updatedGSTNumbers[index];
    setProfileData({
      ...profileData,
      gstNumbers: updatedGSTNumbers,
      gstNumber: selectedGST.gstNumber || '',
      address: selectedGST.address || '',
      tradeName: selectedGST.tradeName || profileData.tradeName,
      panNumber: selectedGST.panNumber || profileData.panNumber
    });
  };

  const handleFileUpload = async (field, file, gstIndex = null) => {
    if (field === 'gstCertificate' && gstIndex !== null) {
      const updatedGSTNumbers = [...profileData.gstNumbers];
      updatedGSTNumbers[gstIndex] = {
        ...updatedGSTNumbers[gstIndex],
        gstCertificate: file,
        gstNumber: '',
        address: '',
        tradeName: '',
        panNumber: ''
      };
      setProfileData(prev => ({ ...prev, gstNumbers: updatedGSTNumbers }));
      const success = await processGSTDocument(file, gstIndex);
      if (!success) {
        updatedGSTNumbers[gstIndex].gstCertificate = null;
        setProfileData(prev => ({ ...prev, gstNumbers: updatedGSTNumbers }));
      }
    } else {
      if (field === 'mcaFile') {
        setProfileData(prev => ({ ...prev, mcaFile: file, mcaNumber: '' }));
        const success = await extractMCANumber(file);
        if (!success) setProfileData(prev => ({ ...prev, mcaFile: null }));
      } else if (field === 'msmeFile') {
        setProfileData(prev => ({ ...prev, msmeFile: file, msmeNumber: '' }));
        const success = await extractMSMENumber(file);
        if (!success) setProfileData(prev => ({ ...prev, msmeFile: null }));
      } else if (field === 'tanFile') {
        setProfileData(prev => ({ ...prev, tanFile: file, tanNumber: '' }));
        const success = await extractTANNumber(file);
        if (!success) setProfileData(prev => ({ ...prev, tanFile: null }));
      } else {
        setProfileData(prev => ({ ...prev, [field]: file }));
      }
    }
  };

  const processGSTDocument = async (file, gstIndex = 0) => {
    setUploadStates(prev => ({ ...prev, [`gst_${gstIndex}`]: true }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'gstCertificate');
      
      console.log(`Uploading GST certificate for index ${gstIndex}...`);
      const ocrResponse = await fetch(`${baseUrl}/api/ocr/extract`, { method: 'POST', body: formData });
      const ocrResult = await ocrResponse.json();
      
      console.log('OCR Response Status:', ocrResponse.ok);
      console.log('OCR Result:', ocrResult);
      
      if (ocrResponse.ok && ocrResult.success && ocrResult.data.gstNumber) {
        const extractedGST = ocrResult.data.gstNumber;
        const extractedPAN = extractedGST.substring(2, 12);
        
        if (profileData.gstNumbers.some((gst, idx) => idx !== gstIndex && gst.gstNumber && gst.gstNumber.substring(2, 12) !== extractedPAN)) {
          alert('Error: This GST belongs to a different company. All GST numbers must belong to the same company (same PAN).');
          setUploadStates(prev => ({ ...prev, [`gst_${gstIndex}`]: false }));
          return false;
        }
        
        let extractedTradeName = (ocrResult.data.tradeName || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const extractedAddress = ocrResult.data.billingAddress || '';
        
        setProfileData(prev => {
          const updatedGSTNumbers = [...prev.gstNumbers];
          updatedGSTNumbers[gstIndex] = {
            ...updatedGSTNumbers[gstIndex],
            gstNumber: extractedGST,
            address: extractedAddress,
            tradeName: extractedTradeName,
            panNumber: extractedPAN,
            gstCertificateName: undefined
          };
          
          const defaultGST = updatedGSTNumbers.find(g => g.isDefault) || updatedGSTNumbers[0];
          
          return { 
            ...prev, 
            gstNumber: defaultGST.gstNumber,
            gstNumbers: updatedGSTNumbers,
            tradeName: defaultGST.tradeName || prev.tradeName,
            address: defaultGST.address,
            panNumber: defaultGST.panNumber || prev.panNumber
          };
        });
        alert('GST certificate processed successfully!');
        return true;
      } else {
        alert('Could not extract GST number from the document.');
        return false;
      }
    } catch (error) {
      console.error('Error processing GST document:', error);
      alert('Error processing GST document.');
      return false;
    } finally {
      setUploadStates(prev => ({ ...prev, [`gst_${gstIndex}`]: false }));
    }
  };

  const extractMCANumber = async (file) => {
    setUploadStates(prev => ({ ...prev, mca: true }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'mcaCertificate');
      const response = await fetch(`${baseUrl}/api/ocr/extract`, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (response.ok && result.success && result.data.mcaNumber) {
        setProfileData(prev => ({ ...prev, mcaNumber: result.data.mcaNumber }));
        alert(`MCA number extracted: ${result.data.mcaNumber}`);
        return true;
      } else {
        alert('MCA number not found in this document. Please upload the correct MCA certificate.');
        return false;
      }
    } catch (error) {
      alert('Error processing MCA document. Please try again.');
      return false;
    } finally {
      setUploadStates(prev => ({ ...prev, mca: false }));
    }
  };

  const extractMSMENumber = async (file) => {
    setUploadStates(prev => ({ ...prev, msme: true }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'msmeCertificate');
      const response = await fetch(`${baseUrl}/api/ocr/extract`, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (response.ok && result.success && result.data.msmeNumber) {
        setProfileData(prev => ({ ...prev, msmeNumber: result.data.msmeNumber, msmeStatus: 'Yes' }));
        alert(`MSME number extracted: ${result.data.msmeNumber}`);
        return true;
      } else {
        alert('MSME number not found in this document. Please upload the correct MSME certificate.');
        return false;
      }
    } catch (error) {
      alert('Error processing MSME document. Please try again.');
      return false;
    } finally {
      setUploadStates(prev => ({ ...prev, msme: false }));
    }
  };

  const extractTANNumber = async (file) => {
    setUploadStates(prev => ({ ...prev, tan: true }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'tanCertificate');
      const response = await fetch(`${baseUrl}/api/ocr/extract`, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (response.ok && result.success && result.data.tanNumber) {
        setProfileData(prev => ({ ...prev, tanNumber: result.data.tanNumber }));
        alert(`TAN number extracted: ${result.data.tanNumber}`);
        return true;
      } else {
        alert('TAN number not found in this document. Please upload the correct TAN certificate.');
        return false;
      }
    } catch (error) {
      alert('Error processing TAN document. Please try again.');
      return false;
    } finally {
      setUploadStates(prev => ({ ...prev, tan: false }));
    }
  };

  const extractBankDetails = async (file, index) => {
    setUploadStates(prev => ({ ...prev, [`bank_${index}`]: { loading: true } }));
    
    // Store file and clear fields
    setProfileData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((acc, i) => 
        i === index ? { ...acc, bankStatement: file, accountNumber: '', ifscCode: '', bankName: '', branchName: '' } : acc
      )
    }));
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'bankStatement');
      formData.append('companyTradeName', profileData.tradeName);
      
      const response = await fetch(`${baseUrl}/api/ocr/extract`, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (response.ok && result.success) {
        const updates = {};
        let dataFound = false;
        
        if (result.data.accountNumber) {
          updates.accountNumber = result.data.accountNumber;
          dataFound = true;
        }
        if (result.data.ifscCode) {
          updates.ifscCode = result.data.ifscCode;
          dataFound = true;
        }
        if (result.data.bankName) {
          updates.bankName = result.data.bankName;
          dataFound = true;
        }
        
        if (dataFound) {
          setProfileData(prev => ({
            ...prev,
            bankAccounts: prev.bankAccounts.map((acc, i) => 
              i === index ? { ...acc, ...updates } : acc
            )
          }));
          alert('Bank details extracted successfully!');
        } else {
          // Remove file if no data found
          setProfileData(prev => ({
            ...prev,
            bankAccounts: prev.bankAccounts.map((acc, i) => 
              i === index ? { ...acc, bankStatement: null } : acc
            )
          }));
          alert('Bank details not found in this document. Please upload the correct bank statement.');
        }
      } else {
        // Remove file if extraction failed
        setProfileData(prev => ({
          ...prev,
          bankAccounts: prev.bankAccounts.map((acc, i) => 
            i === index ? { ...acc, bankStatement: null } : acc
          )
        }));
        alert(result.message || 'Bank details not found in this document. Please upload the correct bank statement.');
      }
    } catch (error) {
      console.error('Error:', error);
      // Remove file on error
      setProfileData(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((acc, i) => 
          i === index ? { ...acc, bankStatement: null } : acc
        )
      }));
      alert('Error processing bank document.');
    } finally {
      setUploadStates(prev => ({ ...prev, [`bank_${index}`]: { loading: false } }));
    }
  };

  const fetchGSTDetails = async (gstNumber, index = 0) => {
    const validation = validateGST(gstNumber);
    if (!validation.isValid) return;
    setUploadStates(prev => ({ ...prev, gst: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/gst/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gstNumber: validation.cleanGST })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const { tradeName, panNumber, address } = result.data;
        const updatedGSTNumbers = [...profileData.gstNumbers];
        updatedGSTNumbers[index].address = address;
        
        setProfileData(prev => ({ 
          ...prev, 
          tradeName, 
          panNumber,
          gstNumbers: updatedGSTNumbers,
          address: updatedGSTNumbers[index].isDefault ? address : prev.address
        }));
      }
    } catch (error) {
      console.error('GST API Error:', error);
    } finally {
      setUploadStates(prev => ({ ...prev, gst: false }));
    }
  };

  const maskPanNumber = (pan) => {
    if (!pan || pan.length < 6) return pan;
    return pan.substring(0, 2) + '*'.repeat(pan.length - 5) + pan.substring(pan.length - 3);
  };

  const addBankAccount = () => {
    setProfileData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '', ifscCode: '', branchName: '', bankStatement: null }]
    }));
  };

  const removeBankAccount = async (index) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/profile/bank/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
        }));
        alert('Bank account deleted successfully');
      } else {
        alert('Error deleting bank account');
      }
    } catch (error) {
      alert('Error deleting bank account');
    }
  };

  const updateBankAccount = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  const handleSave = async () => {
    if (!profileData.gstNumbers[0]?.gstNumber) {
      alert('At least one GST Number is required');
      return;
    }
    
    const defaultGST = profileData.gstNumbers.find(gst => gst.isDefault) || profileData.gstNumbers[0];
    const finalGSTNumber = defaultGST?.gstNumber || '';
    
    // Validate bank accounts
    for (let i = 0; i < profileData.bankAccounts.length; i++) {
      const account = profileData.bankAccounts[i];
      
      if (account.accountNumber) {
        const accountDigits = account.accountNumber.replace(/[^0-9]/g, '');
        if (account.accountNumber !== accountDigits || accountDigits.length < 9 || accountDigits.length > 18) {
          alert(`Bank Account ${i + 1}: Account Number must contain only numbers and be between 9 to 18 digits. Current: ${accountDigits.length} digits`);
          return;
        }
      }
      
      if (account.ifscCode && account.ifscCode.length !== 11) {
        alert(`Bank Account ${i + 1}: IFSC Code must be exactly 11 characters. Current: ${account.ifscCode.length} characters`);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add company logo
      if (profileData.companyLogo instanceof File) {
        formData.append('companyLogo', profileData.companyLogo);
      }
      
      // Add GST certificates
      profileData.gstNumbers.forEach((gst, index) => {
        if (gst.gstCertificate instanceof File) {
          formData.append('gstCertificates', gst.gstCertificate);
        }
      });
      
      // Add bank statements
      profileData.bankAccounts.forEach((bank, index) => {
        if (bank.bankStatement instanceof File) {
          formData.append('bankStatements', bank.bankStatement);
        }
      });
      
      // Add other certificates
      if (profileData.tanFile instanceof File) {
        formData.append('tanCertificate', profileData.tanFile);
      }
      if (profileData.mcaFile instanceof File) {
        formData.append('mcaCertificate', profileData.mcaFile);
      }
      if (profileData.msmeFile instanceof File) {
        formData.append('msmeCertificate', profileData.msmeFile);
      }
      
      // Add text fields
      formData.append('gstNumber', finalGSTNumber);
      formData.append('gstNumbers', JSON.stringify(profileData.gstNumbers.map((gst, index) => ({
        gstNumber: gst.gstNumber,
        address: gst.address,
        tradeName: gst.tradeName,
        panNumber: gst.panNumber,
        isDefault: gst.isDefault,
        gstCertificate: gst.gstCertificate instanceof File ? null : gst.gstCertificate,
        gstCertificateName: gst.gstCertificate instanceof File ? null : gst.gstCertificateName
      }))));
      formData.append('tradeName', profileData.tradeName);
      formData.append('address', profileData.address);
      formData.append('panNumber', profileData.panNumber);
      formData.append('tanNumber', profileData.tanNumber);
      formData.append('mcaNumber', profileData.mcaNumber);
      formData.append('msmeStatus', profileData.msmeStatus);
      formData.append('msmeNumber', profileData.msmeNumber);
      formData.append('bankAccounts', JSON.stringify(profileData.bankAccounts.map((bank, index) => ({
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        branchName: bank.branchName,
        bankStatement: bank.bankStatement instanceof File ? null : bank.bankStatement,
        bankStatementName: bank.bankStatement instanceof File ? null : bank.bankStatementName
      }))));
      
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Profile saved successfully!');
        window.dispatchEvent(new CustomEvent('settingsUpdated'));
      } else {
        alert('Error saving profile: ' + result.message);
      }
    } catch (error) {
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-xl">
            <h1 className="text-2xl font-bold flex items-center">
              <Building className="mr-3" size={28} />
              Company Profile
            </h1>
            <p className="text-blue-100 mt-1">Manage your company information and settings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* GST Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
              <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">GST Information *</h3>
                  <button onClick={addGSTNumber} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add GST
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {profileData.gstNumbers.map((gst, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">GST {index + 1}</span>
                        {gst.isDefault && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Default</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!gst.isDefault && (
                          <button onClick={() => setDefaultGST(index)} className="text-blue-600 hover:text-blue-800 text-sm">
                            Set Default
                          </button>
                        )}
                        {profileData.gstNumbers.length > 1 && (
                          <button onClick={() => removeGSTNumber(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                        <input type="text" value={gst.gstNumber} onChange={(e) => handleGSTChange(index, 'gstNumber', e.target.value.toUpperCase())} maxLength="15" placeholder="Enter 15-digit GST Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                        <textarea value={gst.address} onChange={(e) => handleGSTChange(index, 'address', e.target.value)} rows="2" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" placeholder="Enter billing address" />
                      </div>
                      <div>
                        <label className={`cursor-pointer bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md text-sm ${uploadStates[`gst_${index}`] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadStates[`gst_${index}`] ? 'Processing...' : 'Upload GST Certificate'}
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload('gstCertificate', e.target.files[0], index);
                                e.target.value = '';
                              }
                            }} 
                            className="hidden" 
                            disabled={uploadStates[`gst_${index}`]} 
                          />
                        </label>
                        {gst.gstCertificate && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span className="flex-1">{gst.gstCertificate instanceof File ? gst.gstCertificate.name : (gst.gstCertificateName || 'GST Certificate')}</span>
                            <button onClick={() => {
                              const url = gst.gstCertificate instanceof File ? URL.createObjectURL(gst.gstCertificate) : gst.gstCertificate;
                              window.open(url);
                            }} className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <a href={gst.gstCertificate instanceof File ? URL.createObjectURL(gst.gstCertificate) : gst.gstCertificate} download="GST-Certificate.pdf" className="text-green-600 hover:text-green-800">
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trade Name</label>
                  <input type="text" value={profileData.tradeName} onChange={(e) => handleInputChange('tradeName', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Enter trade name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company PAN Number</label>
                  <div className="relative">
                    <input type="text" value={showPanFull ? profileData.panNumber : maskPanNumber(profileData.panNumber)} onChange={(e) => handleInputChange('panNumber', e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Enter PAN number" />
                    <button onClick={() => setShowPanFull(!showPanFull)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors">
                      {showPanFull ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TAN Number</label>
                  <input type="text" value={profileData.tanNumber} onChange={(e) => handleInputChange('tanNumber', e.target.value.toUpperCase())} maxLength="10" placeholder="Enter 10-character TAN Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">TAN Certificate</label>
                  <label className={`cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${uploadStates.tan ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadStates.tan ? 'Processing...' : 'Upload TAN Certificate'}
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload('tanFile', e.target.files[0]);
                          e.target.value = '';
                        }
                      }} 
                      className="hidden" 
                      disabled={uploadStates.tan} 
                    />
                  </label>
                  {profileData.tanFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1">{profileData.tanFile.name}</span>
                      <button onClick={() => {
                        const url = profileData.tanFile instanceof File ? URL.createObjectURL(profileData.tanFile) : profileData.tanFile.url;
                        if (url) window.open(url);
                      }} className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <a href={profileData.tanFile instanceof File ? URL.createObjectURL(profileData.tanFile) : profileData.tanFile.url} download={profileData.tanFile.name} className="text-green-600 hover:text-green-800">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address & MCA Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
              <h3 className="text-lg font-semibold text-white">Address & Registration Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                  <textarea value={profileData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" placeholder="Enter complete address" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MCA Number</label>
                    <input type="text" value={profileData.mcaNumber} onChange={(e) => handleInputChange('mcaNumber', e.target.value)} placeholder="Enter MCA Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                  </div>
                  <label className={`cursor-pointer bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${uploadStates.mca ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadStates.mca ? 'Processing...' : 'Upload MCA Certificate'}
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload('mcaFile', e.target.files[0]);
                          e.target.value = '';
                        }
                      }} 
                      className="hidden" 
                      disabled={uploadStates.mca} 
                    />
                  </label>
                  {profileData.mcaFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1">{profileData.mcaFile.name}</span>
                      <button onClick={() => {
                        const url = profileData.mcaFile instanceof File ? URL.createObjectURL(profileData.mcaFile) : profileData.mcaFile.url;
                        if (url) window.open(url);
                      }} className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <a href={profileData.mcaFile instanceof File ? URL.createObjectURL(profileData.mcaFile) : profileData.mcaFile.url} download={profileData.mcaFile.name} className="text-green-600 hover:text-green-800">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MSME Registration Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
              <h3 className="text-lg font-semibold text-white">MSME Registration</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">MSME Status</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="msme" value="No" checked={profileData.msmeStatus === 'No'} onChange={(e) => handleInputChange('msmeStatus', e.target.value)} className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-gray-700">No</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="msme" value="Yes" checked={profileData.msmeStatus === 'Yes'} onChange={(e) => handleInputChange('msmeStatus', e.target.value)} className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>
                {profileData.msmeStatus === 'Yes' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">MSME Number</label>
                      <input type="text" value={profileData.msmeNumber} onChange={(e) => handleInputChange('msmeNumber', e.target.value)} placeholder="Enter MSME Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">MSME Certificate</label>
                      <label className={`cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${uploadStates.msme ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadStates.msme ? 'Processing...' : 'Upload Certificate'}
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload('msmeFile', e.target.files[0]);
                              e.target.value = '';
                            }
                          }} 
                          className="hidden" 
                          disabled={uploadStates.msme} 
                        />
                      </label>
                      {profileData.msmeFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="flex-1">{profileData.msmeFile.name}</span>
                          <button onClick={() => {
                            const url = profileData.msmeFile instanceof File ? URL.createObjectURL(profileData.msmeFile) : profileData.msmeFile.url;
                            if (url) window.open(url);
                          }} className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a href={profileData.msmeFile instanceof File ? URL.createObjectURL(profileData.msmeFile) : profileData.msmeFile.url} download={profileData.msmeFile.name} className="text-green-600 hover:text-green-800">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Accounts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Bank Accounts</h3>
                <button onClick={addBankAccount} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank
                </button>
              </div>
            </div>
            <div className="p-6">
              {profileData.bankAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No bank accounts added</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add Bank" to add your first bank account</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.bankAccounts.map((account, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <h4 className="font-semibold text-gray-800">Bank Account {index + 1}</h4>
                            <div className="flex items-center">
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const file = e.target.files[0]; if (file) extractBankDetails(file, index); }} className="hidden" id={`bankFile${index}`} />
                              <label htmlFor={`bankFile${index}`} className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-200 text-sm flex items-center font-medium text-blue-700 transition-colors">
                                {uploadStates[`bank_${index}`]?.loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div> : <Upload className="w-4 h-4 mr-2" />}
                                Upload Statement
                              </label>
                            </div>
                          </div>
                          {profileData.bankAccounts[index].bankStatement && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <FileText className="w-4 h-4" />
                              <span className="flex-1">{profileData.bankAccounts[index].bankStatement instanceof File ? profileData.bankAccounts[index].bankStatement.name : (profileData.bankAccounts[index].bankStatementName || 'Bank Statement')}</span>
                              <button onClick={() => {
                                const url = profileData.bankAccounts[index].bankStatement instanceof File ? URL.createObjectURL(profileData.bankAccounts[index].bankStatement) : profileData.bankAccounts[index].bankStatement;
                                window.open(url);
                              }} className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              <a href={profileData.bankAccounts[index].bankStatement instanceof File ? URL.createObjectURL(profileData.bankAccounts[index].bankStatement) : profileData.bankAccounts[index].bankStatement} download="Bank-Statement.pdf" className="text-green-600 hover:text-green-800">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                          <button onClick={() => removeBankAccount(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                            <input type="text" value={account.bankName} onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)} placeholder="Enter Bank Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                            <input type="text" value={account.accountNumber} onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)} placeholder="9-18 digits" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                            <input type="text" value={account.ifscCode} onChange={(e) => updateBankAccount(index, 'ifscCode', e.target.value.toUpperCase())} maxLength="11" placeholder="11 characters" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                            <input type="text" value={account.branchName} onChange={(e) => updateBankAccount(index, 'branchName', e.target.value)} placeholder="Enter Branch Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <Save className="w-5 h-5 mr-3" />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


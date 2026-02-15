import React, { useState, useEffect } from 'react';
import { Upload, Building, Save, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { validateGST } from '../utils/gstUtils';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    companyLogo: null,
    companyLogoUrl: null,
    gstNumber: '',
    gstCertificate: null,
    tradeName: '',
    address: '',
    panNumber: '',
    mcaNumber: '',
    msmeStatus: 'No',
    msmeNumber: '',
    msmeFile: null,
    bankAccounts: [{ bankName: '', accountNumber: '', ifscCode: '', branchName: '' }]
  });

  const [showPanFull, setShowPanFull] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStates, setUploadStates] = useState({});

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in'}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.user && result.user.profile) {
            const profile = result.user.profile;
            setProfileData(prev => ({
              ...prev,
              gstNumber: profile.gstNumber || '',
              tradeName: profile.tradeName || '',
              panNumber: profile.panNumber || '',
              address: profile.address || '',
              mcaNumber: profile.mcaNumber || '',
              msmeStatus: profile.msmeStatus || 'No',
              msmeNumber: profile.msmeNumber || '',
              companyLogoUrl: profile.companyLogo || null,
              bankAccounts: profile.bankAccounts && profile.bankAccounts.length > 0 ? profile.bankAccounts : [{ bankName: '', accountNumber: '', ifscCode: '', branchName: '' }]
            }));
          }
        }
      } catch (error) {
        console.log('No saved profile data found');
      }
    };
    loadProfileData();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (field === 'gstNumber' && value && value.length === 15) {
      const validation = validateGST(value);
      if (validation.isValid) fetchGSTDetails(validation.cleanGST);
    }
  };

  const handleFileUpload = async (field, file) => {
    setProfileData(prev => ({ ...prev, [field]: file }));
    if (field === 'gstCertificate' && file) await processGSTDocument(file);
    if (field === 'mcaFile' && file) await extractMCANumber(file);
    if (field === 'msmeFile' && file) await extractMSMENumber(file);
  };

  const processGSTDocument = async (file) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'gstCertificate');
      const ocrResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/ocr/extract', { method: 'POST', body: formData });
      const ocrResult = await ocrResponse.json();
      if (ocrResponse.ok && ocrResult.success && ocrResult.data.gstNumber) {
        const extractedGST = ocrResult.data.gstNumber;
        const token = localStorage.getItem('token');
        const verifyResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/gst/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ gstNumber: extractedGST })
        });
        const verifyResult = await verifyResponse.json();
        if (verifyResponse.ok && verifyResult.success) {
          const { gstNumber, tradeName, panNumber, address } = verifyResult.data;
          setProfileData(prev => ({ ...prev, gstNumber, tradeName, address, panNumber }));
          alert('GST certificate processed successfully!');
        } else {
          setProfileData(prev => ({ ...prev, gstNumber: extractedGST }));
          alert(`GST number extracted: ${extractedGST}. Verification failed.`);
        }
      } else {
        alert('Could not extract GST number from the document.');
      }
    } catch (error) {
      alert('Error processing GST document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractMCANumber = async (file) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'mcaCertificate');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/ocr/extract', { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok && result.success && result.data.mcaNumber) {
        setProfileData(prev => ({ ...prev, mcaNumber: result.data.mcaNumber }));
        alert(`MCA number extracted: ${result.data.mcaNumber}`);
      }
    } catch (error) {
      alert('Error processing MCA document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractMSMENumber = async (file) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'msmeCertificate');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/ocr/extract', { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok && result.success && result.data.msmeNumber) {
        setProfileData(prev => ({ ...prev, msmeNumber: result.data.msmeNumber, msmeStatus: 'Yes' }));
        alert(`MSME number extracted: ${result.data.msmeNumber}`);
      }
    } catch (error) {
      alert('Error processing MSME document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractBankDetails = async (file, index) => {
    setUploadStates(prev => ({ ...prev, [`bank_${index}`]: { loading: true } }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'bankStatement');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/ocr/extract', { method: 'POST', body: formData });
      const result = await response.json();
      
      console.log('OCR Response:', result);
      console.log('Success:', result.success);
      console.log('Data:', result.data);
      
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
        
        console.log('Data found:', dataFound);
        console.log('Updates:', updates);
        
        if (dataFound) {
          setProfileData(prev => ({
            ...prev,
            bankAccounts: prev.bankAccounts.map((acc, i) => 
              i === index ? { ...acc, ...updates } : acc
            )
          }));
          alert('Bank details extracted successfully!');
        } else {
          alert('Bank details not found in this document. Please upload the correct bank statement.');
        }
      } else {
        alert(result.message || 'Bank details not found in this document. Please upload the correct bank statement.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing bank document.');
    } finally {
      setUploadStates(prev => ({ ...prev, [`bank_${index}`]: { loading: false } }));
    }
  };

  const fetchGSTDetails = async (gstNumber = profileData.gstNumber) => {
    const validation = validateGST(gstNumber);
    if (!validation.isValid) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/gst/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gstNumber: validation.cleanGST })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const { tradeName, panNumber, address } = result.data;
        setProfileData(prev => ({ ...prev, tradeName, address, panNumber }));
      }
    } catch (error) {
      console.error('GST API Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const maskPanNumber = (pan) => {
    if (!pan || pan.length < 6) return pan;
    return pan.substring(0, 2) + '*'.repeat(pan.length - 5) + pan.substring(pan.length - 3);
  };

  const addBankAccount = () => {
    setProfileData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '', ifscCode: '', branchName: '' }]
    }));
  };

  const removeBankAccount = async (index) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in'}/api/auth/profile/bank/${index}`, {
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
    if (!profileData.gstNumber) {
      alert('GST Number is required');
      return;
    }
    
    // Validate bank accounts
    for (let i = 0; i < profileData.bankAccounts.length; i++) {
      const account = profileData.bankAccounts[i];
      
      // Validate account number (9-18 digits, only numbers)
      if (account.accountNumber) {
        const accountDigits = account.accountNumber.replace(/[^0-9]/g, '');
        if (account.accountNumber !== accountDigits || accountDigits.length < 9 || accountDigits.length > 18) {
          alert(`Bank Account ${i + 1}: Account Number must contain only numbers and be between 9 to 18 digits. Current: ${accountDigits.length} digits`);
          return;
        }
      }
      
      // Validate IFSC code (11 characters)
      if (account.ifscCode && account.ifscCode.length !== 11) {
        alert(`Bank Account ${i + 1}: IFSC Code must be exactly 11 characters. Current: ${account.ifscCode.length} characters`);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      let logoBase64 = null;
      if (profileData.companyLogo) {
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(profileData.companyLogo);
        });
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in'}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          companyLogo: logoBase64,
          gstNumber: profileData.gstNumber,
          tradeName: profileData.tradeName,
          address: profileData.address,
          panNumber: profileData.panNumber,
          mcaNumber: profileData.mcaNumber,
          msmeStatus: profileData.msmeStatus,
          msmeNumber: profileData.msmeNumber,
          bankAccounts: profileData.bankAccounts
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Profile saved successfully!');
      } else {
        alert('Error saving profile: ' + result.message);
      }
    } catch (error) {
      alert('Error saving profile. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Building className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="flex items-center space-x-4">
                {profileData.companyLogo ? (
                  <img src={URL.createObjectURL(profileData.companyLogo)} alt="Logo" className="w-20 h-20 object-cover rounded-lg border" />
                ) : profileData.companyLogoUrl ? (
                  <img src={profileData.companyLogoUrl} alt="Logo" className="w-20 h-20 object-cover rounded-lg border" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload('companyLogo', e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company GST Number *</label>
              <div className="space-y-3">
                <input type="text" value={profileData.gstNumber} onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())} maxLength="15" placeholder="Enter 15-digit GST Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <label className={`cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Upload GST Certificate'}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('gstCertificate', e.target.files[0])} className="hidden" disabled={isProcessing} />
                </label>
                {profileData.gstCertificate && <p className="text-sm text-green-600">✓ Certificate uploaded</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name</label>
              <input type="text" value={profileData.tradeName} onChange={(e) => handleInputChange('tradeName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company PAN Number</label>
              <div className="relative">
                <input type="text" value={showPanFull ? profileData.panNumber : maskPanNumber(profileData.panNumber)} onChange={(e) => handleInputChange('panNumber', e.target.value)} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => setShowPanFull(!showPanFull)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPanFull ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={profileData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MCA Number</label>
              <div className="space-y-2">
                <input type="text" value={profileData.mcaNumber} onChange={(e) => handleInputChange('mcaNumber', e.target.value)} placeholder="Enter MCA Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <label className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload MCA Certificate
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('mcaFile', e.target.files[0])} className="hidden" />
                </label>
                {profileData.mcaFile && <p className="text-sm text-green-600 mt-1">✓ File uploaded: {profileData.mcaFile.name}</p>}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">MSME Registration</label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" name="msme" value="No" checked={profileData.msmeStatus === 'No'} onChange={(e) => handleInputChange('msmeStatus', e.target.value)} className="mr-2" />
                  No
                </label>
                <label className="flex items-center">
                  <input type="radio" name="msme" value="Yes" checked={profileData.msmeStatus === 'Yes'} onChange={(e) => handleInputChange('msmeStatus', e.target.value)} className="mr-2" />
                  Yes
                </label>
              </div>
              {profileData.msmeStatus === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSME Number</label>
                    <input type="text" value={profileData.msmeNumber} onChange={(e) => handleInputChange('msmeNumber', e.target.value)} placeholder="Enter MSME Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSME Certificate</label>
                    <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Upload Certificate'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('msmeFile', e.target.files[0])} className="hidden" disabled={isProcessing} />
                    </label>
                    {profileData.msmeFile && <p className="text-sm text-green-600 mt-1">✓ File uploaded: {profileData.msmeFile.name}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Bank Accounts</label>
              <button onClick={addBankAccount} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Bank
              </button>
            </div>
            {profileData.bankAccounts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bank accounts added. Click "Add Bank" to add one.</p>
            ) : (
              <div className="space-y-4">
                {profileData.bankAccounts.map((account, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-700">Bank Account {index + 1}</h3>
                        <div className="flex items-center">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const file = e.target.files[0]; if (file) extractBankDetails(file, index); }} className="hidden" id={`bankFile${index}`} />
                          <label htmlFor={`bankFile${index}`} className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-200 text-sm flex items-center">
                            {uploadStates[`bank_${index}`]?.loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div> : <Upload className="w-4 h-4 mr-1" />}
                            Upload Bank Statement
                          </label>
                        </div>
                      </div>
                      <button onClick={() => removeBankAccount(index)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input type="text" value={account.bankName} onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)} placeholder="Enter Bank Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input type="text" value={account.accountNumber} onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)} placeholder="9-18 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input type="text" value={account.ifscCode} onChange={(e) => updateBankAccount(index, 'ifscCode', e.target.value.toUpperCase())} maxLength="11" placeholder="11 characters" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                        <input type="text" value={account.branchName} onChange={(e) => updateBankAccount(index, 'branchName', e.target.value)} placeholder="Enter Branch Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

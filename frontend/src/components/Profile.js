import React, { useState, useEffect } from 'react';
import { Upload, Building, FileText, Save, Eye, EyeOff } from 'lucide-react';
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
    msmeFile: null
  });

  const [showPanFull, setShowPanFull] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
              companyLogoUrl: profile.companyLogo || null
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
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fetch GST details when GST number is entered
    if (field === 'gstNumber' && value && value.length === 15) {
      const validation = validateGST(value);
      if (validation.isValid) {
        fetchGSTDetails(validation.cleanGST);
      }
    }
  };

  const handleFileUpload = async (field, file) => {
    setProfileData(prev => ({
      ...prev,
      [field]: file
    }));

    // Auto-extract and verify GST for certificate upload
    if (field === 'gstCertificate' && file) {
      await processGSTDocument(file);
    }
    
    // Extract MCA number from MCA certificate
    if (field === 'mcaFile' && file) {
      await extractMCANumber(file);
    }

    // Extract MSME number from MSME certificate
    if (field === 'msmeFile' && file) {
      await extractMSMENumber(file);
    }
  };

  const processGSTDocument = async (file) => {
    setIsProcessing(true);
    try {
      // Step 1: Extract GST number using OCR
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'gstCertificate');

      const ocrResponse = await fetch('http://localhost:5001/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const ocrResult = await ocrResponse.json();

      if (ocrResponse.ok && ocrResult.success && ocrResult.data.gstNumber) {
        const extractedGST = ocrResult.data.gstNumber;
        
        // Step 2: Auto-verify GST and fetch details
        const token = localStorage.getItem('token');
        const verifyResponse = await fetch('http://localhost:5001/api/gst/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ gstNumber: extractedGST })
        });

        const verifyResult = await verifyResponse.json();

        if (verifyResponse.ok && verifyResult.success) {
          const { gstNumber, tradeName, panNumber, address } = verifyResult.data;
          setProfileData(prev => ({
            ...prev,
            gstNumber: gstNumber,
            tradeName: tradeName,
            address: address,
            panNumber: panNumber
          }));
          alert('GST certificate processed successfully! All details auto-filled.');
        } else {
          // At least fill the GST number even if verification fails
          setProfileData(prev => ({
            ...prev,
            gstNumber: extractedGST
          }));
          alert(`GST number extracted: ${extractedGST}. Verification failed: ${verifyResult.error}`);
        }
      } else {
        alert('Could not extract GST number from the document.');
      }
    } catch (error) {
      console.error('GST Processing Error:', error);
      alert('Error processing GST document. Please try again.');
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

      const response = await fetch('http://localhost:5001/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data.mcaNumber) {
        setProfileData(prev => ({
          ...prev,
          mcaNumber: result.data.mcaNumber
        }));
        alert(`MCA number extracted: ${result.data.mcaNumber}`);
      } else {
        alert('Could not extract MCA number from the document.');
      }
    } catch (error) {
      console.error('MCA OCR Error:', error);
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

      const response = await fetch('http://localhost:5001/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data.msmeNumber) {
        setProfileData(prev => ({
          ...prev,
          msmeNumber: result.data.msmeNumber,
          msmeStatus: 'Yes'
        }));
        alert(`MSME number extracted: ${result.data.msmeNumber}`);
      } else {
        console.log('MSME extraction result:', result);
        alert('Could not extract MSME number from the document.');
      }
    } catch (error) {
      console.error('MSME OCR Error:', error);
      alert('Error processing MSME document.');
    } finally {
      setIsProcessing(false);
    }
  };



  const fetchGSTDetails = async (gstNumber = profileData.gstNumber) => {
    const validation = validateGST(gstNumber);
    if (!validation.isValid) {
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/gst/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gstNumber: validation.cleanGST })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { tradeName, legalName, panNumber, address } = result.data;
        setProfileData(prev => ({
          ...prev,
          tradeName: tradeName,
          address: address,
          panNumber: panNumber
        }));
      }
    } catch (error) {
      console.error('GST API Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const maskPanNumber = (pan) => {
    if (!pan || pan.length < 6) return pan;
    const start = pan.substring(0, 2);
    const end = pan.substring(pan.length - 3);
    const middle = '*'.repeat(pan.length - 5);
    return start + middle + end;
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profileData.gstNumber) {
      alert('GST Number is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convert logo file to base64 if exists
      let logoBase64 = null;
      if (profileData.companyLogo) {
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(profileData.companyLogo);
        });
      }

      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyLogo: logoBase64,
          gstNumber: profileData.gstNumber,
          tradeName: profileData.tradeName,
          address: profileData.address,
          panNumber: profileData.panNumber,
          mcaNumber: profileData.mcaNumber,
          msmeStatus: profileData.msmeStatus,
          msmeNumber: profileData.msmeNumber
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Profile saved successfully!');
      } else {
        alert('Error saving profile: ' + result.message);
      }
    } catch (error) {
      console.error('Save error:', error);
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
        {/* Company Logo and GST Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Logo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            <div className="flex items-center space-x-4">
              {profileData.companyLogo ? (
                <img 
                  src={URL.createObjectURL(profileData.companyLogo)} 
                  alt="Company Logo" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : profileData.companyLogoUrl ? (
                <img 
                  src={profileData.companyLogoUrl} 
                  alt="Company Logo" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('companyLogo', e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* GST Number */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company GST Number *</label>
            <div className="space-y-3">
              <input
                type="text"
                value={profileData.gstNumber}
                onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                maxLength="15"
                placeholder="Enter 15-digit GST Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className={`cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Upload GST Certificate'}
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={(e) => handleFileUpload('gstCertificate', e.target.files[0])}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
              {profileData.gstCertificate && (
                <p className="text-sm text-green-600">✓ Certificate uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Auto-fetched Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name</label>
            <input
              type="text"
              value={profileData.tradeName}
              onChange={(e) => handleInputChange('tradeName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company PAN Number</label>
            <div className="relative">
              <input
                type="text"
                value={showPanFull ? profileData.panNumber : maskPanNumber(profileData.panNumber)}
                onChange={(e) => handleInputChange('panNumber', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowPanFull(!showPanFull)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPanFull ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MCA Number</label>
            <div className="space-y-2">
              <input
                type="text"
                value={profileData.mcaNumber}
                onChange={(e) => handleInputChange('mcaNumber', e.target.value)}
                placeholder="Enter MCA Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload MCA Certificate
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('mcaFile', e.target.files[0])}
                  className="hidden" 
                />
              </label>
              {profileData.mcaFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File uploaded: {profileData.mcaFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MSME */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">MSME Registration</label>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="msme"
                  value="No"
                  checked={profileData.msmeStatus === 'No'}
                  onChange={(e) => handleInputChange('msmeStatus', e.target.value)}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="msme"
                  value="Yes"
                  checked={profileData.msmeStatus === 'Yes'}
                  onChange={(e) => handleInputChange('msmeStatus', e.target.value)}
                  className="mr-2"
                />
                Yes
              </label>
            </div>

            {profileData.msmeStatus === 'Yes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MSME Number</label>
                  <input
                    type="text"
                    value={profileData.msmeNumber}
                    onChange={(e) => handleInputChange('msmeNumber', e.target.value)}
                    placeholder="Enter MSME Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MSME Certificate</label>
                  <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <Upload className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Upload Certificate'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('msmeFile', e.target.files[0])}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </label>
                  {profileData.msmeFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ File uploaded: {profileData.msmeFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
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
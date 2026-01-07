import React, { useState } from 'react';
import { Upload, Building, FileText, Save, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    companyLogo: null,
    gstNumber: '',
    tradeName: '',
    address: '',
    panNumber: '',
    mcaNumber: '',
    msmeStatus: 'No',
    msmeNumber: '',
    msmeFile: null
  });

  const [showPanFull, setShowPanFull] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setProfileData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const fetchGSTDetails = async () => {
    if (!profileData.gstNumber || profileData.gstNumber.length !== 15) {
      alert('Please enter a valid 15-digit GST number');
      return;
    }

    try {
      // Mock API call - replace with actual GST API
      // const response = await fetch(`https://services.gst.gov.in/services/searchtp?gstin=${profileData.gstNumber}`);
      
      // Mock data for demonstration
      const mockData = {
        tradeName: 'ABC Enterprises Pvt Ltd',
        address: '123 Business Street, Bangalore, Karnataka - 560001',
        panNumber: 'ABCDE1234F'
      };

      setProfileData(prev => ({
        ...prev,
        tradeName: mockData.tradeName,
        address: mockData.address,
        panNumber: mockData.panNumber
      }));

      alert('GST details fetched successfully!');
    } catch (error) {
      alert('Error fetching GST details. Please try again.');
    }
  };

  const maskPanNumber = (pan) => {
    if (!pan || pan.length < 6) return pan;
    const start = pan.substring(0, 2);
    const end = pan.substring(pan.length - 3);
    const middle = '*'.repeat(pan.length - 5);
    return start + middle + end;
  };

  const handleSave = () => {
    // Validate required fields
    if (!profileData.gstNumber) {
      alert('GST Number is required');
      return;
    }

    // Save profile data
    console.log('Saving profile data:', profileData);
    alert('Profile saved successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Building className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
        </div>

        <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company GST Number *</label>
            <input
              type="text"
              value={profileData.gstNumber}
              onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
              maxLength="15"
              placeholder="Enter 15-digit GST Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <label className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center w-full justify-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload GST
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchGSTDetails}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Fetch Details
            </button>
          </div>
        </div>

        {/* Auto-fetched Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name (Auto-fetched)</label>
            <input
              type="text"
              value={profileData.tradeName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company PAN Number (Auto-fetched)</label>
            <div className="relative">
              <input
                type="text"
                value={showPanFull ? profileData.panNumber : maskPanNumber(profileData.panNumber)}
                readOnly
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address (Auto-fetched)</label>
          <textarea
            value={profileData.address}
            readOnly
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
          />
        </div>

        {/* MCA Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MCA Number</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={profileData.mcaNumber}
              onChange={(e) => handleInputChange('mcaNumber', e.target.value)}
              placeholder="Enter MCA Number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload
              <input type="file" className="hidden" />
            </label>
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
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Certificate
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('msmeFile', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {profileData.msmeFile && (
                    <p className="text-sm text-green-600 mt-1">
                      File uploaded: {profileData.msmeFile.name}
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
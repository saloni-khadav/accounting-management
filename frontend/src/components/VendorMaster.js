import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Search, Eye, Download } from 'lucide-react';
import VendorForm from './VendorForm';
import VendorDetails from './VendorDetails';
import { exportToExcel } from '../utils/excelExport';

const VendorMaster = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
    setLoading(false);
  };

  const handleExportSingleVendor = (vendor) => {
    const exportData = {
      'Vendor Code': vendor.vendorCode || '',
      'Vendor Name': vendor.vendorName || '',
      'Contact Person': vendor.contactPerson || '',
      'Contact Details': vendor.contactDetails || '',
      'Email': vendor.email || '',
      'Website': vendor.website || '',
      'Billing Address': vendor.billingAddress || '',
      'GST Number': vendor.gstNumber || 'N/A',
      'PAN Number': vendor.panNumber || '',
      'Aadhaar Number': vendor.aadharNumber || '',
      'Payment Terms': vendor.paymentTerms || '',
      'Credit Limit': vendor.creditLimit || '',
      'Account Number': vendor.accountNumber || '',
      'IFSC Code': vendor.ifscCode || '',
      'Bank Name': vendor.bankName || '',
      'Industry Type': vendor.industryType || '',
      'Vendor Category': vendor.vendorCategory || '',
      'Contract Start Date': vendor.contractStartDate || '',
      'Contract End Date': vendor.contractEndDate || '',
      'Currency': vendor.currency || '',
      'Status': vendor.status || '',
      'Account Manager': vendor.accountManager || ''
    };
    exportToExcel([exportData], 'vendor_' + vendor.vendorCode);
  };

  const handleAddVendor = async () => {
    await fetchVendors();
  };

  const handleEditVendor = (vendor) => {
    try {
      console.log('Editing vendor:', vendor);
      setEditingVendor(vendor);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error in handleEditVendor:', error);
      alert('Error opening edit form. Please try again.');
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsDetailsOpen(true);
  };

  const handleExportToExcel = () => {
    if (vendors.length === 0) {
      alert('No vendor data to export');
      return;
    }
    const exportData = vendors.map(vendor => ({
      'Vendor Code': vendor.vendorCode,
      'Vendor Name': vendor.vendorName,
      'Contact Person': vendor.contactPerson,
      'Contact Details': vendor.contactDetails,
      'Email': vendor.email,
      'Website': vendor.website,
      'Billing Address': vendor.billingAddress,
      'GST Number': vendor.gstNumbers && vendor.gstNumbers.length > 0 
        ? vendor.gstNumbers.map(gst => `${gst.gstNumber}${gst.isDefault ? ' (Default)' : ''}`).join(', ')
        : vendor.gstNumber || 'N/A',
      'PAN Number': vendor.panNumber,
      'Aadhaar Number': vendor.aadharNumber,
      'Payment Terms': vendor.paymentTerms,
      'Credit Limit': vendor.creditLimit,
      'Account Number': vendor.accountNumber,
      'IFSC Code': vendor.ifscCode,
      'Bank Name': vendor.bankName,
      'Industry Type': vendor.industryType,
      'Vendor Category': vendor.vendorCategory,
      'Contract Start Date': vendor.contractStartDate,
      'Contract End Date': vendor.contractEndDate,
      'Currency': vendor.currency,
      'Status': vendor.status,
      'Account Manager': vendor.accountManager
    }));
    exportToExcel(exportData, `vendors_${new Date().toISOString().split('T')[0]}`);
    alert('Vendor data exported successfully!');
  };

  const filteredVendors = vendors.filter(vendor =>
    (vendor.vendorName && vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vendor.vendorCode && vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 flex items-center">
              <Users className="mr-3" />
              Vendor Master
            </h1>
            <p className="text-white text-sm sm:text-base">Manage vendor information</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Search Vendors</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Vendor List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">Vendor List</h3>
              <span className="text-sm text-blue-100 bg-blue-500 px-3 py-1 rounded-full">{filteredVendors.length} Vendors</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Vendor Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Vendor Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Contact Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      Loading vendors...
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No vendors found
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{vendor.vendorName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{vendor.vendorCode || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{vendor.contactPerson || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{vendor.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditVendor(vendor)}
                            className="text-blue-600 hover:text-blue-800 p-1" 
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleViewDetails(vendor)}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleExportSingleVendor(vendor)}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                            title="Export this vendor"
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <VendorForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVendor(null);
          }}
          onSave={handleAddVendor}
          editingVendor={editingVendor}
        />

        <VendorDetails
          vendor={selectedVendor}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      </div>
    </div>
  );
};

export default VendorMaster;

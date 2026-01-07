import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Eye, Download } from 'lucide-react';
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
      const response = await fetch('http://localhost:5001/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
    setLoading(false);
  };

  const handleAddVendor = async (vendorData) => {
    try {
      const url = editingVendor 
        ? `http://localhost:5001/api/vendors/${editingVendor._id}`
        : 'http://localhost:5001/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      
      if (response.ok) {
        const updatedVendor = await response.json();
        if (editingVendor) {
          setVendors(vendors.map(vendor => 
            vendor._id === editingVendor._id ? updatedVendor : vendor
          ));
          alert('Vendor updated successfully!');
        } else {
          setVendors([updatedVendor, ...vendors]);
          alert('Vendor added successfully!');
        }
        setEditingVendor(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving vendor');
      }
    } catch (error) {
      alert('Network error. Please check if backend is running.');
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/vendors/${vendorId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setVendors(vendors.filter(vendor => vendor._id !== vendorId));
          alert('Vendor deleted successfully!');
        }
      } catch (error) {
        alert('Error deleting vendor');
      }
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
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
      'GST Number': vendor.gstNumber,
      'PAN Number': vendor.panNumber,
      'Payment Terms': vendor.paymentTerms,
      'Credit Limit': vendor.creditLimit,
      'Account Number': vendor.accountNumber,
      'IFSC Code': vendor.ifscCode,
      'Bank Name': vendor.bankName,
      'Industry Type': vendor.industryType,
      'Vendor Category': vendor.clientCategory,
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
    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Users className="mr-2" />
            Vendor Master
          </h2>
          <p className="text-gray-600">Manage vendor information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vendor List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Vendor Name</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Vendor Code</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Contact Person</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Email</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
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
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{vendor.vendorName}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{vendor.vendorCode}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{vendor.contactPerson}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{vendor.email}</td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditVendor(vendor)}
                        className="text-blue-600 hover:text-blue-800" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteVendor(vendor._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewDetails(vendor)}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => exportToExcel([{
                          'Vendor Code': vendor.vendorCode,
                          'Vendor Name': vendor.vendorName,
                          'Contact Person': vendor.contactPerson,
                          'Email': vendor.email,
                          'Status': vendor.status
                        }], `vendor_${vendor.vendorCode}`)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 ml-1"
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
  );
};

export default VendorMaster;

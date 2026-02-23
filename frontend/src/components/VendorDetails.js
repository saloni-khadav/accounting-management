import React from 'react';
import { X, User, Mail, Phone, MapPin, Building, CreditCard, Calendar, DollarSign } from 'lucide-react';

const VendorDetails = ({ vendor, isOpen, onClose }) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Vendor Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Vendor Name</label>
                  <p className="text-gray-900">{vendor.vendorName || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Vendor Code</label>
                  <p className="text-gray-900">{vendor.vendorCode || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Person</label>
                  <p className="text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {vendor.contactPerson || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Details</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {vendor.contactDetails || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.email || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  <p className="text-gray-900">{vendor.website || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address & Legal
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Billing Address</label>
                  <p className="text-gray-900">{vendor.billingAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">GST Numbers</label>
                  <div className="text-gray-900">
                    {vendor.gstNumbers && vendor.gstNumbers.length > 0 ? (
                      <div className="space-y-1">
                        {vendor.gstNumbers.map((gst, index) => (
                          <div key={index} className="flex items-center">
                            <span>{gst.gstNumber}</span>
                            {gst.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{vendor.gstNumber || 'N/A'}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">PAN Number</label>
                  <p className="text-gray-900">{vendor.panNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
                  <p className="text-gray-900">{vendor.aadharNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Industry Type</label>
                  <p className="text-gray-900">{vendor.industryType || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Vendor Category</label>
                  <p className="text-gray-900">{vendor.vendorCategory || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                  <p className="text-gray-900">{vendor.paymentTerms || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Credit Limit</label>
                  <p className="text-gray-900">{vendor.creditLimit ? `₹${vendor.creditLimit.toLocaleString()}` : 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Currency</label>
                  <p className="text-gray-900">{vendor.currency || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Banking Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Number</label>
                  <p className="text-gray-900">{vendor.accountNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                  <p className="text-gray-900">{vendor.ifscCode || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Name</label>
                  <p className="text-gray-900">{vendor.bankName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract & Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Contract Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contract Start Date</label>
                  <p className="text-gray-900">
                    {vendor.contractStartDate ? new Date(vendor.contractStartDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Contract End Date</label>
                  <p className="text-gray-900">
                    {vendor.contractEndDate ? new Date(vendor.contractEndDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Management</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Manager</label>
                  <p className="text-gray-900">{vendor.accountManager || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;

import React from 'react';
import { X, User, Phone, Mail, MapPin, Building, CreditCard } from 'lucide-react';

const ClientDetails = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Client Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="mr-2" size={20} />
                Company Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client Name</label>
                  <p className="text-gray-900">{client.clientName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Client Code</label>
                  <p className="text-gray-900 font-mono">{client.clientCode || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Industry Type</label>
                  <p className="text-gray-900">{client.industryType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Client Category</label>
                  <p className="text-gray-900">{client.clientCategory || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  <p className="text-gray-900">{client.website || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Person</label>
                  <p className="text-gray-900">{client.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{client.contactDetails || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{client.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Manager</label>
                  <p className="text-gray-900">{client.accountManager || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" size={20} />
              Address Information
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Billing Address</label>
              <p className="text-gray-900 whitespace-pre-line">{client.billingAddress || 'N/A'}</p>
            </div>
          </div>

          {/* Legal & Financial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">GST Number</label>
                  <p className="text-gray-900 font-mono">{client.gstNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">PAN Number</label>
                  <p className="text-gray-900 font-mono">{client.panNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Financial Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                  <p className="text-gray-900">{client.paymentTerms || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Credit Limit</label>
                  <p className="text-gray-900">₹ {client.creditLimit?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Currency</label>
                  <p className="text-gray-900">{client.currency || 'INR'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Bank Information</label>
              <p className="text-gray-900 whitespace-pre-line">{client.bankDetails || 'N/A'}</p>
            </div>
          </div>

          {/* Contract */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Contract Information</h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Contract Period</label>
              <p className="text-gray-900">{client.contractDates || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
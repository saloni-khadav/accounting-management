import React from 'react';
import { X, User, Phone, Mail, MapPin, Building, CreditCard, FileText, Calendar, Download } from 'lucide-react';

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

          {/* GST Numbers */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">GST Information</h3>
            {client.gstNumbers && client.gstNumbers.length > 0 ? (
              <div className="space-y-3">
                {client.gstNumbers.map((gst, index) => (
                  <div key={index} className="border border-gray-200 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm">{gst.gstNumber || 'N/A'}</span>
                      {gst.isDefault && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{gst.billingAddress || 'No address provided'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-600">GST Number</label>
                <p className="text-gray-900 font-mono">{client.gstNumber || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Legal & Financial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">PAN Number</label>
                  <p className="text-gray-900 font-mono">{client.panNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Aadhar Number</label>
                  <p className="text-gray-900 font-mono">{client.aadharNumber || 'N/A'}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Account Number</label>
                <p className="text-gray-900 font-mono">{client.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                <p className="text-gray-900 font-mono">{client.ifscCode || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bank Name</label>
                <p className="text-gray-900">{client.bankName || 'N/A'}</p>
              </div>
            </div>
            {client.bankDetails && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-600">Additional Bank Information</label>
                <p className="text-gray-900 whitespace-pre-line">{client.bankDetails}</p>
              </div>
            )}
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Contract Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Contract Start Date</label>
                <p className="text-gray-900">
                  {client.contractStartDate ? new Date(client.contractStartDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contract End Date</label>
                <p className="text-gray-900">
                  {client.contractEndDate ? new Date(client.contractEndDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            {client.contractDates && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-600">Contract Period</label>
                <p className="text-gray-900">{client.contractDates}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          {client.documents && (client.documents.panCard || client.documents.aadharCard || client.documents.gstCertificate || client.documents.bankStatement || (client.documents.otherDocuments && client.documents.otherDocuments.length > 0)) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.documents.panCard && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-700">PAN Card</p>
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    </div>
                    <button
                      onClick={() => window.open(`https://nextbook-backend.nextsphere.co.in/api/clients/download/${client.documents.panCard}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                )}
                {client.documents.aadharCard && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    </div>
                    <button
                      onClick={() => window.open(`https://nextbook-backend.nextsphere.co.in/api/clients/download/${client.documents.aadharCard}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                )}
                {client.documents.gstCertificate && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-700">GST Certificate</p>
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    </div>
                    <button
                      onClick={() => window.open(`https://nextbook-backend.nextsphere.co.in/api/clients/download/${client.documents.gstCertificate}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                )}
                {client.documents.bankStatement && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Bank Statement</p>
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    </div>
                    <button
                      onClick={() => window.open(`https://nextbook-backend.nextsphere.co.in/api/clients/download/${client.documents.bankStatement}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                )}
              </div>
              {client.documents.otherDocuments && client.documents.otherDocuments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Other Documents</p>
                  <div className="space-y-2">
                    {client.documents.otherDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <div>
                          <p className="text-sm text-gray-700">{typeof doc === 'string' ? `Document ${index + 1}` : doc.name || `Document ${index + 1}`}</p>
                          <p className="text-xs text-green-600">✓ Uploaded</p>
                        </div>
                        <button
                          onClick={() => window.open(`https://nextbook-backend.nextsphere.co.in/api/clients/download/${doc}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
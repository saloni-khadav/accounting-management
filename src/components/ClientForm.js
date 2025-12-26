import React, { useState } from 'react';
import { X, Save, Building, Phone, Mail, MapPin, Download, FileText } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const ClientForm = ({ isOpen, onClose, onSave, editingClient }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientCode: '',
    contactPerson: '',
    contactDetails: '',
    email: '',
    website: '',
    billingAddress: '',
    gstNumber: '',
    panNumber: '',
    paymentTerms: '',
    creditLimit: '',
    bankDetails: '',
    industryType: '',
    clientCategory: '',
    contractDates: '',
    currency: 'INR',
    status: 'Active',
    accountManager: '',
    documents: {
      panCard: null,
      aadharCard: null,
      gstCertificate: null,
      bankStatement: null,
      otherDocuments: []
    }
  });

  // Update form data when editing client changes
  React.useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
    } else {
      setFormData({
        clientName: '',
        clientCode: '',
        contactPerson: '',
        contactDetails: '',
        email: '',
        website: '',
        billingAddress: '',
        gstNumber: '',
        panNumber: '',
        paymentTerms: '',
        creditLimit: '',
        bankDetails: '',
        industryType: '',
        clientCategory: '',
        contractDates: '',
        currency: 'INR',
        status: 'Active',
        accountManager: '',
        documents: {
          panCard: null,
          aadharCard: null,
          gstCertificate: null,
          bankStatement: null,
          otherDocuments: []
        }
      });
    }
  }, [editingClient]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

  const handleOtherDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        otherDocuments: [...formData.documents.otherDocuments, ...files]
      }
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleExportTemplate = () => {
    const templateData = [{
      'Client Name': '',
      'Client Code': '',
      'Contact Person': '',
      'Contact Details': '',
      'Email': '',
      'Website': '',
      'Billing Address': '',
      'GST Number': '',
      'PAN Number': '',
      'Payment Terms': '',
      'Credit Limit': '',
      'Bank Details': '',
      'Industry Type': '',
      'Client Category': '',
      'Contract Dates': '',
      'Currency': 'INR',
      'Status': 'Active',
      'Account Manager': ''
    }];
    exportToExcel(templateData, 'client_template');
    alert('Client template exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleExportTemplate}
              className="text-green-600 hover:text-green-800 flex items-center"
              title="Export Excel Template"
            >
              <Download size={20} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name / Company Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code *
              </label>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Details
              </label>
              <input
                type="text"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address with PIN Code
            </label>
            <textarea
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry Type
              </label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Category
              </label>
              <select
                name="clientCategory"
                value={formData.clientCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Details (Account No., IFSC, Bank Name)
            </label>
            <textarea
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract (Start & End Dates)
              </label>
              <input
                type="text"
                name="contractDates"
                value={formData.contractDates}
                onChange={handleInputChange}
                placeholder="01/01/2024 - 31/12/2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Account Manager
              </label>
              <input
                type="text"
                name="accountManager"
                value={formData.accountManager}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Documents Section */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Document Uploads
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Card
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'panCard')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.documents.panCard && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'aadharCard')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.documents.aadharCard && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Certificate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'gstCertificate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.documents.gstCertificate && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Statement
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'bankStatement')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.documents.bankStatement && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Documents
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleOtherDocumentUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {formData.documents.otherDocuments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Uploaded Documents:</p>
                  <div className="space-y-1">
                    {formData.documents.otherDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeOtherDocument(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
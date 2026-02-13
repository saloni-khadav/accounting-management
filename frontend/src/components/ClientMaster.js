import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit, Trash2, Search, Eye, Download, Upload } from 'lucide-react';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import { exportClientsToExcel } from '../utils/excelExport';
import { importClientsFromExcel } from '../utils/excelImport';

const ClientMaster = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setLoading(false);
  };

  const handleAddClient = async (clientData) => {
    try {
      const url = editingClient 
        ? `http://localhost:5001/api/clients/${editingClient._id}`
        : 'http://localhost:5001/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      
      if (response.ok) {
        const updatedClient = await response.json();
        if (editingClient) {
          setClients(clients.map(client => 
            client._id === editingClient._id ? updatedClient : client
          ));
          alert('Client updated successfully!');
        } else {
          setClients([updatedClient, ...clients]);
          alert('Client added successfully!');
        }
        setEditingClient(null);
        setIsFormOpen(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving client');
      }
    } catch (error) {
      alert('Network error. Please check if backend is running.');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/clients/${clientId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setClients(clients.filter(client => client._id !== clientId));
          alert('Client deleted successfully!');
        }
      } catch (error) {
        alert('Error deleting client');
      }
    }
  };

  const handleViewDetails = async (client) => {
    try {
      // Fetch full client details by ID to ensure we have all data
      const response = await fetch(`http://localhost:5001/api/clients/${client._id}`);
      if (response.ok) {
        const fullClientData = await response.json();
        setSelectedClient(fullClientData);
      } else {
        // Fallback to the client data we have
        setSelectedClient(client);
      }
      
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      // Fallback to the client data we have
      setSelectedClient(client);
      setIsDetailsOpen(true);
    }
  };

  const handleEditClient = async (client) => {
    try {
      console.log('Editing client:', client); // Debug log
      
      // Fetch full client details by ID to ensure we have all data
      const response = await fetch(`http://localhost:5001/api/clients/${client._id}`);
      if (response.ok) {
        const fullClientData = await response.json();
        console.log('Full client data:', fullClientData); // Debug log
        setEditingClient(fullClientData);
      } else {
        // Fallback to the client data we have
        setEditingClient(client);
      }
      
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error in handleEditClient:', error);
      // Fallback to the client data we have
      setEditingClient(client);
      setIsFormOpen(true);
    }
  };

  const filteredClients = clients.filter(client =>
    (client.clientName && client.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.clientCode && client.clientCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadFormat = () => {
    const templateData = [{
      'Client Code': '',
      'Client Name': '',
      'Contact Person': '',
      'Contact Details': '',
      'Email': '',
      'Website': '',
      'Billing Address': '',
      'GST Number': '',
      'PAN Number': '',
      'Aadhar Number': '',
      'Payment Terms': '',
      'Credit Limit': '',
      'Account Number': '',
      'IFSC Code': '',
      'Bank Name': '',
      'Industry Type': '',
      'Client Category': '',
      'Contract Start Date': '',
      'Contract End Date': '',
      'Currency': 'INR',
      'Status': 'Active',
      'Account Manager': ''
    }];
    exportClientsToExcel(templateData, 'client_import_template');
    alert('Client import template downloaded successfully!');
  };

  const handleExportToExcel = () => {
    if (clients.length === 0) {
      alert('No client data to export');
      return;
    }
    exportClientsToExcel(clients);
    alert('Client data exported successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const importedClients = await importClientsFromExcel(file);
      
      let successCount = 0;
      let errorCount = 0;
      const failedClients = [];

      for (const clientData of importedClients) {
        const errors = [];
        
        // Validate required fields in order (left to right as per form)
        if (!clientData.clientCode) errors.push('Client Code is required');
        
        // Check if client code already exists
        if (clientData.clientCode) {
          const existingClient = clients.find(c => c.clientCode === clientData.clientCode);
          if (existingClient) {
            errors.push(`Client Code '${clientData.clientCode}' already exists`);
          }
        }
        
        if (!clientData.clientName) errors.push('Client Name is required');
        if (!clientData.contactPerson) errors.push('Contact Person is required');
        
        // Validate Contact Details (10 digits) - check before required validation
        if (clientData.contactDetails) {
          const contactDigits = clientData.contactDetails.toString().replace(/[^0-9]/g, '');
          if (contactDigits.length !== 10) {
            errors.push(`Contact Details must be exactly 10 digits (current: ${contactDigits.length})`);
          }
        } else {
          errors.push('Contact Details is required');
        }
        
        if (!clientData.email) errors.push('Email is required');
        if (!clientData.billingAddress) errors.push('Billing Address is required');
        
        // Validate GST Number (15 digits)
        if (clientData.gstNumber) {
          const gstDigits = clientData.gstNumber.toString().replace(/[^0-9A-Z]/g, '');
          if (gstDigits.length !== 15) {
            errors.push(`GST Number must be exactly 15 characters (current: ${gstDigits.length})`);
          }
        }
        
        // Validate PAN Number (10 characters)
        if (clientData.panNumber) {
          const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panPattern.test(clientData.panNumber.toString())) {
            errors.push('PAN Number must be 10 characters (5 letters, 4 digits, 1 letter)');
          }
        } else {
          errors.push('PAN Number is required');
        }
        
        if (!clientData.paymentTerms) {
          errors.push('Payment Terms is required');
        } else if (!['15 Days', '30 Days', '45 Days', '60 Days', 'Advance'].includes(clientData.paymentTerms)) {
          errors.push(`Payment Terms must be one of: 15 Days, 30 Days, 45 Days, 60 Days, Advance (current: ${clientData.paymentTerms})`);
        }
        if (!clientData.creditLimit) errors.push('Credit Limit is required');
        
        // Validate Account Number (9-18 digits)
        if (clientData.accountNumber) {
          const accountDigits = clientData.accountNumber.toString().replace(/[^0-9]/g, '');
          if (clientData.accountNumber.toString() !== accountDigits || accountDigits.length < 9 || accountDigits.length > 18) {
            errors.push(`Account Number must contain only numbers and be 9-18 digits (current: ${accountDigits.length})`);
          }
        } else {
          errors.push('Account Number is required');
        }
        
        // Validate IFSC Code (11 characters)
        if (clientData.ifscCode && clientData.ifscCode.toString().length !== 11) {
          errors.push(`IFSC Code must be 11 characters (current: ${clientData.ifscCode.toString().length})`);
        }
        
        if (!clientData.bankName) errors.push('Bank Name is required');
        if (!clientData.industryType) {
          errors.push('Industry Type is required');
        } else if (!['Company', 'Firm', 'Partnership', 'Proprietorship', 'LLP'].includes(clientData.industryType)) {
          errors.push(`Industry Type must be one of: Company, Firm, Partnership, Proprietorship, LLP (current: ${clientData.industryType})`);
        }
        
        if (!clientData.clientCategory) {
          errors.push('Client Category is required');
        } else if (!['Retail', 'Corporate'].includes(clientData.clientCategory)) {
          errors.push(`Client Category must be either Retail or Corporate (current: ${clientData.clientCategory})`);
        }
        if (!clientData.contractStartDate) errors.push('Contract Start Date is required');
        if (!clientData.contractEndDate) errors.push('Contract End Date is required');
        if (!clientData.accountManager) errors.push('Account Manager is required');
        
        // Validate Aadhar Number (12 digits)
        if (clientData.aadharNumber) {
          const aadharDigits = clientData.aadharNumber.toString().replace(/[^0-9]/g, '');
          if (aadharDigits.length !== 12) {
            errors.push(`Aadhar Number must be 12 digits (current: ${aadharDigits.length})`);
          }
        }
        
        if (errors.length > 0) {
          errorCount++;
          failedClients.push({
            ...clientData,
            remarks: errors.join('; ')
          });
          continue;
        }

        try {
          const response = await fetch('http://localhost:5001/api/clients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errorCount++;
            failedClients.push({
              ...clientData,
              remarks: errorData.message || 'Failed to add client'
            });
          }
        } catch (error) {
          errorCount++;
          failedClients.push({
            ...clientData,
            remarks: error.message || 'Network error'
          });
        }
      }

      await fetchClients();
      
      let message = `Import completed!\nSuccess: ${successCount}\nFailed: ${errorCount}`;
      
      if (failedClients.length > 0) {
        message += '\n\nDo you want to download the error report?';
        if (window.confirm(message)) {
          exportClientsToExcel(failedClients, `client_import_errors_${new Date().toISOString().split('T')[0]}`);
        }
      } else {
        alert(message);
      }
    } catch (error) {
      alert('Error importing file: ' + error.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Users className="mr-2" />
            Client Master
          </h2>
          <p className="text-gray-600">Manage client information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadFormat}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Format
          </button>
          <button
            onClick={handleImportClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            disabled={loading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import from Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
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
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Client Name</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Client Code</th>
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
                  Loading clients...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.clientName || 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.clientCode || 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.contactPerson || 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.email || 'N/A'}</td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClient(client)}
                        className="text-blue-600 hover:text-blue-800" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewDetails(client)}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => exportClientsToExcel([client])}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 ml-1"
                        title="Export this client"
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

      <ClientForm
        key={isFormOpen ? (editingClient ? editingClient._id : 'new') : 'closed'}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
        onSave={handleAddClient}
        editingClient={editingClient}
      />

      <ClientDetails
        client={selectedClient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default ClientMaster;
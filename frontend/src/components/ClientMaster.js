import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit, Search, Eye, Download, Upload } from 'lucide-react';
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

  const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/clients`);
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
        ? `${baseUrl}/api/clients/${editingClient._id}`
        : `${baseUrl}/api/clients`;
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
        const response = await fetch(`${baseUrl}/api/clients/${clientId}`, {
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
      const response = await fetch(`${baseUrl}/api/clients/${client._id}`);
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
      const response = await fetch(`${baseUrl}/api/clients/${client._id}`);
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
    const link = document.createElement('a');
    link.href = '/client-template.xlsx';
    link.download = 'client_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          const response = await fetch(`${baseUrl}/api/clients`, {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Users className="mr-3" size={28} />
                Client Master
              </h1>
              <p className="text-blue-100 mt-1">Manage client information</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-2">
              <button
                onClick={handleDownloadFormat}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} />
                Download Format
              </button>
              <button
                onClick={handleImportClick}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                disabled={loading}
              >
                <Upload size={18} />
                Import
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
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Add Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Client List</h2>
            <span className="text-blue-100 text-sm">{filteredClients.length} Clients</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Client Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Client Code</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Contact Person</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300 animate-pulse" />
                    <p className="text-lg font-medium">Loading clients...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No clients found</p>
                    <p className="text-sm">Add your first client to get started</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => (
                  <tr key={client._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 text-gray-900 font-medium">{client.clientName || 'N/A'}</td>
                    <td className="py-4 px-6 text-blue-600 font-medium">{client.clientCode || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-600">{client.contactPerson || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-600">{client.email || 'N/A'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(client)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => exportClientsToExcel([client])}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Export this client"
                        >
                          <Download size={18} />
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

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';

const ClientMaster = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await fetch('http://localhost:5001/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      
      if (response.ok) {
        const newClient = await response.json();
        setClients([newClient, ...clients]);
        alert('Client added successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error adding client');
      }
    } catch (error) {
      alert('Network error. Please check if backend is running.');
    }
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

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </button>
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
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.clientName}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.clientCode}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.contactPerson}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{client.email}</td>
                  <td className="px-4 py-3 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Edit">
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddClient}
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
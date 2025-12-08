import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const ClientMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const clientsData = [
    {
      name: 'Sun Corporation',
      email: 'john.doe@suncorp.com',
      phone: '9876543210',
      receivables: '₹ 86,450'
    },
    {
      name: 'Green Power Ltd.',
      email: 'info@greenpower.com',
      phone: '9123456780',
      receivables: '₹ 41,200'
    },
    {
      name: 'Global Solutions',
      email: 'contact@globalsol.com',
      phone: '9988776655',
      receivables: '₹ 63,890'
    },
    {
      name: 'Rajan Exports',
      email: 'sales@rajanexports.in',
      phone: '9123467890',
      receivables: '₹ 29,340'
    },
    {
      name: 'Alpha Enterprises',
      email: 'alpha@example.com',
      phone: '8901234567',
      receivables: '₹ 92,150'
    }
  ];

  const filteredClients = clientsData.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Master</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
            <Plus size={20} />
            ADD
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Client Name</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Phone</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Receivables</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900 text-base">{client.name}</td>
                  <td className="py-4 px-4 text-gray-900 text-base">{client.email}</td>
                  <td className="py-4 px-4 text-gray-900 text-base">{client.phone}</td>
                  <td className="py-4 px-4 text-gray-900 text-base">{client.receivables}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientMaster;

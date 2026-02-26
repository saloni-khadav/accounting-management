import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import CreatePO from './CreatePO';

const PurchaseOrderManagement = ({ setActivePage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState([
    { 
      _id: '1', 
      poNumber: 'PO-0082', 
      vendor: 'GerernLane', 
      orderDate: '2024-04-30', 
      deliveryDate: '2024-04-29', 
      status: 'Open', 
      amount: 2500,
      items: [{ name: 'Dell Laptop', hsn: '8471', quantity: 5, rate: 50000, discount: 10 }]
    },
    { 
      _id: '2', 
      poNumber: 'PO-0081', 
      vendor: 'Acme.tam', 
      orderDate: '2024-05-24', 
      deliveryDate: '2024-04-28', 
      status: 'Completed', 
      amount: 2300,
      items: [{ name: 'Office Chair', hsn: '9401', quantity: 10, rate: 2300, discount: 0 }]
    },
    { 
      _id: '3', 
      poNumber: 'PO-0080', 
      vendor: 'Tarnikvoish', 
      orderDate: '2024-05-16', 
      deliveryDate: '2024-04-29', 
      status: 'Completed', 
      amount: 4000,
      items: [{ name: 'Printer', hsn: '8443', quantity: 2, rate: 20000, discount: 0 }]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  const handleEditPO = (po) => {
    setEditingPO(po);
    setIsFormOpen(true);
  };

  const handleDeletePO = (poId) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      setPurchaseOrders(purchaseOrders.filter(po => po._id !== poId));
      alert('Purchase Order deleted successfully!');
    }
  };

  const filteredPOs = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <FileText className="mr-2" />
            Purchase Order Management
          </h2>
          <p className="text-gray-600">Manage purchase orders and vendor requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New PO
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total POs</h3>
          <p className="text-2xl font-bold text-blue-900">{filteredPOs.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-900">
            {filteredPOs.filter(po => po.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Open</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {filteredPOs.filter(po => po.status === 'Open').length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Draft</h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredPOs.filter(po => po.status === 'Draft').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Open">Open</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Purchase Orders List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">PO Number</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Vendor</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Order Date</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Delivery Date</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Loading purchase orders...
                </td>
              </tr>
            ) : filteredPOs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No purchase orders found
                </td>
              </tr>
            ) : (
              filteredPOs.map((po) => (
                <tr key={po._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium whitespace-nowrap">
                    {po.poNumber}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 whitespace-nowrap">
                    {po.vendor}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 whitespace-nowrap">
                    {new Date(po.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 whitespace-nowrap">
                    {new Date(po.deliveryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700 font-medium whitespace-nowrap">
                    ₹{po.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-sm whitespace-nowrap">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPO(po)}
                        className="text-green-600 hover:text-green-800 p-1" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePO(po._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreatePO
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPO(null);
        }}
        onSave={(savedPO) => {
          if (editingPO) {
            setPurchaseOrders(purchaseOrders.map(po => 
              po._id === editingPO._id ? savedPO : po
            ));
          } else {
            setPurchaseOrders([savedPO, ...purchaseOrders]);
          }
          setIsFormOpen(false);
          setEditingPO(null);
        }}
        editingPO={editingPO}
      />
    </div>
  );
};

export default PurchaseOrderManagement;

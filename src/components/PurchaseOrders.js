import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar, Plus, X, Trash2, ChevronDown, Filter, Edit, Trash } from 'lucide-react';

const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: ''
  });
  const [items, setItems] = useState([
    { name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }
  ]);

  useEffect(() => {
    let filtered = purchaseOrders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(po => po.status === activeFilter);
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, activeFilter]);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
    if (showCreateForm) {
      generatePONumber();
    }
  }, [showCreateForm]);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
  }, []);

  const generatePONumber = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/purchase-orders/next-po-number');
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, poNumber: data.poNumber }));
      }
    } catch (error) {
      console.error('Error generating PO number:', error);
      // Fallback to manual generation
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
      setFormData(prev => ({ ...prev, poNumber: `PO-${yearCode}-001` }));
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/purchase-orders');
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierSearch = (e) => {
    setSupplierSearch(e.target.value);
    setShowSupplierDropdown(true);
  };

  const handleSupplierSelect = (vendor) => {
    setFormData(prev => ({ ...prev, supplier: vendor.vendorName }));
    setSupplierSearch(vendor.vendorName);
    setShowSupplierDropdown(false);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      return sum + (itemTotal * item.discount / 100);
    }, 0);
  };

  const calculateCGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.cgstRate || 0)) / 100;
    }, 0);
  };

  const calculateSGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.sgstRate || 0)) / 100;
    }, 0);
  };

  const calculateIGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.igstRate || 0)) / 100;
    }, 0);
  };

  const calculateTax = () => {
    return calculateCGST() + calculateSGST() + calculateIGST();
  };

  const calculateTotal = () => {
    return calculateSubTotal() - calculateDiscount() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const poData = {
        ...formData,
        items,
        subTotal: calculateSubTotal(),
        totalDiscount: calculateDiscount(),
        totalTax: calculateTax(),
        totalAmount: calculateTotal(),
        status: editingOrder ? editingOrder.status : 'Pending Approval',
        approvalStatus: editingOrder ? editingOrder.approvalStatus : 'pending',
        createdBy: 'Current User',
        createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString()
      };

      const url = editingOrder 
        ? `http://localhost:5001/api/purchase-orders/${editingOrder._id}`
        : 'http://localhost:5001/api/purchase-orders';
      
      const method = editingOrder ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(poData)
      });

      if (response.ok) {
        alert(editingOrder ? 'Purchase Order updated successfully!' : 'Purchase Order created and sent for manager approval!');
        setShowCreateForm(false);
        setEditingOrder(null);
        setFormData({
          supplier: '',
          poNumber: '',
          poDate: new Date().toISOString().split('T')[0],
          deliveryDate: ''
        });
        setSupplierSearch('');
        setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
        fetchPurchaseOrders();
      } else {
        alert(editingOrder ? 'Error updating Purchase Order' : 'Error creating Purchase Order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(editingOrder ? 'Error updating Purchase Order' : 'Error creating Purchase Order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      supplier: order.supplier,
      poNumber: order.poNumber,
      poDate: order.poDate ? order.poDate.split('T')[0] : '',
      deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : ''
    });
    setSupplierSearch(order.supplier);
    setItems(order.items || [{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
    setShowCreateForm(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this Purchase Order?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/purchase-orders/${orderId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Purchase Order deleted successfully!');
          fetchPurchaseOrders();
        } else {
          alert('Error deleting Purchase Order');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting Purchase Order');
      }
    }
  };

  const ordersData = filteredOrders;

  const stats = {
    pending: purchaseOrders.filter(po => po.status === 'Pending Approval' || po.approvalStatus === 'pending').length,
    approved: purchaseOrders.filter(po => po.status === 'Approved' || po.approvalStatus === 'approved').length,
    rejected: purchaseOrders.filter(po => po.status === 'Rejected' || po.approvalStatus === 'rejected').length
  };

  const getStatusColor = (status, approvalStatus) => {
    if (approvalStatus === 'pending' || status === 'Pending Approval') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (approvalStatus === 'approved' || status === 'Approved') {
      return 'bg-green-100 text-green-800';
    }
    if (approvalStatus === 'rejected' || status === 'Rejected') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const isApproved = (order) => {
    return order.approvalStatus === 'approved' || order.status === 'Approved';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Purchase Orders</h1>
        <button 
          onClick={() => {
            setEditingOrder(null);
            setFormData({
              supplier: '',
              poNumber: '',
              poDate: new Date().toISOString().split('T')[0],
              deliveryDate: ''
            });
            setSupplierSearch('');
            setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
            setShowCreateForm(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-500 text-white rounded-xl p-6">
          <div className="text-lg mb-2">Pending Approval</div>
          <div className="text-5xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-6">
          <div className="text-lg mb-2">Approved</div>
          <div className="text-5xl font-bold">{stats.approved}</div>
        </div>
        <div className="bg-red-500 text-white rounded-xl p-6">
          <div className="text-lg mb-2">Rejected</div>
          <div className="text-5xl font-bold">{stats.rejected}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter size={16} />
              <span>Filter</span>
              <ChevronDown size={16} />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => { setActiveFilter('All'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${activeFilter === 'All' ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    All ({purchaseOrders.length})
                  </button>
                  <button
                    onClick={() => { setActiveFilter('Pending Approval'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${activeFilter === 'Pending Approval' ? 'bg-yellow-50 text-yellow-700' : ''}`}
                  >
                    Pending Approval ({stats.pending})
                  </button>
                  <button
                    onClick={() => { setActiveFilter('Approved'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${activeFilter === 'Approved' ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    Approved ({stats.approved})
                  </button>
                  <button
                    onClick={() => { setActiveFilter('Rejected'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${activeFilter === 'Rejected' ? 'bg-red-50 text-red-700' : ''}`}
                  >
                    Rejected ({stats.rejected})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">PO Number</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Vendor</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Order Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Status</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900 text-base">Amount</th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900 text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  Loading purchase orders...
                </td>
              </tr>
            ) : ordersData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No purchase orders found
                </td>
              </tr>
            ) : (
              ordersData.map((order, index) => (
                <tr key={order._id || index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-5 px-6">
                    <span className="text-blue-600 font-medium">{order.poNumber}</span>
                  </td>
                  <td className="py-5 px-6 text-gray-900">{order.supplier}</td>
                  <td className="py-5 px-6 text-gray-900">{new Date(order.poDate).toLocaleDateString()}</td>
                  <td className="py-5 px-6">
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(order.status, order.approvalStatus)}`}>
                      {order.approvalStatus === 'pending' ? 'Pending Approval' : 
                       order.approvalStatus === 'approved' ? 'Approved' :
                       order.approvalStatus === 'rejected' ? 'Rejected' :
                       order.status || 'Draft'}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-semibold text-gray-900">₹{order.totalAmount?.toLocaleString() || '0'}</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(order)}
                        disabled={isApproved(order)}
                        className={`p-2 rounded-lg transition-colors ${
                          isApproved(order)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                        title={isApproved(order) ? 'Cannot edit approved order' : 'Edit Purchase Order'}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        disabled={isApproved(order)}
                        className={`p-2 rounded-lg transition-colors ${
                          isApproved(order)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                        title={isApproved(order) ? 'Cannot delete approved order' : 'Delete Purchase Order'}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">2</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">3</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">4</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">5</button>
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Create PO Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingOrder(null);
                    setFormData({
                      supplier: '',
                      poNumber: '',
                      poDate: new Date().toISOString().split('T')[0],
                      deliveryDate: ''
                    });
                    setSupplierSearch('');
                    setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
              {/* Supplier, PO Number and Dates */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={supplierSearch}
                      onChange={handleSupplierSearch}
                      onFocus={() => setShowSupplierDropdown(true)}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg"
                      placeholder="Search or select supplier"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown size={20} />
                    </button>
                    {showSupplierDropdown && filteredVendors.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {filteredVendors.map(vendor => (
                          <div
                            key={vendor._id}
                            onClick={() => handleSupplierSelect(vendor)}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{vendor.vendorName}</div>
                            <div className="text-sm text-gray-500">{vendor.vendorCode}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PO Number</label>
                  <input 
                    type="text"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleInputChange}
                    placeholder="PO-2627-001" 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PO Date</label>
                  <input
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Date</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Item Details and Summary Side by Side */}
              <div className="flex gap-8 mb-8">
                {/* Item Details */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-4">Item Details</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-48">Item Name</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">HSN/SAC</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">Qty</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-28">Rate</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-20">Discount%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">CGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">SGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">IGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">Total</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2 w-48">
                              <input 
                                type="text" 
                                value={item.name}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].name = e.target.value;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-44"
                                placeholder="Enter item name"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="text" 
                                value={item.hsn}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].hsn = e.target.value;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="HSN/SAC"
                              />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].quantity = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-20"
                                placeholder="Qty"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2 w-28">
                              <input 
                                type="number" 
                                value={item.rate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].rate = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-24"
                                placeholder="Rate"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.discount}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].discount = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.cgstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].cgstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="9"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.sgstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].sgstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="9"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.igstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].igstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm font-medium">
                              ₹{((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                                 (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * (item.cgstRate + item.sgstRate + item.igstRate) / 100)).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <button 
                                onClick={() => removeItem(idx)}
                                className="text-red-600 hover:text-red-800"
                                disabled={items.length === 1}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 text-blue-600 font-medium mt-4 hover:text-blue-700"
                  >
                    <Plus size={20} />
                    Add Item
                  </button>
                </div>

                {/* Summary */}
                <div className="w-80">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>Sub Total</span>
                      <span className="font-semibold">₹ {calculateSubTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>₹ {calculateDiscount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST</span>
                      <span>₹ {calculateCGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST</span>
                      <span>₹ {calculateSGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST</span>
                      <span>₹ {calculateIGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax</span>
                      <span>₹ {calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span>₹ {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingOrder(null);
                    setFormData({
                      supplier: '',
                      poNumber: '',
                      poDate: new Date().toISOString().split('T')[0],
                      deliveryDate: ''
                    });
                    setSupplierSearch('');
                    setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
                  }}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingOrder ? 'Update' : 'Create'}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
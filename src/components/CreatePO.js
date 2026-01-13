import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Edit, Eye, Download, FileText, Search, Filter, Calendar } from 'lucide-react';
import DatePicker from './ui/DatePicker';
import { generatePONumber } from '../utils/numberGenerator';

const CreatePO = () => {
  const [showForm, setShowForm] = useState(false);
  const [pos, setPOs] = useState([]);
  const [filteredPOs, setFilteredPOs] = useState([]);
  const [editingPO, setEditingPO] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPO, setViewingPO] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [supplierData, setSupplierData] = useState({
    gstNumber: '',
    billingAddress: '',
    contactPerson: '',
    email: '',
    contactDetails: ''
  });
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getNextPONumber = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/pos/next-number');
      if (response.ok) {
        const data = await response.json();
        return data.poNumber;
      }
    } catch (error) {
      console.error('Error fetching PO number:', error);
    }
    // Dynamic fallback based on current year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    return `PO-${yearCode}-001`;
  };

  const [poNumber, setPoNumber] = useState(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    return `PO-${yearCode}-001`;
  });

  // Fetch next PO number on component mount
  useEffect(() => {
    const fetchPONumber = async () => {
      const nextNumber = await getNextPONumber();
      setPoNumber(nextNumber);
    };
    fetchPONumber();
  }, []);
  const [poDate, setPoDate] = useState(getCurrentDate());
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate());
  const [items, setItems] = useState([
    { name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }
  ]);

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.clientName.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // Fetch POs on component mount
  useEffect(() => {
    fetchPOs();
    fetchClients();
  }, []);

  useEffect(() => {
    if (showForm) {
      fetchClients();
    }
  }, [showForm]);

  const fetchPOs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/pos');
      if (response.ok) {
        const posData = await response.json();
        setPOs(posData);
        setFilteredPOs(posData);
      }
    } catch (error) {
      console.error('Error fetching POs:', error);
    }
  };

  // Filter POs based on search and filters
  useEffect(() => {
    let filtered = pos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(po => 
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(po => {
        const poDate = new Date(po.poDate);
        const filterFromDate = new Date(fromDate);
        return poDate >= filterFromDate;
      });
    }

    if (toDate) {
      filtered = filtered.filter(po => {
        const poDate = new Date(po.poDate);
        const filterToDate = new Date(toDate);
        return poDate <= filterToDate;
      });
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(po => po.status === statusFilter);
    }

    setFilteredPOs(filtered);
  }, [pos, searchTerm, fromDate, toDate, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/clients');
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client._id);
    setSupplierSearch(client.clientName);
    setShowDropdown(false);
    setSupplierData({
      gstNumber: client.gstNumber || '',
      billingAddress: client.billingAddress || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      contactDetails: client.contactDetails || ''
    });
  };

  const handleSupplierSearchChange = (e) => {
    setSupplierSearch(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedClient('');
      setSupplierData({
        gstNumber: '',
        billingAddress: '',
        contactPerson: '',
        email: '',
        contactDetails: ''
      });
    }
  };

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

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      const cgstAmount = (afterDiscount * (item.cgstRate || 0)) / 100;
      const sgstAmount = (afterDiscount * (item.sgstRate || 0)) / 100;
      const igstAmount = (afterDiscount * (item.igstRate || 0)) / 100;
      return sum + cgstAmount + sgstAmount + igstAmount;
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

  const calculateTotal = () => {
    return calculateSubTotal() - calculateDiscount() + calculateTax();
  };

  const resetForm = () => {
    setSelectedClient('');
    setSupplierSearch('');
    setSupplierData({
      gstNumber: '',
      billingAddress: '',
      contactPerson: '',
      email: '',
      contactDetails: ''
    });
    setPoDate(getCurrentDate());
    setDeliveryDate(getCurrentDate());
    setItems([{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
  };

  const handleCreatePO = async () => {
    const confirmed = window.confirm('Do you want to create this Purchase Order?');
    if (!confirmed) return;

    try {
      const poData = {
        poNumber,
        supplier: selectedClient,
        supplierName: supplierSearch,
        poDate,
        deliveryDate,
        gstNumber: supplierData.gstNumber,
        items,
        subTotal: calculateSubTotal(),
        totalDiscount: calculateDiscount(),
        cgst: calculateCGST(),
        sgst: calculateSGST(),
        igst: calculateIGST(),
        totalTax: calculateTax(),
        totalAmount: calculateTotal()
      };

      const isEditing = editingPO && editingPO._id;
      const url = isEditing 
        ? `http://localhost:5001/api/pos/${editingPO._id}`
        : 'http://localhost:5001/api/pos';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(poData)
      });

      if (response.ok) {
        alert(isEditing ? 'Purchase Order updated successfully!' : 'Purchase Order created successfully!');
        resetForm();
        setShowForm(false);
        setEditingPO(null);
        fetchPOs();
        // Get next PO number
        const nextNumber = await getNextPONumber();
        setPoNumber(nextNumber);
      } else {
        alert('Error creating Purchase Order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating Purchase Order');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleView = (po) => {
    setViewingPO(po);
    setShowViewModal(true);
  };

  const handleEdit = (po) => {
    setEditingPO(po);
    setSelectedClient(po.supplier);
    setSupplierSearch(po.supplierName);
    setPoNumber(po.poNumber);
    setPoDate(po.poDate);
    setDeliveryDate(po.deliveryDate);
    setSupplierData({
      gstNumber: po.gstNumber || '',
      billingAddress: '',
      contactPerson: '',
      email: '',
      contactDetails: ''
    });
    setItems(po.items || [{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
    setShowForm(true);
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      setShowForm(false);
      setEditingPO(null);
      resetForm();
    }
  };

  // PO List View
  if (!showForm && !showViewModal) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Proforma Invoice Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Proforma Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
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
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">FROM:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">TO:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredPOs.length} of {pos.length} proforma invoices
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPOs.map((po) => (
                  <tr key={po._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {po.poNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {po.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(po.poDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{po.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(po)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleView(po)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // View Modal
  if (showViewModal && viewingPO) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">PO Details - {viewingPO.poNumber}</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">PO Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">PO Number:</span> {viewingPO.poNumber}</p>
                  <p><span className="font-medium">Date:</span> {new Date(viewingPO.poDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Delivery Date:</span> {new Date(viewingPO.deliveryDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">GST Number:</span> {viewingPO.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Supplier Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {viewingPO.supplierName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sub Total</p>
                    <p className="text-lg font-semibold">₹{viewingPO.subTotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tax</p>
                    <p className="text-lg font-semibold">₹{viewingPO.totalTax?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discount</p>
                    <p className="text-lg font-semibold">₹{viewingPO.totalDiscount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-600">₹{viewingPO.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Modal View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{editingPO ? 'Edit Proforma Invoice' : 'Create Proforma Invoice'}</h1>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">

      {/* All Fields in One Row */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Supplier</label>
          <div className="relative">
            <input
              type="text"
              value={supplierSearch}
              onChange={handleSupplierSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg"
              placeholder="Search or select supplier"
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={20} />
            </button>
            {showDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {filteredClients.map(client => (
                  <div
                    key={client._id}
                    onClick={() => handleClientSelect(client)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {client.clientName}
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
            value={poNumber} 
            onChange={(e) => setPoNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Enter PO Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PO Date</label>
          <DatePicker 
            value={poDate} 
            onChange={setPoDate} 
            placeholder="Select PO Date" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Date</label>
          <DatePicker 
            value={deliveryDate} 
            onChange={setDeliveryDate} 
            placeholder="Select Delivery Date" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">GST Number</label>
          <input 
            type="text" 
            value={supplierData.gstNumber} 
            onChange={(e) => setSupplierData({...supplierData, gstNumber: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Enter GST Number"
          />
        </div>
      </div>

      {/* Item Details and Summary Side by Side */}
      <div className="flex gap-8 mb-8">
        {/* Item Details */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Item Details</h2>
          
          <div className="grid grid-cols-12 gap-4 mb-3 text-sm font-medium text-gray-600">
            <div className="col-span-2">Item Name</div>
            <div className="col-span-1">HSN/SAC</div>
            <div className="col-span-1">Quantity</div>
            <div className="col-span-1">Rate</div>
            <div className="col-span-1">Discount</div>
            <div className="col-span-1">CGST%</div>
            <div className="col-span-1">SGST%</div>
            <div className="col-span-1">IGST%</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1">Action</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 mb-3">
              <input 
                type="text" 
                value={item.name}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].name = e.target.value;
                  setItems(newItems);
                }}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Item Name"
              />
              <input 
                type="text" 
                value={item.hsn}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].hsn = e.target.value;
                  setItems(newItems);
                }}
                className="col-span-1 p-3 border border-gray-300 rounded-lg"
                placeholder="HSN/SAC"
              />
              <input 
                type="number" 
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].quantity = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-3 border border-gray-300 rounded-lg"
                placeholder="Qty"
              />
              <input 
                type="number" 
                value={item.rate}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].rate = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-3 border border-gray-300 rounded-lg"
                placeholder="Rate"
              />
              <input 
                type="number" 
                value={item.discount}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].discount = parseInt(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-3 border border-gray-300 rounded-lg"
                placeholder="Discount %"
              />
              <input 
                type="number" 
                value={item.cgstRate}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].cgstRate = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="9"
                min="0"
                max="28"
                step="0.01"
              />
              <input 
                type="number" 
                value={item.sgstRate}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].sgstRate = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="9"
                min="0"
                max="28"
                step="0.01"
              />
              <input 
                type="number" 
                value={item.igstRate}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].igstRate = parseFloat(e.target.value) || 0;
                  setItems(newItems);
                }}
                className="col-span-1 p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
                min="0"
                max="28"
                step="0.01"
              />
              <div className="col-span-2 p-3 border border-gray-200 rounded-lg bg-gray-50 text-right font-medium">
                ₹ {((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                   (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * (item.cgstRate + item.sgstRate + item.igstRate) / 100)).toLocaleString()}
              </div>
              <button 
                onClick={() => removeItem(idx)}
                className="col-span-1 p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                disabled={items.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

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
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button 
            onClick={handleClose}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreatePO}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editingPO ? 'Update' : 'Create'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePO;

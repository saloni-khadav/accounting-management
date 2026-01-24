import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Building, Car, Monitor, Wrench, X, Save, DollarSign, Upload, Paperclip } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const AssetsEntry = () => {
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    assetName: '',
    assetCode: '',
    category: '',
    subCategory: '',
    purchaseDate: '',
    purchaseValue: '',
    vendor: '',
    location: '',
    depreciationMethod: 'straight-line',
    usefulLife: '',
    salvageValue: '',
    description: '',
    serialNumber: '',
    warrantyPeriod: '',
    status: 'Active'
  });
  const [items, setItems] = useState([
    { name: '', hsn: '', quantity: 1, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }
  ]);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchVendors();
  }, [categoryFilter, statusFilter]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5001/api/assets';
      const params = new URLSearchParams();
      
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchAssets();
  };

  const categories = ['IT Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Buildings'];
  const statuses = ['Active', 'Under Maintenance', 'Disposed', 'Sold'];
  const depreciationMethods = [
    { value: 'straight-line', label: 'Straight Line' },
    { value: 'declining-balance', label: 'Declining Balance' },
    { value: 'sum-of-years', label: 'Sum of Years Digits' },
    { value: 'units-of-production', label: 'Units of Production' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Show dropdown when typing in vendor field
    if (name === 'vendor') {
      setVendorSearchTerm(value);
      setShowVendorDropdown(true);
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVendorSelect = (vendorName) => {
    setFormData(prev => ({
      ...prev,
      vendor: vendorName
    }));
    setShowVendorDropdown(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const downloadAttachment = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { name: '', hsn: '', quantity: 1, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
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

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes((formData.vendor || '').toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.assetName) newErrors.assetName = 'Asset name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (calculateTotal() <= 0) newErrors.purchaseValue = 'Please add at least one item with valid amount';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const url = editingAsset 
          ? `http://localhost:5001/api/assets/${editingAsset._id}`
          : 'http://localhost:5001/api/assets';
        
        const method = editingAsset ? 'PUT' : 'POST';
        
        const totalAmount = calculateTotal();
        
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('assetName', formData.assetName);
        formDataToSend.append('assetCode', formData.assetCode);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('subCategory', formData.subCategory);
        formDataToSend.append('purchaseDate', formData.purchaseDate);
        formDataToSend.append('purchaseValue', totalAmount);
        formDataToSend.append('vendor', formData.vendor);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('depreciationMethod', formData.depreciationMethod);
        formDataToSend.append('usefulLife', formData.usefulLife);
        formDataToSend.append('salvageValue', formData.salvageValue);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('serialNumber', formData.serialNumber);
        formDataToSend.append('warrantyPeriod', formData.warrantyPeriod);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('items', JSON.stringify(items));
        
        // Append attachments
        attachments.forEach((file) => {
          formDataToSend.append('attachments', file);
        });
        
        const response = await fetch(url, {
          method,
          body: formDataToSend,
        });
        
        if (response.ok) {
          const savedAsset = await response.json();
          if (editingAsset) {
            setAssets(assets.map(asset => 
              asset._id === editingAsset._id ? savedAsset : asset
            ));
            alert('Asset updated successfully!');
          } else {
            setAssets([savedAsset, ...assets]);
            alert('Asset added successfully!');
          }
          setIsFormOpen(false);
          resetForm();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error saving asset');
        }
      } catch (error) {
        console.error('Error saving asset:', error);
        alert('Error saving asset');
      }
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetName: asset.assetName,
      assetCode: asset.assetCode,
      category: asset.category,
      subCategory: asset.subCategory || '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      purchaseValue: asset.purchaseValue,
      vendor: asset.vendor || '',
      location: asset.location || '',
      depreciationMethod: asset.depreciationMethod,
      usefulLife: asset.usefulLife || '',
      salvageValue: asset.salvageValue || '',
      description: asset.description || '',
      serialNumber: asset.serialNumber || '',
      warrantyPeriod: asset.warrantyPeriod || '',
      status: asset.status
    });
    if (asset.items && asset.items.length > 0) {
      setItems(asset.items);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/assets/${assetId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setAssets(assets.filter(asset => asset._id !== assetId));
          alert('Asset deleted successfully!');
        } else {
          alert('Error deleting asset');
        }
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset');
      }
    }
  };

  const handleCloseForm = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      setIsFormOpen(false);
      resetForm();
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    console.log('Current Date:', dateString, '| Full Date Object:', today);
    return dateString;
  };

  const resetForm = () => {
    setFormData({
      assetName: '',
      assetCode: '',
      category: '',
      subCategory: '',
      purchaseDate: getTodayDate(),
      purchaseValue: '',
      vendor: '',
      location: '',
      depreciationMethod: 'straight-line',
      usefulLife: '',
      salvageValue: '',
      description: '',
      serialNumber: '',
      warrantyPeriod: '',
      status: 'Active'
    });
    setItems([{ name: '', hsn: '', quantity: 1, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
    setErrors({});
    setEditingAsset(null);
    setShowVendorDropdown(false);
    setVendorSearchTerm('');
    setAttachments([]);
  };

  const handleExportToExcel = () => {
    if (filteredAssets.length === 0) {
      alert('No asset data to export');
      return;
    }
    
    const exportData = filteredAssets.map(asset => ({
      'Asset Code': asset.assetCode,
      'Asset Name': asset.assetName,
      'Category': asset.category,
      'Serial Number': asset.serialNumber || 'N/A',
      'Purchase Date': new Date(asset.purchaseDate).toLocaleDateString(),
      'Purchase Value': asset.purchaseValue,
      'Vendor': asset.vendor || 'N/A',
      'Location': asset.location || 'N/A',
      'Depreciation Method': asset.depreciationMethod,
      'Useful Life (Years)': asset.usefulLife || 'N/A',
      'Warranty (Months)': asset.warrantyPeriod || 0,
      'Status': asset.status
    }));
    
    exportToExcel(exportData, `assets_${new Date().toISOString().split('T')[0]}`);
    alert('Asset data exported successfully!');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Buildings': return <Building className="w-5 h-5 text-blue-600" />;
      case 'Vehicles': return <Car className="w-5 h-5 text-green-600" />;
      case 'IT Equipment': return <Monitor className="w-5 h-5 text-purple-600" />;
      case 'Machinery': return <Wrench className="w-5 h-5 text-orange-600" />;
      default: return <Building className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Disposed': return 'bg-red-100 text-red-800';
      case 'Sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.purchaseValue, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Assets Entry</h1>
        <p className="text-gray-600">Manage and track all your company assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Assets</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredAssets.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Assets</h3>
          <p className="text-2xl font-bold text-purple-600">{filteredAssets.filter(a => a.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Categories</h3>
          <p className="text-2xl font-bold text-orange-600">{[...new Set(filteredAssets.map(a => a.category))].length}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
            <button 
              onClick={handleExportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Asset Details</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Purchase Info</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    Loading assets...
                  </td>
                </tr>
              ) : filteredAssets.map((asset) => (
                <tr key={asset._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{asset.assetName}</div>
                      <div className="text-sm text-gray-500">{asset.assetCode}</div>
                      <div className="text-sm text-gray-500">S/N: {asset.serialNumber || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {getCategoryIcon(asset.category)}
                      <span className="ml-2 text-sm text-gray-900">{asset.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">₹{asset.purchaseValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{new Date(asset.purchaseDate).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">Warranty: {asset.warrantyPeriod || 0}M</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{asset.vendor || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{asset.location || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(asset)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No assets found matching your criteria.</p>
        </div>
      )}

      {/* Add Asset Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Name *
                      </label>
                      <input
                        type="text"
                        name="assetName"
                        value={formData.assetName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.assetName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter asset name"
                      />
                      {errors.assetName && <p className="text-red-500 text-sm mt-1">{errors.assetName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Code
                      </label>
                      <input
                        type="text"
                        name="assetCode"
                        value={formData.assetCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated or manual"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter serial number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Asset location"
                      />
                    </div>

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
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Purchase Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Date *
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                        max={getTodayDate()}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        onFocus={() => setShowVendorDropdown(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search or type vendor name"
                        autoComplete="off"
                      />
                      {showVendorDropdown && filteredVendors.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredVendors.map(vendor => (
                            <div
                              key={vendor._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleVendorSelect(vendor.vendorName);
                              }}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900"
                            >
                              {vendor.vendorName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty Period (Months)
                      </label>
                      <input
                        type="number"
                        name="warrantyPeriod"
                        value={formData.warrantyPeriod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12"
                      />
                    </div>
                  </div>

                  {/* Product Details Table */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Product Details</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Item Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">HSN/SAC</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Qty</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Rate</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Discount%</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">CGST%</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">SGST%</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">IGST%</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Total</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx].name = e.target.value;
                                    setItems(newItems);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="Item name"
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
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="HSN"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                                    setItems(newItems);
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  value={item.rate}
                                  onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx].rate = parseInt(e.target.value) || 0;
                                    setItems(newItems);
                                  }}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
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
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
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
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
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
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
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
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td className="px-3 py-2 text-xs font-medium">
                                ₹{((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                                   (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * (item.cgstRate + item.sgstRate + item.igstRate) / 100)).toFixed(2)}
                              </td>
                              <td className="px-3 py-2">
                                <button 
                                  onClick={() => removeItem(idx)}
                                  className="text-red-600 hover:text-red-800"
                                  disabled={items.length === 1}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button 
                      onClick={addItem}
                      className="flex items-center gap-2 text-blue-600 font-medium mt-3 hover:text-blue-700 text-sm"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>

                    {/* Summary */}
                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sub Total</span>
                          <span className="font-semibold">₹{calculateSubTotal().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount</span>
                          <span>₹{calculateDiscount().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST</span>
                          <span>₹{calculateCGST().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST</span>
                          <span>₹{calculateSGST().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IGST</span>
                          <span>₹{calculateIGST().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Tax</span>
                          <span>₹{calculateTax().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-base font-bold">
                          <span>Total Amount</span>
                          <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Depreciation Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Depreciation Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Depreciation Method
                      </label>
                      <select
                        name="depreciationMethod"
                        value={formData.depreciationMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {depreciationMethods.map(method => (
                          <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Useful Life (Years)
                      </label>
                      <input
                        type="number"
                        name="usefulLife"
                        value={formData.usefulLife}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salvage Value
                      </label>
                      <input
                        type="number"
                        name="salvageValue"
                        value={formData.salvageValue}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Asset description and additional notes"
                  />
                </div>

                {/* Attachments */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Documents (Invoice, Warranty, etc.)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Choose Files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        {attachments.length} file(s) selected
                      </span>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => downloadAttachment(file)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingAsset ? 'Update Asset' : 'Save Asset'}
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

export default AssetsEntry;
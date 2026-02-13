import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Building, Car, Monitor, Wrench, X, Save, DollarSign, Upload, Paperclip, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const AssetsEntry = () => {
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [selectedPO, setSelectedPO] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [viewingAsset, setViewingAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, assetId: null, assetName: '' });
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
  const [vendorData, setVendorData] = useState({
    vendorName: '',
    vendorCode: '',
    contactPerson: '',
    contactDetails: '',
    email: '',
    website: '',
    billingAddress: '',
    gstNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    industryType: 'Company',
    vendorCategory: 'Corporate'
  });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [items, setItems] = useState([
    { name: '', hsn: '', quantity: 1, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }
  ]);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchVendors();
  }, [categoryFilter, statusFilter]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchPurchaseOrders = async (vendorName) => {
    try {
      console.log('Fetching Purchase Orders for vendor:', vendorName);
      const response = await fetch(`http://localhost:5001/api/purchase-orders/vendor/${encodeURIComponent(vendorName)}`);
      const data = await response.json();
      console.log('Purchase Orders received:', data);
      setPurchaseOrders(data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setPurchaseOrders([]);
    }
  };

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

  const generateAssetCode = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/assets/next-code');
      const data = await response.json();
      // Add random suffix to make it unique even if not saved
      const randomSuffix = Math.floor(Math.random() * 100);
      setFormData(prev => ({
        ...prev,
        assetCode: `${data.assetCode}-${randomSuffix}`
      }));
    } catch (error) {
      console.error('Error generating asset code:', error);
    }
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
      
      // Fetch POs when vendor name is typed
      if (value.length > 2) {
        fetchPurchaseOrders(value);
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVendorSelect = (vendorName) => {
    const selectedVendor = vendors.find(v => v.vendorName === vendorName);
    
    setFormData(prev => ({
      ...prev,
      vendor: vendorName
    }));
    
    if (selectedVendor) {
      setVendorData({
        vendorName: selectedVendor.vendorName || '',
        vendorCode: selectedVendor.vendorCode || '',
        contactPerson: selectedVendor.contactPerson || '',
        contactDetails: selectedVendor.contactDetails || '',
        email: selectedVendor.email || '',
        website: selectedVendor.website || '',
        billingAddress: selectedVendor.billingAddress || '',
        gstNumber: selectedVendor.gstNumber || '',
        panNumber: selectedVendor.panNumber || '',
        aadhaarNumber: selectedVendor.aadharNumber || '',
        industryType: selectedVendor.industryType || 'Company',
        vendorCategory: selectedVendor.vendorCategory || 'Corporate'
      });
    }
    
    // Fetch POs for selected vendor
    console.log('Fetching POs for vendor:', vendorName);
    fetchPurchaseOrders(vendorName);
    
    setShowVendorDropdown(false);
  };

  const handlePOSelect = (poNumber) => {
    const selectedPOData = purchaseOrders.find(po => po.poNumber === poNumber);
    
    if (selectedPOData) {
      setSelectedPO(poNumber);
      
      // Fill purchase information from Purchase Order
      setFormData(prev => ({
        ...prev,
        purchaseDate: selectedPOData.poDate ? selectedPOData.poDate.split('T')[0] : prev.purchaseDate,
        purchaseValue: selectedPOData.totalAmount || prev.purchaseValue
      }));
      
      // Fill items from Purchase Order
      if (selectedPOData.items && selectedPOData.items.length > 0) {
        setItems(selectedPOData.items);
      }
    }
    
    setShowPODropdown(false);
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
        
        console.log('Form Data before submit:', formData);
        console.log('Submitting asset:', { method, url, totalAmount, status: formData.status });
        
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('assetName', formData.assetName);
        formDataToSend.append('assetCode', formData.assetCode);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('subCategory', formData.subCategory);
        formDataToSend.append('purchaseDate', formData.purchaseDate);
        formDataToSend.append('purchaseValue', totalAmount);
        formDataToSend.append('vendor', formData.vendor);
        formDataToSend.append('vendorDetails', JSON.stringify(vendorData));
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
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const savedAsset = await response.json();
          console.log('Asset saved successfully:', savedAsset);
          console.log('Saved asset status:', savedAsset.status);
          
          // Refresh the entire list from server
          await fetchAssets();
          
          if (editingAsset) {
            showNotification('success', 'Asset updated successfully!');
          } else {
            showNotification('success', 'Asset added successfully!');
          }
          setIsFormOpen(false);
          resetForm();
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          showNotification('error', errorData.message || 'Error saving asset');
        }
      } catch (error) {
        console.error('Error saving asset:', error);
        showNotification('error', 'Error saving asset: ' + error.message);
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
    
    if (asset.vendorDetails) {
      setVendorData({
        vendorName: asset.vendorDetails.vendorName || '',
        vendorCode: asset.vendorDetails.vendorCode || '',
        contactPerson: asset.vendorDetails.contactPerson || '',
        contactDetails: asset.vendorDetails.contactDetails || '',
        email: asset.vendorDetails.email || '',
        website: asset.vendorDetails.website || '',
        billingAddress: asset.vendorDetails.billingAddress || '',
        gstNumber: asset.vendorDetails.gstNumber || '',
        panNumber: asset.vendorDetails.panNumber || '',
        aadhaarNumber: asset.vendorDetails.aadhaarNumber || '',
        industryType: asset.vendorDetails.industryType || 'Company',
        vendorCategory: asset.vendorDetails.vendorCategory || 'Corporate'
      });
    }
    
    if (asset.items && asset.items.length > 0) {
      setItems(asset.items);
    }
    setIsFormOpen(true);
  };

  const handleDelete = (asset) => {
    setDeleteConfirm({ show: true, assetId: asset._id, assetName: asset.assetName });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/assets/${deleteConfirm.assetId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAssets(assets.filter(asset => asset._id !== deleteConfirm.assetId));
        showNotification('success', 'Asset deleted successfully!');
      } else {
        showNotification('error', 'Error deleting asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      showNotification('error', 'Error deleting asset');
    }
    setDeleteConfirm({ show: false, assetId: null, assetName: '' });
  };

  const handleCloseForm = () => {
    setShowCloseConfirm(true);
  };

  const confirmClose = () => {
    setIsFormOpen(false);
    setShowCloseConfirm(false);
    resetForm();
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
    setPurchaseOrders([]);
    setSelectedPO('');
    setShowPODropdown(false);
    setVendorData({
      vendorName: '',
      vendorCode: '',
      contactPerson: '',
      contactDetails: '',
      email: '',
      website: '',
      billingAddress: '',
      gstNumber: '',
      panNumber: '',
      aadhaarNumber: '',
      industryType: 'Company',
      vendorCategory: 'Corporate'
    });
    setShowVendorForm(false);
    
    // Auto-generate asset code for new asset
    if (!editingAsset) {
      generateAssetCode();
    }
  };

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      
      if (response.ok) {
        const savedVendor = await response.json();
        setVendors([savedVendor, ...vendors]);
        setFormData(prev => ({ ...prev, vendor: savedVendor.vendorName }));
        setShowVendorForm(false);
        alert('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving vendor');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor');
    }
  };

  const handleExportToExcel = () => {
    if (filteredAssets.length === 0) {
      showNotification('error', 'No asset data to export');
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
    showNotification('success', 'Asset data exported successfully!');
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Assets Entry</h1>
        <p className="text-gray-600 text-lg">Manage and track all your company assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Total Assets</h3>
              <p className="text-3xl font-bold text-blue-900">{filteredAssets.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-300 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-2">Total Value</h3>
              <p className="text-3xl font-bold text-green-900">₹{(totalValue/100000).toFixed(1)}L</p>
            </div>
            <div className="w-12 h-12 bg-green-300 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-purple-800 mb-2">Active Assets</h3>
              <p className="text-3xl font-bold text-purple-900">{filteredAssets.filter(a => a.status === 'Active').length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-300 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-orange-800 mb-2">Categories</h3>
              <p className="text-3xl font-bold text-orange-900">{[...new Set(filteredAssets.map(a => a.category))].length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-300 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900">Search & Filters</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-blue-400 cursor-pointer font-medium text-gray-700 shadow-sm hover:shadow-md min-w-[180px]"
          >
            <option value="" className="py-2">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category} className="py-2">{category}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-blue-400 cursor-pointer font-medium text-gray-700 shadow-sm hover:shadow-md min-w-[150px]"
          >
            <option value="" className="py-2">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status} className="py-2">{status}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditingAsset(null);
                resetForm();
                generateAssetCode();
                setIsFormOpen(true);
              }}
              className="bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Asset
            </button>
            <button 
              onClick={handleExportToExcel}
              className="bg-green-500 text-white px-3 py-2.5 rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Asset Details</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Purchase Info</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Vendor</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Location</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm">Actions</th>
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
                <tr key={asset._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
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
                    <div className="flex space-x-2 justify-center">
                      <button 
                        onClick={() => setViewingAsset(asset)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" onClick={() => setViewingAsset(asset)} />
                      </button>
                      <button 
                        onClick={() => handleEdit(asset)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Edit Asset"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Delete Asset"
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
                        Asset Code (Auto-generated)
                      </label>
                      <input
                        type="text"
                        name="assetCode"
                        value={formData.assetCode}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Auto-generated"
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
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={vendorData.gstNumber}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GST registration number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={vendorData.panNumber}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PAN number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Address
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={vendorData.billingAddress}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Complete billing address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Order (PO)
                      </label>
                      <input
                        type="text"
                        value={selectedPO}
                        onChange={(e) => setSelectedPO(e.target.value)}
                        onFocus={() => setShowPODropdown(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Select PO Number"
                        autoComplete="off"
                      />
                      {showPODropdown && purchaseOrders.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {purchaseOrders.map(po => (
                            <div
                              key={po._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handlePOSelect(po.poNumber);
                              }}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900"
                            >
                              <div className="font-medium">{po.poNumber}</div>
                              <div className="text-xs text-gray-500">₹{po.totalAmount?.toLocaleString()} - {new Date(po.poDate).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

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

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Add New Vendor</h2>
                <button
                  onClick={() => setShowVendorForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleVendorSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Name *
                      </label>
                      <input
                        type="text"
                        name="vendorName"
                        value={vendorData.vendorName}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter vendor name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Code
                      </label>
                      <input
                        type="text"
                        name="vendorCode"
                        value={vendorData.vendorCode}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated or manual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={vendorData.contactPerson}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contact person name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Details
                      </label>
                      <input
                        type="text"
                        name="contactDetails"
                        value={vendorData.contactDetails}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={vendorData.email}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="vendor@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={vendorData.website}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Legal */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address & Legal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Address
                      </label>
                      <textarea
                        name="billingAddress"
                        value={vendorData.billingAddress}
                        onChange={handleVendorInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Complete billing address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={vendorData.gstNumber}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GST registration number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={vendorData.panNumber}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PAN number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={vendorData.aadhaarNumber}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Aadhaar number (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry Type
                      </label>
                      <select
                        name="industryType"
                        value={vendorData.industryType}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Company">Company</option>
                        <option value="Individual">Individual</option>
                        <option value="Partnership">Partnership</option>
                        <option value="LLP">LLP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Category
                      </label>
                      <select
                        name="vendorCategory"
                        value={vendorData.vendorCategory}
                        onChange={handleVendorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Corporate">Corporate</option>
                        <option value="SME">SME</option>
                        <option value="Startup">Startup</option>
                        <option value="Government">Government</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowVendorForm(false)}
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
                    Save Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-white border-green-500' 
              : 'bg-white border-red-500'
          }`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notification.type === 'success' 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.type === 'success' ? 'Success!' : 'Error!'}
              </p>
              <p className="text-gray-700 text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, type: '', message: '' })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close? Any unsaved changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete Asset</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{deleteConfirm.assetName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, assetId: null, assetName: '' })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Asset Details Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Asset Details</h2>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Asset Name</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.assetName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Asset Code</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.assetCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Serial Number</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.serialNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewingAsset.status)}`}>
                        {viewingAsset.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Purchase Date</p>
                      <p className="text-base font-medium text-gray-900">{new Date(viewingAsset.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purchase Value</p>
                      <p className="text-base font-medium text-gray-900">₹{viewingAsset.purchaseValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.vendor || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Warranty Period</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.warrantyPeriod || 0} Months</p>
                    </div>
                  </div>
                </div>

                {/* Depreciation Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.depreciationMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Useful Life</p>
                      <p className="text-base font-medium text-gray-900">{viewingAsset.usefulLife || 'N/A'} Years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Salvage Value</p>
                      <p className="text-base font-medium text-gray-900">₹{viewingAsset.salvageValue || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Vendor Details */}
                {viewingAsset.vendorDetails && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vendor Name</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.vendorName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vendor Code</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.vendorCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.contactPerson || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Details</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.contactDetails || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">GST Number</p>
                        <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.gstNumber || 'N/A'}</p>
                      </div>
                      {viewingAsset.vendorDetails.billingAddress && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Billing Address</p>
                          <p className="text-base font-medium text-gray-900">{viewingAsset.vendorDetails.billingAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {viewingAsset.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{viewingAsset.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={() => setViewingAsset(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleEdit(viewingAsset);
                      setViewingAsset(null);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Asset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsEntry;
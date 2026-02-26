import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Edit, Eye, Download, FileText, Search, Filter, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import DatePicker from './ui/DatePicker';
import MetricsCard from './ui/MetricsCard';
import { generatePONumber } from '../utils/numberGenerator';
import { determineGSTType, applyGSTRates } from '../utils/gstTaxUtils';

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
    deliveryAddress: '',
    contactPerson: '',
    email: '',
    contactDetails: ''
  });
  const [companyGST, setCompanyGST] = useState('');
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [showGSTDropdown, setShowGSTDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getNextPONumber = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/pos/next-number');
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
    return `PI-${yearCode}-001`;
  };

  const [poNumber, setPoNumber] = useState(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearCode = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    return `PI-${yearCode}-001`;
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

  // Fetch POs and company profile on component mount
  useEffect(() => {
    fetchPOs();
    fetchClients();
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (showForm) {
      fetchClients();
    }
  }, [showForm]);

  const fetchPOs = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/pos');
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
      filtered = filtered.filter(po => {
        if (statusFilter === 'Pending Approval') {
          return po.approvalStatus === 'pending' || po.status === 'Pending Approval';
        } else if (statusFilter === 'Approved') {
          return po.approvalStatus === 'approved' || po.status === 'Approved';
        } else if (statusFilter === 'Rejected') {
          return po.approvalStatus === 'rejected' || po.status === 'Rejected';
        }
        return po.status === statusFilter;
      });
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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/clients');
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user && result.user.profile && result.user.profile.gstNumber) {
          setCompanyGST(result.user.profile.gstNumber);
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client._id);
    setSupplierSearch(client.clientName);
    setShowDropdown(false);
    setSelectedClientData(client);
    
    const clientGST = client.gstNumber || '';
    const deliveryAddr = client.billingAddress || '';
    
    setSupplierData({
      gstNumber: clientGST,
      billingAddress: client.billingAddress || '',
      deliveryAddress: deliveryAddr,
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      contactDetails: client.contactDetails || ''
    });

    // Apply GST logic when client is selected
    if (companyGST && clientGST) {
      const gstType = determineGSTType(companyGST, clientGST);
      const updatedItems = applyGSTRates(items, gstType);
      setItems(updatedItems);
    }
  };

  const handleGSTSelect = (gstNumber, billingAddress) => {
    setSupplierData(prev => ({ 
      ...prev, 
      gstNumber: gstNumber,
      deliveryAddress: billingAddress
    }));
    setShowGSTDropdown(false);
    
    // Apply GST logic when GST is changed
    if (companyGST && gstNumber) {
      const gstType = determineGSTType(companyGST, gstNumber);
      const updatedItems = applyGSTRates(items, gstType);
      setItems(updatedItems);
    }
  };

  const handleSupplierGSTChange = (gstNumber) => {
    setSupplierData({...supplierData, gstNumber});
    
    // Apply GST logic when GST number is changed
    if (companyGST && gstNumber && gstNumber.length >= 2) {
      const gstType = determineGSTType(companyGST, gstNumber);
      const updatedItems = applyGSTRates(items, gstType);
      setItems(updatedItems);
    }
  };

  const handleSupplierSearchChange = (e) => {
    setSupplierSearch(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedClient('');
      setSelectedClientData(null);
      setSupplierData({
        gstNumber: '',
        billingAddress: '',
        deliveryAddress: '',
        contactPerson: '',
        email: '',
        contactDetails: ''
      });
    }
  };

  const addItem = () => {
    // Get GST rates from existing items or calculate based on current GST selection
    let gstRates = { cgstRate: 9, sgstRate: 9, igstRate: 0 };
    
    if (items.length > 0) {
      // Use GST rates from first item
      gstRates = {
        cgstRate: items[0].cgstRate,
        sgstRate: items[0].sgstRate,
        igstRate: items[0].igstRate
      };
    } else if (companyGST && supplierData.gstNumber) {
      // Calculate GST rates based on current selection
      const gstType = determineGSTType(companyGST, supplierData.gstNumber);
      const tempItem = [{ name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }];
      const updatedItem = applyGSTRates(tempItem, gstType);
      gstRates = {
        cgstRate: updatedItem[0].cgstRate,
        sgstRate: updatedItem[0].sgstRate,
        igstRate: updatedItem[0].igstRate
      };
    }
    
    setItems([...items, { 
      name: '', 
      hsn: '', 
      quantity: 0, 
      rate: 0, 
      discount: 0, 
      ...gstRates 
    }]);
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
    setSelectedClientData(null);
    setSupplierData({
      gstNumber: '',
      billingAddress: '',
      deliveryAddress: '',
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

    // Validate supplier exists in client master
    if (!supplierSearch || !supplierSearch.trim()) {
      alert('Supplier name is required');
      return;
    }
    
    const supplierExists = clients.some(client => 
      client.clientName.toLowerCase() === supplierSearch.toLowerCase()
    );
    
    if (!supplierExists) {
      alert('Supplier not found in Client Master. Please select a valid supplier from the dropdown or add them in Client Master first.');
      return;
    }

    try {
      const poData = {
        poNumber,
        piNumber: poNumber,
        supplier: selectedClient,
        supplierName: supplierSearch,
        poDate,
        piDate: poDate,
        deliveryDate,
        gstNumber: supplierData.gstNumber,
        deliveryAddress: supplierData.deliveryAddress,
        items,
        subTotal: calculateSubTotal(),
        totalDiscount: calculateDiscount(),
        cgst: calculateCGST(),
        sgst: calculateSGST(),
        igst: calculateIGST(),
        totalTax: calculateTax(),
        totalAmount: calculateTotal(),
        status: editingPO ? editingPO.status : 'Pending Approval',
        approvalStatus: editingPO ? editingPO.approvalStatus : 'pending',
        createdBy: 'Current User',
        createdAt: editingPO ? editingPO.createdAt : new Date().toISOString()
      };

      console.log('Sending PI data:', poData);
      console.log('PI Date:', poDate);

      const isEditing = editingPO && editingPO._id;
      const url = isEditing 
        ? `https://nextbook-backend.nextsphere.co.in/api/pos/${editingPO._id}`
        : 'https://nextbook-backend.nextsphere.co.in/api/pos';
      const method = isEditing ? 'PUT' : 'POST';

      console.log('API URL:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(poData)
      });

      if (response.ok) {
        alert(isEditing ? 'Proforma Invoice updated successfully!' : 'Proforma Invoice created and sent for manager approval!');
        resetForm();
        setShowForm(false);
        setEditingPO(null);
        fetchPOs();
        const nextNumber = await getNextPONumber();
        setPoNumber(nextNumber);
      } else {
        const errorData = await response.json();
        if (errorData.isPastDateError) {
          alert(errorData.message);
        } else {
          alert('Error creating Proforma Invoice: ' + (errorData.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating Proforma Invoice: ' + error.message);
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
    setPoDate(po.poDate ? po.poDate.split('T')[0] : getCurrentDate());
    setDeliveryDate(po.deliveryDate ? po.deliveryDate.split('T')[0] : getCurrentDate());
    setSupplierData({
      gstNumber: po.gstNumber || '',
      billingAddress: '',
      deliveryAddress: po.deliveryAddress || '',
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

  const handleDelete = async (poId) => {
    if (window.confirm('Are you sure you want to delete this Proforma Invoice?')) {
      try {
        const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/pos/${poId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Proforma Invoice deleted successfully!');
          fetchPOs();
        } else {
          alert('Error deleting Proforma Invoice');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting Proforma Invoice');
      }
    }
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

  const isApproved = (po) => {
    return po.approvalStatus === 'approved' || po.status === 'Approved';
  };

  const isProcessed = (po) => {
    return po.approvalStatus === 'approved' || po.status === 'Approved' || 
           po.approvalStatus === 'rejected' || po.status === 'Rejected';
  };

  const stats = {
    pending: pos.filter(po => po.status === 'Pending Approval' || po.approvalStatus === 'pending').length,
    approved: pos.filter(po => po.status === 'Approved' || po.approvalStatus === 'approved').length,
    rejected: pos.filter(po => po.status === 'Rejected' || po.approvalStatus === 'rejected').length
  };

  // PO List View
  if (!showForm && !showViewModal) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
            <h1 className="text-2xl font-bold">Proforma Invoice Management</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg flex items-center font-medium transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Proforma Invoice
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricsCard
            title="Pending Approval"
            value={stats.pending}
            icon={Clock}
            color="warning"
          />
          <MetricsCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="success"
          />
          <MetricsCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="danger"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-3 rounded-t-xl">
            <h2 className="text-lg font-semibold">Search & Filters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full justify-between"
            >
              <span>{statusFilter || 'All Status'}</span>
              <ChevronDown size={16} />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => { setStatusFilter(''); setShowFilterDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    All ({pos.length})
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Pending Approval'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Pending Approval ({stats.pending})
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Approved'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Approved ({stats.approved})
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Rejected'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Rejected ({stats.rejected})
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 lg:col-span-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">FROM:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">TO:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            </div>
          </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredPOs.length} of {pos.length} proforma invoices
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-3">
            <h2 className="text-lg font-semibold">Proforma Invoice List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">PI Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-lg">No proforma invoices found</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first proforma invoice to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                  <tr key={po._id} className="hover:bg-blue-50 transition-colors">
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(po.status, po.approvalStatus)}`}>
                        {po.approvalStatus === 'pending' ? 'Pending Approval' : 
                         po.approvalStatus === 'approved' ? 'Approved' :
                         po.approvalStatus === 'rejected' ? 'Rejected' :
                         po.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(po)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleEdit(po)}
                          disabled={isProcessed(po)}
                          className={`p-2 rounded-lg transition-colors ${isProcessed(po) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                          title={isProcessed(po) ? 'Cannot edit processed invoice' : 'Edit'}
                        >
                          <Edit className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(po._id)}
                          disabled={isProcessed(po)}
                          className={`p-2 rounded-lg transition-colors ${isProcessed(po) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                          title={isProcessed(po) ? 'Cannot delete processed invoice' : 'Delete'}
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
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
      </div>
    );
  }

  // View Modal
  if (showViewModal && viewingPO) {
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Proforma Invoice Details - {viewingPO.poNumber}</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">PI Number:</span> {viewingPO.poNumber}</p>
                  <p><span className="font-medium">Date:</span> {new Date(viewingPO.poDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Delivery Date:</span> {new Date(viewingPO.deliveryDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">GST Number:</span> {viewingPO.gstNumber || 'N/A'}</p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(viewingPO.status, viewingPO.approvalStatus)}`}>
                      {viewingPO.approvalStatus === 'pending' ? 'Pending Approval' : 
                       viewingPO.approvalStatus === 'approved' ? 'Approved' :
                       viewingPO.approvalStatus === 'rejected' ? 'Rejected' :
                       viewingPO.status || 'Draft'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Client Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {viewingPO.supplierName}</p>
                  {viewingPO.deliveryAddress && (
                    <div>
                      <span className="font-medium">Delivery Address:</span>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{viewingPO.deliveryAddress}</p>
                    </div>
                  )}
                  {viewingPO.createdBy && (
                    <p><span className="font-medium">Created By:</span> {viewingPO.createdBy}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Item Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">HSN/SAC</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Discount%</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">CGST%</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">SGST%</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">IGST%</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingPO.items?.map((item, idx) => {
                      const itemTotal = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                                       (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * ((item.cgstRate || 0) + (item.sgstRate || 0) + (item.igstRate || 0)) / 100);
                      return (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.hsn}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">₹{item.rate?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">{item.discount}%</td>
                          <td className="px-4 py-3 text-right">{item.cgstRate || 0}%</td>
                          <td className="px-4 py-3 text-right">{item.sgstRate || 0}%</td>
                          <td className="px-4 py-3 text-right">{item.igstRate || 0}%</td>
                          <td className="px-4 py-3 text-right font-semibold">₹{itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sub Total</p>
                  <p className="text-lg font-semibold">₹{viewingPO.subTotal?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="text-lg font-semibold">₹{viewingPO.totalDiscount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tax</p>
                  <p className="text-lg font-semibold">₹{viewingPO.totalTax?.toLocaleString()}</p>
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
    );
  }

  // Form Modal View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-5 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="mr-3" size={24} />
            {editingPO ? 'Edit Proforma Invoice' : 'Create Proforma Invoice'}
          </h1>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">

      {/* Supplier, PO Number, Dates */}
      <div className="grid grid-cols-5 gap-6 mb-6">
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
          <label className="block text-sm font-medium mb-2">PI Number</label>
          <input 
            type="text" 
            value={poNumber} 
            onChange={(e) => setPoNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Enter PI Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PI Date</label>
          <DatePicker 
            value={poDate} 
            onChange={setPoDate} 
            placeholder="Select PI Date" 
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
          <div className="relative">
            <input 
              type="text" 
              value={supplierData.gstNumber} 
              onChange={(e) => handleSupplierGSTChange(e.target.value)}
              onFocus={() => selectedClientData && selectedClientData.gstNumbers && selectedClientData.gstNumbers.length > 1 && setShowGSTDropdown(true)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg" 
              placeholder="Enter GST Number"
            />
            {selectedClientData && selectedClientData.gstNumbers && selectedClientData.gstNumbers.length > 1 && (
              <button
                type="button"
                onClick={() => setShowGSTDropdown(!showGSTDropdown)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown size={20} />
              </button>
            )}
            {showGSTDropdown && selectedClientData && selectedClientData.gstNumbers && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {selectedClientData.gstNumbers.map((gstData, index) => (
                  <div
                    key={index}
                    onClick={() => handleGSTSelect(gstData.gstNumber, gstData.billingAddress)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{gstData.gstNumber}</div>
                    <div className="text-sm text-gray-500">{gstData.billingAddress}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Address</label>
          <textarea
            value={supplierData.deliveryAddress}
            onChange={(e) => setSupplierData({...supplierData, deliveryAddress: e.target.value})}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter delivery address..."
          />
        </div>
      </div>

      {/* Item Details and Summary Side by Side */}
      <div className="flex gap-6 mb-6">
        {/* Item Details */}
        <div className="flex-1 min-w-0">
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
                        type="text" 
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          newItems[idx].quantity = parseInt(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-20"
                        placeholder="Qty"
                      />
                    </td>
                    <td className="px-3 py-2 w-28">
                      <input 
                        type="text" 
                        value={item.rate ? item.rate.toLocaleString('en-IN') : ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/,/g, '');
                          newItems[idx].rate = parseInt(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-24"
                        placeholder="Rate"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={item.discount}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          newItems[idx].discount = parseInt(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={item.cgstRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          newItems[idx].cgstRate = parseFloat(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="9"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={item.sgstRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          newItems[idx].sgstRate = parseFloat(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="9"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={item.igstRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          newItems[idx].igstRate = parseFloat(value) || 0;
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="0"
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
        <div className="w-96 min-w-[400px]">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h3>
            <div className="space-y-4">
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
            <div className="border-t pt-4 flex justify-between text-xl font-bold text-blue-600">
              <span>Total Amount</span>
              <span>₹ {calculateTotal().toLocaleString()}</span>
            </div>
            </div>
          </div>
        </div>
      </div>

        {/* Actions */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button 
            onClick={handleClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreatePO}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
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



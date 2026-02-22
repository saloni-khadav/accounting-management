import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { X, CheckCircle } from 'lucide-react';

const CollectionRegister = () => {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: 0,
    pendingInvoices: 0,
    monthlyAmount: 0
  });
  const [formData, setFormData] = useState({
    collectionDate: new Date().toISOString().split('T')[0],
    customer: '',
    invoiceNumbers: [],
    amount: '',
    paymentMode: 'Online',
    bankAccount: '',
    referenceNumber: '',
    tdsSection: '',
    tdsPercentage: '',
    tdsAmount: '',
    netAmount: ''
  });



  const tdsSection = [
    { code: '194H', rate: 5, description: 'Commission or Brokerage' },
    { code: '194C', rate: 1, description: 'Individual/HUF' },
    { code: '194C', rate: 2, description: 'Company' },
    { code: '194J(a)', rate: 2, description: 'Technical Services' },
    { code: '194J(b)', rate: 10, description: 'Professional' },
    { code: '194I(a)', rate: 2, description: 'Rent - Plant & Machinery' },
    { code: '194I(b)', rate: 10, description: 'Rent - Land & Building' },
    { code: '194A', rate: 10, description: 'Interest other than on Securities' }
  ];

  useEffect(() => {
    fetchCollections();
    fetchStats();
    fetchClients();
    fetchUserRole();
    fetchBankAccounts();
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowClientDropdown(false);
        setShowInvoiceDropdown(false);
        setShowBankDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.user.role || '');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile && data.profile.bankAccounts) {
          setBankAccounts(data.profile.bankAccounts);
        }
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/collections`);
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/collections/stats/summary`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchInvoices = async (clientName) => {
    try {
      const response = await fetch(`${baseUrl}/api/invoices`);
      
      if (!response.ok) {
        setInvoices([]);
        return;
      }
      
      const allInvoices = await response.json();
      
      if (!Array.isArray(allInvoices)) {
        setInvoices([]);
        return;
      }
      
      // Get token for credit notes API
      const token = localStorage.getItem('token');
      
      // Fetch collections
      const collectionsResponse = await fetch(`${baseUrl}/api/collections`);
      let collections = [];
      if (collectionsResponse.ok) {
        collections = await collectionsResponse.json();
      }
      
      // Fetch credit notes
      const creditNotesResponse = await fetch(`${baseUrl}/api/credit-notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let creditNotes = [];
      if (creditNotesResponse.ok) {
        creditNotes = await creditNotesResponse.json();
      }
      
      // Filter invoices: same customer, approved, and not fully received
      const filteredInvoices = allInvoices.filter(invoice => 
        invoice.customerName?.toLowerCase() === clientName.toLowerCase() &&
        invoice.approvalStatus === 'Approved'
      );
      
      // Calculate remaining amounts for each invoice
      const invoicesWithRemaining = filteredInvoices.map((invoice) => {
        // Calculate total received from collections
        const invoiceCollections = collections.filter(collection => 
          collection.invoiceNumber?.includes(invoice.invoiceNumber) && 
          collection.approvalStatus === 'Approved'
        );
        const totalReceived = invoiceCollections.reduce((sum, collection) => 
          sum + (parseFloat(collection.netAmount) || parseFloat(collection.amount) || 0), 0
        );
        
        // Calculate total credit notes
        const invoiceCreditNotes = creditNotes.filter(cn => 
          cn.originalInvoiceNumber === invoice.invoiceNumber && 
          cn.approvalStatus === 'Approved'
        );
        const totalCreditNotes = invoiceCreditNotes.reduce((sum, cn) => 
          sum + (cn.grandTotal || 0), 0
        );
        
        // Calculate TDS from collections
        const totalTDS = invoiceCollections.reduce((sum, col) => 
          sum + (parseFloat(col.tdsAmount) || 0), 0
        );
        
        // Calculate remaining amount (subtract TDS)
        const totalSettled = totalReceived + totalCreditNotes;
        const remainingAmount = (invoice.grandTotal || 0) - totalSettled - totalTDS;
        
        return { 
          ...invoice, 
          remainingAmount: remainingAmount > 0 ? remainingAmount : 0 
        };
      }).filter(invoice => invoice.remainingAmount > 0); // Only show invoices with remaining amount
      
      setInvoices(invoicesWithRemaining || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const handleClientSelect = (clientName) => {
    setFormData({...formData, customer: clientName, invoiceNumbers: [], amount: '', tdsSection: '', tdsPercentage: '', tdsAmount: '', netAmount: ''});
    setShowClientDropdown(false);
    fetchInvoices(clientName);
  };

  const handleInvoiceSelect = (invoice) => {
    const isSelected = formData.invoiceNumbers.some(inv => inv.invoiceNumber === invoice.invoiceNumber);
    let updatedInvoices;
    
    if (isSelected) {
      // Remove invoice if already selected
      updatedInvoices = formData.invoiceNumbers.filter(inv => inv.invoiceNumber !== invoice.invoiceNumber);
    } else {
      // Add invoice if not selected - use remainingAmount instead of grandTotal
      updatedInvoices = [...formData.invoiceNumbers, {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.remainingAmount || 0,
        remainingAmount: invoice.remainingAmount || 0
      }];
    }
    
    // Calculate total amount
    const totalAmount = updatedInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    
    // Recalculate TDS and net amount if TDS section exists
    let tdsAmount = 0;
    if (formData.tdsSection) {
      const selectedSection = tdsSection.find(s => s.code === formData.tdsSection);
      if (selectedSection) {
        tdsAmount = (totalAmount * selectedSection.rate) / 100;
      }
    }
    const netAmount = totalAmount - tdsAmount;
    
    setFormData({
      ...formData, 
      invoiceNumbers: updatedInvoices,
      amount: totalAmount.toString(),
      tdsAmount: tdsAmount.toString(),
      netAmount: netAmount.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate bank account
    if (formData.bankAccount) {
      const isValidBank = bankAccounts.some(bank => {
        const bankDisplay = `${bank.bankName} - ${bank.accountNumber}`;
        return bankDisplay === formData.bankAccount;
      });
      
      if (!isValidBank) {
        alert('Please select a valid bank account from the dropdown or add it in Profile page first.');
        return;
      }
    }
    
    try {
      // Prepare data for API - convert invoiceNumbers array to comma-separated string
      const submitData = {
        ...formData,
        invoiceNumber: formData.invoiceNumbers.map(inv => inv.invoiceNumber).join(', '),
        invoiceNumbers: undefined, // Remove this field as API doesn't expect it
        tdsAmount: parseFloat(formData.tdsAmount) || 0,
        tdsPercentage: parseFloat(formData.tdsPercentage) || 0,
        netAmount: parseFloat(formData.netAmount) || parseFloat(formData.amount) || 0,
        tdsSection: formData.tdsSection || ''
      };
      
      console.log('Submitting data:', submitData);
      
      const response = await fetch(`${baseUrl}/api/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        setShowModal(false);
        setFormData({ collectionDate: new Date().toISOString().split('T')[0], customer: '', invoiceNumbers: [], amount: '', paymentMode: 'Online', bankAccount: '', referenceNumber: '', tdsSection: '', tdsPercentage: '', tdsAmount: '', netAmount: '' });
        setBankSearchTerm('');
        fetchCollections();
        fetchStats();
        window.dispatchEvent(new Event('invoicesUpdated'));
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert('Error saving collection: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding collection:', error);
      alert('Network error. Please try again.');
    }
  };
  const chartData = [
    { name: 'Collected', value: stats.totalCollections - stats.pendingInvoices },
    { name: 'Pending', value: stats.pendingInvoices }
  ];

  const COLORS = ['#4f46e5', '#a5b4fc'];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleApprovalChange = async (collectionId, approvalStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/collections/${collectionId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approvalStatus })
      });
      if (response.ok) {
        const updatedCollection = await response.json();
        setCollections(collections.map(c => 
          c._id === collectionId ? updatedCollection : c
        ));
        window.dispatchEvent(new Event('invoicesUpdated'));
        alert(`Collection ${approvalStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Error updating approval status');
    }
  };

  const getApprovalColor = (approval) => {
    switch (approval) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleBankSelect = (bank) => {
    const bankDisplay = `${bank.bankName} - ${bank.accountNumber}`;
    setFormData(prev => ({ ...prev, bankAccount: bankDisplay }));
    setBankSearchTerm(bankDisplay);
    setShowBankDropdown(false);
  };

  const filteredBanks = bankAccounts.filter(bank =>
    bank.bankName?.toLowerCase().includes((bankSearchTerm || formData.bankAccount || '').toLowerCase()) ||
    bank.accountNumber?.toLowerCase().includes((bankSearchTerm || formData.bankAccount || '').toLowerCase()) ||
    bank.ifscCode?.toLowerCase().includes((bankSearchTerm || formData.bankAccount || '').toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(formData.customer.toLowerCase()) ||
    client.clientCode.toLowerCase().includes(formData.customer.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-4 rounded-t-xl">
          <h1 className="text-2xl font-bold">Collection Register</h1>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Collections with Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total collec</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCollections}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-4">Total Collections</p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Pending Invoices</h3>
          <p className="text-5xl font-bold text-gray-900">{stats.pendingInvoices}</p>
        </div>

        {/* Collected This Month */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Collected This Month</h3>
          <p className="text-5xl font-bold text-gray-900">₹{stats.monthlyAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Add Collection Button */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ADD COLLECTION
        </button>
      </div>

      {/* Add Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Collection</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <div className="relative dropdown-container">
                    <input
                      type="text"
                      required
                      value={formData.customer}
                      onChange={(e) => setFormData({...formData, customer: e.target.value})}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Select or enter customer name"
                    />
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredClients.map((client) => (
                          <div
                            key={client._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleClientSelect(client.clientName);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{client.clientName}</div>
                            <div className="text-sm text-gray-500">{client.clientCode}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Numbers</label>
                  <div className="relative dropdown-container">
                    <div
                      onClick={() => formData.customer && setShowInvoiceDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px] cursor-pointer bg-white"
                    >
                      {formData.invoiceNumbers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.invoiceNumbers.map((inv, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {inv.invoiceNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {formData.customer ? "Click to select invoices" : "Select customer first"}
                        </span>
                      )}
                    </div>
                    {showInvoiceDropdown && formData.customer && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {invoices.length > 0 ? (
                          invoices.map((invoice) => {
                            const isSelected = formData.invoiceNumbers.some(inv => inv.invoiceNumber === invoice.invoiceNumber);
                            return (
                              <div
                                key={invoice._id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleInvoiceSelect(invoice);
                                }}
                                className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                  isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(invoice.invoiceDate).toLocaleDateString()} | Total: ₹{(invoice.grandTotal || 0).toLocaleString('en-IN')} | Remaining: ₹{(invoice.remainingAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="text-blue-600 font-medium">✓</div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No invoices found for this customer
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.collectionDate}
                    onChange={(e) => setFormData({...formData, collectionDate: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const newAmount = parseFloat(e.target.value) || 0;
                      const maxAmount = formData.invoiceNumbers.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
                      
                      if (maxAmount > 0 && newAmount > maxAmount) {
                        alert(`Amount cannot exceed remaining amount of ₹${maxAmount.toFixed(2)}`);
                        return;
                      }
                      
                      let tdsAmount = 0;
                      if (formData.tdsSection) {
                        const selectedSection = tdsSection.find(s => s.code === formData.tdsSection);
                        if (selectedSection) {
                          tdsAmount = (newAmount * selectedSection.rate) / 100;
                        }
                      }
                      const netAmount = newAmount - tdsAmount;
                      setFormData({
                        ...formData,
                        amount: e.target.value,
                        tdsAmount: tdsAmount.toString(),
                        netAmount: netAmount.toString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount or select invoices"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TDS Section</label>
                  <select
                    value={formData.tdsSection}
                    onChange={(e) => {
                      const selectedSection = tdsSection.find(s => s.code === e.target.value);
                      const totalAmount = parseFloat(formData.amount) || 0;
                      const tdsAmount = selectedSection ? (totalAmount * selectedSection.rate) / 100 : 0;
                      const netAmount = totalAmount - tdsAmount;
                      
                      setFormData({
                        ...formData,
                        tdsSection: e.target.value,
                        tdsPercentage: selectedSection ? selectedSection.rate.toString() : '',
                        tdsAmount: tdsAmount.toString(),
                        netAmount: netAmount.toString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select TDS Section</option>
                    {tdsSection.map((section, idx) => (
                      <option key={idx} value={section.code}>
                        {section.code} - {section.rate}% ({section.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TDS Percentage (%)</label>
                  <input
                    type="number"
                    value={formData.tdsPercentage}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    placeholder="Auto-filled from TDS section"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TDS Amount</label>
                  <input
                    type="number"
                    value={formData.tdsAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    placeholder="Auto-calculated based on TDS percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount (After TDS)</label>
                  <input
                    type="number"
                    value={formData.netAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                    placeholder="Net amount after TDS deduction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                  <select
                    required
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Online">Online</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account *</label>
                  <div className="relative dropdown-container">
                    <input
                      type="text"
                      required
                      value={bankSearchTerm || formData.bankAccount}
                      onChange={(e) => {
                        setBankSearchTerm(e.target.value);
                        setFormData({...formData, bankAccount: e.target.value});
                        setShowBankDropdown(true);
                      }}
                      onFocus={() => setShowBankDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search or select bank account"
                    />
                    {showBankDropdown && filteredBanks.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredBanks.map((bank, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleBankSelect(bank);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{bank.bankName}</div>
                            <div className="text-sm text-gray-500">{bank.accountNumber} | {bank.ifscCode}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Transaction Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference or transaction number"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-3">
          <h2 className="text-lg font-semibold">Collections List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Collection No.</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Customer Name</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Invoice</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Total Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">TDS Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Net Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Mode</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Reference No.</th>
                <th className="text-left py-4 px-6 font-semibold text-blue-900 text-sm">Approval</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium">{collection.collectionNumber || '-'}</td>
                  <td className="py-4 px-6 text-gray-900">{formatDate(collection.collectionDate)}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.customer}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.invoiceNumber}</td>
                  <td className="py-4 px-6 text-gray-900">₹{collection.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-gray-900">
                    {collection.tdsAmount && parseFloat(collection.tdsAmount) > 0 ? 
                      `₹${parseFloat(collection.tdsAmount).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-4 px-6 text-gray-900 font-semibold">
                    {collection.netAmount && parseFloat(collection.netAmount) > 0 ? 
                      `₹${parseFloat(collection.netAmount).toLocaleString('en-IN')}` : 
                      `₹${collection.amount.toLocaleString('en-IN')}`}
                  </td>
                  <td className="py-4 px-6 text-gray-900">{collection.paymentMode}</td>
                  <td className="py-4 px-6 text-gray-900">{collection.referenceNumber || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(collection.approvalStatus || 'Pending')}`}>
                        {collection.approvalStatus || 'Pending'}
                      </span>
                      {userRole === 'manager' && collection.approvalStatus === 'Pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprovalChange(collection._id, 'Approved')}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleApprovalChange(collection._id, 'Rejected')}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
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
};

export default CollectionRegister;

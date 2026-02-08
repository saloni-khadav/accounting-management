import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';

const CollectionRegister = () => {
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
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
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowClientDropdown(false);
        setShowInvoiceDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/collections/stats/summary');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchInvoices = async (clientName) => {
    try {
      console.log('Fetching invoices for client:', clientName);
      // Get all invoices and filter client-side
      const response = await fetch('http://localhost:5001/api/invoices');
      
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setInvoices([]);
        return;
      }
      
      const allInvoices = await response.json();
      console.log('All invoices received:', allInvoices);
      
      if (!Array.isArray(allInvoices)) {
        console.error('Response is not an array:', allInvoices);
        setInvoices([]);
        return;
      }
      
      // Filter invoices for the selected client
      const clientInvoices = allInvoices.filter(invoice => 
        invoice.customerName?.toLowerCase() === clientName.toLowerCase()
      );
      
      console.log('Filtered invoices for client:', clientInvoices);
      setInvoices(clientInvoices || []);
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
      // Add invoice if not selected
      updatedInvoices = [...formData.invoiceNumbers, {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.grandTotal || 0
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
      
      const response = await fetch('http://localhost:5001/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        setShowModal(false);
        setFormData({ collectionDate: new Date().toISOString().split('T')[0], customer: '', invoiceNumbers: [], amount: '', paymentMode: 'Online', referenceNumber: '', tdsSection: '', tdsPercentage: '', tdsAmount: '', netAmount: '' });
        fetchCollections();
        fetchStats();
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Collection Register</h1>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Collections with Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Pending Invoices</h3>
          <p className="text-5xl font-bold text-gray-900">{stats.pendingInvoices}</p>
        </div>

        {/* Collected This Month */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
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
                    {showClientDropdown && clients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {clients.map((client) => (
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
                                      {new Date(invoice.invoiceDate).toLocaleDateString()} | ₹{(invoice.grandTotal || 0).toLocaleString('en-IN')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                    placeholder="Auto-calculated from selected invoices"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Transaction Number</label>
                  <input
                    type="text"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Invoice</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Total Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">TDS Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Net Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Mode</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Reference No.</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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

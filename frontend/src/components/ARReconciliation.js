import React, { useState, useEffect } from 'react';
import { RefreshCw, Search } from 'lucide-react';

const ARReconciliation = () => {
  const [invoices, setInvoices] = useState([]);
  const [collections, setCollections] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [invoicesResponse, collectionsResponse, creditNotesResponse] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/invoices', { headers }),
        fetch('https://nextbook-backend.nextsphere.co.in/api/collections', { headers }),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', { headers })
      ]);
      
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        const approvedInvoices = invoicesData.filter(inv => inv.approvalStatus === 'Approved');
        setInvoices(approvedInvoices);
      }
      
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData);
      }
      
      if (creditNotesResponse.ok) {
        const creditNotesData = await creditNotesResponse.json();
        const approvedCreditNotes = creditNotesData.filter(note => note.approvalStatus === 'Approved');
        setCreditNotes(approvedCreditNotes);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const totalReceivable = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  
  const totalCollected = collections
    .filter(col => col.approvalStatus === 'Approved')
    .reduce((sum, col) => sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0);
    
  const creditNotesAmount = creditNotes
    .filter(note => note.status !== 'Cancelled')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);
    
  const adjustedReceivable = totalReceivable - creditNotesAmount;
  const unreconciled = adjustedReceivable - totalCollected;

  const invoicesData = invoices.map(inv => ({
    date: new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: inv.invoiceNumber,
    customer: inv.customerName,
    type: 'Invoice',
    amount: `₹${(inv.grandTotal || 0).toLocaleString('en-IN')}`,
    status: inv.status || 'Pending',
    sortDate: new Date(inv.invoiceDate)
  }));

  const collectionsData = collections.map(col => ({
    date: new Date(col.collectionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: col.referenceNumber || col.collectionNumber || col.invoiceNumber || '-',
    customer: col.customer,
    type: 'Collection',
    amount: `₹${(parseFloat(col.netAmount) || parseFloat(col.amount) || 0).toLocaleString('en-IN')}`,
    status: col.approvalStatus === 'Pending' ? 'Pending Approval' :
            col.approvalStatus === 'Rejected' ? 'Rejected' : 'Completed',
    sortDate: new Date(col.collectionDate)
  }));

  const creditNotesData = creditNotes.map(note => ({
    date: new Date(note.creditNoteDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: note.creditNoteNumber,
    customer: note.customerName,
    type: 'Credit Note',
    amount: `₹${(note.grandTotal || 0).toLocaleString('en-IN')}`,
    status: note.approvalStatus === 'Pending' ? 'Pending Approval' :
            note.approvalStatus === 'Rejected' ? 'Rejected' :
            note.status || 'Issued',
    sortDate: new Date(note.creditNoteDate)
  }));

  const allData = [...invoicesData, ...collectionsData, ...creditNotesData]
    .sort((a, b) => b.sortDate - a.sortDate);

  const filteredData = allData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || item.type === typeFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AR Reconciliation</h1>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Receivable</h3>
          <p className="text-2xl font-bold text-gray-900">₹{totalReceivable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Collected</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Credit Notes</h3>
          <p className="text-2xl font-bold text-blue-600">₹{creditNotesAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Adjusted Receivable</h3>
          <p className="text-2xl font-bold text-gray-900">₹{adjustedReceivable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Unreconciled</h3>
          <p className="text-2xl font-bold text-red-600">₹{Math.abs(unreconciled).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by customer or reference" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          >
            <option value="">All Types</option>
            <option value="Invoice">Invoice</option>
            <option value="Collection">Collection</option>
            <option value="Credit Note">Credit Note</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Rejected">Rejected</option>
            <option value="Issued">Issued</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">AR Transactions ({filteredData.length})</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-600 font-medium">Invoices: {invoicesData.length}</span>
            <span className="text-green-600 font-medium">Collections: {collectionsData.length}</span>
            <span className="text-purple-600 font-medium">Credit Notes: {creditNotesData.length}</span>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reconciliation data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No transactions found!</p>
            <p className="text-sm mt-2">Create invoices, collections, or credit notes to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Reference No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => {
                  const getStatusColor = (status, type) => {
                    if (type === 'Collection') {
                      switch(status) {
                        case 'Completed': return 'bg-green-100 text-green-800';
                        case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
                        case 'Rejected': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    } else {
                      switch(status) {
                        case 'Pending': return 'bg-blue-100 text-blue-800';
                        case 'Completed': return 'bg-green-100 text-green-800';
                        case 'Issued': return 'bg-green-100 text-green-800';
                        case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
                        case 'Rejected': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    }
                  };
                  
                  return (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-900">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className={`font-medium ${row.type === 'Collection' ? 'text-green-600' : row.type === 'Credit Note' ? 'text-purple-600' : 'text-blue-600'}`}>{row.invoiceNo}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{row.customer}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.type === 'Collection' ? 'bg-green-100 text-green-800' :
                          row.type === 'Credit Note' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-semibold ${
                        row.type === 'Collection' ? 'text-green-600' :
                        row.type === 'Credit Note' ? 'text-purple-600' :
                        'text-gray-900'
                      }`}>{row.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status, row.type)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARReconciliation;

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search } from 'lucide-react';

const APReconciliation = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [creditDebitNotes, setCreditDebitNotes] = useState([]);
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
      // Fetch bills, payments, and credit/debit notes
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [billsResponse, paymentsResponse, notesResponse] = await Promise.all([
        fetch('http://localhost:5001/api/bills', { headers }),
        fetch('http://localhost:5001/api/payments', { headers }),
        fetch('http://localhost:5001/api/credit-debit-notes', { headers })
      ]);
      
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        // Only include approved bills
        const approvedBills = billsData.filter(bill => bill.approvalStatus === 'approved');
        setBills(approvedBills);
      }
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
      
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        // Only include approved credit/debit notes
        const approvedNotes = notesData.filter(note => note.approvalStatus === 'approved');
        setCreditDebitNotes(approvedNotes);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Calculate reconciliation data from bills, payments, and credit/debit notes
  const totalPayable = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  
  // Only count approved and completed payments for Total Paid
  const totalPaid = payments
    .filter(payment => payment.status === 'Completed' && payment.approvalStatus === 'approved')
    .reduce((sum, payment) => sum + (payment.netAmount || payment.amount || 0), 0);
    
  const invoicedAmount = bills
    .filter(bill => bill.status !== 'Draft' && bill.status !== 'Cancelled')
    .reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    
  // Calculate credit/debit notes impact
  const creditNotesAmount = creditDebitNotes
    .filter(note => note.type === 'Credit Note' && note.status !== 'Cancelled')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);
    
  const debitNotesAmount = creditDebitNotes
    .filter(note => note.type === 'Debit Note' && note.status !== 'Cancelled')
    .reduce((sum, note) => sum + (note.grandTotal || 0), 0);
    
  const adjustedPayable = totalPayable - creditNotesAmount + debitNotesAmount;
  const unreconciled = adjustedPayable - totalPaid;

  // Combine bills and payments for reconciliation
  const billsData = bills.map(bill => ({
    date: new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: bill.billNumber,
    vendor: bill.vendorName,
    type: 'Invoice',
    amount: `₹${(bill.grandTotal || 0).toLocaleString('en-IN')}`,
    status: bill.status === 'Overdue' ? 'Overdue' : 
            bill.status === 'Partially Paid' ? 'Partial' : 
            bill.status === 'Fully Paid' ? 'Paid' :
            bill.status === 'Draft' ? 'Draft' :
            bill.status === 'Cancelled' ? 'Cancelled' : 'Pending',
    originalStatus: bill.status,
    sortDate: new Date(bill.billDate)
  }));

  const paymentsData = payments.map(payment => ({
    date: new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: payment.paymentNumber || payment.referenceNumber || '-',
    vendor: payment.vendor,
    type: 'Payment',
    amount: `₹${(payment.netAmount || payment.amount || 0).toLocaleString('en-IN')}`,
    status: payment.approvalStatus === 'pending' ? 'Pending Approval' :
            payment.approvalStatus === 'rejected' ? 'Rejected' :
            payment.approvalStatus === 'approved' ? 'Completed' :
            payment.status || 'Completed',
    originalStatus: payment.status,
    sortDate: new Date(payment.paymentDate)
  }));

  const creditDebitNotesData = creditDebitNotes.map(note => ({
    date: new Date(note.noteDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    invoiceNo: note.noteNumber,
    vendor: note.vendorName,
    type: note.type,
    amount: `₹${(note.grandTotal || 0).toLocaleString('en-IN')}`,
    status: note.approvalStatus === 'pending' ? 'Pending Approval' :
            note.approvalStatus === 'rejected' ? 'Rejected' :
            note.approvalStatus === 'approved' ? note.status :
            note.status || 'Open',
    originalStatus: note.status,
    sortDate: new Date(note.noteDate)
  }));

  // Combine and sort by date (newest first)
  const allData = [...billsData, ...paymentsData, ...creditDebitNotesData]
    .sort((a, b) => b.sortDate - a.sortDate);

  // Apply filters
  const mismatchData = allData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || item.type === typeFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AP Reconciliation</h1>
        <p className="text-gray-600 text-lg mt-1">Reconcile accounts payable transactions</p>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="font-medium">Last updated:</span> {lastUpdated.toLocaleString()}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <h3 className="text-xs font-medium text-blue-700 mb-1">Total Payable</h3>
          <p className="text-2xl font-bold text-blue-900">₹{totalPayable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <h3 className="text-xs font-medium text-green-700 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-900">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <h3 className="text-xs font-medium text-blue-700 mb-1">Credit Notes</h3>
          <p className="text-2xl font-bold text-blue-900">₹{creditNotesAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-orange-200">
          <h3 className="text-xs font-medium text-orange-700 mb-1">Debit Notes</h3>
          <p className="text-2xl font-bold text-orange-900">₹{debitNotesAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200">
          <h3 className="text-xs font-medium text-purple-700 mb-1">Adjusted Payable</h3>
          <p className="text-2xl font-bold text-purple-900">₹{adjustedPayable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-200">
          <h3 className="text-xs font-medium text-red-700 mb-1">Unreconciled</h3>
          <p className="text-2xl font-bold text-red-900">₹{Math.abs(unreconciled).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-8 shadow-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by vendor or reference" 
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
            <option value="Payment">Payment</option>
            <option value="Credit Note">Credit Note</option>
            <option value="Debit Note">Debit Note</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bills & Payments Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">AP Transactions ({mismatchData.length})</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">Bills: {billsData.length}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">Payments: {paymentsData.length}</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">Credit/Debit Notes: {creditDebitNotesData.length}</span>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reconciliation data...</p>
          </div>
        ) : mismatchData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No bills or payments found!</p>
            <p className="text-sm mt-2">Create some bills and payments to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Reference No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Vendor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mismatchData.map((row, index) => {
                  const getStatusColor = (status, type) => {
                    if (type === 'Payment') {
                      switch(status) {
                        case 'Completed': return 'bg-green-100 text-green-800';
                        case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
                        case 'Rejected': return 'bg-red-100 text-red-800';
                        case 'Pending': return 'bg-blue-100 text-blue-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    } else {
                      switch(status) {
                        case 'Overdue': return 'bg-red-100 text-red-800';
                        case 'Partial': return 'bg-yellow-100 text-yellow-800';
                        case 'Pending': return 'bg-blue-100 text-blue-800';
                        case 'Paid': return 'bg-green-100 text-green-800';
                        case 'Draft': return 'bg-gray-100 text-gray-800';
                        case 'Cancelled': return 'bg-red-200 text-red-900';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    }
                  };
                  
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-4 px-6 text-gray-700 font-medium">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${row.type === 'Payment' ? 'text-green-600' : 'text-blue-600'}`}>{row.invoiceNo}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">{row.vendor}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          row.type === 'Payment' ? 'bg-green-100 text-green-800 border border-green-200' :
                          row.type === 'Credit Note' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          row.type === 'Debit Note' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-bold ${
                        row.type === 'Payment' ? 'text-green-600' :
                        row.type === 'Credit Note' ? 'text-blue-600' :
                        row.type === 'Debit Note' ? 'text-orange-600' :
                        'text-gray-900'
                      }`}>{row.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(row.status, row.type)}`}>
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

export default APReconciliation;
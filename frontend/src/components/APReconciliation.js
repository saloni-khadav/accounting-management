import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search, BarChart3, DollarSign, CheckCircle, AlertTriangle, Calculator, FileText } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

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
        fetch('https://nextbook-backend.nextsphere.co.in/api/bills', { headers }),
        fetch('https://nextbook-backend.nextsphere.co.in/api/payments', { headers }),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes', { headers })
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <BarChart3 className="mr-3" size={28} />
                AP Reconciliation
              </h1>
              <p className="text-blue-100 mt-1">Reconcile accounts payable transactions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start lg:items-center gap-3">
              <div className="text-blue-100 text-sm">
                <span className="font-medium">Last updated:</span> {lastUpdated.toLocaleString()}
              </div>
              <button 
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Total Payable"
            value={`₹${totalPayable.toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString('en-IN')}`}
            icon={CheckCircle}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Credit Notes"
            value={`₹${creditNotesAmount.toLocaleString('en-IN')}`}
            icon={FileText}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Debit Notes"
            value={`₹${debitNotesAmount.toLocaleString('en-IN')}`}
            icon={FileText}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Adjusted Payable"
            value={`₹${adjustedPayable.toLocaleString('en-IN')}`}
            icon={Calculator}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Unreconciled"
            value={`₹${Math.abs(unreconciled).toLocaleString('en-IN')}`}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
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
      </div>

      {/* AP Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">AP Transactions</h2>
            <div className="flex gap-4 text-sm">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">Bills: {billsData.length}</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">Payments: {paymentsData.length}</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">Notes: {creditDebitNotesData.length}</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-lg font-medium">Loading reconciliation data...</p>
          </div>
        ) : mismatchData.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Create some bills and payments to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Reference No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-6 text-gray-600">{new Date(row.sortDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                      <td className="py-4 px-6">
                        <span className={`font-medium ${row.type === 'Payment' ? 'text-green-600' : 'text-blue-600'}`}>{row.invoiceNo}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">{row.vendor}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          row.type === 'Payment' ? 'bg-green-100 text-green-800' :
                          row.type === 'Credit Note' ? 'bg-blue-100 text-blue-800' :
                          row.type === 'Debit Note' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-semibold ${
                        row.type === 'Payment' ? 'text-green-600' :
                        row.type === 'Credit Note' ? 'text-blue-600' :
                        row.type === 'Debit Note' ? 'text-orange-600' :
                        'text-gray-900'
                      }`}>{row.amount}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status, row.type)}`}>
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
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search } from 'lucide-react';

const APReconciliation = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
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
      // Fetch both bills and payments
      const [billsResponse, paymentsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/bills'),
        fetch('http://localhost:5001/api/payments')
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
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Calculate reconciliation data from bills and payments
  const totalPayable = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  
  // Only count approved and completed payments for Total Paid
  const totalPaid = payments
    .filter(payment => payment.status === 'Completed' && payment.approvalStatus === 'approved')
    .reduce((sum, payment) => sum + (payment.netAmount || payment.amount || 0), 0);
    
  const invoicedAmount = bills
    .filter(bill => bill.status !== 'Draft' && bill.status !== 'Cancelled')
    .reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const unreconciled = totalPayable - totalPaid;

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

  // Combine and sort by date (newest first)
  const allData = [...billsData, ...paymentsData]
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AP Reconciliation</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Total Payable</h3>
          <p className="text-3xl font-bold text-gray-900">₹{totalPayable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Invoiced Amount</h3>
          <p className="text-3xl font-bold text-gray-900">₹{invoicedAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Unreconciled</h3>
          <p className="text-3xl font-bold text-red-600">₹{Math.abs(unreconciled).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Bills & Payments ({mismatchData.length})</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-600 font-medium">Bills: {billsData.length}</span>
            <span className="text-green-600 font-medium">Payments: {paymentsData.length}</span>
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Reference No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Vendor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
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
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-900">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className={`font-medium ${row.type === 'Payment' ? 'text-green-600' : 'text-blue-600'}`}>{row.invoiceNo}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{row.vendor}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.type === 'Payment' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-semibold ${
                        row.type === 'Payment' ? 'text-green-600' : 'text-gray-900'
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

export default APReconciliation;
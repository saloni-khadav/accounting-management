import React, { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';

const APReconciliation = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/bills');
      if (response.ok) {
        const data = await response.json();
        setBills(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
    setLoading(false);
  };

  // Calculate reconciliation data from real bills
  const totalPayable = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const invoicedAmount = bills
    .filter(bill => bill.status !== 'Draft' && bill.status !== 'Cancelled')
    .reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const unreconciled = bills
    .filter(bill => bill.status === 'Not Paid' || bill.status === 'Overdue')
    .reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);

  // Get all bills for reconciliation (remove filter to show all)
  const mismatchData = bills
    .map(bill => ({
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
      originalStatus: bill.status
    }));

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
            onClick={fetchBills}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Total Payable</h3>
          <p className="text-3xl font-bold text-gray-900">₹{totalPayable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Invoiced Amount</h3>
          <p className="text-3xl font-bold text-gray-900">₹{invoicedAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Unreconciled</h3>
          <p className="text-3xl font-bold text-red-600">₹{unreconciled.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* All Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">All Bills ({mismatchData.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reconciliation data...</p>
          </div>
        ) : mismatchData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No bills found!</p>
            <p className="text-sm mt-2">Create some bills to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Bill No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Vendor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {mismatchData.map((row, index) => {
                  const getStatusColor = (status) => {
                    switch(status) {
                      case 'Overdue': return 'bg-red-100 text-red-800';
                      case 'Partial': return 'bg-yellow-100 text-yellow-800';
                      case 'Pending': return 'bg-blue-100 text-blue-800';
                      case 'Paid': return 'bg-green-100 text-green-800';
                      case 'Draft': return 'bg-gray-100 text-gray-800';
                      case 'Cancelled': return 'bg-red-200 text-red-900';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  
                  return (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-900">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className="text-blue-600 font-medium">{row.invoiceNo}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{row.vendor}</td>
                      <td className="py-4 px-6 text-gray-900">{row.type}</td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">{row.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status)}`}>
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
import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const TDSPurchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionsData, setTransactionsData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalTds: 0,
    paid: 0,
    payable: 0,
    interest: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch TDS data from bills, payments, and credit/debit notes
  const fetchTDSData = async () => {
    try {
      setLoading(true);
      const [billsResponse, vendorsResponse, paymentsResponse, creditDebitNotesResponse] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/bills'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/vendors'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/payments'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (billsResponse.ok && vendorsResponse.ok && paymentsResponse.ok && creditDebitNotesResponse.ok) {
        const bills = await billsResponse.json();
        const vendors = await vendorsResponse.json();
        const payments = await paymentsResponse.json();
        const creditDebitNotes = await creditDebitNotesResponse.json();
        
        // Create vendor PAN lookup
        const vendorPANMap = {};
        vendors.forEach(vendor => {
          if (vendor.vendorName && vendor.panNumber) {
            vendorPANMap[vendor.vendorName] = vendor.panNumber;
          }
        });
        
        // Get TDS from bills
        const billTdsTransactions = bills
          .filter(bill => bill.tdsAmount && bill.tdsAmount > 0 && bill.approvalStatus === 'approved')
          .map(bill => ({
            _id: bill._id,
            source: 'Bill',
            vendorName: bill.vendorName,
            invoiceNo: bill.billNumber,
            invoiceDate: bill.billDate,
            panNo: bill.vendorPAN || vendorPANMap[bill.vendorName] || 'N/A',
            tdsSection: bill.tdsSection || 'N/A',
            taxableValue: bill.totalTaxableValue || 0,
            tdsAmount: bill.tdsAmount || 0,
            interest: 0,
            totalTdsPayable: bill.tdsAmount || 0,
            status: 'Payable',
            chalanNo: bill.chalanNo || null,
            chalanDate: bill.chalanDate || null
          }));
        
        // Get TDS from payments
        const paymentTdsTransactions = payments
          .filter(payment => payment.tdsAmount && payment.tdsAmount > 0 && payment.approvalStatus === 'approved')
          .map(payment => ({
            _id: payment._id,
            source: 'Payment',
            vendorName: payment.vendor,
            invoiceNo: payment.invoiceNumber,
            invoiceDate: payment.paymentDate,
            panNo: vendorPANMap[payment.vendor] || 'N/A',
            tdsSection: payment.tdsSection || 'N/A',
            taxableValue: payment.amount || 0,
            tdsAmount: payment.tdsAmount || 0,
            interest: 0,
            totalTdsPayable: payment.tdsAmount || 0,
            status: 'Paid',
            chalanNo: null,
            chalanDate: null
          }));
        
        // Get TDS from credit/debit notes
        const creditDebitNoteTdsTransactions = creditDebitNotes
          .filter(note => note.tdsAmount && note.tdsAmount > 0 && note.approvalStatus === 'approved')
          .map(note => ({
            _id: note._id,
            source: note.type === 'Credit Note' ? 'Credit Note' : 'Debit Note',
            vendorName: note.vendorName,
            invoiceNo: note.noteNumber,
            invoiceDate: note.noteDate,
            panNo: vendorPANMap[note.vendorName] || 'N/A',
            tdsSection: note.tdsSection || 'N/A',
            taxableValue: -(note.totalTaxableValue || 0), // Make taxable value negative for Credit/Debit Notes
            tdsAmount: -(note.tdsAmount || 0), // Make TDS amount negative for Credit/Debit Notes
            interest: 0,
            totalTdsPayable: -(note.tdsAmount || 0), // Make total TDS payable negative
            status: 'Payable',
            chalanNo: null,
            chalanDate: null
          }));
        
        // Combine all sources
        const allTdsTransactions = [...billTdsTransactions, ...paymentTdsTransactions, ...creditDebitNoteTdsTransactions]
          .filter(transaction => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
              transaction.vendorName.toLowerCase().includes(search) ||
              transaction.invoiceNo.toLowerCase().includes(search) ||
              transaction.panNo.toLowerCase().includes(search)
            );
          })
          .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
        
        setTransactionsData(allTdsTransactions);
        
        // Calculate summary from the combined data
        const totalTds = allTdsTransactions.reduce((sum, t) => sum + t.tdsAmount, 0);
        const paid = allTdsTransactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.tdsAmount, 0);
        const payable = allTdsTransactions.filter(t => t.status === 'Payable').reduce((sum, t) => sum + t.tdsAmount, 0);
        const interest = allTdsTransactions.reduce((sum, t) => sum + t.interest, 0);
        
        setSummaryData({ totalTds, paid, payable, interest });
        setError(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load TDS data from bills, payments, and credit/debit notes');
      setTransactionsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTDSData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTDSData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleExportToExcel = () => {
    if (transactionsData.length === 0) {
      alert('No TDS data to export');
      return;
    }
    
    const exportData = transactionsData.map(transaction => ({
      'Source': transaction.source,
      'Vendor Name': transaction.vendorName,
      'Invoice No.': transaction.invoiceNo,
      'Date': new Date(transaction.invoiceDate).toLocaleDateString('en-IN'),
      'PAN No.': transaction.panNo,
      'TDS Section': transaction.tdsSection,
      'Taxable Value': transaction.taxableValue,
      'TDS Amount': transaction.tdsAmount,
      'Interest': transaction.interest,
      'Total TDS Payable': transaction.totalTdsPayable,
      'Status': transaction.status,
      'Chalan No.': transaction.chalanNo || '',
      'Chalan Date': transaction.chalanDate ? new Date(transaction.chalanDate).toLocaleDateString('en-IN') : ''
    }));
    
    exportToExcel(exportData, `TDS_Purchases_${new Date().toISOString().split('T')[0]}`);
    alert('TDS data exported successfully!');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">TDS on Purchases</h1>
        <p className="text-gray-600 text-lg mt-1">Consolidated TDS data from Bills, Payments, and Credit/Debit Notes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-700">Total TDS</h3>
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-blue-900">₹{summaryData.totalTds.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-green-700">Paid</h3>
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-900">₹{summaryData.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-yellow-700">Payable</h3>
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-yellow-900">₹{summaryData.payable.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-purple-700">Interest</h3>
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-900">₹{summaryData.interest.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-900">Search & Export</h3>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by vendor, invoice, or PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
          <button 
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transaction Details Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{transactionsData.length} Transactions</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading TDS data...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error: {error}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Source</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Vendor Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Invoice No.</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">PAN No.</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">TDS Section</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Taxable Value</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">TDS Amount</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Interest</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Total TDS Payable</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Chalan No.</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Chalan Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactionsData.map((transaction, index) => (
                  <tr key={transaction._id || index} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        transaction.source === 'Payment' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : transaction.source === 'Credit Note'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : transaction.source === 'Debit Note'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {transaction.source}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-semibold">{transaction.vendorName}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{transaction.invoiceNo}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{new Date(transaction.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-4 px-4 text-gray-700 font-mono text-sm">{transaction.panNo}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{transaction.tdsSection}</td>
                    <td className="py-4 px-4 text-gray-900 text-right font-bold">₹{transaction.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-gray-900 text-right font-bold">₹{transaction.tdsAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-gray-700 text-right font-medium">{transaction.interest > 0 ? `₹${transaction.interest.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="py-4 px-4 text-gray-900 text-right font-bold">₹{transaction.totalTdsPayable.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        transaction.status === 'Paid' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          transaction.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{transaction.chalanNo || '—'}</td>
                    <td className="py-4 px-4 text-gray-700">{transaction.chalanDate ? new Date(transaction.chalanDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && !error && transactionsData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No TDS transactions found. TDS data is automatically loaded from bills, payments, and credit/debit notes with TDS amounts.
            <br />
            <span className="text-sm">Create bills, payments, or credit/debit notes with TDS sections to see TDS purchase data here.</span>
          </div>
        )}
      </div>


    </div>
  );
};

export default TDSPurchases;

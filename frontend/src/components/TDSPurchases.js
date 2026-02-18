import React, { useState, useEffect } from 'react';
import { Search, Download, Calculator, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import MetricsCard from './ui/MetricsCard';

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Calculator className="mr-3" size={28} />
                TDS on Purchases
              </h1>
              <p className="text-blue-100 mt-1">Consolidated TDS data from Bills, Payments, and Credit/Debit Notes</p>
            </div>
            <button 
              onClick={handleExportToExcel}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Total TDS"
            value={`₹${summaryData.totalTds.toLocaleString('en-IN')}`}
            icon={Calculator}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Paid"
            value={`₹${summaryData.paid.toLocaleString('en-IN')}`}
            icon={CheckCircle}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Payable"
            value={`₹${summaryData.payable.toLocaleString('en-IN')}`}
            icon={Clock}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Interest"
            value={`₹${summaryData.interest.toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="danger"
          />
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>
        <div className="p-4">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor, invoice, or PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Transaction Details Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Transaction Details</h2>
            <span className="text-blue-100 text-sm">{transactionsData.length} Transactions</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Loading TDS data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg font-medium">Error: {error}</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Source</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">PAN No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">TDS Section</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Taxable Value</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">TDS Amount</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Interest</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Total TDS Payable</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Chalan No.</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Chalan Date</th>
                </tr>
              </thead>
              <tbody>
                {transactionsData.map((transaction, index) => (
                  <tr key={transaction._id || index} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        transaction.source === 'Payment' 
                          ? 'bg-blue-100 text-blue-800' 
                          : transaction.source === 'Credit Note'
                          ? 'bg-green-100 text-green-800'
                          : transaction.source === 'Debit Note'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.source}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{transaction.vendorName}</td>
                    <td className="py-4 px-6 text-blue-600 font-medium">{transaction.invoiceNo}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(transaction.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-sm">{transaction.panNo}</td>
                    <td className="py-4 px-6 text-gray-600">{transaction.tdsSection}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{transaction.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{transaction.tdsAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-right text-gray-600">{transaction.interest > 0 ? `₹${transaction.interest.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{transaction.totalTdsPayable.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{transaction.chalanNo || '—'}</td>
                    <td className="py-4 px-6 text-gray-600">{transaction.chalanDate ? new Date(transaction.chalanDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && !error && transactionsData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No TDS transactions found</p>
            <p className="text-sm">TDS data is automatically loaded from bills, payments, and credit/debit notes with TDS amounts.</p>
            <p className="text-sm mt-1">Create bills, payments, or credit/debit notes with TDS sections to see TDS purchase data here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TDSPurchases;

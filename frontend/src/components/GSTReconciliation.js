import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, IndianRupee, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const GSTReconciliation = () => {
  const [bills, setBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchInvoices();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/bills');
      if (response.ok) {
        const data = await response.json();
        setBills(data.filter(bill => bill.approvalStatus === 'approved'));
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
    setLoading(false);
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.filter(inv => inv.status !== 'Draft' && inv.status !== 'Cancelled'));
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Calculate matched invoices (bills with proper GST)
  const matchedInvoices = bills.filter(bill => 
    bill.vendorGSTIN && bill.totalTax > 0
  ).length;

  // Calculate mismatch invoices (bills with GST issues)
  const mismatchInvoices = bills.filter(bill => 
    (!bill.vendorGSTIN && bill.totalTax > 0) || 
    (bill.vendorGSTIN && bill.totalTax === 0 && bill.grandTotal > 0)
  );
  const mismatchCount = mismatchInvoices.length;
  const mismatchAmount = mismatchInvoices.reduce((sum, bill) => sum + bill.grandTotal, 0);

  // Calculate missing invoices (bills without GSTIN)
  const missingInvoices = bills.filter(bill => !bill.vendorGSTIN);
  const missingCount = missingInvoices.length;
  const missingAmount = missingInvoices.reduce((sum, bill) => sum + bill.grandTotal, 0);

  // Calculate excess credit (total GST collected)
  const excessCredit = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);

  const exportToExcel = () => {
    const purchaseData = bills.map(bill => ({
      'Date': new Date(bill.billDate).toLocaleDateString('en-GB'),
      'Vendor': bill.vendorName,
      'Invoice No.': bill.billNumber,
      'GSTIN': bill.vendorGSTIN || '-',
      'Taxable Amount': bill.totalTaxableValue,
      'GST Amount': bill.totalTax
    }));
    const salesData = invoices.map(invoice => ({
      'Date': new Date(invoice.invoiceDate).toLocaleDateString('en-GB'),
      'Customer': invoice.customerName,
      'Invoice No.': invoice.invoiceNumber,
      'GSTIN': invoice.customerGSTIN || '-',
      'Taxable Amount': invoice.totalTaxableValue,
      'GST Amount': invoice.totalTax
    }));
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(purchaseData);
    const ws2 = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Purchase Register');
    XLSX.utils.book_append_sheet(wb, ws2, 'Sales Register');
    XLSX.writeFile(wb, `GST_Reconciliation_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  const exportPurchaseToExcel = () => {
    const purchaseData = bills.map(bill => ({
      'Date': new Date(bill.billDate).toLocaleDateString('en-GB'),
      'Vendor': bill.vendorName,
      'Invoice No.': bill.billNumber,
      'GSTIN': bill.vendorGSTIN || '-',
      'Taxable Amount': bill.totalTaxableValue,
      'GST Amount': bill.totalTax
    }));
    const ws = XLSX.utils.json_to_sheet(purchaseData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Register');
    XLSX.writeFile(wb, `GSTR-2B_Purchase_Register_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  const exportSalesToExcel = () => {
    const salesData = invoices.map(invoice => ({
      'Date': new Date(invoice.invoiceDate).toLocaleDateString('en-GB'),
      'Customer': invoice.customerName,
      'Invoice No.': invoice.invoiceNumber,
      'GSTIN': invoice.customerGSTIN || '-',
      'Taxable Amount': invoice.totalTaxableValue,
      'GST Amount': invoice.totalTax
    }));
    const ws = XLSX.utils.json_to_sheet(salesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Register');
    XLSX.writeFile(wb, `GSTR-1_Sales_Register_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">GST Reconciliation</h1>
          <p className="text-gray-500 text-sm sm:text-base">Monitor GST compliance and reconciliation status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Matched Invoices</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">{matchedInvoices}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <CheckCircle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Mismatch Invoices</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">{mismatchCount}</p>
                <p className="text-xs text-gray-400 mt-1">₹{mismatchAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <AlertTriangle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Missing Invoices</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">{missingCount}</p>
                <p className="text-xs text-gray-400 mt-1">₹{missingAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <XCircle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
            <div className="ml-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Excess Credit</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{excessCredit.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                <IndianRupee size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Register Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-white">GSTR-2B vs Purchase Register</h3>
            <button 
              onClick={exportPurchaseToExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Vendor</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">GSTIN</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Taxable Amt.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">GST Amt.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : bills.length > 0 ? (
                  bills.map((bill, index) => {
                    const hasGSTIN = bill.vendorGSTIN && bill.vendorGSTIN.length > 0;
                    const hasGST = bill.totalTax > 0;
                    const isMatched = hasGSTIN && hasGST;
                    const isMismatch = (!hasGSTIN && hasGST) || (hasGSTIN && !hasGST && bill.grandTotal > 0);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">
                          {new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{bill.vendorName}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{bill.billNumber}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{bill.vendorGSTIN || '-'}</td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{bill.totalTaxableValue.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{bill.totalTax.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            isMatched ? 'bg-green-500' : isMismatch ? 'bg-orange-500' : 'bg-red-500'
                          }`}></span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No bills found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Register Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-white">GSTR-1 vs Sales Register</h3>
            <button 
              onClick={exportSalesToExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">GSTIN</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Taxable Amt.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">GST Amt.</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : invoices.length > 0 ? (
                  invoices.map((invoice, index) => {
                    const hasGSTIN = invoice.customerGSTIN && invoice.customerGSTIN.length > 0;
                    const hasGST = invoice.totalTax > 0;
                    const isMatched = hasGSTIN && hasGST;
                    const isMismatch = (!hasGSTIN && hasGST) || (hasGSTIN && !hasGST && invoice.grandTotal > 0);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">
                          {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.customerName}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.invoiceNumber}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.customerGSTIN || '-'}</td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{invoice.totalTaxableValue.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">₹{invoice.totalTax.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            isMatched ? 'bg-green-500' : isMismatch ? 'bg-orange-500' : 'bg-red-500'
                          }`}></span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No invoices found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTReconciliation;
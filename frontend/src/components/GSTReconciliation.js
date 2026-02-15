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
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800">GST Reconciliation</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Matched Invoices</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{matchedInvoices}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg text-green-600 bg-green-50 flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Mismatch Invoices</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{mismatchCount}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">₹ {mismatchAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg text-yellow-600 bg-yellow-50 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Missing Invoices</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{missingCount}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">₹ {missingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg text-red-600 bg-red-50 flex-shrink-0">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Excess Credit</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">₹ {excessCredit.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg text-blue-600 bg-blue-50 flex-shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">GSTR-2B vs Purchase Register</h2>
      
      <div className="flex justify-end mb-3">
        <button 
          onClick={exportPurchaseToExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Date</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Vendor</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Invoice No.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">GSTIN</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Taxable Amt.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">GST Amt.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-2 md:px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : bills.length > 0 ? (
                bills.map((bill, index) => {
                  const hasGSTIN = bill.vendorGSTIN && bill.vendorGSTIN.length > 0;
                  const hasGST = bill.totalTax > 0;
                  const isMatched = hasGSTIN && hasGST;
                  const isMismatch = (!hasGSTIN && hasGST) || (hasGSTIN && !hasGST && bill.grandTotal > 0);
                  
                  return (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        {new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{bill.vendorName}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{bill.billNumber}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{bill.vendorGSTIN || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ {bill.totalTaxableValue.toLocaleString('en-IN')}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ {bill.totalTax.toLocaleString('en-IN')}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${
                          isMatched ? 'bg-green-500' : isMismatch ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-2 md:px-4 py-8 text-center text-gray-500">No bills found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 mt-8">GSTR-1 vs Sales Register</h2>
      
      <div className="flex justify-end mb-3">
        <button 
          onClick={exportSalesToExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Date</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Customer</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Invoice No.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">GSTIN</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Taxable Amt.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">GST Amt.</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-2 md:px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((invoice, index) => {
                  const hasGSTIN = invoice.customerGSTIN && invoice.customerGSTIN.length > 0;
                  const hasGST = invoice.totalTax > 0;
                  const isMatched = hasGSTIN && hasGST;
                  const isMismatch = (!hasGSTIN && hasGST) || (hasGSTIN && !hasGST && invoice.grandTotal > 0);
                  
                  return (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{invoice.customerName}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{invoice.invoiceNumber}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">{invoice.customerGSTIN || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ {invoice.totalTaxableValue.toLocaleString('en-IN')}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ {invoice.totalTax.toLocaleString('en-IN')}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${
                          isMatched ? 'bg-green-500' : isMismatch ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-2 md:px-4 py-8 text-center text-gray-500">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GSTReconciliation;
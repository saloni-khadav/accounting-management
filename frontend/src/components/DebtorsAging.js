import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const DebtorsAging = () => {
  const [invoicesData, setInvoicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoicesAging();
  }, []);

  const fetchInvoicesAging = async () => {
    try {
      const token = localStorage.getItem('token');
      const [invoicesRes, collectionsRes, creditNotesRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/invoices'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/collections'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (invoicesRes.ok) {
        const invoices = await invoicesRes.json();
        const collections = collectionsRes.ok ? await collectionsRes.json() : [];
        const creditNotes = creditNotesRes.ok ? await creditNotesRes.json() : [];
        const agingData = calculateAging(invoices, collections, creditNotes);
        setInvoicesData(agingData);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAging = (invoices, collections, creditNotes) => {
    const today = new Date();
    const approvedCollections = collections.filter(col => col.approvalStatus === 'Approved');
    const approvedCreditNotes = creditNotes.filter(cn => cn.approvalStatus === 'Approved');

    return invoices
      .filter(inv => inv.approvalStatus === 'Approved')
      .map(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        const invoiceAmount = invoice.grandTotal || 0;
        
        // Calculate total collected
        const invoiceCollections = approvedCollections.filter(col => 
          col.invoiceNumber?.includes(invoice.invoiceNumber)
        );
        const totalCollected = invoiceCollections.reduce((sum, col) => 
          sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
        );
        
        // Calculate total credit notes
        const invoiceCreditNotes = approvedCreditNotes.filter(cn => 
          cn.originalInvoiceNumber === invoice.invoiceNumber
        );
        const totalCredited = invoiceCreditNotes.reduce((sum, cn) => 
          sum + (parseFloat(cn.grandTotal) || 0), 0
        );
        
        // Calculate TDS
        const totalTDS = invoiceCollections.reduce((sum, col) => 
          sum + (parseFloat(col.tdsAmount) || 0), 0
        );
        
        const remainingAmount = invoiceAmount - totalCollected - totalCredited - totalTDS;
        
        // Only show invoices with remaining amount
        if (remainingAmount <= 0) return null;
        
        return {
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          customerName: invoice.customerName,
          totalAmount: remainingAmount,
          daysDiff,
          lessThan30: daysDiff < 30 ? remainingAmount : 0,
          days30to60: daysDiff >= 30 && daysDiff < 60 ? remainingAmount : 0,
          days60to90: daysDiff >= 60 && daysDiff < 90 ? remainingAmount : 0,
          days90to180: daysDiff >= 90 && daysDiff < 180 ? remainingAmount : 0,
          moreThan180: daysDiff >= 180 ? remainingAmount : 0
        };
      })
      .filter(invoice => invoice !== null && invoice.daysDiff >= 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatAmount = (amount) => {
    return amount > 0 ? amount.toFixed(2) : '-';
  };

  const handleExport = () => {
    const exportData = invoicesData.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Date': formatDate(invoice.invoiceDate),
      'Customer': invoice.customerName,
      '< 30 Days': invoice.lessThan30 > 0 ? invoice.lessThan30.toFixed(2) : '',
      '30 to 60 Days': invoice.days30to60 > 0 ? invoice.days30to60.toFixed(2) : '',
      '60 to 90 Days': invoice.days60to90 > 0 ? invoice.days60to90.toFixed(2) : '',
      '90 to 180 Days': invoice.days90to180 > 0 ? invoice.days90to180.toFixed(2) : '',
      '> 180 Days': invoice.moreThan180 > 0 ? invoice.moreThan180.toFixed(2) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Debtors Aging');
    XLSX.writeFile(wb, `Debtors_Aging_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totals = invoicesData.reduce((acc, invoice) => ({
    lessThan30: acc.lessThan30 + invoice.lessThan30,
    days30to60: acc.days30to60 + invoice.days30to60,
    days60to90: acc.days60to90 + invoice.days60to90,
    days90to180: acc.days90to180 + invoice.days90to180,
    moreThan180: acc.moreThan180 + invoice.moreThan180
  }), { lessThan30: 0, days30to60: 0, days60to90: 0, days90to180: 0, moreThan180: 0 });

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="text-center py-8">Loading...</div></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold">Debtors Aging Report</h1>
          <button 
            onClick={handleExport}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-6 py-3">
          <h2 className="text-lg font-semibold">Aging Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                <th className="text-left py-3 px-4 font-semibold text-blue-900 border-r border-gray-300">Invoice Number</th>
                <th className="text-left py-3 px-4 font-semibold text-blue-900 border-r border-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-blue-900 border-r border-gray-300">Customer</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-green-500 border-r border-gray-300">&lt; 30 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-yellow-500 border-r border-gray-300">30 to 60 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-orange-500 border-r border-gray-300">60 to 90 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-red-500 border-r border-gray-300">90 to 180 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-red-700">&gt; 180 Days</th>
              </tr>
            </thead>
            <tbody>
              {invoicesData.map((invoice, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-blue-50">
                  <td className="py-3 px-4 text-blue-600 font-medium border-r border-gray-200">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-gray-700 border-r border-gray-200">{formatDate(invoice.invoiceDate)}</td>
                  <td className="py-3 px-4 text-gray-700 border-r border-gray-200">{invoice.customerName}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(invoice.lessThan30)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(invoice.days30to60)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(invoice.days60to90)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(invoice.days90to180)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatAmount(invoice.moreThan180)}</td>
                </tr>
              ))}
              {invoicesData.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtorsAging;

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const VendorsAging = () => {
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillsAging();
  }, []);

  const fetchBillsAging = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/bills');
      if (response.ok) {
        const bills = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments');
        let payments = [];
        if (paymentsResponse.ok) {
          payments = await paymentsResponse.json();
        }
        
        // Calculate paid amounts for each bill
        const billsWithPaidAmounts = bills.map(bill => {
          const billPayments = payments.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          return {
            ...bill,
            paidAmount: totalPaid
          };
        });
        
        const agingData = calculateAging(billsWithPaidAmounts);
        setBillsData(agingData);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAging = (bills) => {
    const today = new Date();
    return bills
      .filter(bill => {
        // Only include approved bills
        if (bill.approvalStatus !== 'approved') return false;
        
        // Calculate remaining amount
        const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
        const paidAmount = bill.paidAmount || 0;
        const remainingAmount = netPayable - paidAmount;
        
        // Exclude fully paid bills (remaining amount <= 0)
        return remainingAmount > 0;
      })
      .map(bill => {
        const billDate = new Date(bill.billDate);
        const daysDiff = Math.floor((today - billDate) / (1000 * 60 * 60 * 24));
        const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
        const paidAmount = bill.paidAmount || 0;
        const remainingAmount = netPayable - paidAmount; // Show remaining amount instead of total
        
        return {
          billNumber: bill.billNumber,
          billDate: bill.billDate,
          vendorName: bill.vendorName,
          totalAmount: remainingAmount, // Use remaining amount
          daysDiff,
          lessThan30: daysDiff < 30 ? remainingAmount : 0,
          days30to60: daysDiff >= 30 && daysDiff < 60 ? remainingAmount : 0,
          days60to90: daysDiff >= 60 && daysDiff < 90 ? remainingAmount : 0,
          days90to180: daysDiff >= 90 && daysDiff < 180 ? remainingAmount : 0,
          moreThan180: daysDiff >= 180 ? remainingAmount : 0
        };
      }).filter(bill => bill.daysDiff >= 0);
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
    const exportData = billsData.map(bill => ({
      'Bill Number': bill.billNumber,
      'Date': formatDate(bill.billDate),
      'Vendor': bill.vendorName,
      '< 30 Days': bill.lessThan30 > 0 ? bill.lessThan30.toFixed(2) : '',
      '30 to 60 Days': bill.days30to60 > 0 ? bill.days30to60.toFixed(2) : '',
      '60 to 90 Days': bill.days60to90 > 0 ? bill.days60to90.toFixed(2) : '',
      '90 to 180 Days': bill.days90to180 > 0 ? bill.days90to180.toFixed(2) : '',
      '> 180 Days': bill.moreThan180 > 0 ? bill.moreThan180.toFixed(2) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors Aging');
    XLSX.writeFile(wb, `Vendors_Aging_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totals = billsData.reduce((acc, bill) => ({
    lessThan30: acc.lessThan30 + bill.lessThan30,
    days30to60: acc.days30to60 + bill.days30to60,
    days60to90: acc.days60to90 + bill.days60to90,
    days90to180: acc.days90to180 + bill.days90to180,
    moreThan180: acc.moreThan180 + bill.moreThan180
  }), { lessThan30: 0, days30to60: 0, days60to90: 0, days90to180: 0, moreThan180: 0 });

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="text-center py-8">Loading...</div></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendors Aging Report</h1>
        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-300">Bill Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 border-r border-gray-300">Vendor</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-green-500 border-r border-gray-300">&lt; 30 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-yellow-500 border-r border-gray-300">30 to 60 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-orange-500 border-r border-gray-300">60 to 90 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-red-500 border-r border-gray-300">90 to 180 Days</th>
                <th className="text-center py-3 px-4 font-semibold text-white bg-red-700">&gt; 180 Days</th>
              </tr>
            </thead>
            <tbody>
              {billsData.map((bill, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-blue-600 font-medium border-r border-gray-200">{bill.billNumber}</td>
                  <td className="py-3 px-4 text-gray-700 border-r border-gray-200">{formatDate(bill.billDate)}</td>
                  <td className="py-3 px-4 text-gray-700 border-r border-gray-200">{bill.vendorName}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(bill.lessThan30)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(bill.days30to60)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(bill.days60to90)}</td>
                  <td className="py-3 px-4 text-center text-gray-700 border-r border-gray-200">{formatAmount(bill.days90to180)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatAmount(bill.moreThan180)}</td>
                </tr>
              ))}
              {billsData.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">No bills found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorsAging;

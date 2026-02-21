import React, { useState, useEffect } from 'react';
import { API_URL } from '../utils/apiConfig';
import { Download, Calendar, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import MetricsCard from './ui/MetricsCard';

const VendorsAging = () => {
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillsAging();
  }, []);

  const fetchBillsAging = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bills`);
      if (response.ok) {
        const bills = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch(`${API_URL}/api/payments`);
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

  const totalOutstanding = totals.lessThan30 + totals.days30to60 + totals.days60to90 + totals.days90to180 + totals.moreThan180;
  const totalVendors = [...new Set(billsData.map(bill => bill.vendorName))].length;
  const overdueAmount = totals.days30to60 + totals.days60to90 + totals.days90to180 + totals.moreThan180;

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="text-center py-8">Loading...</div></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Calendar className="mr-3" size={28} />
                Vendors Aging Report
              </h1>
              <p className="text-blue-100 mt-1">Track outstanding vendor payments by aging periods</p>
            </div>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Aging Analysis</h2>
            <span className="text-blue-100 text-sm">{billsData.length} Outstanding Bills</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Bill Number</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
                <th className="text-center py-4 px-6 font-semibold text-white bg-green-500 text-sm">< 30 Days</th>
                <th className="text-center py-4 px-6 font-semibold text-white bg-yellow-500 text-sm">30-60 Days</th>
                <th className="text-center py-4 px-6 font-semibold text-white bg-orange-500 text-sm">60-90 Days</th>
                <th className="text-center py-4 px-6 font-semibold text-white bg-red-500 text-sm">90-180 Days</th>
                <th className="text-center py-4 px-6 font-semibold text-white bg-red-700 text-sm">> 180 Days</th>
              </tr>
            </thead>
            <tbody>
              {billsData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No outstanding bills found</p>
                    <p className="text-sm">All vendor payments are up to date</p>
                  </td>
                </tr>
              ) : (
                billsData.map((bill, index) => (
                  <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6">
                      <span className="text-blue-600 font-medium">{bill.billNumber}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{bill.vendorName}</td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={bill.lessThan30 > 0 ? 'text-green-700' : 'text-gray-400'}>
                        {bill.lessThan30 > 0 ? `₹${bill.lessThan30.toLocaleString('en-IN')}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={bill.days30to60 > 0 ? 'text-yellow-700' : 'text-gray-400'}>
                        {bill.days30to60 > 0 ? `₹${bill.days30to60.toLocaleString('en-IN')}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={bill.days60to90 > 0 ? 'text-orange-700' : 'text-gray-400'}>
                        {bill.days60to90 > 0 ? `₹${bill.days60to90.toLocaleString('en-IN')}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={bill.days90to180 > 0 ? 'text-red-700' : 'text-gray-400'}>
                        {bill.days90to180 > 0 ? `₹${bill.days90to180.toLocaleString('en-IN')}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">
                      <span className={bill.moreThan180 > 0 ? 'text-red-800' : 'text-gray-400'}>
                        {bill.moreThan180 > 0 ? `₹${bill.moreThan180.toLocaleString('en-IN')}` : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {billsData.length > 0 && (
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="3" className="py-4 px-6 font-bold text-gray-900">TOTAL</td>
                  <td className="py-4 px-6 text-center font-bold text-green-700">
                    ₹{totals.lessThan30.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-yellow-700">
                    ₹{totals.days30to60.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-orange-700">
                    ₹{totals.days60to90.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-red-700">
                    ₹{totals.days90to180.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-red-800">
                    ₹{totals.moreThan180.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorsAging;

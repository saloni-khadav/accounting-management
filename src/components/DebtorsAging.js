import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import axios from 'axios';

const DebtorsAging = () => {
  const [debtorsData, setDebtorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebtorsAging();
  }, []);

  const fetchDebtorsAging = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/invoices/reports/debtors-aging', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDebtorsData(response.data);
    } catch (error) {
      console.error('Error fetching debtors aging:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totals = debtorsData.reduce((acc, debtor) => ({
    totalDue: acc.totalDue + debtor.totalDue,
    days1_30: acc.days1_30 + debtor.days1_30,
    days31_60: acc.days31_60 + debtor.days31_60,
    days61_120: acc.days61_120 + debtor.days61_120,
    days121_180: acc.days121_180 + debtor.days121_180,
    days180Plus: acc.days180Plus + debtor.days180Plus
  }), { totalDue: 0, days1_30: 0, days31_60: 0, days61_120: 0, days121_180: 0, days180Plus: 0 });

  const agingData = [
    { label: '1-30 Days', value: totals.days1_30 > 0 ? (totals.days1_30 / totals.totalDue) * 100 : 0, color: 'bg-green-500' },
    { label: '31-60 Days', value: totals.days31_60 > 0 ? (totals.days31_60 / totals.totalDue) * 100 : 0, color: 'bg-yellow-500' },
    { label: '61-120 Days', value: totals.days61_120 > 0 ? (totals.days61_120 / totals.totalDue) * 100 : 0, color: 'bg-orange-500' },
    { label: '121-180 Days', value: totals.days121_180 > 0 ? (totals.days121_180 / totals.totalDue) * 100 : 0, color: 'bg-red-500' },
    { label: '180+ Days', value: totals.days180Plus > 0 ? (totals.days180Plus / totals.totalDue) * 100 : 0, color: 'bg-red-700' }
  ];

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="text-center py-8">Loading...</div></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Debtors Ageing</h1>
      </div>

      {/* Top Section */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Aging Bars */}
          <div className="space-y-4">
            {agingData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-900 w-32">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8">
                  <div 
                    className={`${item.color} h-8 rounded-full transition-all`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Total Outstanding */}
          <div className="flex flex-col items-end justify-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Outstanding</h3>
            <p className="text-5xl font-bold text-gray-900 mb-6">{formatCurrency(totals.totalDue)}</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download size={20} />
              EXPORT
            </button>
          </div>
        </div>
      </div>

      {/* Debtors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Total Due</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">1-30 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">31-60 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">61-120 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">121-180 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">180+ Days</th>
              </tr>
            </thead>
            <tbody>
              {debtorsData.map((debtor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{debtor.customerName}</td>
                  <td className="py-4 px-6 text-gray-700 font-semibold">{formatCurrency(debtor.totalDue)}</td>
                  <td className="py-4 px-6 text-gray-700">{formatCurrency(debtor.days1_30)}</td>
                  <td className="py-4 px-6 text-gray-700">{formatCurrency(debtor.days31_60)}</td>
                  <td className="py-4 px-6 text-gray-700">{formatCurrency(debtor.days61_120)}</td>
                  <td className="py-4 px-6 text-gray-700">{formatCurrency(debtor.days121_180)}</td>
                  <td className="py-4 px-6 text-gray-700">{formatCurrency(debtor.days180Plus)}</td>
                </tr>
              ))}
              {debtorsData.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No overdue invoices found</td>
                </tr>
              )}
              {/* Totals Row */}
              {debtorsData.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-4 px-6 text-gray-900">Total</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.totalDue)}</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.days1_30)}</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.days31_60)}</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.days61_120)}</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.days121_180)}</td>
                  <td className="py-4 px-6 text-gray-900">{formatCurrency(totals.days180Plus)}</td>
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

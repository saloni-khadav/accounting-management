import React from 'react';
import { Download } from 'lucide-react';

const DebtorsAging = () => {
  const agingData = [
    { label: '32 Invoices', value: 100, color: 'bg-blue-600' },
    { label: '20 1-30 Day', value: 75, color: 'bg-blue-600' },
    { label: '18 1-60 Day', value: 55, color: 'bg-blue-500' },
    { label: '14 1-90 Days', value: 35, color: 'bg-blue-300' }
  ];

  const debtorsData = [
    { customer: 'Alpha Enterprises', totalDue: '₹38,000', notDue: '15,000', days1_30: '10,000', days31_60: '10,000', days61_90: '13,000', days90Plus: '40' },
    { customer: 'Sun Corporation', totalDue: '₹26,000', notDue: '30,000', days1_30: '6,000', days31_60: '13,000', days61_90: '100', days90Plus: '20' },
    { customer: 'Global Solutions', totalDue: '₹26,000', notDue: '26,000', days1_30: '11,000', days31_60: '600', days61_90: '1,000', days90Plus: '20' },
    { customer: 'K.P.Industries', totalDue: '₹30,000', notDue: '10,000', days1_30: '3,800', days31_60: '16,000', days61_90: '600', days90Plus: '10' },
    { customer: 'Vision Tech', totalDue: '₹26,000', notDue: '26,000', days1_30: '26,000', days31_60: '12,000', days61_90: '3,000', days90Plus: '5' }
  ];

  const totals = {
    totalDue: '₹132,000',
    notDue: '26,800',
    days1_30: '215,000',
    days31_60: '31-000',
    days61_90: '8,000'
  };

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
            <p className="text-5xl font-bold text-gray-900 mb-6">₹182,500</p>
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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Not Due</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">1-30 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">31-60 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">61-90 Days</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">&gt;90 Das</th>
              </tr>
            </thead>
            <tbody>
              {debtorsData.map((debtor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{debtor.customer}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.totalDue}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.notDue}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.days1_30}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.days31_60}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.days61_90}</td>
                  <td className="py-4 px-6 text-gray-700">{debtor.days90Plus}</td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-50 font-semibold">
                <td className="py-4 px-6 text-gray-900"></td>
                <td className="py-4 px-6 text-gray-900">{totals.totalDue}</td>
                <td className="py-4 px-6 text-gray-900">{totals.notDue}</td>
                <td className="py-4 px-6 text-gray-900">{totals.days1_30}</td>
                <td className="py-4 px-6 text-gray-900">{totals.days31_60}</td>
                <td className="py-4 px-6 text-gray-900">{totals.days61_90}</td>
                <td className="py-4 px-6 text-gray-900"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtorsAging;

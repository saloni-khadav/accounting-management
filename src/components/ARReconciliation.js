import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ARReconciliation = () => {
  const [downloadStatus, setDownloadStatus] = useState('');
  const [matchStatus, setMatchStatus] = useState('');

  const reconciliationData = [
    {
      invoiceDate: '05/04/2024',
      invoiceNo: 'INV-001',
      invoiceAmount: '₹ 56,800',
      matchStatus: 'Matched'
    },
    {
      invoiceDate: '02/04/2024',
      invoiceNo: 'INV-002',
      invoiceAmount: '₹ 34,500',
      matchStatus: 'Mismatch'
    },
    {
      invoiceDate: '28/03/2024',
      invoiceNo: 'Green Power Ltd.',
      invoiceAmount: '₹ 49,250',
      matchStatus: 'Matched'
    },
    {
      invoiceDate: '25/03/2024',
      invoiceNo: 'Global Solutions',
      invoiceAmount: '₹ 27,300',
      matchStatus: 'Matched'
    },
    {
      invoiceDate: '25/03/2024',
      invoiceNo: 'Alpha Enterprises',
      invoiceAmount: '₹ 27,300',
      matchStatus: 'Matched'
    }
  ];

  const filteredData = reconciliationData.filter(item => {
    if (matchStatus && item.matchStatus !== matchStatus) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">AR Reconciliation</h1>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <select
              value={downloadStatus}
              onChange={(e) => setDownloadStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            >
              <option value="">Download Status</option>
              <option value="downloaded">Downloaded</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          <div className="relative">
            <select
              value={matchStatus}
              onChange={(e) => setMatchStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            >
              <option value="">Match Status</option>
              <option value="Matched">Matched</option>
              <option value="Mismatch">Mismatch</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Invoice Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Invoice No.</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Invoice Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-lg">Match Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900 text-base">{item.invoiceDate}</td>
                  <td className="py-4 px-4 text-gray-900 text-base">{item.invoiceNo}</td>
                  <td className="py-4 px-4 text-gray-900 text-base">{item.invoiceAmount}</td>
                  <td className="py-4 px-4">
                    <span className={`px-4 py-2 rounded-lg font-medium text-base ${
                      item.matchStatus === 'Matched' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.matchStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ARReconciliation;

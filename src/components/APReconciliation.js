import React from 'react';

const APReconciliation = () => {
  const mismatchData = [
    { date: 'Apr 12 2024', invoiceNo: 'INV-5741', vendor: 'Ace Solutions', type: 'Invoice', amount: '₹18,200', status: 'Pending' },
    { date: 'Apr 9 2024', invoiceNo: 'INV-5740', vendor: 'Omni Enterprises', type: 'Invoice', amount: '₹22,600', status: 'Pending' },
    { date: 'Apr 7 2024', invoiceNo: 'PAY-1792', vendor: 'Vision Trade Ltd.', type: 'Payment', amount: '₹31,500', status: 'Pending' },
    { date: 'Apr 5 2024', invoiceNo: 'INV-5738', vendor: 'Beacon Industries', type: 'Invoice', amount: '₹3,300', status: 'Pending' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AP Reconciliation</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Total Payable</h3>
          <p className="text-3xl font-bold text-gray-900">₹80,650</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Invoiced Amount</h3>
          <p className="text-3xl font-bold text-gray-900">₹77,350</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-600 mb-2">Unreconciled</h3>
          <p className="text-3xl font-bold text-gray-900">₹3,300</p>
        </div>
      </div>

      {/* Mismatch Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Mismatch Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Invoice No.</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Vendor</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {mismatchData.map((row, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-4 px-6 text-gray-900">{row.date}</td>
                  <td className="py-4 px-6 text-gray-900">{row.invoiceNo}</td>
                  <td className="py-4 px-6 text-gray-900">{row.vendor}</td>
                  <td className="py-4 px-6 text-gray-900">{row.type}</td>
                  <td className="py-4 px-6 text-gray-900">{row.amount}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {row.status}
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

export default APReconciliation;
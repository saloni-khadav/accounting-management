import React from 'react';

const TDSPurchases = () => {
  const transactionsData = [
    { date: 'April 2024', vendor: 'Ace Solutions', section: '194C', amount: '₹2,500', status: 'Paid', interest: '—' },
    { date: 'April 7.024', vendor: 'Beacon Industries', section: '194C', amount: '₹3,200', status: 'Payable', interest: '₹300' },
    { date: 'April 4,204', vendor: 'Omni Enterprises', section: '194J', amount: '₹5,000', status: 'Payable', interest: '₹200' },
    { date: 'April 1.204', vendor: 'Ace Solutions', section: '194Q', amount: '₹4,500', status: 'Paid', interest: '—' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">TDS on Purchases</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">Total TDS</h3>
          <p className="text-4xl font-bold text-gray-900">₹15,200</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">Paid</h3>
          <p className="text-4xl font-bold text-gray-900">₹8,000</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">Payable</h3>
          <p className="text-4xl font-bold text-gray-900">₹7,200</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">Interest</h3>
          <p className="text-4xl font-bold text-gray-900">₹500</p>
        </div>
      </div>

      {/* Transaction Details Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Vendor</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">TDS Section</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">TDS Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Interest</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-5 px-4 text-gray-900">{transaction.date}</td>
                  <td className="py-5 px-4 text-gray-900">{transaction.vendor}</td>
                  <td className="py-5 px-4 text-gray-900">{transaction.section}</td>
                  <td className="py-5 px-4 text-gray-900 font-semibold">{transaction.amount}</td>
                  <td className="py-5 px-4 text-gray-900">{transaction.status}</td>
                  <td className="py-5 px-4 text-gray-900">{transaction.interest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TDSPurchases;

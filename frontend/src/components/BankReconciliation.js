import React from 'react';
import { ChevronDown } from 'lucide-react';

const BankReconciliation = () => {
  const transactions = [
    { date: '21 Apr', bankStatement: '₹ 18,500', books: 'Payment Received', status: 'matched' },
    { date: '17 Apr', bankStatement: '₹ 20,000', books: '₹ 20,000', status: 'matched' },
    { date: '12 Apr', bankStatement: '₹ 4,200', books: 'Rent', status: 'matched' },
    { date: '12 Apr', bankStatement: '₹ 4,500', books: 'Refund fromsupplier', status: 'matched' },
    { date: '5 Apr', bankStatement: '₹ 4,500', books: 'Electricity bill', status: 'matched' },
    { date: '21 Apr', bankStatement: '₹ 18,500', books: 'Payment Received', status: 'matched' },
    { date: '21 Apr', bankStatement: '₹ 20,000', books: 'Electricity Pay', status: 'matched' },
  ];

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8">Bank Reconciliation</h1>

      {/* Dropdowns */}
      <div className="flex gap-6 mb-8">
        <div>
          <label className="block text-sm text-gray-600 mb-2">Bank Account</label>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-64">
              <option>HDFC Bank</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">Period</label>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-64">
              <option>April 2024</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">From Bank Statement</div>
          <div className="text-3xl font-semibold text-gray-900">₹ 46,800.00</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">From Books</div>
          <div className="text-3xl font-semibold text-gray-900">₹ 45,200.00</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Difference</div>
          <div className="text-3xl font-semibold text-gray-900">₹ 1,600.00</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Bank Statement</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Books</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Reconciliation Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 px-6 text-gray-900">{transaction.date}</td>
                <td className="py-4 px-6 text-gray-900">{transaction.bankStatement}</td>
                <td className="py-4 px-6 text-gray-900">{transaction.books}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-900">{transaction.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankReconciliation;
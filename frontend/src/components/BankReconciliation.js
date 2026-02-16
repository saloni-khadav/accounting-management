import React from 'react';
import { ChevronDown, FileText, TrendingUp, DollarSign } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

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

  const metricsData = [
    {
      title: 'From Bank Statement',
      value: '₹46,800.00',
      icon: FileText,
      color: 'primary'
    },
    {
      title: 'From Books',
      value: '₹45,200.00',
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Difference',
      value: '₹1,600.00',
      icon: DollarSign,
      color: 'warning'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bank Reconciliation
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Reconcile your bank statements with your books.</p>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>HDFC Bank</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>April 2024</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
          {metricsData.map((metric, index) => (
            <div key={index} className="transform transition-all duration-200 hover:-translate-y-1">
              <MetricsCard {...metric} />
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Reconciliation Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Bank Statement</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Books</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Reconciliation Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-900">{transaction.date}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{transaction.bankStatement}</td>
                    <td className="py-4 px-6 text-gray-900">{transaction.books}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium capitalize">{transaction.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankReconciliation;
import React from 'react';
import { Plus, ChevronLeft } from 'lucide-react';

const Payments = () => {
  const paymentsData = [
    { paymentNo: 'PYMT-004', date: 'May 15, 2023', vendor: 'Omni Enterprises', amount: '₹25,000', color: 'bg-green-100' },
    { paymentNo: 'PYMT-003', date: 'May 10, 2023', vendor: 'JK Manufacturing', amount: '₹45,000', color: 'bg-green-100' },
    { paymentNo: 'PYMT-002', date: 'Apr 28, 2023', vendor: 'Global Systems', amount: '₹75,000', color: 'bg-green-100' },
    { paymentNo: 'PYMT-001', date: 'Apr 20, 2023', vendor: 'Ace Solutions', amount: '₹75,000', color: 'bg-red-100' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
          <Plus size={20} />
          New Payment
        </button>
      </div>

      {/* Payments Summary Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Upcoming Payments</h3>
            <p className="text-4xl font-bold text-gray-900">₹25,000</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Completed Payments</h3>
            <p className="text-4xl font-bold text-gray-900">₹120,000</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Payments Overdue</h3>
            <p className="text-4xl font-bold text-gray-900">₹10,000</p>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Payment #</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Payment Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Vendor</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900 text-base">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData.map((payment) => (
                <tr key={payment.paymentNo} className="border-b border-gray-100">
                  <td className="py-5 px-4 text-gray-900 font-medium">{payment.paymentNo}</td>
                  <td className="py-5 px-4 text-gray-900">{payment.date}</td>
                  <td className="py-5 px-4 text-gray-900">{payment.vendor}</td>
                  <td className="py-5 px-4 text-right">
                    <span className={`px-4 py-2 rounded-lg font-semibold ${payment.color}`}>
                      {payment.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium">1</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">2</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">3</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">4</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">5</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;

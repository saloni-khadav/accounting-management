import React from 'react';

const VendorsAging = () => {
  const vendorsData = [
    { vendor: 'Omni Enterprises', notDue: '₹15,000', days1_30: '₹40,000', days31_60: '—', days61_90: '—' },
    { vendor: 'JK Manufacturing', notDue: '₹25,000', days1_30: '₹5,000', days31_60: '₹20,000', days61_90: '—' },
    { vendor: 'Global Systems', notDue: '₹10,000', days1_30: '₹15,000', days31_60: '₹10,000', days61_90: '₹10,000' },
    { vendor: 'Ace Solutions', notDue: '₹15,000', days1_30: '₹10,000', days31_60: '₹10,000', days61_90: '₹10,000' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Vendors Aging</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">Not Due</h3>
          <p className="text-4xl font-bold text-gray-900">₹65,000</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">1-30 Days</h3>
          <p className="text-4xl font-bold text-gray-900">₹40,000</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">31-60 Days</h3>
          <p className="text-4xl font-bold text-gray-900">₹20,000</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-700 mb-2">61-90 Days</h3>
          <p className="text-4xl font-bold text-gray-900">₹10,000</p>
        </div>
      </div>

      {/* Vendors Aging Summary Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendors Aging Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Vendor</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Not Due</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">1-30 Days</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">31-60 Days</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">61-90 Days</th>
              </tr>
            </thead>
            <tbody>
              {vendorsData.map((vendor, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-5 px-4 text-gray-900 font-medium">{vendor.vendor}</td>
                  <td className="py-5 px-4 text-gray-900">{vendor.notDue}</td>
                  <td className="py-5 px-4 text-gray-900">{vendor.days1_30}</td>
                  <td className="py-5 px-4 text-gray-900">{vendor.days31_60}</td>
                  <td className="py-5 px-4 text-gray-900">{vendor.days61_90}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorsAging;

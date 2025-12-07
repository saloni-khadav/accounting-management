import React from 'react';
import { Download } from 'lucide-react';

const ClientOutstanding = () => {
  const clientData = [
    { name: 'Mobile Robotics', idquxui: '₹48,600', outstand: '₹30,200', rate: '₹10,200', amount: '₹42,200' },
    { name: 'Green Energy Ltd.', idquxui: '₹28,600', outstand: '₹62,400', rate: '₹62,400', amount: '₹45,600' },
    { name: 'Quantum Systems', idquxui: '₹62,400', outstand: '₹62,400', rate: '₹45,600', amount: '₹45,600' },
    { name: 'Apex Solutions', idquxui: '₹45,600', outstand: '₹45,600', rate: '₹45,600', amount: '₹45,600' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Client Outstanding</h1>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">₹1,85,200</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Current Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900">₹80,600</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">60+ Days Outstanding</h3>
          <p className="text-3xl font-bold text-red-600">₹42,200</p>
        </div>
      </div>

      {/* Client Overview Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Client Overview</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Client Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Idquxui</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Outstand</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Rate</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{client.idquxui}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{client.outstand}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{client.rate}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">{client.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientOutstanding;

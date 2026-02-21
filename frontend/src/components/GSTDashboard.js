import React from 'react';
import { FileText, DollarSign } from 'lucide-react';

const GSTDashboard = () => {
  const missingInvoices = [
    { date: '01/04/2024', invoiceNo: 'ABC Enterpri…', clientName: 'ABC Enterprises', gstin: '1234-5678', taxAmount: '₹56,000' },
    { date: '02/04/2024', invoiceNo: 'AYZ Corpora…', clientName: 'XYZ Corporation', gstin: '1234-5678', taxAmount: '₹55,000' },
    { date: '03/04/2024', invoiceNo: 'Bill Batemart', clientName: 'Bill Hillinghouse', gstin: '1234-5678', taxAmount: '₹16,000' },
    { date: '04/04/2024', invoiceNo: 'BAC Billinghaus', clientName: 'ABC Billinghause', gstin: '1234-5678', taxAmount: '₹35,000' },
    { date: '10/04/2024', invoiceNo: 'Cub Surprisco', clientName: 'Cub Francisco', gstin: '1234-5678', taxAmount: '₹20,000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
              <h1 className="text-2xl sm:text-3xl font-bold">GST Dashboard</h1>
              <p className="text-blue-100 mt-1">GST filing status and reconciliation overview</p>
            </div>
          </div>
        </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
          <div className="ml-2 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">GST Payable</p>
              <p className="text-3xl font-bold text-gray-900">₹2,19,293.80</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
          <div className="ml-2 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Net GST Payable</p>
              <p className="text-3xl font-bold text-gray-900">₹1,96,422.85</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filing Status and Mismatch Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Filing Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
            <h3 className="text-lg font-semibold text-white">Filing Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Status</span>
                <span className="text-sm text-gray-600 font-medium">Ste+inn</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">GSTR-1</span>
                <span className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">Pending</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700">GSTR-3B</span>
                <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">Submitted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mismatch Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
            <h3 className="text-lg font-semibold text-white">Mismatch Overview</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">In Books</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">In GSTR-2A/2B</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Mismatched</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900">6</div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Invoices Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 border-b border-blue-400">
          <h3 className="text-lg font-semibold text-white">Missing Invoices</h3>
          <p className="text-sm text-blue-100 mt-1">Invoices not Found in Books</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Date</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No.</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Client Name</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">GSTIN</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {missingInvoices.map((invoice, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 text-sm text-gray-900 font-medium">{invoice.date}</td>
                  <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.invoiceNo}</td>
                  <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.clientName}</td>
                  <td className="py-3.5 px-4 text-sm text-gray-900">{invoice.gstin}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">{invoice.taxAmount}</td>
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

export default GSTDashboard;

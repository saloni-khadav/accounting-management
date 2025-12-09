import React from 'react';

const GSTDashboard = () => {
  const missingInvoices = [
    { date: '01/04/2024', invoiceNo: 'ABC Enterpri…', clientName: 'ABC Enterprises', gstin: '1234-5678', taxAmount: '₹56,000' },
    { date: '02/04/2024', invoiceNo: 'AYZ Corpora…', clientName: 'XYZ Corporation', gstin: '1234-5678', taxAmount: '₹55,000' },
    { date: '03/04/2024', invoiceNo: 'Bill Batemart', clientName: 'Bill Hillinghouse', gstin: '1234-5678', taxAmount: '₹16,000' },
    { date: '04/04/2024', invoiceNo: 'BAC Billinghaus', clientName: 'ABC Billinghause', gstin: '1234-5678', taxAmount: '₹35,000' },
    { date: '10/04/2024', invoiceNo: 'Cub Surprisco', clientName: 'Cub Francisco', gstin: '1234-5678', taxAmount: '₹20,000' }
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹2,50,000</div>
          <div className="text-sm text-gray-500">GST Payable</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹1,00,000</div>
          <div className="text-sm text-gray-500">GST Receivable</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">₹1,50,000</div>
          <div className="text-sm text-gray-500">Net GST Payable</div>
        </div>
      </div>

      {/* Filing Status and Mismatch Overview */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Filing Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm text-gray-600">Ste+inn</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">GSTR-1</span>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">GSTR-3B</span>
              <span className="text-sm text-gray-700">Submitted</span>
            </div>
          </div>
        </div>

        {/* Mismatch Overview Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mismatch Overview</h3>
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

      {/* Missing Invoices Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Missing Invoices</h3>
          <p className="text-sm text-gray-500">Invoices not Found in Books</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice No.</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">GSTIN</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {missingInvoices.map((invoice, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{invoice.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{invoice.invoiceNo}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{invoice.clientName}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{invoice.gstin}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{invoice.taxAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GSTDashboard;

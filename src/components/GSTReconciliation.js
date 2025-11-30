import React from 'react';

const GSTReconciliation = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">GST Reconciliation</h1>
      <div className="flex gap-3">
        <select className="px-4 py-2 border border-gray-300 rounded-md">
          <option>Export</option>
        </select>
        <button className="px-4 py-2 border border-gray-300 rounded-md">A</button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-6 mb-8">
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-sm text-gray-600 mb-2">Matched Invoices</div>
        <div className="text-3xl font-semibold">240</div>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-sm text-gray-600 mb-2">Mismatch Invoices</div>
        <div className="text-3xl font-semibold">18</div>
        <div className="text-sm text-gray-500">₹ 3,56,700</div>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-sm text-gray-600 mb-2">Missing Invoices</div>
        <div className="text-3xl font-semibold">8</div>
        <div className="text-sm text-gray-500">₹ 1,92,500</div>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-sm text-gray-600 mb-2">Excess Credit</div>
        <div className="text-3xl font-semibold">₹ 45,200</div>
      </div>
    </div>

    <h2 className="text-xl font-semibold mb-4">GSTR-2B vs Purchase Register</h2>
    
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vendor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice No.</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">GSTR-2B Taxable Amt.</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Purchase Taxable Amt.</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">3 May 2023</td>
            <td className="px-4 py-3">ABC Traders</td>
            <td className="px-4 py-3">INV-00123</td>
            <td className="px-4 py-3">₹ 219,200</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">4 May 2023</td>
            <td className="px-4 py-3">XYZ Enterprises</td>
            <td className="px-4 py-3">INV-00457</td>
            <td className="px-4 py-3">₹ 13,8100</td>
            <td className="px-4 py-3">₹ 8,000</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">5 May 2023</td>
            <td className="px-4 py-3">MNO Distributors</td>
            <td className="px-4 py-3">INV-00234</td>
            <td className="px-4 py-3">₹ 13,5000</td>
            <td className="px-4 py-3">₹ 5,000</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">5 May 2023</td>
            <td className="px-4 py-3">Global Suppliers</td>
            <td className="px-4 py-3">INV-00789</td>
            <td className="px-4 py-3">₹ 171,300</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">6 May 2023</td>
            <td className="px-4 py-3">PQR Corporation</td>
            <td className="px-4 py-3">INV-00356</td>
            <td className="px-4 py-3">₹ 121,400</td>
            <td className="px-4 py-3">₹ 5,000</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">6 May 2023</td>
            <td className="px-4 py-3">ABC Traders</td>
            <td className="px-4 py-3">INV-00123</td>
            <td className="px-4 py-3">₹ 219,100</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">7 May 2023</td>
            <td className="px-4 py-3">XYZ Enterprises</td>
            <td className="px-4 py-3">INV-00457</td>
            <td className="px-4 py-3">₹ 13,6000</td>
            <td className="px-4 py-3">₹ 5,000</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">5 May 2023</td>
            <td className="px-4 py-3">CFH Enterprises</td>
            <td className="px-4 py-3">INV-00234</td>
            <td className="px-4 py-3">₹ 13,5000</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">8 May 2023</td>
            <td className="px-4 py-3">DFB Assuppliers</td>
            <td className="px-4 py-3">INV-00356</td>
            <td className="px-4 py-3">₹ 171,200</td>
            <td className="px-4 py-3">₹ 5,000</td>
            <td className="px-4 py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default GSTReconciliation;
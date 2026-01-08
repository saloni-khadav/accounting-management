import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, DollarSign } from 'lucide-react';

const GSTReconciliation = () => (
  <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800">GST Reconciliation</h1>
      <div className="flex gap-2 md:gap-3">
        <select className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm">
          <option>Export</option>
        </select>
        <button className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm">A</button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Matched Invoices</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">240</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg text-green-600 bg-green-50 flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Mismatch Invoices</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">18</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">₹ 3,56,700</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg text-yellow-600 bg-yellow-50 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Missing Invoices</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">8</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">₹ 1,92,500</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg text-red-600 bg-red-50 flex-shrink-0">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Excess Credit</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">₹ 45,200</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg text-blue-600 bg-blue-50 flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
    </div>

    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">GSTR-2B vs Purchase Register</h2>
    
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Date</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Vendor</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Invoice No.</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">GSTR-2B Taxable Amt.</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Purchase Taxable Amt.</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">3 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">ABC Traders</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00123</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 219,200</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">-</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">4 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">XYZ Enterprises</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00457</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 13,8100</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 8,000</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">5 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">MNO Distributors</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00234</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 13,5000</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 5,000</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">5 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">Global Suppliers</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00789</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 171,300</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">-</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">6 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">PQR Corporation</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00356</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 121,400</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 5,000</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">6 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">ABC Traders</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00123</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 219,100</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">-</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">7 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">XYZ Enterprises</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00457</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 13,6000</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 5,000</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">5 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">CFH Enterprises</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00234</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 13,5000</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">-</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">8 May 2023</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">DFB Assuppliers</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">INV-00356</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 171,200</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 5,000</td>
              <td className="px-2 md:px-4 py-2 md:py-3"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default GSTReconciliation;
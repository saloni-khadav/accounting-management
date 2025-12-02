import React from 'react';
import { DollarSign, FileText, AlertTriangle, Calendar } from 'lucide-react';

const TDSReconciliation = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <h1 className="text-3xl font-semibold text-gray-800 mb-8">TDS Reconciliation</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">TDS Amount</p>
            <p className="text-xs text-gray-500 mb-1">(This Month)</p>
            <p className="text-2xl font-bold text-gray-900">₹ 55,800</p>
          </div>
          <div className="p-3 rounded-lg text-green-600 bg-green-50">
            <DollarSign size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Invoices with TDS</p>
            <p className="text-2xl font-bold text-gray-900">125</p>
          </div>
          <div className="p-3 rounded-lg text-blue-600 bg-blue-50">
            <FileText size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Not Deducted</p>
            <p className="text-xs text-gray-500 mb-1">Where Applicable</p>
            <p className="text-2xl font-bold text-red-600">15</p>
          </div>
          <div className="p-3 rounded-lg text-red-600 bg-red-50">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Due Date</p>
            <p className="text-xl font-bold text-gray-900">07/07/2023</p>
          </div>
          <div className="p-3 rounded-lg text-purple-600 bg-purple-50">
            <Calendar size={24} />
          </div>
        </div>
      </div>
    </div>

    <div className="flex gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm">Section</span>
        <select className="px-3 py-2 border border-gray-300 rounded-md">
          <option>194C</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <select className="px-3 py-2 border border-gray-300 rounded-md">
          <option>Mismatch</option>
        </select>
      </div>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Apply Filters
      </button>
    </div>

    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice No.</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Party</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TDS Section</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Taxable Amount</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TDS Deducted</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">21/142021</td>
            <td className="px-4 py-3">INV-0012</td>
            <td className="px-4 py-3">Alpha Traders</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 95,000</td>
            <td className="px-4 py-3">₹1,500</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">18/8/2021</td>
            <td className="px-4 py-3">INV-0010</td>
            <td className="px-4 py-3">Green Solutions</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 65,200</td>
            <td className="px-4 py-3">₹2.00</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">16/8/2021</td>
            <td className="px-4 py-3">INV-0096</td>
            <td className="px-4 py-3">Horizon Pvt. Ltd.</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 80,800</td>
            <td className="px-4 py-3">₹100</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">13/6/2021</td>
            <td className="px-4 py-3">INV-0085</td>
            <td className="px-4 py-3">Alpha Traders</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 65,000</td>
            <td className="px-4 py-3">₹ 0</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">18/6/2021</td>
            <td className="px-4 py-3">INV-0088</td>
            <td className="px-4 py-3">Green Solutions</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 1,800</td>
            <td className="px-4 py-3">1,900</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-3">13/6/2021</td>
            <td className="px-4 py-3">INV-0057</td>
            <td className="px-4 py-3">Alpha Traders</td>
            <td className="px-4 py-3">194C</td>
            <td className="px-4 py-3">₹ 62,400</td>
            <td className="px-4 py-3">1,248</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TDSReconciliation;
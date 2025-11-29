import React from 'react';

const BalanceSheet = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">Balance Sheet</h1>
      <div className="flex items-center gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-md">
          <option>This Year</option>
        </select>
        <button className="p-2 border border-gray-300 rounded-md">
          ☰
        </button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-6 mb-8">
      <div className="text-center">
        <div className="text-sm text-gray-600">Total Assets</div>
        <div className="text-2xl font-semibold">₹8,200,000</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">Total Liabilities</div>
        <div className="text-2xl font-semibold">₹4,000,000</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">Equity</div>
        <div className="text-2xl font-semibold">₹4,200,000</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">Current Ratio</div>
        <div className="text-2xl font-semibold">1.80</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Assets</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Particulars</th>
              <th className="text-right py-2">As of Mar 31,2024</th>
              <th className="text-right py-2">Previous Period</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Assets</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="py-2">Current Assets</td>
              <td className="text-right">500,000</td>
              <td className="text-right">2,500,000</td>
            </tr>
            <tr>
              <td className="py-2">Accounts Receivable</td>
              <td className="text-right">1,200,000</td>
              <td className="text-right">1,300,000</td>
            </tr>
            <tr>
              <td className="py-2">Inventory</td>
              <td className="text-right">900,000</td>
              <td className="text-right">800,000</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Subtotal Total</td>
              <td className="text-right font-medium">2,600,000</td>
              <td className="text-right font-medium">2,800,000</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mt-6 mb-4 text-blue-600">Liabilities</h3>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-2">Accounts Payable</td>
              <td className="text-right">1,300,000</td>
              <td className="text-right">1,300,000</td>
            </tr>
            <tr>
              <td className="py-2">Short-term Loans</td>
              <td className="text-right">1,300,000</td>
              <td className="text-right">1,300,000</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Subtotal Total</td>
              <td className="text-right font-medium">3,300,000</td>
              <td className="text-right font-medium">2,550,000</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mt-6 mb-4 text-blue-600">Equity</h3>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-2">Share Capital</td>
              <td className="text-right">2,300,000</td>
              <td className="text-right">2,500,000</td>
            </tr>
            <tr>
              <td className="py-2">Retained Earnings</td>
              <td className="text-right">1,700,000</td>
              <td className="text-right">1,700,000</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Total Equity</td>
              <td className="text-right font-medium">4,200,000</td>
              <td className="text-right font-medium">4,200,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div className="mb-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-end justify-center gap-8 mb-4 h-32">
              <div className="flex flex-col items-center">
                <div className="w-12 h-20 bg-blue-500 rounded-sm mb-2"></div>
                <span className="text-xs text-gray-600">Assets</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-24 bg-blue-600 rounded-sm mb-2"></div>
                <span className="text-xs text-gray-600">Liabilities</span>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-2">Assets</td>
              <td className="text-right">Total</td>
            </tr>
            <tr>
              <td className="py-2">9,200,000</td>
              <td className="text-right">4,000,000</td>
            </tr>
            <tr>
              <td className="py-2">4,200,000</td>
              <td className="text-right">4,100,000</td>
            </tr>
            <tr>
              <td className="py-2">6,200,000</td>
              <td className="text-right">6,200,000</td>
            </tr>
            <tr>
              <td className="py-2">2100,000</td>
              <td className="text-right">3,100,000</td>
            </tr>
            <tr>
              <td className="py-2">-</td>
              <td className="text-right">-</td>
            </tr>
            <tr>
              <td className="py-2">5,500,000</td>
              <td className="text-right">5,500,000</td>
            </tr>
            <tr>
              <td className="py-2">4,350,000</td>
              <td className="text-right">4,300,000</td>
            </tr>
            <tr>
              <td className="py-2">1,200,000</td>
              <td className="text-right">1,300,000</td>
            </tr>
            <tr>
              <td className="py-2">4,200,000</td>
              <td className="text-right">4,200,000</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 text-center">
          <span className="text-blue-600 font-medium">Assets</span>
          <span className="mx-4">vs</span>
          <span className="text-blue-600 font-medium">Liabilities</span>
        </div>
      </div>
    </div>
  </div>
);

export default BalanceSheet;
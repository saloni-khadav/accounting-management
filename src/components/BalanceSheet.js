import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';

const BalanceSheet = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-6 border-b border-gray-200 gap-4 sm:gap-0">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Balance Sheet</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 pr-8 md:pr-10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>This Year</option>
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Total Assets</div>
            <div className="text-2xl font-bold text-gray-900">₹8,200,000</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Total Liabilities</div>
            <div className="text-2xl font-bold text-gray-900">₹4,000,000</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Equity</div>
            <div className="text-2xl font-bold text-gray-900">₹4,200,000</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Current Ratio</div>
            <div className="text-2xl font-bold text-gray-900">1.80</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Financial Data */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              {/* Assets Section */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-blue-600">Assets</h2>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700">Particulars</th>
                      <th className="text-right py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700">As of Mar 31, 2024</th>
                      <th className="text-right py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700">Previous Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm font-medium text-blue-600">Assets</td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Current Assets</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">500,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">2,500,000</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Accounts Receivable</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,200,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,300,000</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Inventory</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">900,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">800,000</td>
                    </tr>
                    <tr className="border-b-2 border-gray-400">
                      <td className="py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-900">Subtotal Total</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">2,600,000</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">2,800,000</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-blue-600">Liabilities</h3>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Accounts Payable</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,300,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,300,000</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Short-term Loans</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,300,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,300,000</td>
                    </tr>
                    <tr className="border-b-2 border-gray-400">
                      <td className="py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-900">Subtotal Total</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">3,300,000</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">2,550,000</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Equity Section */}
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-blue-600">Equity</h3>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Share Capital</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">2,300,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">2,500,000</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 md:py-2 text-xs md:text-sm text-gray-700">Retained Earnings</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,700,000</td>
                      <td className="text-right text-xs md:text-sm text-gray-900">1,700,000</td>
                    </tr>
                    <tr className="border-b-2 border-gray-400">
                      <td className="py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-900">Total Equity</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">4,200,000</td>
                      <td className="text-right text-xs md:text-sm font-semibold text-gray-900">4,200,000</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart and Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              {/* Bar Chart */}
              <div className="mb-6 md:mb-8">
                <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                  <div className="flex items-end justify-center gap-4 md:gap-8 mb-4 h-24 md:h-32">
                    <div className="flex flex-col items-center">
                      <div className="w-8 md:w-12 h-16 md:h-20 bg-blue-500 rounded-sm mb-2"></div>
                      <span className="text-xs font-medium text-gray-700">Assets</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 md:w-12 h-20 md:h-24 bg-blue-600 rounded-sm mb-2"></div>
                      <span className="text-xs font-medium text-gray-700">Liabilities</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Table */}
              <div className="mb-4 md:mb-6">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 text-xs md:text-sm font-medium text-gray-700">Assets</th>
                      <th className="text-right py-2 text-xs md:text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm text-gray-700">
                    <tr><td className="py-1">9,200,000</td><td className="text-right">4,000,000</td></tr>
                    <tr><td className="py-1">4,200,000</td><td className="text-right">4,100,000</td></tr>
                    <tr><td className="py-1">6,200,000</td><td className="text-right">6,200,000</td></tr>
                    <tr><td className="py-1">2100,000</td><td className="text-right">3,100,000</td></tr>
                    <tr><td className="py-1">-</td><td className="text-right">-</td></tr>
                    <tr><td className="py-1">5,500,000</td><td className="text-right">5,500,000</td></tr>
                    <tr><td className="py-1">4,350,000</td><td className="text-right">4,300,000</td></tr>
                    <tr><td className="py-1">1,200,000</td><td className="text-right">1,300,000</td></tr>
                    <tr><td className="py-1">4,200,000</td><td className="text-right">4,200,000</td></tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-300 pt-3 md:pt-4">
                <div className="text-sm md:text-base font-medium text-gray-900 mb-2">Totals</div>
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-blue-600 font-semibold text-xs md:text-sm">Assets</span>
                  <span className="text-gray-500 text-xs md:text-sm">vs</span>
                  <span className="text-blue-600 font-semibold text-xs md:text-sm">Liabilities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
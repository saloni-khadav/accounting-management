import React from 'react';

const CreditNote = () => (
  <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800">Credit Note</h1>
      <div className="flex gap-2 md:gap-3">
        <button className="px-4 md:px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base">
          Cancel
        </button>
        <button className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base">
          Save
        </button>
      </div>
    </div>

    <div className="mb-4 md:mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">XYZ Ltd</h2>
      <p className="text-sm md:text-base text-gray-600">456 Commerce Ave.</p>
      <p className="text-sm md:text-base text-gray-600">Mumbai, Maharashtra -400001</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Credit Note No.</label>
        <input type="text" value="CN-00001" className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Credit Note Date</label>
        <input type="text" value="27 Apr 2024" className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Reference No.</label>
        <input type="text" value="INV-00250" className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Reason</label>
        <input type="text" value="Product Returned" className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" />
      </div>
    </div>

    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 md:mb-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Product / Service</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">HSN/SAC</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Quantity</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Rate</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">Product B</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">2002</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">2.00</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 3,000.00</td>
              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">₹ 3,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
      <div className="w-full lg:w-1/2">
        <h3 className="text-base md:text-lg font-medium text-gray-800 mb-3">Subtotal</h3>
        <textarea 
          placeholder="Enter any additional information..."
          className="w-full p-2 md:p-3 border border-gray-300 rounded-md h-20 md:h-24 resize-none text-sm md:text-base"
        />
      </div>
      <div className="w-full lg:w-1/3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm md:text-base text-gray-600">Subtotal</span>
            <span className="text-sm md:text-base font-medium">₹ 3,000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm md:text-base text-gray-600">IGST @ 18%</span>
            <span className="text-sm md:text-base font-medium">350.00</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-base md:text-lg font-semibold">
            <span>Total</span>
            <span>₹ 2,360.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CreditNote;
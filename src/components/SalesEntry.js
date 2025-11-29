import React from 'react';

const SalesEntry = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">Sales Entry</h1>
      <div className="flex gap-3">
        <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save and Print
        </button>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
        <select className="w-full p-3 border border-gray-300 rounded-md">
          <option>ABC Enterprises</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice No.</label>
        <input type="text" value="INV. 03001" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Order No.</label>
        <input type="text" placeholder="Optional" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
        <input type="text" value="04/25/2024" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
        <input type="text" value="03/25/2024" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
      <textarea 
        placeholder="Enter notes..."
        className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none"
      />
    </div>

    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product / Service</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">HSN/SAC</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">Product A</td>
            <td className="px-4 py-3">1001</td>
            <td className="px-4 py-3">1.00</td>
            <td className="px-4 py-3">2,000.00</td>
            <td className="px-4 py-3">₹ 880.00</td>
            <td className="px-4 py-3">₹ 2,000</td>
          </tr>
        </tbody>
      </table>
      <div className="p-4 border-t">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          + Add Line
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Attach File</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">📄</div>
          <p className="text-gray-500">Drop file here or click to upload</p>
        </div>
      </div>
      <div>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹ 2,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">IGST @ 18%</span>
            <span className="font-medium">₹ 360</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₹ 2,360</span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
      <textarea 
        placeholder="Enter terms-and-conditions..."
        className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
      />
    </div>
  </div>
);

export default SalesEntry;
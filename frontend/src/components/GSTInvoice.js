import React from 'react';

const GSTInvoice = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">GST Invoice</h1>
      <div className="flex gap-3">
        <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save
        </button>
      </div>
    </div>

    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">ABC Enterprises</h2>
      <p className="text-gray-600">125 Business St.</p>
      <p className="text-gray-600">Bangalore, Karnataka.-550001</p>
      <p className="text-gray-600">GSTIN:23ABCE1234F1Z1</p>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice No.</label>
        <input type="text" value="INV-00001" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
        <input type="text" value="25 Apr. 2024" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Order No.</label>
        <input type="text" value="12345" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
        <input type="text" value="25 May 2024" className="w-full p-3 border border-gray-300 rounded-md" />
      </div>
    </div>

    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product / Service</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">HSN/SAC</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">Product A</td>
            <td className="px-4 py-3">1001</td>
            <td className="px-4 py-3">1.00</td>
            <td className="px-4 py-3">₹ 2,000.00</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Total</h3>
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Customer Notes</h4>
          <textarea 
            placeholder="Enter terms and conditions..."
            className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
          />
        </div>
      </div>
      <div className="w-1/3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹ 2,009.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">IGST @ 18%</span>
            <span className="font-medium">₹ 360.00</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₹ 2,360.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default GSTInvoice;

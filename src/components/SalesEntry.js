import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';

const SalesEntry = () => {
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'PO-001',
      customer: 'ABC Enterprises',
      amount: '₹ 25,000',
      items: [{ name: 'Product A', qty: 5, rate: 5000 }],
      date: '2024-01-15',
      status: 'pending'
    },
    {
      id: 'PO-002', 
      customer: 'XYZ Corp',
      amount: '₹ 15,000',
      items: [{ name: 'Product B', qty: 3, rate: 5000 }],
      date: '2024-01-16',
      status: 'pending'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [autoFillData, setAutoFillData] = useState(null);

  // Mock function to simulate receiving purchase order
  const handleAutoFillFromOrder = (order) => {
    setAutoFillData({
      customer: order.customer,
      orderNo: order.id,
      items: order.items,
      amount: order.amount
    });
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
  <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
    {/* Notification */}
    {showNotification && (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 text-sm">Sales entry auto-filled from purchase order!</span>
      </div>
    )}

    {/* Pending Orders Alert */}
    {pendingOrders.length > 0 && (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Pending Purchase Orders ({pendingOrders.length})</h3>
        </div>
        <div className="space-y-2">
          {pendingOrders.map(order => (
            <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-white rounded border">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">{order.id}</span>
                  <span className="text-sm text-gray-600">- {order.customer}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{order.date} • {order.amount}</div>
              </div>
              <button 
                onClick={() => handleAutoFillFromOrder(order)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Auto Fill
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-800">Sales Entry</h1>
      <div className="flex gap-2 md:gap-3">
        <button className="px-4 md:px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base">
          Cancel
        </button>
        <button className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base">
          Save
        </button>
        <button className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base">
          Save and Print
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Customer</label>
        <select className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base">
          <option>{autoFillData?.customer || 'ABC Enterprises'}</option>
        </select>
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Invoice No.</label>
        <input type="text" value="INV. 03001" className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Order No.</label>
        <input 
          type="text" 
          value={autoFillData?.orderNo || ''}
          placeholder="Optional" 
          className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" 
        />
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
};

export default SalesEntry;
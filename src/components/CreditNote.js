import React, { useState } from 'react';
import { Bell, CheckCircle, RotateCcw } from 'lucide-react';

const CreditNote = () => {
  const [returnRequests, setReturnRequests] = useState([
    {
      id: 'RET-001',
      customer: 'XYZ Ltd',
      originalInvoice: 'INV-00250',
      amount: '₹ 6,000',
      items: [{ name: 'Product B', qty: 2, rate: 3000 }],
      reason: 'Product Returned',
      date: '2024-01-15'
    }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [autoFillData, setAutoFillData] = useState(null);

  const handleAutoFillFromReturn = (returnReq) => {
    setAutoFillData({
      customer: returnReq.customer,
      referenceNo: returnReq.originalInvoice,
      reason: returnReq.reason,
      items: returnReq.items,
      amount: returnReq.amount
    });
    setReturnRequests(prev => prev.filter(r => r.id !== returnReq.id));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
  <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
    {/* Notification */}
    {showNotification && (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 text-sm">Credit note auto-filled from return request!</span>
      </div>
    )}

    {/* Return Requests Alert */}
    {returnRequests.length > 0 && (
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-orange-600" />
          <h3 className="font-medium text-orange-800">Pending Return Requests ({returnRequests.length})</h3>
        </div>
        <div className="space-y-2">
          {returnRequests.map(returnReq => (
            <div key={returnReq.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-white rounded border">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">{returnReq.id}</span>
                  <span className="text-sm text-gray-600">- {returnReq.customer}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{returnReq.originalInvoice} • {returnReq.amount} • {returnReq.reason}</div>
              </div>
              <button 
                onClick={() => handleAutoFillFromReturn(returnReq)}
                className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
              >
                Auto Fill
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
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
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{autoFillData?.customer || 'XYZ Ltd'}</h2>
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
        <input 
          type="text" 
          value={autoFillData?.referenceNo || 'INV-00250'} 
          className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" 
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Reason</label>
        <input 
          type="text" 
          value={autoFillData?.reason || 'Product Returned'} 
          className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base" 
        />
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
};

export default CreditNote;
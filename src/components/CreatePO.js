import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';

const CreatePO = () => {
  const [items, setItems] = useState([
    { name: 'Dell Laptop', hsn: '8471', quantity: 5, rate: 50000, discount: 10 }
  ]);

  const addItem = () => {
    setItems([...items, { name: '', hsn: '', quantity: 0, rate: 0, discount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      return sum + (itemTotal * item.discount / 100);
    }, 0);
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubTotal() - calculateDiscount();
    return afterDiscount * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubTotal() - calculateDiscount() + calculateTax();
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Purchase Order</h1>
      </div>

      {/* Supplier and Dates */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Supplier</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg">
            <option>ABC Enterprises</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PO Date</label>
          <div className="relative">
            <input type="text" value="2024-04-16" className="w-full p-3 border border-gray-300 rounded-lg" />
            <Calendar className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Date</label>
          <input type="text" value="2024-04-25" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
      </div>

      {/* Item Details and Summary Side by Side */}
      <div className="flex gap-8 mb-8">
        {/* Item Details */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Item Details</h2>
          
          <div className="grid grid-cols-12 gap-4 mb-3 text-sm font-medium text-gray-600">
            <div className="col-span-3">Item Name</div>
            <div className="col-span-2">HSN/SAC</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2">Discount</div>
            <div className="col-span-1">Action</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 mb-3">
              <input 
                type="text" 
                value={item.name}
                className="col-span-3 p-3 border border-gray-300 rounded-lg"
                placeholder="Item Name"
              />
              <input 
                type="text" 
                value={item.hsn}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="HSN/SAC"
              />
              <input 
                type="number" 
                value={item.quantity}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Qty"
              />
              <input 
                type="text" 
                value={`₹ ${item.rate.toLocaleString()}`}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Rate"
              />
              <input 
                type="text" 
                value={`${item.discount} %`}
                className="col-span-2 p-3 border border-gray-300 rounded-lg"
                placeholder="Discount"
              />
              <button 
                onClick={() => removeItem(idx)}
                className="col-span-1 p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                disabled={items.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button 
            onClick={addItem}
            className="flex items-center gap-2 text-blue-600 font-medium mt-4 hover:text-blue-700"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Summary */}
        <div className="w-80">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Sub Total</span>
              <span className="font-semibold">₹ {calculateSubTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹ {calculateDiscount().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹ {calculateTax().toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total Amount</span>
              <span>₹ {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create
        </button>
      </div>
    </div>
  );
};

export default CreatePO;

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar, Plus, X, Trash2 } from 'lucide-react';

const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState('All (36)');
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const ordersData = [
    { poNumber: 'PO-0082', vendor: 'GerernLane', orderDate: '30 April', expect: '29 Apr', status: 'Open', amount: '₹2,500' },
    { poNumber: 'PO-0081', vendor: 'Acme.tam', orderDate: '24 May', expect: '28 Apr', status: 'Completed', amount: '₹2,300' },
    { poNumber: 'PO-0080', vendor: 'Tarnikvoish', orderDate: '16 May', expect: '29 Apr', status: 'Completed', amount: '₹4,000' },
    { poNumber: 'PO-0075', vendor: 'Sunetcop', orderDate: '10 Jun', expect: '11 Mar', status: 'Draft', amount: '₹3,000' },
    { poNumber: 'PO-0074', vendor: 'Stotzbunner', orderDate: '16 Jul', expect: '28 Mar', status: 'Draft', amount: '₹9,500' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-green-400 text-white';
      case 'Completed': return 'bg-gray-400 text-white';
      case 'Draft': return 'bg-gray-300 text-gray-800';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Purchase Orders</h1>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium">
            Cancel Order
          </button>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 text-white rounded-xl p-6">
          <div className="text-lg mb-2">Open</div>
          <div className="text-5xl font-bold">5</div>
        </div>
        <div className="bg-blue-400 text-white rounded-xl p-6">
          <div className="text-lg mb-2">Completed</div>
          <div className="text-5xl font-bold">24</div>
        </div>
        <div className="bg-gray-200 text-gray-700 rounded-xl p-6">
          <div className="text-lg mb-2">Draft</div>
          <div className="text-5xl font-bold">2</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="px-4 py-2 rounded-lg font-medium text-gray-600">
            Status
          </button>
          <button 
            onClick={() => setActiveFilter('All (36)')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'All (36)' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All (36)
          </button>
          <button 
            onClick={() => setActiveFilter('Open')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Open' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Open
          </button>
          <button 
            onClick={() => setActiveFilter('Completed')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Completed' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setActiveFilter('In Progress')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'In Progress' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setActiveFilter('Draft')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'Draft' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Draft
          </button>
          <button 
            onClick={() => setActiveFilter('On Hold')}
            className={`px-4 py-2 rounded-lg ${activeFilter === 'On Hold' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            On Hold
          </button>
          <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
            Sendor
          </button>
          <div className="ml-auto">
            <Search size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">PO Number</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Vendor</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Order Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Expect</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-base">Status</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900 text-base">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((order, index) => (
              <tr key={order.poNumber} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-5 px-6">
                  <span className="text-blue-600 font-medium">{order.poNumber}</span>
                </td>
                <td className="py-5 px-6 text-gray-900">{order.vendor}</td>
                <td className="py-5 px-6 text-gray-900">{order.orderDate}</td>
                <td className="py-5 px-6 text-gray-900">{order.expect}</td>
                <td className="py-5 px-6">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-5 px-6 text-right font-semibold text-gray-900">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">2</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">3</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">4</button>
        <button className="px-4 py-2 hover:bg-white rounded-lg text-gray-700">5</button>
        <button className="p-2 rounded-lg hover:bg-white">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Create PO Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Purchase Order</h1>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
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
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
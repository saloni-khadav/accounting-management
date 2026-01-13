import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar, Plus, X, Trash2 } from 'lucide-react';

const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState('All (36)');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [items, setItems] = useState([
    { name: 'Dell Laptop', hsn: '8471', quantity: 5, rate: 50000, discount: 10, cgstRate: 9, sgstRate: 9, igstRate: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { name: '', hsn: '', quantity: 0, rate: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 0 }]);
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

  const calculateCGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.cgstRate || 0)) / 100;
    }, 0);
  };

  const calculateSGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.sgstRate || 0)) / 100;
    }, 0);
  };

  const calculateIGST = () => {
    return items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100);
      return sum + (afterDiscount * (item.igstRate || 0)) / 100;
    }, 0);
  };

  const calculateTax = () => {
    return calculateCGST() + calculateSGST() + calculateIGST();
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
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-48">Item Name</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">HSN/SAC</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">Qty</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-28">Rate</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-20">Discount%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">CGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">SGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">IGST%</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-24">Total</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2 w-48">
                              <input 
                                type="text" 
                                value={item.name}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].name = e.target.value;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-44"
                                placeholder="Enter item name"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="text" 
                                value={item.hsn}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].hsn = e.target.value;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="HSN/SAC"
                              />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].quantity = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-20"
                                placeholder="Qty"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2 w-28">
                              <input 
                                type="number" 
                                value={item.rate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].rate = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm min-w-24"
                                placeholder="Rate"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.discount}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].discount = parseInt(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.cgstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].cgstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="9"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.sgstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].sgstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="9"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input 
                                type="number" 
                                value={item.igstRate}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].igstRate = parseFloat(e.target.value) || 0;
                                  setItems(newItems);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                                min="0"
                                max="28"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm font-medium">
                              ₹{((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100) + 
                                 (((item.quantity * item.rate) - ((item.quantity * item.rate) * item.discount / 100)) * (item.cgstRate + item.sgstRate + item.igstRate) / 100)).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <button 
                                onClick={() => removeItem(idx)}
                                className="text-red-600 hover:text-red-800"
                                disabled={items.length === 1}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                      <span>CGST</span>
                      <span>₹ {calculateCGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST</span>
                      <span>₹ {calculateSGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST</span>
                      <span>₹ {calculateIGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax</span>
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
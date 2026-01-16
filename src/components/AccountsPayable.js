import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, X } from 'lucide-react';

const AccountsPayable = () => {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    invoiceNumber: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Payment Data:', formData);
    alert('Payment recorded successfully!');
    setIsPaymentFormOpen(false);
    setFormData({
      vendor: '',
      invoiceNumber: '',
      amount: '',
      paymentDate: '',
      paymentMethod: 'Bank Transfer',
      referenceNumber: '',
      description: ''
    });
  };
  const purchaseData = [
    { month: 'Jan', purchases: 35000, payments: 28000 },
    { month: 'May', purchases: 42000, payments: 38000 },
    { month: 'Jun', purchases: 48000, payments: 45000 }
  ];

  const overduePayables = [
    { vendor: 'Bright Solutions', dueDate: '15-Jan-2024', amount: '$13,040', status: 'Overdue' },
    { vendor: 'Anderson Supplies', dueDate: '20-Jan-2024', amount: '$30,840', status: 'Overdue' },
    { vendor: 'Northwest Traders', dueDate: '25-Jan-2024', amount: '$8,750', status: 'Overdue' },
    { vendor: 'Metro Manufacturing', dueDate: '28-Jan-2024', amount: '$18,640', status: 'Overdue' },
    { vendor: 'Summit Enterprises', dueDate: '30-Jan-2024', amount: '$12,500', status: 'Overdue' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts Payable</h1>
        <button
          onClick={() => {
            console.log('Button clicked!');
            setIsPaymentFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Payment
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Payable</h3>
          <p className="text-2xl font-bold text-gray-900">$45,200</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Overdue Payable</h3>
          <p className="text-2xl font-bold text-red-600">$12,800</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Due in 30 Days</h3>
          <p className="text-2xl font-bold text-yellow-600">$24,600</p>
        </div>
      </div>

      {/* Chart and Aging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Purchases & Payments Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchases & Payments</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'purchases' ? 'Purchases' : 'Payments']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="purchases" fill="#3b82f6" name="Purchases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payments" fill="#10b981" name="Payments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payable Aging */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payable Aging</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Over 80 Days</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Anderson Supplies</div>
                  <div className="text-gray-600">$30,840</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Metro Manufacturing</div>
                  <div className="text-gray-600">$18,640</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">1–30 Days</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Bright Solutions</div>
                  <div className="text-gray-600">$13,040</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Global Distributors</div>
                  <div className="text-gray-600">$21,600</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Payables Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Payables</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Vendor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {overduePayables.map((payable, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{payable.vendor}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{payable.dueDate}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{payable.amount}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {payable.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Overdue Payables Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Payables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900">Bright Solutions</div>
            <div className="text-gray-600">Due: 15-Jan-2024</div>
            <div className="font-semibold text-red-600">$13,040</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Anderson Supplies</div>
            <div className="text-gray-600">Due: 20-Jan-2024</div>
            <div className="font-semibold text-red-600">$30,840</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Northwest Traders</div>
            <div className="text-gray-600">Due: 25-Jan-2024</div>
            <div className="font-semibold text-red-600">$8,750</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900">Metro Manufacturing</div>
            <div className="text-gray-600">Due: 28-Jan-2024</div>
            <div className="font-semibold text-red-600">$18,640</div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {isPaymentFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Record New Payment</h2>
              <button
                onClick={() => setIsPaymentFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vendor</option>
                    <option value="Bright Solutions">Bright Solutions</option>
                    <option value="Anderson Supplies">Anderson Supplies</option>
                    <option value="Northwest Traders">Northwest Traders</option>
                    <option value="Metro Manufacturing">Metro Manufacturing</option>
                    <option value="Summit Enterprises">Summit Enterprises</option>
                    <option value="Global Distributors">Global Distributors</option>
                  </select>
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="INV-2024-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT/RTGS">NEFT/RTGS</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference/Transaction Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    placeholder="TXN123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description/Notes
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPayable;
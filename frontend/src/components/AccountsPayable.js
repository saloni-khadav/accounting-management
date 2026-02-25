import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { X, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

const AccountsPayable = () => {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    invoiceNumber: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    description: ''
  });

  useEffect(() => {
    fetchBills();
    fetchPayments();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/bills');
      if (response.ok) {
        const data = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments');
        let paymentsData = [];
        if (paymentsResponse.ok) {
          paymentsData = await paymentsResponse.json();
        }
        
        // Calculate paid amounts for each bill and filter only approved bills
        const billsWithPaidAmounts = data
          .filter(bill => bill.approvalStatus === 'approved') // Only approved bills
          .map(bill => {
          const billPayments = paymentsData.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          return {
            ...bill,
            paidAmount: totalPaid
          };
        });
        
        setBills(billsWithPaidAmounts);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
    setLoading(false);
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'Completed'
      };
      
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        alert('Payment recorded successfully!');
        fetchPayments();
        fetchBills();
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
      } else {
        const errorData = await response.json();
        alert(`Error recording payment: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording payment');
    }
  };
  // Function to calculate bill status based on payment and due date
  const calculateBillStatus = (bill) => {
    const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
    const paidAmount = bill.paidAmount || 0;
    const currentDate = new Date();
    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
    
    // Payment status takes priority
    if (paidAmount >= netPayable) {
      return 'Fully Paid';
    }
    
    if (paidAmount > 0 && paidAmount < netPayable) {
      return 'Partially Paid';
    }
    
    // Due date status only when no payment is made (paidAmount === 0)
    if (paidAmount === 0 && dueDate) {
      const timeDiff = dueDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) {
        return 'Overdue';
      } else if (daysDiff <= 7) {
        return 'Due Soon';
      } else {
        return 'Not Paid';
      }
    }
    
    // Default status when no due date is set
    return 'Not Paid';
  };

  // Calculate metrics from real data using dynamic status
  const totalPayable = bills.reduce((sum, bill) => {
    const netPayable = bill.grandTotal - (bill.tdsAmount || 0);
    const status = calculateBillStatus(bill);
    return sum + (status !== 'Fully Paid' ? netPayable : 0);
  }, 0);

  const overduePayable = bills.reduce((sum, bill) => {
    const netPayable = bill.grandTotal - (bill.tdsAmount || 0);
    const status = calculateBillStatus(bill);
    return sum + (status === 'Overdue' ? netPayable : 0);
  }, 0);

  const dueSoonPayable = bills.reduce((sum, bill) => {
    const netPayable = bill.grandTotal - (bill.tdsAmount || 0);
    const status = calculateBillStatus(bill);
    return sum + (status === 'Due Soon' ? netPayable : 0);
  }, 0);

  // Get overdue bills for table
  const overduePayables = bills
    .filter(bill => calculateBillStatus(bill) === 'Overdue')
    .map(bill => ({
      vendor: bill.vendorName,
      dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
      amount: `₹${(bill.grandTotal - (bill.tdsAmount || 0)).toLocaleString('en-IN')}`,
      status: 'Overdue'
    }));

  // Generate chart data from bills and payments
  const getMonthlyData = () => {
    const monthlyData = {};
    
    // Process bills (purchases)
    bills.forEach(bill => {
      const month = new Date(bill.billDate).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, purchases: 0, payments: 0 };
      }
      monthlyData[month].purchases += bill.grandTotal || 0;
    });
    
    // Process payments
    payments.forEach(payment => {
      const month = new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, purchases: 0, payments: 0 };
      }
      monthlyData[month].payments += parseFloat(payment.amount) || 0;
    });
    
    return Object.values(monthlyData).slice(0, 6); // Last 6 months
  };

  const purchaseData = getMonthlyData();

  // Get aging data
  const getAgingData = () => {
    const days1to30 = [];
    const days31to90 = [];
    const days91to180 = [];
    const over180Days = [];
    
    bills.forEach(bill => {
      const status = calculateBillStatus(bill);
      if (status === 'Overdue' && bill.dueDate) {
        const daysPastDue = Math.floor((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24));
        const netPayable = bill.grandTotal - (bill.tdsAmount || 0);
        
        if (daysPastDue >= 1 && daysPastDue <= 30) {
          days1to30.push({
            vendor: bill.vendorName,
            amount: `₹${netPayable.toLocaleString('en-IN')}`
          });
        } else if (daysPastDue >= 31 && daysPastDue <= 90) {
          days31to90.push({
            vendor: bill.vendorName,
            amount: `₹${netPayable.toLocaleString('en-IN')}`
          });
        } else if (daysPastDue >= 91 && daysPastDue <= 180) {
          days91to180.push({
            vendor: bill.vendorName,
            amount: `₹${netPayable.toLocaleString('en-IN')}`
          });
        } else if (daysPastDue > 180) {
          over180Days.push({
            vendor: bill.vendorName,
            amount: `₹${netPayable.toLocaleString('en-IN')}`
          });
        }
      }
    });
    
    return { 
      days1to30: days1to30.slice(0, 2), 
      days31to90: days31to90.slice(0, 2),
      days91to180: days91to180.slice(0, 2),
      over180Days: over180Days.slice(0, 2)
    };
  };

  const agingData = getAgingData();

  const metricsData = [
    {
      title: 'Total Payable',
      value: `₹${totalPayable.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'primary'
    },
    {
      title: 'Overdue Payable',
      value: `₹${overduePayable.toLocaleString('en-IN')}`,
      icon: AlertTriangle,
      color: 'danger'
    },
    {
      title: 'Due Soon',
      value: `₹${dueSoonPayable.toLocaleString('en-IN')}`,
      icon: Clock,
      color: 'warning'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
              Accounts Payable
            </h1>
            <p className="text-white text-sm sm:text-base">Manage vendor bills and payments</p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {metricsData.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))}
        </div>

        {/* Chart and Aging Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {/* Purchases & Payments Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Purchases & Payments</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={purchaseData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="purchases" fill="#3b82f6" name="Purchases" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="payments" fill="#10b981" name="Payments" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Payable Aging */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
              <h3 className="text-base sm:text-lg font-semibold text-white">Payable Aging</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3">1–30 Days</h4>
                  <div className="space-y-3">
                    {agingData.days1to30.length > 0 ? agingData.days1to30.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{item.vendor}</div>
                        <div className="text-gray-600">{item.amount}</div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">No bills</div>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-3">31–90 Days</h4>
                  <div className="space-y-3">
                    {agingData.days31to90.length > 0 ? agingData.days31to90.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{item.vendor}</div>
                        <div className="text-gray-600">{item.amount}</div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">No bills</div>
                    )}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-700 mb-3">91–180 Days</h4>
                  <div className="space-y-3">
                    {agingData.days91to180.length > 0 ? agingData.days91to180.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{item.vendor}</div>
                        <div className="text-gray-600">{item.amount}</div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">No bills</div>
                    )}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-3">180+ Days</h4>
                  <div className="space-y-3">
                    {agingData.over180Days.length > 0 ? agingData.over180Days.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{item.vendor}</div>
                        <div className="text-gray-600">{item.amount}</div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">No bills</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Payables Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">Overdue Payables</h3>
              <span className="text-sm text-blue-100 bg-blue-500 px-3 py-1 rounded-full">{overduePayables.length} Bills</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Vendor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Due Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : overduePayables.length > 0 ? (
                  overduePayables.map((payable, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">{payable.vendor}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-medium">{payable.dueDate}</td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{payable.amount}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                          {payable.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No overdue payables</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Overdue Payables Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
            <h3 className="text-base sm:text-lg font-semibold text-white">Overdue Payables Summary</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {overduePayables.length > 0 ? (
                overduePayables.slice(0, 4).map((payable, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-100 hover:bg-red-100 transition-colors">
                    <div className="font-semibold text-gray-900 mb-1">{payable.vendor}</div>
                    <div className="text-sm text-gray-600 mb-2">Due: {payable.dueDate}</div>
                    <div className="text-lg font-bold text-red-600">{payable.amount}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No overdue payables
                </div>
              )}
            </div>
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
                    {[...new Set(bills.map(bill => bill.vendorName))].map((vendorName, index) => (
                      <option key={index} value={vendorName}>{vendorName}</option>
                    ))}
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

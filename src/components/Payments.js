import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, X } from 'lucide-react';

const Payments = () => {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ completed: 0, pending: 0, upcoming: 0 });
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    vendor: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: '',
    tdsSection: '',
    tdsAmount: '',
    tdsPercentage: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    description: '',
    billId: '' // Add billId to track which bill this payment is for
  });

  const tdsSection = [
    { code: '194H', rate: 5, description: 'Commission or Brokerage' },
    { code: '194C', rate: 1, description: 'Individual/HUF' },
    { code: '194C', rate: 2, description: 'Company' },
    { code: '194J(a)', rate: 2, description: 'Technical Services' },
    { code: '194J(b)', rate: 10, description: 'Professional' },
    { code: '194I(a)', rate: 2, description: 'Rent - Plant & Machinery' },
    { code: '194I(b)', rate: 10, description: 'Rent - Land & Building' },
    { code: '194A', rate: 10, description: 'Interest other than on Securities' }
  ];

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchBillsByVendor = async (vendorName) => {
    try {
      console.log('Fetching bills for vendor:', vendorName);
      const response = await fetch(`http://localhost:5001/api/bills?vendorName=${encodeURIComponent(vendorName)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched bills:', data);
        setBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/payments/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setStats({
          completed: data.completed,
          pending: data.pending,
          upcoming: data.upcoming
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vendor') {
      setVendorSearchTerm(value);
      setShowVendorDropdown(true);
    }
    
    if (name === 'tdsSection') {
      const selectedSection = tdsSection.find(s => s.code === value);
      if (selectedSection && formData.amount) {
        const calculatedTds = ((formData.amount * selectedSection.rate) / 100).toFixed(2);
        setFormData(prev => ({
          ...prev,
          tdsSection: value,
          tdsPercentage: selectedSection.rate,
          tdsAmount: calculatedTds
        }));
        return;
      }
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate TDS amount when percentage changes
      if (name === 'tdsPercentage' && prev.amount) {
        updated.tdsAmount = ((prev.amount * value) / 100).toFixed(2);
      }
      // Auto-calculate TDS percentage when amount changes
      if (name === 'tdsAmount' && prev.amount) {
        updated.tdsPercentage = ((value / prev.amount) * 100).toFixed(2);
      }
      // Recalculate TDS when amount changes and section is selected
      if (name === 'amount' && prev.tdsSection) {
        const selectedSection = tdsSection.find(s => s.code === prev.tdsSection);
        if (selectedSection) {
          updated.tdsAmount = ((value * selectedSection.rate) / 100).toFixed(2);
          updated.tdsPercentage = selectedSection.rate;
        }
      }
      
      return updated;
    });
  };

  const handleVendorSelect = async (vendorName) => {
    setFormData(prev => ({ ...prev, vendor: vendorName, invoiceNumber: '', invoiceDate: '' }));
    setVendorSearchTerm(vendorName);
    setShowVendorDropdown(false);
    await fetchBillsByVendor(vendorName);
    setShowBillDropdown(true);
  };

  const handleBillSelect = (bill) => {
    console.log('Selected bill:', bill); // Debug log
    const remainingAmount = (bill.grandTotal || 0) - (bill.paidAmount || 0);
    setFormData(prev => ({
      ...prev,
      billId: bill._id, // Store the bill ID
      invoiceNumber: bill.billNumber || bill.billId || bill.invoiceNumber,
      invoiceDate: bill.billDate ? bill.billDate.split('T')[0] : '',
      amount: remainingAmount // Set to remaining amount, user can modify for partial payment
    }));
    setShowBillDropdown(false);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes((vendorSearchTerm || formData.vendor || '').toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes((vendorSearchTerm || formData.vendor || '').toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const netAmount = parseFloat(formData.amount) - (parseFloat(formData.tdsAmount) || 0);
      
      // Auto-determine status based on payment date
      const paymentDate = new Date(formData.paymentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      paymentDate.setHours(0, 0, 0, 0);
      
      let status;
      if (paymentDate > today) {
        status = 'Upcoming';
      } else if (paymentDate.getTime() === today.getTime()) {
        status = 'Completed';
      } else {
        status = 'Pending';
      }
      
      const payload = {
        ...formData,
        netAmount,
        status,
        amount: parseFloat(formData.amount),
        tdsAmount: parseFloat(formData.tdsAmount) || 0,
        tdsPercentage: parseFloat(formData.tdsPercentage) || 0
      };
      
      const response = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        alert('Payment recorded successfully!');
        setIsPaymentFormOpen(false);
        setFormData({
          vendor: '',
          invoiceNumber: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          amount: '',
          tdsSection: '',
          tdsAmount: '',
          tdsPercentage: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Bank Transfer',
          referenceNumber: '',
          description: '',
          billId: ''
        });
        setVendorSearchTerm('');
        fetchPayments();
        fetchStats();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Error recording payment'));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording payment');
    }
  };
  
  const paymentsData = payments.map(payment => ({
    paymentNo: payment.paymentNumber,
    date: new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    vendor: payment.vendor,
    amount: `₹${payment.netAmount.toLocaleString('en-IN')}`,
    color: payment.status === 'Completed' ? 'bg-green-100' : 'bg-red-100'
  }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
        <button 
          onClick={() => {
            setFormData(prev => ({ ...prev, paymentDate: new Date().toISOString().split('T')[0] }));
            setIsPaymentFormOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          New Payment
        </button>
      </div>

      {/* Payments Summary Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Upcoming Payments</h3>
            <p className="text-4xl font-bold text-gray-900">₹{stats.upcoming.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Completed Payments</h3>
            <p className="text-4xl font-bold text-gray-900">₹{stats.completed.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-700 mb-2">Pending Payments</h3>
            <p className="text-4xl font-bold text-gray-900">₹{stats.pending.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Payment #</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Payment Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-base">Vendor</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900 text-base">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : paymentsData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                paymentsData.map((payment) => (
                <tr key={payment.paymentNo} className="border-b border-gray-100">
                  <td className="py-5 px-4 text-gray-900 font-medium">{payment.paymentNo}</td>
                  <td className="py-5 px-4 text-gray-900">{payment.date}</td>
                  <td className="py-5 px-4 text-gray-900">{payment.vendor}</td>
                  <td className="py-5 px-4 text-right">
                    <span className={`px-4 py-2 rounded-lg font-semibold ${payment.color}`}>
                      {payment.amount}
                    </span>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium">1</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">2</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">3</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">4</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">5</button>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="vendor"
                      value={vendorSearchTerm || formData.vendor}
                      onChange={handleInputChange}
                      onFocus={() => setShowVendorDropdown(true)}
                      required
                      placeholder="Search or select vendor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="off"
                    />
                    {showVendorDropdown && filteredVendors.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredVendors.map((vendor) => (
                          <div
                            key={vendor._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleVendorSelect(vendor.vendorName);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                            <div className="text-sm text-gray-500">{vendor.vendorCode}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      onFocus={() => formData.vendor && setShowBillDropdown(true)}
                      onClick={() => formData.vendor && setShowBillDropdown(true)}
                      required
                      placeholder="Select from bills or enter manually"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showBillDropdown && bills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {bills.filter(bill => bill.approvalStatus === 'approved' && bill.vendorName === formData.vendor && bill.status !== 'Fully Paid').length > 0 ? (
                          bills.filter(bill => bill.approvalStatus === 'approved' && bill.vendorName === formData.vendor && bill.status !== 'Fully Paid').map((bill) => {
                            const remainingAmount = (bill.grandTotal || 0) - (bill.paidAmount || 0);
                            return (
                            <div
                              key={bill._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleBillSelect(bill);
                                setShowBillDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{bill.billNumber || 'No Bill Number'}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(bill.billDate).toLocaleDateString()} | Total: ₹{(bill.grandTotal || 0).toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-gray-600">
                                Status: <span className={`font-medium ${
                                  bill.status === 'Fully Paid' ? 'text-green-600' :
                                  bill.status === 'Partially Paid' ? 'text-yellow-600' :
                                  bill.status === 'Overdue' ? 'text-red-600' :
                                  bill.status === 'Due Soon' ? 'text-orange-600' :
                                  'text-blue-600'
                                }`}>{bill.status}</span> | Remaining: ₹{remainingAmount.toLocaleString('en-IN')}
                              </div>
                            </div>
                          )})
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No approved bills found for this vendor
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                    {formData.billId && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Remaining: ₹{((bills.find(b => b._id === formData.billId)?.grandTotal || 0) - (bills.find(b => b._id === formData.billId)?.paidAmount || 0)).toLocaleString('en-IN')})
                      </span>
                    )}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TDS Section
                  </label>
                  <select
                    name="tdsSection"
                    value={formData.tdsSection}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select TDS Section</option>
                    {tdsSection.map((section, idx) => (
                      <option key={idx} value={section.code}>
                        {section.code} - {section.rate}% ({section.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TDS Amount
                  </label>
                  <input
                    type="number"
                    name="tdsAmount"
                    value={formData.tdsAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Payment Amount
                  </label>
                  <input
                    type="text"
                    value={formData.amount && formData.tdsAmount ? (parseFloat(formData.amount) - parseFloat(formData.tdsAmount)).toFixed(2) : formData.amount || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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

export default Payments;

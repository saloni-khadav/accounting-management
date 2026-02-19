import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, X, Upload, Paperclip, Download, CreditCard, Clock, CheckCircle, DollarSign } from 'lucide-react';
import MetricsCard from './ui/MetricsCard';

const Payments = () => {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ completed: 0, pending: 0, upcoming: 0 });
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
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
    bankAccount: '',
    referenceNumber: '',
    description: '',
    billId: '', // Add billId to track which bill this payment is for
    attachments: []
  });

  const bankAccounts = [
    { name: 'HDFC Bank - Current Account', code: 'HDFC001', accountNumber: '****1234' },
    { name: 'Axis Bank - Savings Account', code: 'AXIS002', accountNumber: '****5678' },
    { name: 'ICICI Bank - Current Account', code: 'ICICI003', accountNumber: '****9012' },
    { name: 'SBI - Current Account', code: 'SBI004', accountNumber: '****3456' },
    { name: 'Kotak Mahindra Bank', code: 'KOTAK005', accountNumber: '****7890' },
    { name: 'Punjab National Bank', code: 'PNB006', accountNumber: '****2345' },
    { name: 'Bank of Baroda', code: 'BOB007', accountNumber: '****6789' },
    { name: 'Canara Bank', code: 'CANARA008', accountNumber: '****0123' }
  ];

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
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      console.log('User data:', userData); // Debug log
      setUserRole(userData.user?.role || userData.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/vendors');
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
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/bills?vendorName=${encodeURIComponent(vendorName)}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments');
        let payments = [];
        if (paymentsResponse.ok) {
          payments = await paymentsResponse.json();
        }
        
        // Fetch credit/debit notes to calculate adjustments
        const creditDebitResponse = await fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes/reconciliation');
        let creditDebitNotes = [];
        if (creditDebitResponse.ok) {
          creditDebitNotes = await creditDebitResponse.json();
        }
        
        // Calculate paid amounts and credit/debit adjustments for each bill
        const billsWithAdjustments = data.map(bill => {
          const billPayments = payments.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          // Calculate credit/debit note adjustments for this bill
          const billCreditDebitNotes = creditDebitNotes.filter(note => 
            note.vendorName === vendorName &&
            note.originalInvoiceNumber === (bill.billNumber || bill.invoiceNumber) &&
            note.approvalStatus === 'approved'
          );
          
          const totalCreditAmount = billCreditDebitNotes
            .filter(note => note.type === 'Credit Note')
            .reduce((sum, note) => sum + (note.grandTotal || 0), 0);
          
          const totalDebitAmount = billCreditDebitNotes
            .filter(note => note.type === 'Debit Note')
            .reduce((sum, note) => sum + (note.grandTotal || 0), 0);
          
          const netCreditDebitAdjustment = totalCreditAmount - totalDebitAmount;
          
          return {
            ...bill,
            paidAmount: totalPaid,
            creditDebitAdjustment: netCreditDebitAdjustment
          };
        });
        
        console.log('Fetched bills with adjustments:', billsWithAdjustments);
        setBills(billsWithAdjustments);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments');
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
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments/stats/summary');
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
    
    if (name === 'bankAccount') {
      setBankSearchTerm(value);
      setShowBankDropdown(true);
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
    const netPayableAmount = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
    const adjustedAmount = netPayableAmount - (bill.creditDebitAdjustment || 0);
    const remainingAmount = adjustedAmount - (bill.paidAmount || 0);
    setFormData(prev => ({
      ...prev,
      billId: bill._id, // Store the bill ID
      invoiceNumber: bill.billNumber || bill.billId || bill.invoiceNumber,
      invoiceDate: bill.billDate ? bill.billDate.split('T')[0] : '',
      amount: remainingAmount // Set to adjusted remaining amount
    }));
    setShowBillDropdown(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleBankSelect = (bankName) => {
    setFormData(prev => ({ ...prev, bankAccount: bankName }));
    setBankSearchTerm(bankName);
    setShowBankDropdown(false);
  };

  const filteredBanks = bankAccounts.filter(bank =>
    bank.name.toLowerCase().includes((bankSearchTerm || formData.bankAccount || '').toLowerCase()) ||
    bank.code.toLowerCase().includes((bankSearchTerm || formData.bankAccount || '').toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendorName.toLowerCase().includes((vendorSearchTerm || formData.vendor || '').toLowerCase()) ||
    vendor.vendorCode.toLowerCase().includes((vendorSearchTerm || formData.vendor || '').toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.attachments || formData.attachments.length === 0) {
      alert('At least one attachment is required');
      return;
    }
    
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
        status: 'Pending',
        approvalStatus: 'pending',
        amount: parseFloat(formData.amount),
        tdsAmount: parseFloat(formData.tdsAmount) || 0,
        tdsPercentage: parseFloat(formData.tdsPercentage) || 0
      };
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all payment data fields
      Object.keys(payload).forEach(key => {
        if (key !== 'attachments') {
          formDataToSend.append(key, payload[key] || '');
        }
      });
      
      // Add attachment files
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });
      
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/payments', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (response.ok) {
        const createdPayment = await response.json();
        alert('Payment submitted for approval!');
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
          bankAccount: '',
          referenceNumber: '',
          description: '',
          billId: '',
          attachments: []
        });
        setVendorSearchTerm('');
        setBankSearchTerm('');
        fetchPayments();
        fetchStats();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Error recording payment'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording payment');
    }
  };
  
  const handlePaymentApproval = async (paymentId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/payments/${paymentId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        alert(`Payment ${action === 'approve' ? 'approved and processed' : 'rejected'} successfully!`);
        fetchPayments();
        fetchStats();
        
        // Refresh bills data if payment was approved to update status
        if (action === 'approve') {
          // Trigger a refresh of bills data in parent components
          window.dispatchEvent(new CustomEvent('billsUpdated'));
        }
      }
    } catch (error) {
      alert('Error updating approval status');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-500 text-white';
      case 'Pending Approval': return 'bg-yellow-500 text-white';
      case 'Rejected': return 'bg-red-500 text-white';
      case 'Pending': return 'bg-blue-500 text-white';
      case 'Failed': return 'bg-red-600 text-white';
      case 'Upcoming': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const paymentsData = payments.map(payment => {
    console.log('Payment data:', payment); // Debug log
    
    // Determine display status based on approvalStatus and status
    let displayStatus;
    if (payment.approvalStatus === 'pending') {
      displayStatus = 'Pending Approval';
    } else if (payment.approvalStatus === 'rejected') {
      displayStatus = 'Rejected';
    } else if (payment.approvalStatus === 'approved') {
      displayStatus = payment.status || 'Completed';
    } else {
      // For old payments without approvalStatus
      displayStatus = payment.status || 'Completed';
    }
    
    return {
      paymentNo: payment.paymentNumber,
      date: new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      vendor: payment.vendor,
      invoiceNumber: payment.invoiceNumber || '-',
      referenceNumber: payment.referenceNumber || '-',
      status: displayStatus,
      amount: `₹${payment.netAmount.toLocaleString('en-IN')}`,
      color: displayStatus === 'Completed' ? 'bg-green-100' : 
             displayStatus === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100',
      originalPayment: payment
    };
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <CreditCard className="mr-3" size={28} />
                Payments
              </h1>
              <p className="text-blue-100 mt-1">Manage vendor payments and approvals</p>
            </div>
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, paymentDate: new Date().toISOString().split('T')[0] }));
                setIsPaymentFormOpen(true);
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              New Payment
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Upcoming Payments"
            value={`₹${stats.upcoming.toLocaleString('en-IN')}`}
            icon={Clock}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Completed Payments"
            value={`₹${stats.completed.toLocaleString('en-IN')}`}
            icon={CheckCircle}
            color="success"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Pending Payments"
            value={`₹${stats.pending.toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="primary"
          />
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Payment List</h2>
            <span className="text-blue-100 text-sm">{paymentsData.length} Payments</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Payment # ↓</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Payment Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Invoice Number</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Reference #</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Approval</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Loading payments...</p>
                  </td>
                </tr>
              ) : paymentsData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm">Create your first payment to get started</p>
                  </td>
                </tr>
              ) : (
                paymentsData.map((payment, index) => (
                <tr key={payment.paymentNo} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-4 px-6">
                    <span className="text-blue-600 font-medium">{payment.paymentNo}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{new Date(payment.originalPayment.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  <td className="py-4 px-6 text-gray-900 font-medium">{payment.vendor}</td>
                  <td className="py-4 px-6 text-gray-600">{payment.invoiceNumber}</td>
                  <td className="py-4 px-6 text-gray-600">{payment.referenceNumber}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">{payment.amount}</td>
                  <td className="py-4 px-6 text-center">
                    {userRole === 'manager' && payment.originalPayment.approvalStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePaymentApproval(payment.originalPayment._id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePaymentApproval(payment.originalPayment._id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.originalPayment.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                          payment.originalPayment.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          payment.originalPayment.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.originalPayment.approvalStatus === 'approved' ? 'Approved' : 
                           payment.originalPayment.approvalStatus === 'rejected' ? 'Rejected' : 
                           payment.originalPayment.approvalStatus === 'pending' ? 'Pending' : 'N/A'}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Form Modal */}
      {isPaymentFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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
                        {bills.filter(bill => {
                          const netPayableAmount = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
                          const adjustedAmount = netPayableAmount - (bill.creditDebitAdjustment || 0);
                          const remainingAmount = adjustedAmount - (bill.paidAmount || 0);
                          return bill.approvalStatus === 'approved' && bill.vendorName === formData.vendor && bill.status !== 'Fully Paid' && remainingAmount > 0;
                        }).length > 0 ? (
                          bills.filter(bill => {
                            const netPayableAmount = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
                            const adjustedAmount = netPayableAmount - (bill.creditDebitAdjustment || 0);
                            const remainingAmount = adjustedAmount - (bill.paidAmount || 0);
                            return bill.approvalStatus === 'approved' && bill.vendorName === formData.vendor && bill.status !== 'Fully Paid' && remainingAmount > 0;
                          }).map((bill) => {
                            const netPayableAmount = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
                            const adjustedAmount = netPayableAmount - (bill.creditDebitAdjustment || 0);
                            const remainingAmount = adjustedAmount - (bill.paidAmount || 0);
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
                                {new Date(bill.billDate).toLocaleDateString()} | Net Payable: ₹{netPayableAmount.toLocaleString('en-IN')}
                                {(bill.creditDebitAdjustment || 0) !== 0 && (
                                  <span className="ml-2 text-blue-600">| Adjusted: ₹{adjustedAmount.toLocaleString('en-IN')}</span>
                                )}
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
                            No unpaid bills found for this vendor
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
                        (Remaining: ₹{(() => {
                          const selectedBill = bills.find(b => b._id === formData.billId);
                          if (!selectedBill) return '0';
                          const netPayableAmount = (selectedBill.grandTotal || 0) - (selectedBill.tdsAmount || 0);
                          const adjustedAmount = netPayableAmount - (selectedBill.creditDebitAdjustment || 0);
                          const remainingAmount = adjustedAmount - (selectedBill.paidAmount || 0);
                          return remainingAmount.toLocaleString('en-IN');
                        })()})
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
                    <option value="Check">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT/RTGS">NEFT/RTGS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="bankAccount"
                      value={bankSearchTerm || formData.bankAccount}
                      onChange={handleInputChange}
                      onFocus={() => setShowBankDropdown(true)}
                      required
                      placeholder="Search or select bank account"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="off"
                    />
                    {showBankDropdown && filteredBanks.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredBanks.map((bank) => (
                          <div
                            key={bank.code}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleBankSelect(bank.name);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{bank.name}</div>
                            <div className="text-sm text-gray-500">{bank.code} | {bank.accountNumber}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, PNG, JPG, DOC (MAX. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => downloadFile(file)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

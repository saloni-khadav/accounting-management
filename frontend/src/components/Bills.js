import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Download, Eye, X, Plus, AlertTriangle, Clock, CreditCard, CheckCircle, IndianRupee } from 'lucide-react';
import VendorBill from './VendorBill';
import MetricsCard from './ui/MetricsCard';

const Bills = () => {
  const [activeFilter, setActiveFilter] = useState('Status');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');
  const [viewingBill, setViewingBill] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchUserRole();
    
    // Add event listener for focus to refresh data when user returns to bills page
    const handleFocus = () => {
      fetchBills();
    };
    
    // Add event listener for bills updates from payments
    const handleBillsUpdate = () => {
      fetchBills();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('billsUpdated', handleBillsUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('billsUpdated', handleBillsUpdate);
    };
  }, []);

  const fetchUserRole = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      setUserRole(userData.user.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      const response = await fetch(`${baseUrl}/api/bills`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch(`${baseUrl}/api/payments`);
        let payments = [];
        if (paymentsResponse.ok) {
          payments = await paymentsResponse.json();
        }
        
        // Calculate paid amounts for each bill
        const billsWithPaidAmounts = data.map(bill => {
          const billPayments = payments.filter(payment => 
            payment.billId === bill._id && 
            payment.approvalStatus === 'approved'
          );
          const totalPaid = billPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          
          return {
            ...bill,
            paidAmount: totalPaid
          };
        });
        
        setBills(billsWithPaidAmounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
    setLoading(false);
  };

  const handleSaveBill = async (billData) => {
    // Refresh bills data after save
    await fetchBills();
    setIsFormOpen(false);
    setEditingBill(null);
  };

  const handleCreateNew = () => {
    setEditingBill(null);
    setIsFormOpen(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsFormOpen(true);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
        const response = await fetch(`${baseUrl}/api/bills/${billId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Bill deleted successfully!');
          fetchBills();
        }
      } catch (error) {
        alert('Error deleting bill');
      }
    }
  };

  const isApproved = (bill) => {
    return bill.approvalStatus === 'approved';
  };

  const handleViewBill = (bill) => {
    setViewingBill(bill);
    setShowViewModal(true);
  };

  const handleStatusChange = async (billId, newStatus) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/bills/${billId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        alert('Bill status updated successfully!');
        fetchBills();
      }
    } catch (error) {
      alert('Error updating bill status');
    }
  };

  const handleApprovalAction = async (billId, action) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/bills/${billId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        alert(`Bill ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        fetchBills();
      }
    } catch (error) {
      alert('Error updating approval status');
    }
  };

  // Function to calculate bill status based on payment and due date
  const calculateBillStatus = (bill) => {
    // If bill is not approved by manager, show hyphen
    if (bill.approvalStatus === 'pending' || bill.approvalStatus === 'rejected') {
      return '-';
    }
    
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

  const billsData = bills
    .filter(bill => {
      const matchesSearch = searchTerm === '' || 
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Calculate dynamic status for filtering
      const calculatedStatus = calculateBillStatus(bill);
      
      const matchesStatus = statusFilter === '' || calculatedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .map(bill => {
      // Calculate net payable (Grand Total - TDS Amount)
      const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
      // Calculate dynamic status
      const calculatedStatus = calculateBillStatus(bill);
      
      return {
        id: bill.billNumber,
        vendor: bill.vendorName,
        billDate: new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-',
        status: calculatedStatus,
        amount: `₹${netPayable.toLocaleString('en-IN')}`
      };
    });

  const overdueCount = bills.filter(bill => bill.approvalStatus === 'approved' && calculateBillStatus(bill) === 'Overdue').length;
  const dueSoonCount = bills.filter(bill => bill.approvalStatus === 'approved' && calculateBillStatus(bill) === 'Due Soon').length;
  const notPaidCount = bills.filter(bill => bill.approvalStatus === 'approved' && calculateBillStatus(bill) === 'Not Paid').length;
  const partiallyPaidCount = bills.filter(bill => bill.approvalStatus === 'approved' && calculateBillStatus(bill) === 'Partially Paid').length;
  const fullyPaidCount = bills.filter(bill => bill.approvalStatus === 'approved' && calculateBillStatus(bill) === 'Fully Paid').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Overdue': return 'bg-red-500 text-white';
      case 'Due Soon': return 'bg-orange-400 text-white';
      case 'Not Paid': return 'bg-blue-400 text-white';
      case 'Partially Paid': return 'bg-yellow-500 text-white';
      case 'Fully Paid': return 'bg-green-500 text-white';
      case '-': return 'bg-gray-400 text-white';
      default: return 'bg-blue-400 text-white';
    }
  };

  const exportToExcel = () => {
    const csvData = bills.map(bill => {
      const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
      const calculatedStatus = calculateBillStatus(bill);
      return {
        'Bill Number': bill.billNumber,
        'Vendor Name': bill.vendorName,
        'Bill Date': new Date(bill.billDate).toLocaleDateString('en-GB'),
        'Due Date': bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB') : '',
        'Status': calculatedStatus,
        'Gross Amount': bill.grossAmount || 0,
        'Tax Amount': bill.taxAmount || 0,
        'TDS Amount': bill.tdsAmount || 0,
        'Grand Total': bill.grandTotal || 0,
        'Net Payable': netPayable,
        'Paid Amount': bill.paidAmount || 0,
        'Approval Status': bill.approvalStatus || 'pending',
        'Created Date': new Date(bill.createdAt).toLocaleDateString('en-GB')
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bills_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-6 rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <h1 className="text-2xl font-bold">Bills Management</h1>
            <div className="flex flex-col lg:flex-row gap-3">
              <button 
                onClick={exportToExcel}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <button 
                onClick={handleCreateNew}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Create New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Overdue"
            value={overdueCount}
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Due Soon"
            value={dueSoonCount}
            icon={Clock}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Not Paid"
            value={notPaidCount}
            icon={CreditCard}
            color="primary"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Partially Paid"
            value={partiallyPaidCount}
            icon={IndianRupee}
            color="warning"
          />
        </div>
        <div className="transform transition-all duration-200 hover:-translate-y-1">
          <MetricsCard
            title="Fully Paid"
            value={fullyPaidCount}
            icon={CheckCircle}
            color="success"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by Bill ID or Vendor" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
            >
              <option value="">All Status</option>
              <option value="Not Paid">Not Paid</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 text-white p-4">
          <h2 className="text-lg font-semibold">Bills List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">
                  Bill ID ↓
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Vendor</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Bill Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Due Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Approval</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
          <tbody>
            {billsData.map((bill, index) => {
              const originalBill = bills.find(b => b.billNumber === bill.id);
              return (
                <tr key={bill.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-blue-600 font-medium">{bill.id}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-900 whitespace-nowrap">{bill.vendor}</td>
                  <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{bill.billDate}</td>
                  <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{bill.dueDate}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900 whitespace-nowrap">{bill.amount}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    {userRole === 'manager' && originalBill.approvalStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprovalAction(originalBill._id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(originalBill._id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          originalBill.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                          originalBill.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {originalBill.approvalStatus === 'approved' ? 'Approved' : 
                           originalBill.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewBill(originalBill)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditBill(originalBill)}
                        disabled={isApproved(originalBill)}
                        className={`p-2 rounded-lg transition-colors ${
                          isApproved(originalBill)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={isApproved(originalBill) ? 'Cannot edit approved bill' : 'Edit'}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(originalBill._id)}
                        disabled={isApproved(originalBill)}
                        className={`p-2 rounded-lg transition-colors ${
                          isApproved(originalBill)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={isApproved(originalBill) ? 'Cannot delete approved bill' : 'Delete'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Bill Form Modal */}
      <VendorBill 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        editingBill={editingBill}
      />

      {/* View Bill Modal */}
      {showViewModal && viewingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Bill Details</h1>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingBill(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Bill Information */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bill Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bill Number</label>
                      <p className="text-lg font-semibold text-blue-600">{viewingBill.billNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vendor</label>
                      <p className="text-lg">{viewingBill.vendorName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(calculateBillStatus(viewingBill))}`}>
                        {calculateBillStatus(viewingBill)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reference Number</label>
                      <p className="text-lg">{viewingBill.referenceNumber || '-'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dates & Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bill Date</label>
                      <p className="text-lg">{new Date(viewingBill.billDate).toLocaleDateString()}</p>
                    </div>
                    {viewingBill.dueDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                        <p className="text-lg">{new Date(viewingBill.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                      <p className="text-lg">{viewingBill.paymentTerms || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Place of Supply</label>
                      <p className="text-lg">{viewingBill.placeOfSupply || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Vendor Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm">{viewingBill.vendorAddress || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">GSTIN</label>
                      <p className="text-sm">{viewingBill.vendorGSTIN || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">PAN</label>
                      <p className="text-sm">{viewingBill.vendorPAN || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Person</label>
                      <p className="text-sm">{viewingBill.contactPerson || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {viewingBill.items && viewingBill.items.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">HSN Code</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Qty</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Unit Price</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Discount%</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">CGST%</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">SGST%</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">IGST%</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingBill.items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-3">{item.product}</td>
                            <td className="px-4 py-3">{item.hsnCode}</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">₹{item.unitPrice?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{item.discount}%</td>
                            <td className="px-4 py-3 text-right">{item.cgstRate}%</td>
                            <td className="px-4 py-3 text-right">{item.sgstRate}%</td>
                            <td className="px-4 py-3 text-right">{item.igstRate}%</td>
                            <td className="px-4 py-3 text-right font-semibold">₹{item.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{viewingBill.subtotal?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Discount:</span>
                      <span>₹{viewingBill.totalDiscount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total CGST:</span>
                      <span>₹{viewingBill.totalCGST?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total SGST:</span>
                      <span>₹{viewingBill.totalSGST?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total IGST:</span>
                      <span>₹{viewingBill.totalIGST?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TDS Amount:</span>
                      <span>₹{viewingBill.tdsAmount?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-600">Grand Total</div>
                          <div className="text-xl font-bold text-blue-600">₹{viewingBill.grandTotal?.toLocaleString() || '0'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Net Payable</div>
                          <div className="text-lg font-semibold text-green-600">₹{((viewingBill.grandTotal || 0) - (viewingBill.tdsAmount || 0)).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Paid Amount</div>
                          <div className="text-lg font-semibold text-orange-600">₹{(viewingBill.paidAmount || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Remaining Amount</div>
                          <div className="text-lg font-bold text-red-600">₹{(((viewingBill.grandTotal || 0) - (viewingBill.tdsAmount || 0)) - (viewingBill.paidAmount || 0)).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingBill.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{viewingBill.notes}</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingBill(null);
                  }}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;



import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Download } from 'lucide-react';
import VendorBill from './VendorBill';

const Bills = () => {
  const [activeFilter, setActiveFilter] = useState('Status');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');

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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/me', {
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
      const response = await fetch('http://localhost:5001/api/bills');
      if (response.ok) {
        const data = await response.json();
        
        // Fetch payments to calculate actual paid amounts
        const paymentsResponse = await fetch('http://localhost:5001/api/payments');
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
        const response = await fetch(`http://localhost:5001/api/bills/${billId}`, {
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

  const handleStatusChange = async (billId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/bills/${billId}/status`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/bills/${billId}/approval`, {
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

  const overdueCount = bills.filter(bill => calculateBillStatus(bill) === 'Overdue').length;
  const dueSoonCount = bills.filter(bill => calculateBillStatus(bill) === 'Due Soon').length;
  const notPaidCount = bills.filter(bill => calculateBillStatus(bill) === 'Not Paid').length;
  const partiallyPaidCount = bills.filter(bill => calculateBillStatus(bill) === 'Partially Paid').length;
  const fullyPaidCount = bills.filter(bill => calculateBillStatus(bill) === 'Fully Paid').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Overdue': return 'bg-red-500 text-white';
      case 'Due Soon': return 'bg-orange-400 text-white';
      case 'Not Paid': return 'bg-blue-400 text-white';
      case 'Partially Paid': return 'bg-yellow-500 text-white';
      case 'Fully Paid': return 'bg-green-500 text-white';
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <Download size={18} />
            Export to Excel
          </button>
          <button 
            onClick={handleCreateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-red-500 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Overdue</div>
          <div className="text-5xl font-bold">{overdueCount}</div>
        </div>
        <div className="bg-orange-400 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Due Soon</div>
          <div className="text-5xl font-bold">{dueSoonCount}</div>
        </div>
        <div className="bg-blue-400 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Not Paid</div>
          <div className="text-5xl font-bold">{notPaidCount}</div>
        </div>
        <div className="bg-yellow-500 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Partially Paid</div>
          <div className="text-5xl font-bold">{partiallyPaidCount}</div>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Fully Paid</div>
          <div className="text-5xl font-bold">{fullyPaidCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-64">
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
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

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
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
                  <td className="py-4 px-6">
                    <span className="text-blue-600 font-medium">{bill.id}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{bill.vendor}</td>
                  <td className="py-4 px-6 text-gray-600">{bill.billDate}</td>
                  <td className="py-4 px-6 text-gray-600">{bill.dueDate}</td>
                  <td className="py-4 px-6">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">{bill.amount}</td>
                  <td className="py-4 px-6 text-center">
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
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditBill(originalBill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(originalBill._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">2</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">3</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">4</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-700">5</button>
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
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
    </div>
  );
};

export default Bills;

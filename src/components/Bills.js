import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
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
        setBills(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
    setLoading(false);
  };

  const handleSaveBill = async (billData) => {
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

  const billsData = bills
    .filter(bill => {
      const matchesSearch = searchTerm === '' || 
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .map(bill => {
      const netPayable = bill.grandTotal - (bill.tdsAmount || 0);
      return {
        id: bill.billNumber,
        vendor: bill.vendorName,
        billDate: new Date(bill.billDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-',
        status: bill.status,
        amount: `₹${netPayable.toLocaleString('en-IN')}`
      };
    });

  const overdueCount = bills.filter(bill => bill.status === 'Overdue').length;
  const dueSoonCount = bills.filter(bill => bill.status === 'Due Soon').length;
  const draftCount = bills.filter(bill => bill.status === 'Draft').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Overdue': return 'bg-red-500 text-white';
      case 'Due Soon': return 'bg-orange-400 text-white';
      case 'Draft': return 'bg-orange-300 text-white';
      default: return 'bg-blue-400 text-white';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
        <button 
          onClick={handleCreateNew}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Overdue</div>
          <div className="text-5xl font-bold">{overdueCount}</div>
        </div>
        <div className="bg-blue-400 text-white rounded-xl p-6">
          <div className="text-sm mb-2">Due Soon</div>
          <div className="text-5xl font-bold">{dueSoonCount}</div>
        </div>
        <div className="bg-gray-200 text-gray-700 rounded-xl p-6">
          <div className="text-sm mb-2">Draft</div>
          <div className="text-5xl font-bold">{draftCount}</div>
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
            <option value="Draft">Draft</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
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
                    <select
                      value={bill.status}
                      onChange={(e) => handleStatusChange(originalBill._id, e.target.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${getStatusColor(bill.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Due Soon">Due Soon</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">{bill.amount}</td>
                  <td className="py-4 px-6">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        originalBill.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                        originalBill.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {originalBill.approvalStatus === 'approved' ? 'Approved' : 
                         originalBill.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
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

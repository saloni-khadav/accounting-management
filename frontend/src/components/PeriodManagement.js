import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';

const PeriodManagement = () => {
  const [users, setUsers] = useState([]);
  const [periodPermissions, setPeriodPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState({
    username: '',
    section: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [emailError, setEmailError] = useState('');

  // Check if user is manager
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only managers can access Period Management.</p>
        </div>
      </div>
    );
  }

  const sections = ['Bills', 'Invoices', 'Payments', 'Collections', 'Credit/Debit Notes', 'Purchase Orders', 'Assets', 'Bank Reconciliation', 'TDS', 'GST'];

  useEffect(() => {
    fetchPeriodPermissions();
  }, []);

  const fetchPeriodPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/period-permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPeriodPermissions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.username || !newPermission.section || !newPermission.startDate || !newPermission.endDate) {
      alert('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPermission.username)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/period-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPermission)
      });

      if (response.ok) {
        alert('Permission added successfully!');
        setNewPermission({ username: '', section: '', startDate: '', endDate: '', isActive: true });
        fetchPeriodPermissions();
      } else {
        alert('Failed to add permission');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding permission');
    }
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/period-permissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Permission deleted!');
        fetchPeriodPermissions();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const togglePermissionStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://nextbook-backend.nextsphere.co.in/api/period-permissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchPeriodPermissions();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Period Management</h1>
            <p className="text-white text-sm sm:text-base">Manage period permissions for users</p>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Period Permission
          </h2>
        </div>
        <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              value={newPermission.username}
              onChange={(e) => {
                setNewPermission({ ...newPermission, username: e.target.value });
                setEmailError('');
              }}
              placeholder="Enter email ID"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={newPermission.section}
              onChange={(e) => setNewPermission({ ...newPermission, section: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={newPermission.startDate}
              onChange={(e) => setNewPermission({ ...newPermission, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={newPermission.endDate}
              onChange={(e) => setNewPermission({ ...newPermission, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddPermission}
          className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
          <h2 className="text-base sm:text-lg font-semibold text-white">Active Permissions</h2>
        </div>
        <div className="p-4 sm:p-6">
        {periodPermissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No permissions added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Email ID</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Section</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">End Date</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periodPermissions.map(permission => (
                  <tr key={permission._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 text-sm text-gray-900 font-medium whitespace-nowrap">{permission.username}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{permission.section}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{new Date(permission.startDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900 whitespace-nowrap">{new Date(permission.endDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permission.isActive}
                          onChange={() => togglePermissionStatus(permission._id, permission.isActive)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeletePermission(permission._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Delete Permission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PeriodManagement;


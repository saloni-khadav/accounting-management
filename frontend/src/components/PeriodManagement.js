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
    <div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Add Period Permission
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              value={newPermission.username}
              onChange={(e) => setNewPermission({ ...newPermission, username: e.target.value })}
              placeholder="Enter email ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Active Permissions</h2>
        
        {periodPermissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No permissions added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {periodPermissions.map(permission => (
                  <tr key={permission._id}>
                    <td className="px-4 py-3 text-sm text-gray-800">{permission.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{permission.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{new Date(permission.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{new Date(permission.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeletePermission(permission._id)}
                        className="text-red-600 hover:text-red-800"
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
  );
};

export default PeriodManagement;


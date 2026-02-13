import React, { useState } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Copy, CheckCircle, Clock, Users, Settings, ArrowRight, Zap, GitBranch } from 'lucide-react';

const Workflows = () => {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Invoice Approval', description: 'Automated invoice approval process', status: 'Active', triggers: 3, actions: 5, executions: 145 },
    { id: 2, name: 'Expense Reimbursement', description: 'Employee expense approval workflow', status: 'Active', triggers: 2, actions: 4, executions: 89 },
    { id: 3, name: 'Purchase Order Creation', description: 'Auto-create PO from requisitions', status: 'Paused', triggers: 1, actions: 3, executions: 67 }
  ]);

  const stats = [
    { title: 'Total Workflows', value: '3', icon: GitBranch, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Active Workflows', value: '2', icon: Play, gradient: 'from-green-500 to-green-600' },
    { title: 'Total Executions', value: '301', icon: Zap, gradient: 'from-purple-500 to-purple-600' },
    { title: 'Success Rate', value: '98%', icon: CheckCircle, gradient: 'from-orange-500 to-orange-600' }
  ];

  const templates = [
    { name: 'Invoice Approval', icon: CheckCircle, color: 'from-blue-500 to-blue-600', description: 'Multi-level invoice approval' },
    { name: 'Expense Workflow', icon: Users, color: 'from-green-500 to-green-600', description: 'Employee expense processing' },
    { name: 'Payment Automation', icon: Zap, color: 'from-purple-500 to-purple-600', description: 'Automated payment processing' },
    { name: 'Vendor Onboarding', icon: GitBranch, color: 'from-orange-500 to-orange-600', description: 'New vendor setup workflow' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700 border-green-200',
      'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Inactive': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Workflows
            </span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">Automate your accounting processes</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold">
          <Plus className="h-5 w-5" />
          Create Workflow
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm font-semibold mb-2">{stat.title}</p>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Templates */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template, idx) => (
            <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${template.color} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm inline-block mb-4">
                  <template.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{template.name}</h4>
                <p className="text-white text-opacity-90 text-sm mb-4">{template.description}</p>
                <div className="flex items-center gap-2 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Use Template</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Active Workflows</h3>
          <p className="text-sm text-gray-600 mt-1">Manage and monitor your automation workflows</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Workflow Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Triggers</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Executions</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GitBranch className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-bold text-gray-900">{workflow.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{workflow.description}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-bold">
                      {workflow.triggers}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold">
                      {workflow.actions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-900">{workflow.executions}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(workflow.status)}`}>
                      {workflow.status === 'Active' ? (
                        <Play className="h-3.5 w-3.5" />
                      ) : (
                        <Pause className="h-3.5 w-3.5" />
                      )}
                      {workflow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Workflows;
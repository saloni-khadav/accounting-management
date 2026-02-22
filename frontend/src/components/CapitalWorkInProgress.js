import React, { useState, useEffect } from 'react';
import { Construction, Plus, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CapitalWorkInProgress = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [cwipProjects, setCwipProjects] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
      const data = await response.json();
      setAssets(data);
      
      // Filter assets that are under construction or in progress
      const wipAssets = data.filter(asset => 
        asset.status === 'Under Maintenance' || 
        asset.category === 'Buildings' ||
        asset.description?.toLowerCase().includes('construction') ||
        asset.description?.toLowerCase().includes('progress')
      );
      
      // Convert assets to CWIP projects format
      const projects = wipAssets.map((asset, index) => ({
        id: asset._id,
        projectName: asset.assetName,
        projectCode: asset.assetCode,
        startDate: asset.purchaseDate,
        expectedCompletion: new Date(new Date(asset.purchaseDate).getTime() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 1 year from start
        budgetAmount: asset.purchaseValue,
        spentAmount: Math.round(asset.purchaseValue * 0.6), // Assume 60% spent
        status: asset.status === 'Active' ? 'In Progress' : asset.status === 'Under Maintenance' ? 'Planning' : 'In Progress',
        progress: Math.round(Math.random() * 40 + 30), // Random progress between 30-70%
        contractor: asset.vendor || 'TBD',
        location: asset.location || 'TBD'
      }));
      
      setCwipProjects(projects);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  // Calculate status data from real projects
  const statusData = React.useMemo(() => {
    const statusCounts = cwipProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
    
    const colors = {
      'Planning': '#f59e0b',
      'In Progress': '#3b82f6',
      'Near Completion': '#10b981',
      'On Hold': '#ef4444'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status] || '#6b7280'
    }));
  }, [cwipProjects]);

  // Sample monthly spending data (would need proper calculation)
  const monthlySpending = [
    { month: 'Jan', amount: 450000 },
    { month: 'Feb', amount: 520000 },
    { month: 'Mar', amount: 680000 },
    { month: 'Apr', amount: 750000 },
    { month: 'May', amount: 620000 },
    { month: 'Jun', amount: 580000 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Near Completion': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'On Hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Planning': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <Construction className="w-4 h-4" />;
      case 'Near Completion': return <CheckCircle className="w-4 h-4" />;
      case 'On Hold': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredProjects = cwipProjects.filter(project => 
    !statusFilter || project.status === statusFilter
  );

  const totalBudget = cwipProjects.reduce((sum, project) => sum + project.budgetAmount, 0);
  const totalSpent = cwipProjects.reduce((sum, project) => sum + project.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const renderOverview = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading CWIP data...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 lg:mb-10">
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Active Projects</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">{cwipProjects.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Currently ongoing</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <Construction size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Total Budget</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{totalBudget.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">Allocated budget</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <DollarSign size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Amount Spent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{totalSpent.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">{totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(1) : 0}% utilized</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-2xl"></div>
              <div className="ml-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Remaining</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-700">₹{totalRemaining.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-1">Available budget</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-300 to-blue-400 text-white shadow-lg shadow-blue-300/30 group-hover:scale-110 transition-all duration-300">
                  <Clock size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
                <h3 className="text-base sm:text-lg font-semibold text-white">Project Status Distribution</h3>
              </div>
              <div className="p-4 sm:p-6">
              {statusData.length > 0 ? (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Projects']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">No projects found</div>
              )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-400">
                <h3 className="text-base sm:text-lg font-semibold text-white">Monthly CWIP Spending</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value/100000}L`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
            >
              <option value="">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Near Completion">Near Completion</option>
              <option value="On Hold">On Hold</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center shadow-md hover:shadow-lg transition-all duration-200 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                <p className="text-sm text-gray-500">{project.projectCode}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="ml-1">{project.status}</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>End: {new Date(project.expectedCompletion).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{project.contractor}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Construction className="w-4 h-4 mr-2" />
                <span>{project.location}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">₹{project.budgetAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spent</p>
                  <p className="font-semibold text-orange-600">₹{project.spentAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Capital Work in Progress</h1>
            <p className="text-white text-sm sm:text-base">Track and manage ongoing capital projects and construction work</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 sm:mb-8 lg:mb-10">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Projects
            </button>
            </nav>
          </div>
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'projects' && renderProjects()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalWorkInProgress;

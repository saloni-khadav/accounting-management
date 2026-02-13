import React from 'react';
import MetricsCard from './ui/MetricsCard';
import RevenueChart from './charts/RevenueChart';
import ExpensesDonut from './charts/ExpensesDonut';
import DataTable from './ui/DataTable';
import { DollarSign, Wallet, TrendingUp, Building, FileText, CreditCard, Banknote, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const metricsData = [
    { title: 'Closing Bank Balance', value: '$125,430', change: '12.5%', changeType: 'positive', icon: Banknote, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { title: 'Cash-in-hand', value: '$8,250', change: '5.2%', changeType: 'positive', icon: Wallet, color: 'green', gradient: 'from-green-500 to-green-600' },
    { title: 'Profit', value: '$45,680', change: '18.3%', changeType: 'positive', icon: TrendingUp, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
    { title: 'Assets', value: '$892,340', change: '3.1%', changeType: 'positive', icon: Building, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
    { title: 'GST', value: '$12,450', change: '-2.4%', changeType: 'negative', icon: FileText, color: 'orange', gradient: 'from-orange-500 to-orange-600' },
    { title: 'TDS', value: '$5,680', change: '1.8%', changeType: 'positive', icon: CreditCard, color: 'yellow', gradient: 'from-yellow-500 to-yellow-600' },
    { title: 'Revenue', value: '$285,940', change: '15.7%', changeType: 'positive', icon: DollarSign, color: 'teal', gradient: 'from-teal-500 to-teal-600' },
    { title: 'Payables', value: '$34,520', change: '-8.2%', changeType: 'negative', icon: Users, color: 'red', gradient: 'from-red-500 to-red-600' }
  ];

  const overdueReceivables = [
    { customer: 'ABC Corp', amount: '$15,420', daysOverdue: 45, status: 'Critical' },
    { customer: 'XYZ Ltd', amount: '$8,750', daysOverdue: 30, status: 'High' },
    { customer: 'Tech Solutions', amount: '$12,300', daysOverdue: 15, status: 'Medium' }
  ];

  const overduePayables = [
    { vendor: 'Office Supplies Co', amount: '$3,420', daysOverdue: 12, status: 'Medium' },
    { vendor: 'Utility Company', amount: '$1,850', daysOverdue: 5, status: 'Low' },
    { vendor: 'Software License', amount: '$5,200', daysOverdue: 25, status: 'High' }
  ];

  const lastTransactions = [
    { date: '2024-01-15', description: 'Payment from ABC Corp', amount: '$15,420', type: 'Credit' },
    { date: '2024-01-14', description: 'Office Rent Payment', amount: '$3,500', type: 'Debit' },
    { date: '2024-01-13', description: 'Software Subscription', amount: '$299', type: 'Debit' }
  ];

  const receivablesColumns = [
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-bold">{value}</span> },
    { key: 'daysOverdue', header: 'Days Overdue' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        value === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
        value === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
        'bg-yellow-100 text-yellow-700 border border-yellow-200'
      }`}>{value}</span>
    )}
  ];

  const payablesColumns = [
    { key: 'vendor', header: 'Vendor' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-bold">{value}</span> },
    { key: 'daysOverdue', header: 'Days Overdue' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        value === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
        'bg-green-100 text-green-700 border border-green-200'
      }`}>{value}</span>
    )}
  ];

  const transactionsColumns = [
    { key: 'date', header: 'Date' },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-bold">{value}</span> },
    { key: 'type', header: 'Type', render: (value) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        value === 'Credit' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
      }`}>{value}</span>
    )}
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's your business overview</p>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData.map((metric, index) => (
          <div key={index} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                {metric.changeType === 'positive' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">{metric.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <div className="flex items-center">
                <span className={`text-sm font-bold ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <ExpensesDonut />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DataTable title="Overdue Receivables" columns={receivablesColumns} data={overdueReceivables} />
        <DataTable title="Overdue Payables" columns={payablesColumns} data={overduePayables} />
      </div>

      {/* Last Transactions */}
      <DataTable title="Last 5 Transactions" columns={transactionsColumns} data={lastTransactions} />
    </div>
  );
};

export default Dashboard;
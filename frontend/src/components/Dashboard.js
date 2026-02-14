import React from 'react';
import MetricsCard from './ui/MetricsCard';
import RevenueChart from './charts/RevenueChart';
import ExpensesDonut from './charts/ExpensesDonut';
import DataTable from './ui/DataTable';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Building, 
  FileText, 
  CreditCard,
  Banknote,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const metricsData = [
    {
      title: 'Closing Bank Balance',
      value: '$125,430',
      change: '12.5%',
      changeType: 'positive',
      icon: Banknote,
      color: 'primary'
    },
    {
      title: 'Cash-in-hand',
      value: '$8,250',
      change: '5.2%',
      changeType: 'positive',
      icon: Wallet,
      color: 'success'
    },
    {
      title: 'Profit',
      value: '$45,680',
      change: '18.3%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Assets',
      value: '$892,340',
      change: '3.1%',
      changeType: 'positive',
      icon: Building,
      color: 'primary'
    },
    {
      title: 'GST',
      value: '$12,450',
      change: '-2.4%',
      changeType: 'negative',
      icon: FileText,
      color: 'warning'
    },
    {
      title: 'TDS',
      value: '$5,680',
      change: '1.8%',
      changeType: 'positive',
      icon: CreditCard,
      color: 'warning'
    },
    {
      title: 'Revenue',
      value: '$285,940',
      change: '15.7%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Payables',
      value: '$34,520',
      change: '-8.2%',
      changeType: 'negative',
      icon: Users,
      color: 'danger'
    }
  ];

  const overdueReceivables = [
    { customer: 'ABC Corp', amount: '$15,420', daysOverdue: 45, status: 'Critical' },
    { customer: 'XYZ Ltd', amount: '$8,750', daysOverdue: 30, status: 'High' },
    { customer: 'Tech Solutions', amount: '$12,300', daysOverdue: 15, status: 'Medium' },
    { customer: 'Global Inc', amount: '$6,890', daysOverdue: 60, status: 'Critical' },
    { customer: 'StartupCo', amount: '$4,250', daysOverdue: 22, status: 'Medium' }
  ];

  const overduePayables = [
    { vendor: 'Office Supplies Co', amount: '$3,420', daysOverdue: 12, status: 'Medium' },
    { vendor: 'Utility Company', amount: '$1,850', daysOverdue: 5, status: 'Low' },
    { vendor: 'Software License', amount: '$5,200', daysOverdue: 25, status: 'High' },
    { vendor: 'Marketing Agency', amount: '$8,750', daysOverdue: 18, status: 'Medium' },
    { vendor: 'Equipment Rental', amount: '$2,340', daysOverdue: 8, status: 'Low' }
  ];

  const lastTransactions = [
    { date: '2024-01-15', description: 'Payment from ABC Corp', amount: '$15,420', type: 'Credit' },
    { date: '2024-01-14', description: 'Office Rent Payment', amount: '$3,500', type: 'Debit' },
    { date: '2024-01-13', description: 'Software Subscription', amount: '$299', type: 'Debit' },
    { date: '2024-01-12', description: 'Client Invoice Payment', amount: '$8,750', type: 'Credit' },
    { date: '2024-01-11', description: 'Utility Bill Payment', amount: '$450', type: 'Debit' }
  ];

  const receivablesColumns = [
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-semibold">{value}</span> },
    { key: 'daysOverdue', header: 'Days Overdue' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Critical' ? 'bg-red-100 text-red-800' :
          value === 'High' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const payablesColumns = [
    { key: 'vendor', header: 'Vendor' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-semibold">{value}</span> },
    { key: 'daysOverdue', header: 'Days Overdue' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'High' ? 'bg-red-100 text-red-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const transactionsColumns = [
    { key: 'date', header: 'Date' },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (value) => <span className="font-semibold">{value}</span> },
    { 
      key: 'type', 
      header: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <ExpensesDonut />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DataTable 
          title="Overdue Receivables"
          columns={receivablesColumns}
          data={overdueReceivables}
        />
        <DataTable 
          title="Overdue Payables"
          columns={payablesColumns}
          data={overduePayables}
        />
      </div>

      {/* Last Transactions */}
      <DataTable 
        title="Last 5 Transactions"
        columns={transactionsColumns}
        data={lastTransactions}
      />
    </div>
  );
};

export default Dashboard;
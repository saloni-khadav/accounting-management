import React, { useState, useEffect } from 'react';
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
  const [overdueReceivables, setOverdueReceivables] = useState([]);
  const [overduePayables, setOverduePayables] = useState([]);
  const [lastTransactions, setLastTransactions] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalPayables, setTotalPayables] = useState(0);
  const [totalTDS, setTotalTDS] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchOverdueReceivables();
    fetchOverduePayables();
    fetchLastTransactions();
    fetchTotalAssets();
    fetchTotalPayables();
    fetchTotalTDS();
    fetchTotalRevenue();
  }, []);

  const fetchOverdueReceivables = async () => {
    try {
      const [invoicesRes, collectionsRes, creditNotesRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/invoices'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/collections'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (invoicesRes.ok) {
        const invoices = await invoicesRes.json();
        const collections = collectionsRes.ok ? await collectionsRes.json() : [];
        const creditNotes = creditNotesRes.ok ? await creditNotesRes.json() : [];
        
        const today = new Date();
        const approvedCollections = collections.filter(col => col.approvalStatus === 'Approved');
        const approvedCreditNotes = creditNotes.filter(cn => cn.approvalStatus === 'Approved');
        
        const overdueData = invoices
          .filter(inv => inv.approvalStatus === 'Approved')
          .map(invoice => {
            const invoiceDate = new Date(invoice.invoiceDate);
            const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
            
            const invoiceCollections = approvedCollections.filter(col => 
              col.invoiceNumber?.includes(invoice.invoiceNumber)
            );
            const totalCollected = invoiceCollections.reduce((sum, col) => 
              sum + (parseFloat(col.netAmount) || parseFloat(col.amount) || 0), 0
            );
            
            const invoiceCreditNotes = approvedCreditNotes.filter(cn => 
              cn.originalInvoiceNumber === invoice.invoiceNumber
            );
            const totalCredited = invoiceCreditNotes.reduce((sum, cn) => 
              sum + (parseFloat(cn.grandTotal) || 0), 0
            );
            
            const totalTDS = invoiceCollections.reduce((sum, col) => 
              sum + (parseFloat(col.tdsAmount) || 0), 0
            );
            
            const remainingAmount = invoice.grandTotal - totalCollected - totalCredited - totalTDS;
            
            if (remainingAmount > 0 && daysDiff >= 0) {
              let status;
              if (daysDiff >= 90) status = 'Critical';
              else if (daysDiff >= 60) status = 'High';
              else if (daysDiff >= 30) status = 'Medium';
              else status = 'Low';
              
              return {
                customer: invoice.customerName,
                amount: `₹${remainingAmount.toLocaleString('en-IN')}`,
                daysOverdue: Math.abs(daysDiff),
                status
              };
            }
            return null;
          })
          .filter(item => item !== null)
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5);
        
        setOverdueReceivables(overdueData);
      }
    } catch (error) {
      console.error('Error fetching overdue receivables:', error);
    }
  };

  const fetchOverduePayables = async () => {
    try {
      const [billsRes, paymentsRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/bills'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/payments')
      ]);

      if (billsRes.ok) {
        const bills = await billsRes.json();
        const payments = paymentsRes.ok ? await paymentsRes.json() : [];
        
        const today = new Date();
        const approvedPayments = payments.filter(p => p.approvalStatus === 'approved');
        
        const overdueData = bills
          .filter(bill => bill.approvalStatus === 'approved')
          .map(bill => {
            const billDate = new Date(bill.billDate);
            const currentDate = new Date();
            const daysDiff = Math.floor((currentDate - billDate) / (1000 * 60 * 60 * 24));
            
            const billPayments = approvedPayments.filter(p => p.billId === bill._id);
            const totalPaid = billPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            
            const netPayable = (bill.grandTotal || 0) - (bill.tdsAmount || 0);
            const remainingAmount = netPayable - totalPaid;
            
            if (remainingAmount > 0 && daysDiff >= 0) {
              let status;
              if (daysDiff >= 90) status = 'Critical';
              else if (daysDiff >= 60) status = 'High';
              else if (daysDiff >= 30) status = 'Medium';
              else status = 'Low';
              
              return {
                vendor: bill.vendorName,
                amount: `₹${remainingAmount.toLocaleString('en-IN')}`,
                daysOverdue: daysDiff,
                status
              };
            }
            return null;
          })
          .filter(item => item !== null)
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5);
        
        setOverduePayables(overdueData);
      }
    } catch (error) {
      console.error('Error fetching overdue payables:', error);
    }
  };

  const fetchLastTransactions = async () => {
    try {
      const [collectionsRes, paymentsRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/collections'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/payments')
      ]);

      const collections = collectionsRes.ok ? await collectionsRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];

      const transactions = [
        ...collections
          .filter(c => c.approvalStatus === 'Approved')
          .map(c => ({
            date: new Date(c.collectionDate),
            party: c.customer,
            description: `Payment from ${c.customer}`,
            amount: `₹${(parseFloat(c.netAmount) || parseFloat(c.amount) || 0).toLocaleString('en-IN')}`,
            type: 'Credit'
          })),
        ...payments
          .filter(p => p.approvalStatus === 'approved')
          .map(p => ({
            date: new Date(p.paymentDate),
            party: p.vendorName || 'Vendor',
            description: `Payment to vendor`,
            amount: `₹${(p.amount || 0).toLocaleString('en-IN')}`,
            type: 'Debit'
          }))
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5)
        .map(t => ({
          ...t,
          date: t.date.toLocaleDateString('en-GB')
        }));

      setLastTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchTotalAssets = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/assets');
      if (response.ok) {
        const assets = await response.json();
        const total = assets.reduce((sum, asset) => sum + (asset.purchaseValue || 0), 0);
        setTotalAssets(total);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchTotalPayables = async () => {
    try {
      const token = localStorage.getItem('token');
      const [billsRes, creditNotesRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/bills'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-debit-notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (billsRes.ok) {
        const bills = await billsRes.json();
        const creditNotes = creditNotesRes.ok ? await creditNotesRes.json() : [];

        const approvedBills = bills.filter(b => b.approvalStatus === 'approved');
        const totalBills = approvedBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        
        const totalCreditNotes = creditNotes
          .filter(cn => cn.type === 'Credit Note' && cn.approvalStatus === 'approved')
          .reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);

        setTotalPayables(totalBills - totalCreditNotes);
      }
    } catch (error) {
      console.error('Error fetching payables:', error);
    }
  };

  const fetchTotalTDS = async () => {
    try {
      const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/tds');
      if (response.ok) {
        const tdsData = await response.json();
        const total = tdsData.reduce((sum, item) => sum + (item.tdsAmount || 0), 0);
        setTotalTDS(total);
      }
    } catch (error) {
      console.error('Error fetching TDS:', error);
    }
  };

  const fetchTotalRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      const [invoicesRes, creditNotesRes] = await Promise.all([
        fetch('https://nextbook-backend.nextsphere.co.in/api/invoices'),
        fetch('https://nextbook-backend.nextsphere.co.in/api/credit-notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (invoicesRes.ok) {
        const invoices = await invoicesRes.json();
        const creditNotes = creditNotesRes.ok ? await creditNotesRes.json() : [];

        const approvedInvoices = invoices.filter(inv => inv.approvalStatus === 'Approved');
        const totalInvoices = approvedInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
        
        const totalCreditNotes = creditNotes
          .filter(cn => cn.approvalStatus === 'Approved')
          .reduce((sum, cn) => sum + (cn.grandTotal || 0), 0);

        setTotalRevenue(totalInvoices - totalCreditNotes);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };
  const metricsData = [
    {
      title: 'Closing Bank Balance',
      value: '$125,430',
      icon: Banknote,
      color: 'primary'
    },
    {
      title: 'Cash-in-hand',
      value: '$8,250',
      icon: Wallet,
      color: 'success'
    },
    {
      title: 'Profit',
      value: '$45,680',
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Assets',
      value: `₹${totalAssets.toLocaleString('en-IN')}`,
      icon: Building,
      color: 'primary'
    },
    {
      title: 'GST',
      value: '$12,450',
      icon: FileText,
      color: 'warning'
    },
    {
      title: 'TDS',
      value: `₹${totalTDS.toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: 'warning'
    },
    {
      title: 'Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Payables',
      value: totalPayables > 0 ? `₹${totalPayables.toLocaleString('en-IN')}` : '₹0',
      icon: Users,
      color: 'danger'
    }
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
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
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
          value === 'Critical' ? 'bg-red-100 text-red-800' :
          value === 'High' ? 'bg-orange-100 text-orange-800' :
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
    { key: 'party', header: 'Party Name' },
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
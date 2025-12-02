import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import AccountsReceivable from './components/AccountsReceivable';
import AccountsPayable from './components/AccountsPayable';
import BankReconciliation from './components/BankReconciliation';
import AssetsManagement from './components/AssetsManagement';
import BalanceSheet from './components/BalanceSheet';
import TDSReconciliation from './components/TDSReconciliation';
import GSTReconciliation from './components/GSTReconciliation';
import SalesEntry from './components/SalesEntry';
import CreditNote from './components/CreditNote';
import GSTInvoice from './components/GSTInvoice';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'Account Receivable':
        return <AccountsReceivable />;
      case 'Accounts Payable':
        return <AccountsPayable />;
      case 'Bank':
        return <BankReconciliation />;
      case 'Taxation':
        return <TDSReconciliation />;
      case 'Assets':
        return <AssetsManagement />;
      case 'Balance Sheet':
        return <BalanceSheet />;
      case 'GST Reconciliation':
        return <GSTReconciliation />;
      case 'Sales Entry':
        return <SalesEntry />;
      case 'Credit Note':
        return <CreditNote />;
      case 'GST Invoice':
        return <GSTInvoice />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-inter">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import AccountsReceivable from './components/AccountsReceivable';
import AccountsPayable from './components/AccountsPayable';
import BankReconciliation from './components/BankReconciliation';
import AssetsManagement from './components/AssetsManagement';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('Assets');

  const renderPage = () => {
    switch(activePage) {
      case 'Account Receivble':
        return <AccountsReceivable />;
      case 'Accounts Payable':
        return <AccountsPayable />;
      case 'Bank':
        return <BankReconciliation />;
      case 'Assets':
        return <AssetsManagement />;
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
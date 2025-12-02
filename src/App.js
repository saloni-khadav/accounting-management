import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
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
  const [currentView, setCurrentView] = useState('landing'); // landing, login, signup, dashboard
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

  // Render based on current view
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={() => setCurrentView('dashboard')}
        onSwitchToSignup={() => setCurrentView('signup')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <Signup 
        onSignup={() => setCurrentView('dashboard')}
        onSwitchToLogin={() => setCurrentView('login')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Dashboard view
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
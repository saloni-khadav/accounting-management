import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import SetPassword from './components/SetPassword';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AccountsReceivable from './components/AccountsReceivable';
import AccountReceivableDashboard from './components/AccountReceivableDashboard';
import AccountsPayable from './components/AccountsPayable';
import APReconciliation from './components/APReconciliation';
import APReport from './components/APReport';
import ApprovalsWorkflows from './components/ApprovalsWorkflows';
import BankReconciliation from './components/BankReconciliation';
import BankDashboard from './components/BankDashboard';
import BankStatementUpload from './components/BankStatementUpload';
import AssetsManagement from './components/AssetsManagement';
import AssetsEntry from './components/AssetsEntry';
import AssetsReport from './components/AssetsReport';
import Depreciation from './components/Depreciation';
import CapitalWorkInProgress from './components/CapitalWorkInProgress';
import BalanceSheet from './components/BalanceSheet';
import TDSReconciliation from './components/TDSReconciliation';
import GSTReconciliation from './components/GSTReconciliation';
import GSTDashboard from './components/GSTDashboard';
import TaxReport from './components/TaxReport';
import SalesEntry from './components/SalesEntry';
import CreditNoteManagement from './components/CreditNoteManagement';
import GSTInvoice from './components/GSTInvoice';
import CreatePO from './components/CreatePO';
import ClientOutstanding from './components/ClientOutstanding';
import DebtorsAging from './components/DebtorsAging';
import CollectionRegister from './components/CollectionRegister';
import ClientMaster from './components/ClientMaster';
import ARReconciliation from './components/ARReconciliation';
import Bills from './components/Bills';
import CreditDebitNotes from './components/CreditDebitNotes';
import Payments from './components/Payments';
import PurchaseOrders from './components/PurchaseOrders';
import TDSPurchases from './components/TDSPurchases';
import VendorsAging from './components/VendorsAging';
import VendorMaster from './components/VendorMaster';
import ImportExport from './components/ImportExport';
import TaxInvoice from './components/TaxInvoice';
import InvoiceManagement from './components/InvoiceManagement';
import Approvals from './components/Approvals';
import PeriodManagement from './components/PeriodManagement';
import ChatBot from './components/ChatBot';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, login, signup, set-password, dashboard
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [activationToken, setActivationToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const savedPage = localStorage.getItem('activePage');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      // Restore the last active page
      if (savedPage) {
        setActivePage(savedPage);
      }
      return;
    }

    // Check for set-password token in URL path
    const path = window.location.pathname;
    const setPasswordMatch = path.match(/\/set-password\/(.+)/);
    
    if (setPasswordMatch) {
      const token = setPasswordMatch[1];
      setActivationToken(token);
      setCurrentView('set-password');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    setActivePage('dashboard');
    localStorage.setItem('activePage', 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activePage');
    setIsAuthenticated(false);
    setCurrentView('landing');
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    localStorage.setItem('activePage', page);
  };

  const renderPage = () => {
    switch(activePage) {
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      case 'dashboard':
        return <Dashboard />;
      case 'Account Receivable':
        return <AccountsReceivable setActivePage={handlePageChange} />;
      case 'AR Dashboard':
        return <AccountReceivableDashboard />;
      case 'Accounts Payable':
        return <AccountsPayable setActivePage={handlePageChange} />;
      case 'AP Reconciliation':
        return <APReconciliation />;
      case 'AP Report':
        return <APReport />;
      case 'Approvals & Workflows':
        return <ApprovalsWorkflows />;
      case 'Bank':
        return <BankDashboard />;
      case 'Bank Dashboard':
        return <BankDashboard />;
      case 'Bank Reconciliation':
        return <BankReconciliation />;
      case 'Bank Statement Upload':
        return <BankStatementUpload />;
      case 'Taxation':
        return <TDSReconciliation />;
      case 'GST Dashboard':
        return <GSTDashboard />;
      case 'Tax Report':
        return <TaxReport />;
      case 'Assets':
        return <AssetsManagement />;
      case 'Assets Dashboard':
        return <AssetsManagement />;
      case 'Asset Entry':
        return <AssetsEntry />;
      case 'Assets Report':
        return <AssetsReport />;
      case 'Depreciation':
        return <Depreciation />;
      case 'Capital Work in Progress':
        return <CapitalWorkInProgress />;
      case 'Balance Sheet':
        return <BalanceSheet />;
      case 'GST Reconciliation':
        return <GSTReconciliation />;
      case 'Create PO':
        return <CreatePO />;
      case 'Credit Note':
        return <CreditNoteManagement setActivePage={handlePageChange} />;
      case 'GST Invoice':
        return <GSTInvoice />;
      case 'Client Outstanding':
        return <ClientOutstanding />;
      case 'Debtors Aging':
        return <DebtorsAging />;
      case 'Collection Register':
        return <CollectionRegister />;
      case 'Client Master':
        return <ClientMaster />;
      case 'AR Reconciliation':
        return <ARReconciliation />;
      case 'Bills':
        return <Bills />;
      case 'Credit/Debit Notes':
        return <CreditDebitNotes />;
      case 'Payments':
        return <Payments />;
      case 'Purchase Orders':
        return <PurchaseOrders />;
      case 'TDS on Purchases':
        return <TDSPurchases />;
      case 'Vendors Aging':
        return <VendorsAging />;
      case 'Vendor Master':
        return <VendorMaster />;
      case 'Tax Invoice':
        return <TaxInvoice />;
      case 'Invoice Management':
        return <InvoiceManagement setActivePage={handlePageChange} />;
      case 'Import/Export':
        return <ImportExport />;
      case 'Approvals':
        return <Approvals />;
      case 'Period Management':
        return <PeriodManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Render based on current view
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={() => setCurrentView('login')} />
        <ChatBot />
      </>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <Login 
          onLogin={handleLogin}
          onSwitchToSignup={() => setCurrentView('signup')}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <ChatBot />
      </>
    );
  }

  if (currentView === 'signup') {
    return (
      <>
        <Signup 
          onSignup={() => setCurrentView('dashboard')}
          onSwitchToLogin={() => setCurrentView('login')}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <ChatBot />
      </>
    );
  }

  if (currentView === 'set-password') {
    return (
      <>
        <SetPassword 
          token={activationToken}
          onPasswordSet={() => setCurrentView('login')}
        />
        <ChatBot />
      </>
    );
  }

  // Dashboard view
  return (
    <>
      <div className="flex h-screen bg-gray-50 font-inter">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          setIsCollapsed={setSidebarCollapsed}
          activePage={activePage}
          setActivePage={handlePageChange}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setActivePage={handlePageChange} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
      <ChatBot />
    </>
  );
}

export default App;
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
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
import BalanceSheet from './components/BalanceSheet';
import TDSReconciliation from './components/TDSReconciliation';
import GSTReconciliation from './components/GSTReconciliation';
import GSTDashboard from './components/GSTDashboard';
import TaxReport from './components/TaxReport';
import SalesEntry from './components/SalesEntry';
import CreditNote from './components/CreditNote';
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
      case 'AR Dashboard':
        return <AccountReceivableDashboard />;
      case 'Accounts Payable':
        return <AccountsPayable />;
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
      case 'Balance Sheet':
        return <BalanceSheet />;
      case 'GST Reconciliation':
        return <GSTReconciliation />;
      case 'Sales Entry':
        return <SalesEntry />;
      case 'Create PO':
        return <CreatePO />;
      case 'Credit Note':
        return <CreditNote />;
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
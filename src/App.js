import React, { useState } from 'react';
import BalanceSheet from './components/BalanceSheet';
import TDSReconciliation from './components/TDSReconciliation';
import GSTReconciliation from './components/GSTReconciliation';
import CreditNote from './components/CreditNote';
import GSTInvoice from './components/GSTInvoice';
import SalesEntry from './components/SalesEntry';
import Sidebar from './components/Sidebar';

function App() {
  const [activeForm, setActiveForm] = useState('balanceSheet');

  const renderActiveForm = () => {
    switch(activeForm) {
      case 'balanceSheet':
        return <BalanceSheet />;
      case 'tdsReconciliation':
        return <TDSReconciliation />;
      case 'gstReconciliation':
        return <GSTReconciliation />;
      case 'creditNote':
        return <CreditNote />;
      case 'gstInvoice':
        return <GSTInvoice />;
      case 'salesEntry':
        return <SalesEntry />;
      default:
        return <BalanceSheet />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeForm={activeForm} setActiveForm={setActiveForm} />
      <div className="flex-1 p-8">
        {renderActiveForm()}
      </div>
    </div>
  );
}

export default App;
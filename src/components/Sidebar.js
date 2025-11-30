import React from 'react';

const Sidebar = ({ activeForm, setActiveForm }) => (
  <div className="w-64 bg-slate-800 text-white min-h-screen p-4">
    <div className="mb-8">
      <h2 className="text-xl font-bold">Accounting</h2>
    </div>
    <nav className="space-y-2">
      <button 
        onClick={() => setActiveForm('balanceSheet')}
        className={`w-full text-left p-2 rounded ${activeForm === 'balanceSheet' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        Balance Sheet
      </button>
      <button 
        onClick={() => setActiveForm('tdsReconciliation')}
        className={`w-full text-left p-2 rounded ${activeForm === 'tdsReconciliation' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        TDS Reconciliation
      </button>
      <button 
        onClick={() => setActiveForm('gstReconciliation')}
        className={`w-full text-left p-2 rounded ${activeForm === 'gstReconciliation' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        GST Reconciliation
      </button>
      <button 
        onClick={() => setActiveForm('salesEntry')}
        className={`w-full text-left p-2 rounded ${activeForm === 'salesEntry' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        Sales Entry
      </button>
      <button 
        onClick={() => setActiveForm('creditNote')}
        className={`w-full text-left p-2 rounded ${activeForm === 'creditNote' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        Credit Note
      </button>
      <button 
        onClick={() => setActiveForm('gstInvoice')}
        className={`w-full text-left p-2 rounded ${activeForm === 'gstInvoice' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
      >
        GST Invoice
      </button>
    </nav>
  </div>
);

export default Sidebar;
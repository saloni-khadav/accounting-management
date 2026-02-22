import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeForm, setActiveForm }) => {
  const [isReceivableOpen, setIsReceivableOpen] = useState(false);

  return (
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
        
        {/* Account Receivable with Submenu */}
        <div>
          <button 
            onClick={() => setIsReceivableOpen(!isReceivableOpen)}
            className="w-full text-left p-2 rounded hover:bg-slate-700 flex items-center justify-between"
          >
            <span>Account Receivable</span>
            {isReceivableOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isReceivableOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button 
                onClick={() => setActiveForm('salesEntry')}
                className={`w-full text-left p-2 rounded text-sm ${activeForm === 'salesEntry' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                Sales Entry
              </button>
              <button 
                onClick={() => setActiveForm('creditNote')}
                className={`w-full text-left p-2 rounded text-sm ${activeForm === 'creditNote' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                Credit Note
              </button>
              <button 
                onClick={() => setActiveForm('gstInvoice')}
                className={`w-full text-left p-2 rounded text-sm ${activeForm === 'gstInvoice' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              >
                GST Invoice
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

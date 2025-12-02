import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  TrendingUp,
  Calculator
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, activePage, setActivePage }) => {

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Account Receivable', icon: Receipt, label: 'Account Receivable' },
    { id: 'Accounts Payable', icon: CreditCard, label: 'Accounts Payable' },
    { id: 'Bank', icon: Wallet, label: 'Bank' },
    { id: 'Taxation', icon: Calculator, label: 'Taxation' },
    { id: 'Assets', icon: TrendingUp, label: 'Assets' },
    { id: 'Balance Sheet', icon: BarChart3, label: 'Balance Sheet' },
    { id: 'GST Reconciliation', icon: FileText, label: 'GST Reconciliation' },
    { id: 'Sales Entry', icon: Users, label: 'Sales Entry' },
    { id: 'Credit Note', icon: Settings, label: 'Credit Note' },
    { id: 'GST Invoice', icon: Receipt, label: 'GST Invoice' },
  ];

  return (
    <div className={`bg-sidebar-bg text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">AccountPro</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-sidebar-hover"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'bg-sidebar-active text-white'
                      : 'hover:bg-sidebar-hover'
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
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
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Account Receivable', icon: Receipt, label: 'Account Receivable' },
    { 
      id: 'Accounts Payable', 
      icon: CreditCard, 
      label: 'Accounts Payable',
      submenu: [
        { id: 'Accounts Payable', label: 'Overview' },
        { id: 'AP Reconciliation', label: 'AP Reconciliation' },
        { id: 'AP Report', label: 'AP Report' },
        { id: 'Approvals & Workflows', label: 'Approvals & Workflows' }
      ]
    },
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
                  onClick={() => {
                    if (item.submenu) {
                      setExpandedMenu(expandedMenu === item.id ? null : item.id);
                    } else {
                      setActivePage(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'bg-sidebar-active text-white'
                      : 'hover:bg-sidebar-hover'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon size={20} />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.submenu && (
                    <ChevronRight size={16} className={`transition-transform ${expandedMenu === item.id ? 'rotate-90' : ''}`} />
                  )}
                </button>
                {!isCollapsed && item.submenu && expandedMenu === item.id && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.id}>
                        <button
                          onClick={() => setActivePage(subItem.id)}
                          className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                            activePage === subItem.id
                              ? 'bg-sidebar-active text-white'
                              : 'hover:bg-sidebar-hover'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
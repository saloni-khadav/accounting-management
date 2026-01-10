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
  Calculator,
  ChevronDown,
  Upload,
  ShoppingCart,
  DollarSign,
  Building,
  Percent,
  FileCheck,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, activePage, setActivePage }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { 
      id: 'Accounts Payable', 
      icon: CreditCard, 
      label: 'Accounts Payable',
      submenu: [
        { id: 'Accounts Payable', label: 'Overview' },
        { id: 'Bills', label: 'Bills' },
        { id: 'Payments', label: 'Payments' },
        { id: 'Purchase Orders', label: 'Purchase Orders' },
        { id: 'Credit/Debit Notes', label: 'Credit/Debit Notes' },
        { id: 'TDS on Purchases', label: 'TDS on Purchases' },
        { id: 'Vendors Aging', label: 'Vendors Aging' },
        { id: 'Vendor Master', label: 'Vendor Master' },
        { id: 'AP Reconciliation', label: 'AP Reconciliation' },
        { id: 'AP Report', label: 'AP Report' },
        { id: 'Approvals & Workflows', label: 'Approvals & Workflows' }
      ]
    },
    { 
      id: 'Taxation', 
      icon: Calculator, 
      label: 'Taxation',
      submenu: [
        { id: 'Taxation', label: 'TDS Reconciliation' },
        { id: 'GST Reconciliation', label: 'GST Reconciliation' },
        { id: 'GST Dashboard', label: 'GST Dashboard' },
        { id: 'Tax Report', label: 'Tax Report' }
      ]
    },
    { id: 'Assets', icon: TrendingUp, label: 'Assets' },
    { id: 'Balance Sheet', icon: BarChart3, label: 'Balance Sheet' },
    { id: 'Import/Export', icon: Upload, label: 'Import/Export' },
  ];

  const receivableItems = [
    { id: 'AR Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Client Master', icon: Users, label: 'Client Master' },
    { id: 'AR Reconciliation', icon: FileText, label: 'AR Reconciliation' },
    { id: 'Create PO', icon: FileText, label: 'Create PO' },
    { id: 'Client Outstanding', icon: Users, label: 'Client Outstanding' },
    { id: 'Debtors Aging', icon: BarChart3, label: 'Debtors Aging' },
    { id: 'Collection Register', icon: CreditCard, label: 'Collection Register' },
    { id: 'Credit Note', icon: Settings, label: 'Credit Note' },
    { id: 'Invoice Management', icon: BarChart3, label: 'Tax Invoice' },
  ];

  return (
    <div className={`bg-sidebar-bg text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">Accounting</h1>
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
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <button
              onClick={() => setActivePage('dashboard')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-sidebar-active text-white'
                  : 'hover:bg-sidebar-hover'
              }`}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && (
                <span className="ml-3 font-medium">Dashboard</span>
              )}
            </button>
          </li>
          
          {/* Account Receivable with Submenu */}
          <li>
            <button
              onClick={() => {
                setExpandedMenu(expandedMenu === 'Account Receivable' ? null : 'Account Receivable');
              }}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activePage === 'Account Receivable'
                  ? 'bg-sidebar-active text-white'
                  : 'hover:bg-sidebar-hover'
              }`}
            >
              <Receipt size={20} />
              {!isCollapsed && (
                <>
                  <span className="ml-3 font-medium flex-1 text-left">Account Receivable</span>
                  <ChevronDown size={16} className={`transition-transform ${expandedMenu === 'Account Receivable' ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            
            {expandedMenu === 'Account Receivable' && !isCollapsed && (
              <ul className="ml-8 mt-1 space-y-1">
                {receivableItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center p-2 rounded-lg transition-colors text-sm ${
                          activePage === item.id
                            ? 'bg-sidebar-active text-white'
                            : 'hover:bg-sidebar-hover'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="ml-2">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
          
          {/* Bank with Submenu */}
          <li>
            <button
              onClick={() => {
                setExpandedMenu(expandedMenu === 'Bank' ? null : 'Bank');
              }}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activePage === 'Bank Dashboard'
                  ? 'bg-sidebar-active text-white'
                  : 'hover:bg-sidebar-hover'
              }`}
            >
              <Wallet size={20} />
              {!isCollapsed && (
                <>
                  <span className="ml-3 font-medium flex-1 text-left">Bank</span>
                  <ChevronDown size={16} className={`transition-transform ${expandedMenu === 'Bank' ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
            
            {expandedMenu === 'Bank' && !isCollapsed && (
              <ul className="ml-8 mt-1 space-y-1">
                <li>
                  <button
                    onClick={() => setActivePage('Bank Dashboard')}
                    className={`w-full flex items-center p-2 rounded-lg transition-colors text-sm ${
                      activePage === 'Bank Dashboard'
                        ? 'bg-sidebar-active text-white'
                        : 'hover:bg-sidebar-hover'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span className="ml-2">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Bank Reconciliation')}
                    className={`w-full flex items-center p-2 rounded-lg transition-colors text-sm ${
                      activePage === 'Bank Reconciliation'
                        ? 'bg-sidebar-active text-white'
                        : 'hover:bg-sidebar-hover'
                    }`}
                  >
                    <FileText size={16} />
                    <span className="ml-2">Reconciliation</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('Bank Statement Upload')}
                    className={`w-full flex items-center p-2 rounded-lg transition-colors text-sm ${
                      activePage === 'Bank Statement Upload'
                        ? 'bg-sidebar-active text-white'
                        : 'hover:bg-sidebar-hover'
                    }`}
                  >
                    <FileText size={16} />
                    <span className="ml-2">Statement Upload</span>
                  </button>
                </li>
              </ul>
            )}
          </li>
          
          {/* Other Menu Items */}
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
                    <ChevronDown size={16} className={`transition-transform ${expandedMenu === item.id ? 'rotate-180' : ''}`} />
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
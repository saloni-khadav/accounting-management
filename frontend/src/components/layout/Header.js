import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

const Header = ({ setActivePage, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [companyName, setCompanyName] = useState('John Doe');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Available pages for search
  const availablePages = [
    { name: 'Dashboard', key: 'dashboard' },
    // Account Receivable
    { name: 'Account Receivable', key: 'Account Receivable' },
    { name: 'AR Dashboard', key: 'AR Dashboard' },
    { name: 'Client Master', key: 'Client Master' },
    { name: 'AR Reconciliation', key: 'AR Reconciliation' },
    { name: 'Proforma Invoice', key: 'Create PO' },
    { name: 'Client Outstanding', key: 'Client Outstanding' },
    { name: 'Debtors Aging', key: 'Debtors Aging' },
    { name: 'Collection Register', key: 'Collection Register' },
    { name: 'Credit Note', key: 'Credit Note' },
    { name: 'Tax Invoice', key: 'Invoice Management' },
    // Accounts Payable
    { name: 'Accounts Payable', key: 'Accounts Payable' },
    { name: 'Bills', key: 'Bills' },
    { name: 'Payments', key: 'Payments' },
    { name: 'Purchase Orders', key: 'Purchase Orders' },
    { name: 'Credit/Debit Notes', key: 'Credit/Debit Notes' },
    { name: 'TDS on Purchases', key: 'TDS on Purchases' },
    { name: 'Vendors Aging', key: 'Vendors Aging' },
    { name: 'Vendor Master', key: 'Vendor Master' },
    { name: 'AP Reconciliation', key: 'AP Reconciliation' },
    { name: 'AP Report', key: 'AP Report' },
    // Bank
    { name: 'Bank Dashboard', key: 'Bank Dashboard' },
    { name: 'Bank Reconciliation', key: 'Bank Reconciliation' },
    { name: 'Bank Statement Upload', key: 'Bank Statement Upload' },
    // Taxation
    { name: 'TDS Reconciliation', key: 'Taxation' },
    { name: 'GST Reconciliation', key: 'GST Reconciliation' },
    { name: 'GST Dashboard', key: 'GST Dashboard' },
    { name: 'Tax Report', key: 'Tax Report' },
    // Other Pages
    { name: 'Assets', key: 'Assets' },
    { name: 'Balance Sheet', key: 'Balance Sheet' },
    { name: 'Import/Export', key: 'Import/Export' },
    { name: 'Approvals & Workflows', key: 'Approvals & Workflows' },
    { name: 'Manager Approvals', key: 'Approvals' },
    { name: 'Profile', key: 'profile' },
    { name: 'Settings', key: 'settings' }
  ];

  const filteredPages = availablePages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('https://nextbook-backend.nextsphere.co.in/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.user) {
            setCompanyName(result.user.companyName || result.user.fullName || 'John Doe');
            if (result.user.profile && result.user.profile.companyLogo) {
              setCompanyLogo(result.user.profile.companyLogo);
            }
          }
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleProfileClick = () => {
    setActivePage('profile');
    setShowDropdown(false);
  };

  const handleSettingsClick = () => {
    setActivePage('settings');
    setShowDropdown(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const matchedPage = availablePages.find(page => 
        page.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedPage) {
        setActivePage(matchedPage.key);
        setSearchQuery('');
        setShowSearchResults(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const selectPage = (pageKey) => {
    setActivePage(pageKey);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowDropdown(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && filteredPages.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredPages.map((page) => (
                <button
                  key={page.key}
                  onClick={() => selectPage(page.key)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <span className="font-medium text-gray-700">{companyName}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button 
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <hr className="my-2" />
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
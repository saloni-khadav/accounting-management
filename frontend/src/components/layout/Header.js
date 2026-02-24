import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, X } from 'lucide-react';

const Header = ({ setActivePage, onLogout }) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://nextbook-backend.nextsphere.co.in';
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const availablePages = [
    { name: 'Dashboard', key: 'dashboard' },
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
    { name: 'Bank Dashboard', key: 'Bank Dashboard' },
    { name: 'Bank Reconciliation', key: 'Bank Reconciliation' },
    { name: 'Bank Statement Upload', key: 'Bank Statement Upload' },
    { name: 'TDS Reconciliation', key: 'Taxation' },
    { name: 'GST Reconciliation', key: 'GST Reconciliation' },
    { name: 'GST Dashboard', key: 'GST Dashboard' },
    { name: 'Tax Report', key: 'Tax Report' },
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

        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Header - User data:', result); // Debug log
          if (result.user) {
            // Use only companyName (not tradeName)
            const displayName = result.user.companyName || result.user.fullName || '';
            console.log('Header - Display name:', displayName); // Debug log
            setCompanyName(displayName);
            
            if (result.user.profile && result.user.profile.companyLogo) {
              console.log('Header - Logo URL:', result.user.profile.companyLogo); // Debug log
              setCompanyLogo(result.user.profile.companyLogo);
            }
          }
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };

    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        console.log('Fetching notifications...');
        const response = await fetch(`${baseUrl}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Notification response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Notifications data:', data);
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        } else {
          const error = await response.json();
          console.error('Notification error:', error);
        }
      } catch (error) {
        console.log('Error loading notifications:', error);
      }
    };

    loadUserData();
    loadNotifications();
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      console.log('Settings updated event received'); // Debug log
      loadUserData();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${baseUrl}/api/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => 
        n._id === notification._id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (notification.link) {
        setActivePage(notification.link);
      }
      setShowNotifications(false);
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${baseUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const createTestNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/notifications/test/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Test notifications created!');
        window.location.reload();
      }
    } catch (error) {
      console.log('Error creating test notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'payment': return '💰';
      case 'invoice': return '📄';
      case 'bill': return '🧾';
      case 'approval': return '✅';
      case 'overdue': return '⚠️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

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

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-80">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No notifications</p>
                      <button
                        onClick={createTestNotifications}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Create Test Notifications
                      </button>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                            <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{getTimeAgo(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-transparent">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-600" />
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
// API utility for handling requests with proper error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (response.status === 404) {
      console.warn(`Endpoint not found: ${url}`);
      return { success: false, error: 'Endpoint not found', status: 404 };
    }

    if (response.status === 403) {
      console.warn(`Permission denied: ${url}`);
      return { success: false, error: 'Permission denied', status: 403 };
    }

    if (response.status === 401) {
      console.warn('Authentication failed');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return { success: false, error: 'Authentication failed', status: 401 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || 'Request failed', 
        status: response.status 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error.message || 'Network error', 
      status: 0 
    };
  }
};

// Permission checker
export const hasPermission = (userRole, requiredPermission) => {
  const rolePermissions = {
    'admin': ['*'], // Admin has all permissions
    'manager': [
      'view_notifications', 'manage_notifications', 'view_dashboard', 
      'view_reports', 'manage_approvals', 'view_all_data'
    ],
    'accountant': [
      'view_notifications', 'manage_bills', 'manage_invoices', 
      'manage_payments', 'view_dashboard', 'manage_vendors', 'manage_clients'
    ],
    'user': [
      'view_notifications', 'view_dashboard', 'view_own_data'
    ]
  };

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('*') || permissions.includes(requiredPermission);
};
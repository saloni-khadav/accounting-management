const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Admin has all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Check if user has required permission
      if (user.permissions && user.permissions.includes(requiredPermission)) {
        return next();
      }

      // Default permissions for basic operations
      const defaultPermissions = {
        'manager': ['view_notifications', 'view_dashboard', 'view_reports'],
        'accountant': ['view_notifications', 'manage_bills', 'manage_invoices'],
        'user': ['view_notifications', 'view_dashboard']
      };

      if (defaultPermissions[user.role] && defaultPermissions[user.role].includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: requiredPermission,
        userRole: user.role
      });
    } catch (error) {
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

module.exports = { checkPermission };
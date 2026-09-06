const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Try loading fresh admin profile from MongoDB if ID exists
    if (decoded.id) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        if (!admin.isActive) {
          return res.status(403).json({ message: 'Your admin account has been deactivated. Contact Super Admin.' });
        }
        req.admin = {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
        };
        return next();
      }
    }

    // Fallback if legacy token or master env admin
    req.admin = {
      id: decoded.id || null,
      name: decoded.name || 'Super Admin',
      email: decoded.email,
      role: decoded.role || 'super_admin',
      permissions: decoded.permissions || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Super Admin privileges required.' });
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    // Super Admin has access to all modules
    if (req.admin.role === 'super_admin') {
      return next();
    }
    // Check permission list
    if (Array.isArray(req.admin.permissions) && req.admin.permissions.includes(permissionKey)) {
      return next();
    }
    return res.status(403).json({
      message: `Access denied: You do not have permission to access '${permissionKey}'.`,
      requiredPermission: permissionKey,
    });
  };
};

module.exports = { adminProtect, requireSuperAdmin, requirePermission };

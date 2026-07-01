const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const protect = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;

            // Fetch role permissions from the database
            const role = await Role.findOne({ name: user.role });
            req.user.permissions = role && role.permissions ? role.permissions : [];

            return next();
        }
        
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log(`[AUTH LOG] Denied: No user found in request`);
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        if (req.user.email === 'admin@smtbms.com' || req.user.role === 'Super Admin' || req.user.role === 'Admin') {
            console.log(`[AUTH LOG] Allowed: Admin bypass for user ${req.user.email}`);
            return next();
        }
        
        const hasPermission = requiredPermissions.some(permission => 
            req.user.permissions.includes(permission)
        );
        
        if (hasPermission) {
            console.log(`[AUTH LOG] Allowed: User ${req.user.email} (${req.user.role}) has required permission`);
            return next();
        }
        
        console.log(`[AUTH LOG] Denied: User ${req.user.email} (${req.user.role}) lacks permissions: ${requiredPermissions.join(', ')}`);
        return res.status(403).json({ message: `User role ${req.user.role} is not authorized to perform this action` });
    };
};

module.exports = { protect, authorize };

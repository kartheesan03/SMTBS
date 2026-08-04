const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Role = require('../models/Role');
const { logAudit } = require('../services/auditService');
const getRolePermissions = async (roleName) => {
    try {
        const role = await Role.findOne({ name: roleName });
        let perms = role && role.permissions ? (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions) : [];
        if (roleName && roleName.toLowerCase() === 'employee') {
            const empPerms = ['view_materials_self', 'view_dashboard', 'view_tasks_self', 'view_leave_self', 'view_erp'];
            empPerms.forEach(p => { if (!perms.includes(p)) perms.push(p); });
        }
        if (roleName && roleName.toLowerCase() === 'sales') {
            const salesPerms = ['view_dashboard', 'view_crm', 'manage_crm', 'view_erp', 'manage_erp'];
            salesPerms.forEach(p => { if (!perms.includes(p)) perms.push(p); });
        }
        if (roleName && roleName.toLowerCase() === 'hr') {
            const hrPerms = [
                'view_hrms', 'manage_hrms',
                'hrms:employeeData:view', 'hrms:employeeData:manage',
                'hrms:attendance:view', 'hrms:attendance:manage',
                'hrms:payroll:view', 'hrms:payroll:generate', 'hrms:payroll:manage',
                'hrms:performance:view', 'hrms:performance:manage',
                'hrms:leave:view', 'hrms:leave:manage',
                'hrms:mySalary:view'
            ];
            hrPerms.forEach(p => { if (!perms.includes(p)) perms.push(p); });
        }
        if (roleName && roleName.toLowerCase() === 'manager') {
            const managerPerms = [
                'view_materials', 'manage_materials',
                'view_hrms', 
                'view_erp', 'manage_erp',
                'view_crm', 'manage_crm',
                'view_tasks', 'manage_tasks',
                'view_reports', 'view_dashboard'
            ];
            managerPerms.forEach(p => { if (!perms.includes(p)) perms.push(p); });
        }
        return perms;
    } catch (e) {
        console.error("Error fetching permissions:", e);
        return [];
    }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, phone, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid user data' });
        }
        logAudit({
            user: { id: user._id, name: user.name },
            action: 'CREATE',
            module: 'Auth',
            description: `New user registered: ${user.name} (${user.role}).`,
            ipAddress: req.ip
        }).catch(() => {});
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password, role: requestedRole } = req.body;
        console.log(`[LOGIN] Received login request for email: ${email}, requestedRole: ${requestedRole}`);
    const user = await User.findOne({ email });
    console.log(`[LOGIN] User found in DB: ${!!user}`);
    if (!user) {
        console.error(`[LOGIN] Login failed for email: ${email} - Account not found`);
        return res.status(404).json({ message: 'Account not found. Please contact the administrator or register an account.' });
    }
    const isMatch = await user.matchPassword(password);
    console.log(`[LOGIN] bcrypt password match: ${isMatch}`);
    if (!isMatch) {
        console.error(`[LOGIN] Login failed for email: ${email} - Invalid password`);
        return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }
    let role = user.role;
    if (requestedRole) {
        let isRoleValid = false;
        const dbRole = (role || '').toLowerCase();
        const reqRole = (requestedRole || '').toLowerCase();
        if (reqRole === dbRole) {
            isRoleValid = true;
        } else if (reqRole === 'admin' && dbRole === 'super admin') {
            isRoleValid = true;
        }
        if (!isRoleValid) {
            console.error(`[LOGIN] Login failed for email: ${email} - Role mismatch. Expected ${role}, got ${requestedRole}`);
            return res.status(403).json({ message: `Role mismatch. This account is registered as ${role}.` });
        }
    }
    let actualName = user.name;
    const permissions = await getRolePermissions(role);
    if (user.email === 'admin@smtbms.com' && !permissions.includes('all')) {
        permissions.push('all');
    }
    logAudit({
        user: { id: user._id, name: actualName },
        action: 'LOGIN',
        module: 'Auth',
        description: `${actualName} (${role}) logged in successfully.`,
        ipAddress: req.ip
    }).catch(() => {});
    return res.json({
        _id: user._id,
        name: actualName,
        email: user.email,
        role: role,
        permissions: permissions,
        picture: user.picture,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: actualName,
            email: user.email,
            role: role,
            permissions: permissions,
            picture: user.picture,
            isProfileComplete: user.isProfileComplete
        }
    });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
const googleAuth = async (req, res) => {
    try {
        const { credential, access_token, mode, role: reqRole } = req.body;
        const selectedRole = reqRole || 'Customer';
        if (!credential && !access_token) {
            return res.status(400).json({ message: 'Google credential or access token is required' });
        }
        let email, name, googleId, picture;
        if (access_token) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            const payload = await response.json();
            if (!response.ok) {
                return res.status(400).json({ message: 'Invalid Google access token' });
            }
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
            picture = payload.picture;
        } else {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
            picture = payload.picture;
        }
        if (typeof email !== 'string') {
            email = String(email);
        }
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Valid email is required' });
        }
        // NOTE: Mongoose-bridge automatically wraps this query into { where: { email } }. 
        // Passing { where: { email } } manually causes Sequelize to receive { where: { where: { email } } } which crashes it.
        let user = await User.findOne({ email });
        if (mode === 'login' && !user) {
            return res.status(404).json({ message: 'No account found. Please sign up with Google first.' });
        }
        if (user) {
            let shouldSave = false;
            if (!user.googleId) {
                user.googleId = googleId;
                shouldSave = true;
            }
            if (picture && !user.picture) {
                user.picture = picture;
                shouldSave = true;
            }
            if (shouldSave) {
                await user.save();
            }
            let role = user.role;
            if (mode === 'login' && reqRole) {
                let isRoleValid = false;
                if (reqRole === role) {
                    isRoleValid = true;
                } else if (reqRole === 'Admin' && role === 'Super Admin') {
                    isRoleValid = true;
                }
                if (!isRoleValid) {
                    console.error(`[LOGIN] Google Login failed for email: ${email} - Role mismatch. Expected ${role}, got ${reqRole}`);
                    return res.status(403).json({ message: `Role mismatch. This account is registered as ${role}.` });
                }
            }
            let actualName = user.name;
            const permissions = await getRolePermissions(role);
            if (user.email === 'admin@smtbms.com' && !permissions.includes('all')) {
                permissions.push('all');
            }
            return res.json({
                success: true,
                _id: user.id || user._id,
                name: actualName,
                email: user.email,
                role: role,
                permissions: permissions,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: actualName,
                    email: user.email,
                    role: role,
                    permissions: permissions,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete,
                    createdAt: user.createdAt
                }
            });
        } else {
            const crypto = require('crypto');
            const dummyPassword = crypto.randomBytes(32).toString('hex');
            user = await User.create({
                name,
                email,
                googleId,
                role: selectedRole,
                password: dummyPassword,
                provider: 'google',
                active: true,
                isProfileComplete: false,
                picture: picture
            });
            if (selectedRole === 'Vendor') {
                const Vendor = require('../models/Vendor');
                await Vendor.create({
                    name: user.name,
                    email: user.email,
                    company: 'Pending Details',
                    phone: '0000000000',
                    address: 'Pending',
                    status: 'Active',
                    userId: user.id || user._id
                });
            } else {
                await Customer.create({
                    name: user.name,
                    email: user.email,
                    company: 'Pending Details',
                    phone: '0000000000',
                    industry: 'Pending',
                    address: 'Pending',
                    status: 'Lead',
                    userId: user.id || user._id
                });
            }
            const permissions = await getRolePermissions(user.role);
            return res.json({
                success: true,
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: permissions,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete
                }
            });
        }
    } catch (error) {
        console.error('==== GOOGLE AUTH ERROR ====');
        console.error(error);
        if (error.errors) {
            error.errors.forEach(e => console.error('Validation Error:', e.message));
        }
        console.error('===========================');
        return res.status(500).json({ message: 'Server error during Google Authentication: ' + error.message });
    }
};

/**
 * Microsoft OAuth2 Authentication
 * Receives an access_token from the frontend (obtained via the OAuth2 implicit flow popup),
 * validates it against Microsoft Graph /me, then finds or creates a user.
 */
const microsoftAuth = async (req, res) => {
    try {
        const { access_token, mode, role: reqRole } = req.body;
        const selectedRole = reqRole || 'Customer';

        if (!access_token) {
            return res.status(400).json({ message: 'Microsoft access token is required' });
        }

        // Call Microsoft Graph to get the user's profile
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!graphResponse.ok) {
            const errBody = await graphResponse.json().catch(() => ({}));
            console.error('[MICROSOFT AUTH] Graph API error:', errBody);
            return res.status(400).json({ message: 'Invalid Microsoft access token' });
        }

        const profile = await graphResponse.json();

        // Microsoft Graph returns: id, displayName, mail or userPrincipalName
        const microsoftId = profile.id;
        const name = profile.displayName || profile.userPrincipalName;
        let email = profile.mail || profile.userPrincipalName;

        // userPrincipalName can be an email or a UPN like user@tenant.onmicrosoft.com
        if (!email) {
            return res.status(400).json({ message: 'Could not retrieve email from Microsoft account' });
        }
        email = String(email).toLowerCase().trim();

        // Find existing user
        let user = await User.findOne({ email });

        if (mode === 'login' && !user) {
            return res.status(404).json({ message: 'No account found. Please sign up with Microsoft first.' });
        }

        if (user) {
            // Update microsoftId if not stored yet
            let shouldSave = false;
            if (!user.microsoftId) {
                user.microsoftId = microsoftId;
                shouldSave = true;
            }
            if (shouldSave) await user.save();

            let role = user.role;

            if (mode === 'login' && reqRole) {
                let isRoleValid = reqRole === role || (reqRole === 'Admin' && role === 'Super Admin');
                if (!isRoleValid) {
                    return res.status(403).json({ message: `Role mismatch. This account is registered as ${role}.` });
                }
            }

            const permissions = await getRolePermissions(role);
            if (user.email === 'admin@smtbms.com' && !permissions.includes('all')) {
                permissions.push('all');
            }

            logAudit({
                user: { id: user.id || user._id, name: user.name },
                action: 'LOGIN',
                module: 'Auth',
                description: `${user.name} (${role}) signed in via Microsoft.`,
                ipAddress: req.ip
            }).catch(() => {});

            return res.json({
                success: true,
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role,
                permissions,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role,
                    permissions,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete,
                }
            });
        } else {
            // Register new user via Microsoft SSO
            const crypto = require('crypto');
            const dummyPassword = crypto.randomBytes(32).toString('hex');
            user = await User.create({
                name,
                email,
                microsoftId,
                role: selectedRole,
                password: dummyPassword,
                provider: 'microsoft',
                active: true,
                isProfileComplete: false,
            });

            if (selectedRole === 'Vendor') {
                await Vendor.create({
                    name: user.name,
                    email: user.email,
                    company: 'Pending Details',
                    phone: '0000000000',
                    address: 'Pending',
                    status: 'Active',
                    userId: user.id || user._id
                });
            } else {
                await Customer.create({
                    name: user.name,
                    email: user.email,
                    company: 'Pending Details',
                    phone: '0000000000',
                    industry: 'Pending',
                    address: 'Pending',
                    status: 'Lead',
                    userId: user.id || user._id
                });
            }

            const permissions = await getRolePermissions(user.role);

            logAudit({
                user: { id: user.id || user._id, name: user.name },
                action: 'CREATE',
                module: 'Auth',
                description: `New user registered via Microsoft SSO: ${user.name} (${user.role}).`,
                ipAddress: req.ip
            }).catch(() => {});

            return res.json({
                success: true,
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete,
                }
            });
        }
    } catch (error) {
        console.error('==== MICROSOFT AUTH ERROR ====');
        console.error(error);
        console.error('==============================');
        return res.status(500).json({ message: 'Server error during Microsoft Authentication: ' + error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.picture) {
                user.picture = req.body.picture;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            let role = updatedUser.role;
            const permissions = await getRolePermissions(role);
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: role,
                permissions: permissions,
                picture: updatedUser.picture,
                isProfileComplete: updatedUser.isProfileComplete,
                token: generateToken(updatedUser._id),
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: role,
                    permissions: permissions,
                    picture: updatedUser.picture,
                    isProfileComplete: updatedUser.isProfileComplete
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            let role = user.role;
            let actualName = user.name;
            const permissions = await getRolePermissions(role);
            if (user.email === 'admin@smtbms.com' && !permissions.includes('all')) {
                permissions.push('all');
            }
            res.json({
                _id: user._id,
                name: actualName,
                email: user.email,
                role: role,
                permissions: permissions,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: actualName,
                    email: user.email,
                    role: role,
                    permissions: permissions,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteAccount = async (req, res) => {
    try {
        const { role, _id } = req.user;
        if (role !== 'Customer' && role !== 'Vendor') {
            return res.status(403).json({ message: 'Only Customers and Vendors can delete their account here.' });
        }
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account.' });
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Account deletion failed.' });
        }
        if (role === 'Customer') {
            const Customer = require('../models/Customer');
            const customer = await Customer.findOne({ userId: _id });
            if (customer) {
                const Order = require('../models/Order');
                const Ticket = require('../models/Ticket');
                await Order.deleteMany({ customer: customer._id });
                await Ticket.deleteMany({ customerId: customer._id });
                await Customer.findByIdAndDelete(customer._id);
            }
        }
        if (role === 'Vendor') {
            const Vendor = require('../models/Vendor');
            const vendor = await Vendor.findOne({ userId: _id });
            if (vendor) {
                const Material = require('../models/Material');
                const Order = require('../models/Order');
                await Material.deleteMany({ vendor: vendor._id });
                await Order.deleteMany({ vendor: vendor._id });
                await Vendor.findByIdAndDelete(vendor._id);
            }
        }
        const Notification = require('../models/Notification');
        await Notification.deleteMany({ user: _id });
        await User.findByIdAndDelete(_id);
        res.json({ message: 'Account and all associated data permanently deleted.' });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: 'Server error during account deletion.' });
    }
};
module.exports = { registerUser, loginUser, googleAuth, microsoftAuth, getUserProfile, updateUserProfile, getUsers, deleteAccount };
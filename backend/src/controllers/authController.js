const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Received login request for email: ${email}`);

    const user = await User.findOne({ email });
    console.log(`[LOGIN] User found in DB: ${!!user}`);

    if (user) {
        const isMatch = await user.matchPassword(password);
        console.log(`[LOGIN] bcrypt password match: ${isMatch}`);

        if (isMatch) {
            let role = user.role;
            if (user.email === 'admin@smtbms.com') {
                role = 'Super Admin';
            }

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: role
                }
            });
        }
    }

    console.error(`[LOGIN] Login failed for email: ${email} - Invalid credentials`);
    res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Google Auth (Login / Signup)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { credential, access_token, signupRole } = req.body;
        
        if (!credential && !access_token) {
            return res.status(400).json({ message: 'Google credential or access token is required' });
        }

        let email, name, googleId, picture;

        if (access_token) {
            // Flow 1: access_token from useGoogleLogin custom button
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
            // Flow 2: idToken from standard GoogleLogin button
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

        // Extract email safely as a string
        if (typeof email !== 'string') {
            email = String(email);
        }

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Valid email is required' });
        }

        // NOTE: Mongoose-bridge automatically wraps this query into { where: { email } }. 
        // Passing { where: { email } } manually causes Sequelize to receive { where: { where: { email } } } which crashes it.
        let user = await User.findOne({ email });

        if (user) {
            // User exists — update googleId or picture if not present, then login
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
            if (user.email === 'admin@smtbms.com') {
                role = 'Super Admin';
            }

            return res.json({
                success: true,
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: role,
                picture: user.picture,
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: role,
                    picture: user.picture,
                    isProfileComplete: user.isProfileComplete
                }
            });
        } else {
            // User does not exist — require signupRole to proceed
            if (!signupRole) {
                return res.status(202).json({
                    requiresRoleSelection: true,
                    message: 'Please select an account type to complete registration.',
                    googleData: { email, name, googleId, picture }
                });
            }

            const actualRole = signupRole === 'Vendor/Supplier' ? 'Vendor' : signupRole;
            
            const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales', 'Customer', 'Vendor'];
            if (!allowedRoles.includes(actualRole)) {
                return res.status(403).json({ message: 'Invalid role selected for Google Sign-In.' });
            }

            // Generate a secure random dummy password for Google users to bypass SQLite NOT NULL constraint
            const crypto = require('crypto');
            const dummyPassword = crypto.randomBytes(32).toString('hex');
            
            user = await User.create({
                name,
                email,
                googleId,
                role: actualRole,
                password: dummyPassword,
                provider: 'google',
                active: true,
                isProfileComplete: false,
                picture: picture
            });

            // Automatically create empty profile
            if (actualRole === 'Customer') {
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
            } else if (actualRole === 'Vendor') {
                await Vendor.create({
                    name: user.name,
                    email: user.email,
                    contactPerson: user.name,
                    phone: '0000000000',
                    address: 'Pending',
                    status: 'Vendor Created',
                    userId: user.id || user._id
                });
            }

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



// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            let role = updatedUser.role;
            if (updatedUser.email === 'admin@smtbms.com') {
                role = 'Super Admin';
            }

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin/Manager
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account permanently (Customer/Vendor only)
// @route   DELETE /api/auth/delete-account
// @access  Private
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

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Account deletion failed.' });
        }

        // Handle Customer Deletion
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

        // Handle Vendor Deletion
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

        // Delete notifications
        const Notification = require('../models/Notification');
        await Notification.deleteMany({ user: _id });

        // Delete User record
        await User.findByIdAndDelete(_id);

        res.json({ message: 'Account and all associated data permanently deleted.' });

    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: 'Server error during account deletion.' });
    }
};

module.exports = { registerUser, loginUser, googleAuth, updateUserProfile, getUsers, deleteAccount };

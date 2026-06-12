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
    const { name, email, password, phone, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone, role });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        let role = user.role;
        if (user.email === 'admin@smtbms.com') {
            role = 'Super Admin';
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role,
            token: generateToken(user._id),
        });
    } else {
        console.error(`Login failed for email: ${email} - Invalid credentials`);
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ message: 'Google token missing' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const googleId = payload.sub;

        let user = await User.findOne({ email });

        if (user) {
            // User exists, update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            let role = user.role;
            if (user.email === 'admin@smtbms.com') {
                role = 'Super Admin';
            }

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                token: generateToken(user._id),
            });
        } else {
            // User does not exist in our database. 
            // We return a 202 Accepted with action 'choose_role' so the frontend
            // can prompt the user if they are a Customer or Vendor.
            // Internal staff (Admin, HR, etc.) are NOT allowed to register this way.
            return res.status(202).json({ 
                action: 'choose_role',
                message: 'Please choose your account type to continue registration.',
                email: email,
                name: name,
                credential: credential // pass the token back so frontend can submit it to the register endpoint
            });
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ message: 'Server error during Google Authentication' });
    }
};

// @desc    Google registration (Customer/Vendor only)
// @route   POST /api/auth/google/register
// @access  Public
const googleRegister = async (req, res) => {
    const { credential, role } = req.body;

    if (!credential || !role) {
        return res.status(400).json({ message: 'Missing credential or role' });
    }

    if (role !== 'Customer' && role !== 'Vendor') {
        return res.status(403).json({ message: 'Auto-registration is only permitted for Customers and Vendors.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const googleId = payload.sub;

        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({ message: 'User already exists. Please sign in normally.' });
        }

        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        user = await User.create({
            name,
            email,
            password: randomPassword,
            role,
            googleId
        });

        // Create the corresponding Customer or Vendor record
        if (role === 'Customer') {
            await Customer.create({
                name,
                email,
                phone: req.body.phone || '',
                address: req.body.address || '',
                company: req.body.company || '',
                customerType: req.body.customerType || 'Individual',
                status: 'Active'
            });
        } else if (role === 'Vendor') {
            await Vendor.create({
                name: req.body.vendorName || name,
                email,
                phone: req.body.phone || '',
                address: req.body.address || '',
                contactPerson: req.body.contactPerson || name,
                category: 'Uncategorized',
                status: 'Vendor Created',
                materialsSupplied: req.body.materialsSupplied || [],
                gstNumber: req.body.gstNumber || ''
            });
        }

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Google Register Error:', error);
        return res.status(500).json({ message: 'Server error during Google Registration' });
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

module.exports = { registerUser, loginUser, googleAuth, googleRegister, updateUserProfile, getUsers };

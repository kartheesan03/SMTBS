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
        const { 
            name, email, password, phone, role,
            customerType, company, address, vendorName, contactPerson, materialsSupplied, gstNumber
        } = req.body;
        
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, phone, role });

        if (!user) {
            return res.status(400).json({ message: 'Invalid user data' });
        }

        // Create associated profile if Customer or Vendor
        if (role === 'Customer') {
            await Customer.create({
                name: name,
                email: email,
                phone: phone || '',
                address: address || '',
                customerType: customerType || 'Individual',
                company: company || '',
                status: 'Active'
            });
        } else if (role === 'Vendor') {
            await Vendor.create({
                name: vendorName || name,
                contactPerson: contactPerson || name,
                email: email,
                phone: phone || '',
                address: address || '',
                materialsSupplied: materialsSupplied || [],
                rating: 0,
                status: 'Active',
                gstNumber: gstNumber || ''
            });
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
            // User does not exist in our database. Block login.
            return res.status(401).json({ message: 'Account not registered' });
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ message: 'Server error during Google Authentication' });
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

module.exports = { registerUser, loginUser, googleAuth, updateUserProfile, getUsers };

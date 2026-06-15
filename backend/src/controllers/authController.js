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
            isProfileComplete: user.isProfileComplete,
            token: generateToken(user._id),
        });
    } else {
        console.error(`Login failed for email: ${email} - Invalid credentials`);
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Google login / signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { credential, signupRole } = req.body;
    
    if (!credential) {
        return res.status(400).json({ message: 'Google token missing' });
    }

    try {
        let email, name, googleId;

        // --- DEV-ONLY MOCK LOGIN BYPASS ---
        if (credential === 'mock_google_token' && process.env.NODE_ENV === 'development') {
            email = req.body.mockEmail || 'test@mock.com';
            name = req.body.mockName || 'Mock User';
            googleId = `mock_id_${email}`;
        } else {
            // --- REAL GOOGLE VERIFICATION ---
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
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
            let userUpdated = false;

            // User exists, update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                userUpdated = true;
            }

            // Update role if signupRole is provided
            if (signupRole) {
                user.role = signupRole === 'Vendor/Supplier' ? 'Vendor' : signupRole;
                const isCustomerOrVendor = user.role === 'Customer' || user.role === 'Vendor';
                user.isProfileComplete = !isCustomerOrVendor;
                userUpdated = true;
            }

            if (userUpdated) {
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
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: role,
                    isProfileComplete: user.isProfileComplete
                }
            });
        } else {
            // User does not exist.
            if (!signupRole) {
                // Return flag to redirect to select-role page
                return res.json({ requireRoleSelection: true, email, name, googleId, credential });
            }

            // Create the new user
            const actualRole = signupRole === 'Vendor/Supplier' ? 'Vendor' : signupRole;
            const isCustomerOrVendor = actualRole === 'Customer' || actualRole === 'Vendor';
            
            user = await User.create({
                name,
                email,
                googleId,
                role: actualRole,
                password: null, // explicitly allow null
                isProfileComplete: !isCustomerOrVendor // Profile is incomplete only for customer/vendor
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
                isProfileComplete: user.isProfileComplete,
                token: generateToken(user.id || user._id),
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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

module.exports = { registerUser, loginUser, googleAuth, updateUserProfile, getUsers };

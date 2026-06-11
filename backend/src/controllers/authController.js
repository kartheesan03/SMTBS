const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// @desc    Google login/register (Simulated for Development)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const { googleToken, email, name } = req.body;
    
    // In a real scenario, we would verify the googleToken using google-auth-library here.
    // Since the user requested a simulated setup for now:
    if (!email || !name) {
        return res.status(400).json({ message: 'Invalid simulated Google payload' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            // User exists, just log them in
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
            // User does not exist, create them
            // We generate a secure random password since the DB requires one if not null, 
            // though we allowed null earlier. We'll set a placeholder to be safe.
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            
            user = await User.create({ 
                name, 
                email, 
                password: randomPassword, 
                role: 'Employee', 
                googleId: 'simulated_google_id_' + Date.now() 
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400).json({ message: 'Invalid user data during Google Auth' });
            }
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Server error during Google Authentication' });
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

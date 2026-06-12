const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, googleRegister, updateUserProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/google/register', googleRegister);
router.get('/users', protect, getUsers);
router.put('/profile', protect, updateUserProfile);

module.exports = router;

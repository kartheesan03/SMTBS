const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/users', protect, getUsers);
router.put('/profile', protect, updateUserProfile);

module.exports = router;

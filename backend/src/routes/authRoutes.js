const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getUserProfile, updateUserProfile, getUsers, deleteAccount } = require('../controllers/authcontroller');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/users', protect, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;

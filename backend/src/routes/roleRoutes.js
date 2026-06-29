const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole, getPermissions } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRoles);
router.post('/', protect, createRole);
router.put('/:id', protect, updateRole);
router.delete('/:id', protect, deleteRole);
router.get('/permissions', protect, getPermissions);

module.exports = router;

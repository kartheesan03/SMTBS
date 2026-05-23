const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getMaterials)
    .post(protect, authorize('Admin', 'Manager', 'Sales'), createMaterial);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager', 'Sales'), updateMaterial)
    .delete(protect, authorize('Admin'), deleteMaterial);

module.exports = router;

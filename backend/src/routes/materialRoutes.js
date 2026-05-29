const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, updateMaterial, deleteMaterial, getLowStockMaterials, recalculateStockStatus } = require('../controllers/materialcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getMaterials)
    .post(protect, authorize('Admin', 'Manager', 'Sales'), createMaterial);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager', 'Sales'), updateMaterial)
    .delete(protect, authorize('Admin'), deleteMaterial);
router.get('/low-stock', protect, authorize('HR', 'Manager', 'Sales'), getLowStockMaterials);
router.put('/recalculate-status', protect, authorize('Admin', 'Manager', 'Sales'), recalculateStockStatus);


module.exports = router;

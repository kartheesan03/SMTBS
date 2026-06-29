const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, updateMaterial, deleteMaterial, getLowStockMaterials, recalculateStockStatus, getMaterialMovements, getAllMovements, getMaterialAnalytics, archiveMaterial } = require('../controllers/materialcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/analytics', protect, getMaterialAnalytics);
router.get('/low-stock', protect, authorize('HR', 'Manager', 'Sales'), getLowStockMaterials);
router.get('/movements/all', protect, getAllMovements);
router.put('/recalculate-status', protect, authorize('Admin', 'Manager', 'Sales'), recalculateStockStatus);

router.route('/')
    .get(protect, getMaterials)
    .post(protect, authorize('Admin', 'Manager', 'Sales', 'Employee'), createMaterial);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager', 'Sales', 'Employee'), updateMaterial)
    .delete(protect, authorize('Admin'), deleteMaterial);

router.put('/:id/archive', protect, authorize('Admin'), archiveMaterial);

router.get('/:id/movements', protect, getMaterialMovements);

module.exports = router;

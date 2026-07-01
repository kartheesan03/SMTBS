const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, updateMaterial, deleteMaterial, getLowStockMaterials, recalculateStockStatus, getMaterialMovements, getAllMovements, getMaterialAnalytics, archiveMaterial, getMaterialList } = require('../controllers/materialcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/list', protect, require('../controllers/materialcontroller').getMaterialList);
router.get('/list', protect, getMaterialList);
router.get('/analytics', protect, getMaterialAnalytics);
router.get('/low-stock', protect, authorize('view_materials'), getLowStockMaterials);
router.get('/movements/all', protect, getAllMovements);
router.put('/recalculate-status', protect, authorize('manage_materials'), recalculateStockStatus);

router.route('/')
    .get(protect, authorize('view_materials'), getMaterials)
    .post(protect, authorize('manage_materials'), createMaterial);

router.route('/:id')
    .get(protect, authorize('view_materials', 'view_erp'), require('../controllers/materialcontroller').getMaterialById)
    .put(protect, authorize('manage_materials'), updateMaterial)
    .delete(protect, authorize('manage_materials'), deleteMaterial);

router.put('/:id/archive', protect, authorize('manage_materials'), archiveMaterial);

router.get('/:id/movements', protect, getMaterialMovements);

module.exports = router;

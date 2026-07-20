const express = require('express');
const router = express.Router();
const {
    getMaterials, createMaterial, updateMaterial, updateMaterialLocation,
    deleteMaterial, getLowStockMaterials, recalculateStockStatus,
    getMaterialMovements, getAllMovements, getMaterialAnalytics,
    archiveMaterial, getMaterialList, getMaterialById, getTimeline,
    getLowStockCount, updateMovement
} = require('../controllers/materialcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── Static / named routes (must come before /:id) ────────────────────────────
router.get('/list',                protect, getMaterialList);
router.get('/analytics',           protect, getMaterialAnalytics);
router.get('/low-stock',           protect, authorize('view_materials'), getLowStockMaterials);
router.get('/low-stock-count',     protect, getLowStockCount);
router.get('/movements/all',       protect, getAllMovements);
router.put('/movements/:id',       protect, authorize('manage_materials', 'view_erp'), updateMovement);
router.put('/recalculate-status',  protect, authorize('manage_materials'), recalculateStockStatus);

// ── Collection routes ─────────────────────────────────────────────────────────
router.route('/')
    .get(protect, authorize('view_materials'), getMaterials)
    .post(protect, authorize('manage_materials'), createMaterial);

// ── Single-item routes ────────────────────────────────────────────────────────
router.route('/:id')
    .get(protect, authorize('view_materials', 'view_erp'), getMaterialById)
    .put(protect, authorize('manage_materials'), updateMaterial)
    .delete(protect, authorize('manage_materials'), deleteMaterial);

router.put('/:id/archive',   protect, authorize('manage_materials'), archiveMaterial);
router.put('/:id/location',  protect, authorize('manage_materials'), updateMaterialLocation);
router.get('/:id/movements', protect, getMaterialMovements);
router.get('/:id/timeline',  protect, getTimeline);

module.exports = router;

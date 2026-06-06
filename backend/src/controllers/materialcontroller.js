const Material = require('../models/Material');
const { notifyManager, notifyCritical } = require('../services/notificationService');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}).populate('vendor', 'name email contactPerson phone');
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = async (req, res) => {
    const { name, sku, category, quantity, lowStockThreshold, unit, price, vendorId } = req.body;
    try {
        let status = 'In Stock';
        if (Number(quantity) === 0) {
            status = 'Out of Stock';
        } else if (Number(quantity) < Number(lowStockThreshold)) {
            status = 'Low Stock';
        }
        const createdMaterial = await Material.create({ name, sku, category, quantity, lowStockThreshold, unit, price, status, vendorId });

        await notifyManager({
            title: 'New Material Added',
            message: `${name} (SKU: ${sku}) has been added to inventory with ${quantity} ${unit}.`,
            type: 'info',
            category: 'stock'
        });

        res.status(201).json(createdMaterial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private/Admin/Manager
const updateMaterial = async (req, res) => {
    const { name, sku, category, quantity, lowStockThreshold, unit, price, vendorId } = req.body;
    try {
        const material = await Material.findById(req.params.id);
        if (material) {
            material.name = name || material.name;
            material.sku = sku || material.sku;
            material.category = category || material.category;
            material.quantity = quantity !== undefined ? quantity : material.quantity;
            material.lowStockThreshold = lowStockThreshold || material.lowStockThreshold;
            material.unit = unit || material.unit;
            material.price = price !== undefined ? price : material.price;
            if (vendorId !== undefined) material.vendorId = vendorId;
            
            if (material.quantity === 0) {
            material.status = 'Out of Stock';
        } else if (material.quantity < material.lowStockThreshold) {
            material.status = 'Low Stock';
        } else {
            material.status = 'In Stock';
        }    

            const updatedMaterial = await material.save();

            if (updatedMaterial.status === 'Low Stock' || updatedMaterial.status === 'Out of Stock') {
                await notifyCritical({
                    title: `Stock Alert: ${updatedMaterial.name}`,
                    message: `${updatedMaterial.name} is currently ${updatedMaterial.status} (${updatedMaterial.quantity} ${updatedMaterial.unit} left).`,
                    category: 'stock'
                });
            } else {
                await notifyManager({
                    title: 'Material Updated',
                    message: `${updatedMaterial.name} inventory details have been updated.`,
                    type: 'info',
                    category: 'stock'
                });
            }

            res.json(updatedMaterial);
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (material) {
            await material.deleteOne();
            res.json({ message: 'Material removed' });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get low stock materials
// @route   GET /api/materials/low-stock
// @access  Private (HR, Manager, Sales)
const getLowStockMaterials = async (req, res) => {
    try {
        // Recalculate statuses for all materials
        const materials = await Material.find({});
        for (const material of materials) {
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.lowStockThreshold && material.quantity <= material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {
                material.status = 'In Stock';
            }
            await material.save();
        }
        // Return only materials with status 'Low Stock'
        const lowStockMaterials = await Material.find({ status: 'Low Stock' });
        res.json(lowStockMaterials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

    // @desc    Get count of low stock materials
    // @route   GET /api/materials/low-stock-count
    // @access  Private (HR, Manager, Sales)
    const getLowStockCount = async (req, res) => {
        try {
            const lowStockMaterials = await Material.find({ status: 'Low Stock' });
            res.json({ count: lowStockMaterials.length });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

// @desc    Recalculate stock status for all materials
// @route   PUT /api/materials/recalculate-status
// @access  Private (Admin, Manager, Sales)
const recalculateStockStatus = async (req, res) => {
    try {
        const materials = await Material.find({});
        for (const material of materials) {
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.lowStockThreshold && material.quantity < material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {

                material.status = 'In Stock';
            }
            await material.save();
        }
        res.json({ message: 'Stock status recalculated for all materials' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMaterials, createMaterial, updateMaterial, deleteMaterial, getLowStockMaterials, recalculateStockStatus, getLowStockCount };

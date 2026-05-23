const Material = require('../models/Material');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({});
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = async (req, res) => {
    const { name, sku, category, quantity, lowStockThreshold, unit, price } = req.body;
    try {
        let status = 'In Stock';
        if (Number(quantity) === 0) {
            status = 'Out of Stock';
        } else if (Number(quantity) <= Number(lowStockThreshold)) {
            status = 'Low Stock';
        }
        const material = new Material({ name, sku, category, quantity, lowStockThreshold, unit, price, status });
        const createdMaterial = await material.save();
        res.status(201).json(createdMaterial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private/Admin/Manager
const updateMaterial = async (req, res) => {
    const { name, sku, category, quantity, lowStockThreshold, unit, price } = req.body;
    try {
        const material = await Material.findById(req.params.id);
        if (material) {
            material.name = name || material.name;
            material.sku = sku || material.sku;
            material.category = category || material.category;
            material.quantity = quantity !== undefined ? quantity : material.quantity;
            material.lowStockThreshold = lowStockThreshold || material.lowStockThreshold;
            material.unit = unit || material.unit;
            material.price = price || material.price;
            
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.quantity <= material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {
                material.status = 'In Stock';
            }

            const updatedMaterial = await material.save();
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

module.exports = { getMaterials, createMaterial, updateMaterial, deleteMaterial };

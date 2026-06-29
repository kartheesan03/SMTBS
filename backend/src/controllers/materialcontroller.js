const Material = require('../models/Material');
const MaterialMovement = require('../models/MaterialMovement');
const Order = require('../models/Order');
const { notifyManager, notifyCritical } = require('../services/notificationService');
const { logAudit, buildChanges } = require('../services/auditService');
const Notification = require('../models/Notification');

const handleStockStatusNotifications = async (material, previousStatus, newStatus) => {
    if (previousStatus === newStatus) return;

    const matId = material._id || material.id;

    if (newStatus === 'In Stock') {
        await Notification.deleteMany({
            category: 'stock',
            'payload.material_id': matId,
            isRead: false
        });
    } else if (newStatus === 'Low Stock') {
        await Notification.deleteMany({
            category: 'stock',
            'payload.material_id': matId,
            'payload.alert_type': 'out_of_stock',
            isRead: false
        });

        const exists = await Notification.findOne({
            category: 'stock',
            'payload.material_id': matId,
            'payload.alert_type': 'low_stock',
            isRead: false
        });

        if (!exists) {
            await notifyCritical({
                module: 'Materials',
                referenceId: matId,
                title: `Low Stock Alert: ${material.name}`,
                message: `${material.name} is currently Low Stock (${material.quantity} ${material.unit} left).`,
                type: 'warning'
            });
        }
    } else if (newStatus === 'Out of Stock') {
        await Notification.deleteMany({
            category: 'stock',
            'payload.material_id': matId,
            'payload.alert_type': 'low_stock',
            isRead: false
        });

        const exists = await Notification.findOne({
            category: 'stock',
            'payload.material_id': matId,
            'payload.alert_type': 'out_of_stock',
            isRead: false
        });

        if (!exists) {
            await notifyCritical({
                module: 'Materials',
                referenceId: matId,
                title: `Out of Stock Alert: ${material.name}`,
                message: `${material.name} is completely Out of Stock.`,
                type: 'error'
            });
        }
    }
};

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}).populate('vendor', 'name email contactPerson phone');
        const activeMaterials = materials.filter(m => m.isActive !== false);
        console.log(`[API /materials] Fetched ${activeMaterials.length} active materials.`);
        res.json(activeMaterials);
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

        // Log material movement
        if (Number(quantity) > 0) {
            await MaterialMovement.create({
                materialId: createdMaterial._id,
                type: 'In',
                quantity: Number(quantity),
                previousQuantity: 0,
                newQuantity: Number(quantity),
                reason: 'Initial stock entry',
                performedById: req.user?._id || null
            });
        }

        // Audit log
        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Material',
            targetId: createdMaterial._id,
            description: `Material created: ${name} (SKU: ${sku}) with ${quantity} ${unit}`,
            ipAddress: req.ip
        });

        await notifyManager({
            module: 'Materials',
            referenceId: createdMaterial._id || createdMaterial.id,
            title: 'New Material Added',
            message: `${name} (SKU: ${sku}) has been added to inventory with ${quantity} ${unit}.`,
            type: 'info'
        });

        await handleStockStatusNotifications(createdMaterial, 'In Stock', status);

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
            const previousQuantity = material.quantity;

            material.name = name || material.name;
            material.sku = sku || material.sku;
            material.category = category || material.category;
            material.quantity = quantity !== undefined ? quantity : material.quantity;
            material.lowStockThreshold = lowStockThreshold || material.lowStockThreshold;
            material.unit = unit || material.unit;
            material.price = price !== undefined ? price : material.price;
            if (vendorId !== undefined) material.vendorId = vendorId;
            
            const previousStatus = material.status;
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.quantity <= material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {
                material.status = 'In Stock';
            }    

            const newStatus = material.status;

            const updatedMaterial = await material.save();

            // Log material movement if quantity changed
            if (quantity !== undefined && Number(quantity) !== previousQuantity) {
                const diff = Number(quantity) - previousQuantity;
                await MaterialMovement.create({
                    materialId: updatedMaterial._id,
                    type: diff > 0 ? 'In' : 'Out',
                    quantity: Math.abs(diff),
                    previousQuantity: previousQuantity,
                    newQuantity: Number(quantity),
                    reason: 'Manual stock adjustment',
                    performedById: req.user?._id || null
                });
            }

            // Audit log
            await logAudit({
                user: req.user,
                action: 'UPDATE',
                module: 'Material',
                targetId: updatedMaterial._id,
                description: `Material updated: ${updatedMaterial.name}`,
                changes: buildChanges(
                    { name: material.name, quantity: previousQuantity, price: material.price },
                    { name, quantity, price },
                    ['name', 'quantity', 'price']
                ),
                ipAddress: req.ip
            });

            await handleStockStatusNotifications(updatedMaterial, previousStatus, newStatus);

            if (newStatus === 'In Stock') {
                await notifyManager({
                    module: 'Materials',
                    referenceId: updatedMaterial._id || updatedMaterial.id,
                    title: 'Material Updated',
                    message: `${updatedMaterial.name} inventory details have been updated.`,
                    type: 'info'
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
            const materialName = material.name;
            const materialIdStr = String(req.params.id);
            
            // Check for references
            const movements = await MaterialMovement.find({ materialId: req.params.id });
            const hasMovements = movements.length > 0;

            const orders = await Order.find({});
            const linkedOrders = orders.filter(o => o.items && o.items.some(i => String(i.material) === materialIdStr));
            const hasOrders = linkedOrders.length > 0;

            if (hasMovements || hasOrders) {
                console.log(`[Material Delete Restriction] Material '${materialName}' is linked to dependencies.`);
                return res.status(409).json({ 
                    message: "This material is currently linked to existing orders or inventory records and cannot be deleted.",
                    dependencies: {
                        movementsCount: movements.length,
                        orderNumbers: linkedOrders.map(o => o.orderNumber || o.id)
                    }
                });
            }

            try {
                await material.deleteOne();
                
                // Audit log
                await logAudit({
                    user: req.user,
                    action: 'DELETE',
                    module: 'Material',
                    targetId: req.params.id,
                    description: `Material deleted: ${materialName}`,
                    ipAddress: req.ip
                });

                res.json({ message: 'Material removed' });
            } catch (dbError) {
                if (dbError.name === 'SequelizeForeignKeyConstraintError' || (dbError.message && dbError.message.includes('FOREIGN KEY constraint failed'))) {
                    console.log(`[Material Delete Restriction] SQLite FOREIGN KEY constraint failed for Material '${materialName}'. Table: ${dbError.table || 'Unknown'}`);
                    return res.status(400).json({ message: "This material is currently linked to existing orders or inventory records and cannot be deleted." });
                }
                throw dbError;
            }
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
            const previousStatus = material.status;
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.lowStockThreshold && material.quantity <= material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {
                material.status = 'In Stock';
            }
            const newStatus = material.status;
            await material.save();
            await handleStockStatusNotifications(material, previousStatus, newStatus);
        }
        // Return only active materials with status 'Low Stock'
        const lowStockMaterials = await Material.find({ status: 'Low Stock' });
        res.json(lowStockMaterials.filter(m => m.isActive !== false));
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
            res.json({ count: lowStockMaterials.filter(m => m.isActive !== false).length });
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
            const previousStatus = material.status;
            if (material.quantity === 0) {
                material.status = 'Out of Stock';
            } else if (material.lowStockThreshold && material.quantity <= material.lowStockThreshold) {
                material.status = 'Low Stock';
            } else {
                material.status = 'In Stock';
            }
            const newStatus = material.status;
            await material.save();
            await handleStockStatusNotifications(material, previousStatus, newStatus);
        }
        res.json({ message: 'Stock status recalculated for all materials' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get movement history for a material
// @route   GET /api/materials/:id/movements
// @access  Private
const getMaterialMovements = async (req, res) => {
    try {
        const movements = await MaterialMovement.find({ materialId: req.params.id })
            .populate('performedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all material movements
// @route   GET /api/materials/movements/all
// @access  Private
const getAllMovements = async (req, res) => {
    try {
        // Find all movements and populate material and performedBy details
        const movements = await MaterialMovement.find({})
            .sort({ createdAt: -1 })
            .limit(100);
            
        // We'll fetch all materials manually to do the join properly since no mongoose populate on mongoose-bridge for Material
        const materials = await Material.find({});
        const matMap = {};
        materials.forEach(m => matMap[m.id || m._id] = m);

        // Map data to include material name and SKU
        const enrichedMovements = movements.map(m => {
            const mObj = m.toJSON ? m.toJSON() : m;
            const mat = matMap[mObj.materialId];
            return {
                ...mObj,
                materialName: mat ? mat.name : 'Unknown',
                materialSku: mat ? mat.sku : 'N/A'
            };
        });

        res.json(enrichedMovements);
    } catch (error) {
        console.error('Error fetching all movements:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get material analytics
// @route   GET /api/materials/analytics
// @access  Private
const getMaterialAnalytics = async (req, res) => {
    try {
        const materialsRaw = await Material.find({});
        const materials = materialsRaw.filter(m => m.isActive !== false);
        
        // Category distribution
        const categoryMap = {};
        let totalStockValue = 0;
        let totalQuantity = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        materials.forEach(m => {
            const cat = m.category || 'Uncategorized';
            if (!categoryMap[cat]) {
                categoryMap[cat] = { count: 0, value: 0, quantity: 0 };
            }
            categoryMap[cat].count += 1;
            categoryMap[cat].value += (m.quantity || 0) * (m.price || 0);
            categoryMap[cat].quantity += (m.quantity || 0);
            totalStockValue += (m.quantity || 0) * (m.price || 0);
            totalQuantity += (m.quantity || 0);
            if (m.status === 'Low Stock') lowStockCount++;
            if (m.status === 'Out of Stock') outOfStockCount++;
        });

        const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
            name,
            count: data.count,
            value: data.value,
            quantity: data.quantity
        }));

        // Top materials by value
        const topByValue = materials
            .map(m => ({ name: m.name, sku: m.sku, value: (m.quantity || 0) * (m.price || 0), quantity: m.quantity, unit: m.unit }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // Stock status summary
        const statusSummary = [
            { name: 'In Stock', value: materials.filter(m => m.status === 'In Stock').length, color: '#10b981' },
            { name: 'Low Stock', value: lowStockCount, color: '#f59e0b' },
            { name: 'Out of Stock', value: outOfStockCount, color: '#ef4444' }
        ];

        res.json({
            totalMaterials: materials.length,
            totalStockValue,
            totalQuantity,
            lowStockCount,
            outOfStockCount,
            categoryDistribution,
            topByValue,
            statusSummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Archive a material (Soft Delete)
// @route   PUT /api/materials/:id/archive
// @access  Private/Admin
const archiveMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (material) {
            material.isActive = false;
            await material.save();

            // Audit log
            await logAudit({
                user: req.user,
                action: 'ARCHIVE',
                module: 'Material',
                targetId: req.params.id,
                description: `Material archived: ${material.name}`,
                ipAddress: req.ip
            });

            res.json({ message: 'Material archived successfully' });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getTimeline = async (req, res) => {
    try {
        const id = req.params.id;
        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find({ module: 'Material', targetId: id }).sort({ createdAt: -1 });
        
        // Map to timeline format
        const timeline = logs.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description || `${log.action} action performed`,
            user: log.userName || 'System',
            date: log.createdAt,
            time: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));
        
        // If empty, return a fallback so it doesn't look broken
        if (timeline.length === 0) {
            timeline.push({
                id: 'init',
                action: 'CREATE',
                description: 'Record initialized',
                user: 'System',
                date: new Date(),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            });
        }
        
        res.json(timeline);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching timeline' });
    }
};

module.exports = {
    getTimeline, getMaterials, createMaterial, updateMaterial, deleteMaterial, getLowStockMaterials, recalculateStockStatus, getLowStockCount, getMaterialMovements, getAllMovements, getMaterialAnalytics, archiveMaterial };

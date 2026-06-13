const Vendor = require('../models/Vendor');
const Material = require('../models/Material');
const { notifyManager } = require('../services/notificationService');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const materials = await Material.find({ vendorId });
        
        const totalMaterials = materials.length;
        const totalStockQty = materials.reduce((sum, m) => sum + (m.quantity || 0), 0);
        const totalInventoryValue = materials.reduce((sum, m) => sum + ((m.quantity || 0) * (m.price || 0)), 0);

        res.status(200).json({
            vendor,
            materials,
            statistics: {
                totalMaterials,
                totalStockQty,
                totalInventoryValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVendor = async (req, res) => {
    try {
        const vendorData = { ...req.body };
        if (!vendorData.status) vendorData.status = 'Vendor Created';
        const vendor = new Vendor(vendorData);
        await vendor.save();

        await notifyManager({
            title: 'New Vendor Added',
            message: `${vendorData.name} has been added to the system.`,
            type: 'info',
            category: 'system'
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        // Update fields
        Object.assign(vendor, req.body);
        await vendor.save();
        
        res.status(200).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

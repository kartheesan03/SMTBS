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

exports.getMyVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }
        
        const materials = await Material.find({ vendorId: vendor._id || vendor.id });
        
        res.status(200).json({ vendor, materials });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVendorProfile = async (req, res) => {
    try {
        const vendorData = { ...req.body, userId: req.user._id, status: 'Vendor Created' };
        const vendor = new Vendor(vendorData);
        const createdVendor = await vendor.save();

        // If materials provided, sync to Materials table
        if (vendorData.materialsSupplied && Array.isArray(vendorData.materialsSupplied)) {
            for (let item of vendorData.materialsSupplied) {
                const materialName = typeof item === 'string' ? item : item.name;
                if (materialName) {
                    const materialData = {
                        name: materialName,
                        vendorId: createdVendor._id || createdVendor.id,
                        quantity: 0,
                        category: vendorData.category || 'Uncategorized'
                    };
                    await Material.create(materialData);
                }
            }
        }

        // Update User
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        if (user) {
            user.isProfileComplete = true;
            await user.save();
        }

        await notifyManager({
            title: 'New Vendor Profile',
            message: `${vendorData.name} has completed their self-registration profile.`,
            type: 'info',
            category: 'system'
        });

        res.status(201).json(createdVendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

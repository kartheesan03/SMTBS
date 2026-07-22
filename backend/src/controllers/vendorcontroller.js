const Vendor = require('../models/Vendor');
const Material = require('../models/Material');
const { notifyManager } = require('../services/notificationService');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({});
        console.log(`[API /vendors] Fetched ${vendors.length} vendors.`);
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

exports.getVendorMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ vendorId: req.params.id });
        res.status(200).json(materials);
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

        const Material = require('../models/Material');
        if (vendorData.materialsSupplied && Array.isArray(vendorData.materialsSupplied)) {
            for (let item of vendorData.materialsSupplied) {
                if (typeof item === 'string') {
                    await Material.create({
                        name: item,
                        vendorId: vendor._id || vendor.id,
                        quantity: 0,
                        category: vendor.category || 'Uncategorized'
                    });
                } else if (item.name) {
                    await Material.create({
                        ...item,
                        vendorId: vendor._id || vendor.id,
                        category: item.category || vendor.category || 'Uncategorized'
                    });
                }
            }
        }

        await notifyManager({
            module: 'Vendors',
            referenceId: vendor._id || vendor.id,
            title: 'New Vendor Added',
            message: `${vendorData.name} has been added to the system.`,
            type: 'info'
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
        
        const Material = require('../models/Material');
        if (req.body.materialsSupplied && Array.isArray(req.body.materialsSupplied)) {
            const currentMaterials = await Material.find({ vendorId: vendor._id || vendor.id });
            const incomingIds = req.body.materialsSupplied.filter(m => m._id || m.id).map(m => String(m._id || m.id));
            
            // Delete materials that are removed
            for (let current of currentMaterials) {
                if (!incomingIds.includes(String(current._id || current.id))) {
                    await Material.findByIdAndDelete(current._id || current.id);
                }
            }
            
            // Update or create
            for (let item of req.body.materialsSupplied) {
                if (item._id || item.id) {
                    const mat = await Material.findById(item._id || item.id);
                    if (mat) {
                        Object.assign(mat, item);
                        await mat.save();
                    }
                } else {
                    if (typeof item === 'string') {
                        await Material.create({
                            name: item,
                            vendorId: vendor._id || vendor.id,
                            quantity: 0,
                            category: vendor.category || 'Uncategorized'
                        });
                    } else if (item.name) {
                        await Material.create({
                            ...item,
                            vendorId: vendor._id || vendor.id,
                            category: item.category || vendor.category || 'Uncategorized'
                        });
                    }
                }
            }
        }

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
        const Order = require('../models/Order');
        const orders = await Order.find({ vendorId: vendor._id || vendor.id });
        
        res.status(200).json({ vendor, materials, orders });
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
            module: 'Vendors',
            referenceId: createdVendor._id || createdVendor.id,
            title: 'New Vendor Profile',
            message: `${vendorData.name} has completed their self-registration profile.`,
            type: 'info'
        });

        res.status(201).json(createdVendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findByIdAndDelete(vendorId);
        
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Optionally delete materials associated with vendor, but user didn't explicitly ask to delete materials, just the vendor.
        // If they want to just delete the vendor, this is sufficient.
        
        await notifyManager({
            module: 'Vendors',
            referenceId: vendor._id || vendor.id,
            title: 'Vendor Deleted',
            message: `${vendor.name || 'A vendor'} has been deleted from the system.`,
            type: 'warning'
        });

        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVendorMaterials = async (req, res) => {
    try {
        const Material = require('../models/Material');
        const vendorId = req.params.id;
        const materials = await Material.find({ vendorId: vendorId });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

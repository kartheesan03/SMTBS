const Vendor = require('../models/Vendor');
const { notifyManager } = require('../services/notificationService');

exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json(vendors);
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

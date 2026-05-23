const Vendor = require('../models/Vendor');

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
        const vendor = new Vendor(req.body);
        await vendor.save();
        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

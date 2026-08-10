const Material = require('../models/Material');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

const globalSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query || query.length < 2) {
            return res.json({ materials: [], employees: [], vendors: [], orders: [] });
        }

        const regex = new RegExp(query, 'i');

        // Query all collections concurrently
        const [materials, employees, vendors, orders] = await Promise.all([
            Material.find({
                $or: [{ name: regex }, { sku: regex }]
            }).limit(5),
            User.find({
                $or: [{ name: regex }, { email: regex }]
            }).limit(5),
            Vendor.find({
                name: regex
            }).limit(5),
            Order.find({
                orderNumber: regex
            }).limit(5)
        ]);

        // Map and format results to be easily consumed by the frontend
        const formatItem = (type, item, title, subtitle, path) => ({
            id: item.id || item._id,
            type,
            title,
            subtitle,
            path
        });

        const formattedMaterials = materials.map(m => 
            formatItem('material', m, m.name, `SKU: ${m.sku}`, `/materials/${m.id || m._id}`)
        );

        const formattedEmployees = employees.map(e => 
            formatItem('employee', e, e.name, e.email, `/employees/${e.id || e._id}`)
        );

        const formattedVendors = vendors.map(v => 
            formatItem('vendor', v, v.name, v.contactEmail || '', `/vendors/${v.id || v._id}`)
        );

        const formattedOrders = orders.map(o => 
            formatItem('order', o, o.orderNumber, `Type: ${o.orderType} • Status: ${o.status}`, `/orders/${o.id || o._id}`)
        );

        res.json({
            materials: formattedMaterials,
            employees: formattedEmployees,
            vendors: formattedVendors,
            orders: formattedOrders,
            totalCount: formattedMaterials.length + formattedEmployees.length + formattedVendors.length + formattedOrders.length
        });
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ message: 'Error performing search', error: error.message });
    }
};

module.exports = {
    globalSearch
};

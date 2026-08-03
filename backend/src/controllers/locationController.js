const Material = require('../models/Material');
const Order = require('../models/Order');
const { Op } = require('sequelize');
exports.getLocations = async (req, res) => {
    try {
        const materials = await Material.findAll({
            where: {
                warehouse: {
                    [Op.not]: null,
                    [Op.ne]: ''
                }
            }
        });
        const locationsMap = {};
        materials.forEach(mat => {
            const wName = mat.warehouse.trim();
            if (!locationsMap[wName]) {
                let type = 'Warehouse';
                if (wName.toLowerCase().includes('yard')) type = 'Yard';
                else if (wName.toLowerCase().includes('store')) type = 'Store';
                locationsMap[wName] = {
                    name: wName,
                    type: type,
                    lat: mat.latitude || null,
                    lng: mat.longitude || null,
                    materials: []
                };
            }
            if (!locationsMap[wName].lat && mat.latitude) {
                locationsMap[wName].lat = mat.latitude;
                locationsMap[wName].lng = mat.longitude;
            }
            locationsMap[wName].materials.push({
                id: mat.id,
                name: mat.name,
                sku: mat.sku,
                quantity: mat.quantity,
                unit: mat.unit
            });
        });
        const locations = Object.values(locationsMap).filter(loc => loc.lat && loc.lng);
        const activeOrders = await Order.findAll({
            where: {
                status: {
                    [Op.in]: ['Material Confirmed', 'Ready for Delivery', 'Out for Delivery']
                },
                sourcedLocation: {
                    [Op.not]: null,
                    [Op.ne]: ''
                }
            },
            attributes: ['id', 'orderNumber', 'status', 'sourcedLocation', 'deliveryDestination', 'liveLocation']
        });
        locations.forEach(loc => {
            loc.activeOrders = activeOrders.filter(order => order.sourcedLocation.trim() === loc.name);
        });
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
};

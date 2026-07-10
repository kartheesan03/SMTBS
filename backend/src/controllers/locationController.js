const Material = require('../models/Material');
const Order = require('../models/Order');
const { Op } = require('sequelize');

exports.getLocations = async (req, res) => {
    try {
        // Fetch all materials that have a warehouse defined
        const materials = await Material.findAll({
            where: {
                warehouse: {
                    [Op.not]: null,
                    [Op.ne]: ''
                }
            }
        });

        // Group materials by warehouse
        const locationsMap = {};

        materials.forEach(mat => {
            const wName = mat.warehouse.trim();
            if (!locationsMap[wName]) {
                // Infer type
                let type = 'Warehouse';
                if (wName.toLowerCase().includes('yard')) type = 'Yard';
                else if (wName.toLowerCase().includes('store')) type = 'Store';

                locationsMap[wName] = {
                    name: wName,
                    type: type,
                    lat: mat.latitude || null, // take the first available coords
                    lng: mat.longitude || null,
                    materials: []
                };
            }

            // Update coords if we found better ones
            if (!locationsMap[wName].lat && mat.latitude) {
                locationsMap[wName].lat = mat.latitude;
                locationsMap[wName].lng = mat.longitude;
            }

            // Add material to stock list
            locationsMap[wName].materials.push({
                id: mat.id,
                name: mat.name,
                sku: mat.sku,
                quantity: mat.quantity,
                unit: mat.unit
            });
        });

        // Filter out any locations that don't have valid coordinates
        const locations = Object.values(locationsMap).filter(loc => loc.lat && loc.lng);

        // Fetch active orders sourced from these locations
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

        // Attach active orders to their respective locations
        locations.forEach(loc => {
            loc.activeOrders = activeOrders.filter(order => order.sourcedLocation.trim() === loc.name);
        });

        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
};

const Order = require('../models/Order');

// A simple simulated route (e.g. from Warehouse to Downtown)
// We will interpolate between these points to simulate movement.
const MOCK_ROUTE = [
    { lat: 12.9716, lng: 77.5946 }, // Start: Bangalore Central
    { lat: 12.9650, lng: 77.6000 },
    { lat: 12.9600, lng: 77.6050 },
    { lat: 12.9550, lng: 77.6100 },
    { lat: 12.9500, lng: 77.6150 },
    { lat: 12.9450, lng: 77.6200 }, // End: Koramangala
];

// Helper to calculate distance in km between two coords
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

class GPSSimulator {
    constructor() {
        this.interval = null;
        this.simulationState = {}; // { orderId: currentRouteIndex }
    }

    start() {
        if (this.interval) return;
        
        console.log('[GPS Simulator] Started.');
        this.interval = setInterval(() => this.updateLocations(), 10000); // Run every 10 seconds
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async updateLocations() {
        try {
            // Find orders that are currently Out for Delivery and NOT yet Delivered
            const activeOrders = await Order.sequelizeModel.findAll({
                where: {
                    status: 'Out for Delivery'
                }
            });

            for (const order of activeOrders) {
                // If the order tracking was manually set to Delayed, pause simulation
                if (order.trackingStatus === 'Delayed') continue;

                let state = this.simulationState[order.id];
                if (!state) {
                    state = { step: 0 };
                    this.simulationState[order.id] = state;
                    
                    // Initial update when just starting
                    order.trackingStatus = 'En Route';
                    order.routePath = [];
                }

                // If we reached the end of the mock route
                if (state.step >= MOCK_ROUTE.length) {
                    order.trackingStatus = 'Arrived'; // or Delivered
                    // Don't auto complete the order status, let the employee do it, but mark arrived
                    await order.save();
                    continue;
                }

                const currentCoord = MOCK_ROUTE[state.step];
                const destination = MOCK_ROUTE[MOCK_ROUTE.length - 1];

                const distanceRemaining = getDistanceFromLatLonInKm(
                    currentCoord.lat, currentCoord.lng,
                    destination.lat, destination.lng
                );

                const newLocation = {
                    lat: currentCoord.lat,
                    lng: currentCoord.lng,
                    timestamp: new Date().toISOString()
                };

                const currentPath = order.routePath ? [...order.routePath] : [];
                currentPath.push(newLocation);

                order.liveLocation = newLocation;
                order.routePath = currentPath;
                order.distanceRemaining = distanceRemaining;
                
                // Assuming roughly 40km/h average speed in city
                const hoursRemaining = distanceRemaining / 40;
                const eta = new Date();
                eta.setMinutes(eta.getMinutes() + (hoursRemaining * 60));
                order.deliveryETA = eta;

                await order.save();

                // Advance step for next tick
                state.step += 1;
            }
        } catch (error) {
            console.error('[GPS Simulator] Error updating locations:', error);
        }
    }
}

module.exports = new GPSSimulator();

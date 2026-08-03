const Order = require('../models/Order');
const MOCK_ROUTE = [
    { lat: 12.9716, lng: 77.5946 },
    { lat: 12.9650, lng: 77.6000 },
    { lat: 12.9600, lng: 77.6050 },
    { lat: 12.9550, lng: 77.6100 },
    { lat: 12.9500, lng: 77.6150 },
    { lat: 12.9450, lng: 77.6200 },
];
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
        this.interval = setInterval(() => this.updateLocations(), 10000);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    async updateLocations() {
        try {
            const activeOrders = await Order.sequelizeModel.findAll({
                where: {
                    status: 'Out for Delivery'
                }
            });
            for (const order of activeOrders) {
                if (order.trackingStatus === 'Delayed') continue;
                let state = this.simulationState[order.id];
                if (!state) {
                    state = { step: 0 };
                    this.simulationState[order.id] = state;
                    order.trackingStatus = 'En Route';
                    order.routePath = [];
                }
                if (state.step >= MOCK_ROUTE.length) {
                    order.trackingStatus = 'Arrived';
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
                const hoursRemaining = distanceRemaining / 40;
                const eta = new Date();
                eta.setMinutes(eta.getMinutes() + (hoursRemaining * 60));
                order.deliveryETA = eta;
                await order.save();
                state.step += 1;
            }
        } catch (error) {
            console.error('[GPS Simulator] Error updating locations:', error);
        }
    }
}
module.exports = new GPSSimulator();

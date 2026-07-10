import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Truck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { PageContainer, PageHeader, DetailViewContainer } from '../components/ui';
import toast from 'react-hot-toast';

// Setup custom truck icon
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png', // Delivery truck png
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Custom icons for Hub Locations using divIcon for styling flexibility
const createHubIcon = (color) => new L.divIcon({
    className: 'custom-hub-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const warehouseIcon = createHubIcon('#3b82f6'); // Blue
const yardIcon = createHubIcon('#f59e0b');      // Orange/Amber
const storeIcon = createHubIcon('#10b981');     // Green

// Fix for default leaflet icons not showing correctly sometimes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const GPSTracking = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Toggles state
    const [showDeliveries, setShowDeliveries] = useState(true);
    const [showWarehouses, setShowWarehouses] = useState(true);
    const [showYards, setShowYards] = useState(true);
    const [showStores, setShowStores] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch Orders
            const ordersPromise = API.get('/orders', {
                params: {
                    status: 'Out for Delivery,Delivered', // show recently delivered too
                    limit: 50
                }
            });

            // Fetch Locations
            const locsPromise = API.get('/locations');

            const [ordersRes, locsRes] = await Promise.all([ordersPromise, locsPromise]);

            // We need to fetch the live location data for each
            const updatedOrders = await Promise.all(ordersRes.data.map(async (order) => {
                try {
                    const locData = await API.get(`/orders/${order._id || order.id}/location`);
                    return { ...order, ...locData.data };
                } catch (e) {
                    return order;
                }
            }));
            
            // Only keep orders that actually have a live location
            const validOrders = updatedOrders.filter(o => o.liveLocation && o.liveLocation.lat);
            setOrders(validOrders);
            setLocations(locsRes.data);
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 5 seconds for live updates
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Center map on Bangalore (since mock route is there)
    const center = [12.9716, 77.5946];

    return (
        <PageContainer>
            <PageHeader 
                title="GPS Tracking" 
                badge="LOGISTICS" 
                subtitle="Real-time GPS tracking for active deliveries." 
            />

            <DetailViewContainer>
                <div style={{ height: 'calc(100vh - 260px)', minHeight: '500px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                    {loading && orders.length === 0 && locations.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading live map...</div>
                    ) : (
                        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            
                            
                            {/* Render Locations */}
                            {locations.map((loc, idx) => {
                                const isVisible = (loc.type === 'Warehouse' && showWarehouses) || 
                                                  (loc.type === 'Yard' && showYards) || 
                                                  (loc.type === 'Store' && showStores);
                                
                                if (!isVisible) return null;

                                let icon = warehouseIcon;
                                if (loc.type === 'Yard') icon = yardIcon;
                                if (loc.type === 'Store') icon = storeIcon;

                                return (
                                    <Marker key={`loc-${idx}`} position={[loc.lat, loc.lng]} icon={icon}>
                                        <Popup maxWidth={300}>
                                            <div style={{ minWidth: '220px', maxHeight: '250px', overflowY: 'auto' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                                                        background: loc.type === 'Warehouse' ? '#bfdbfe' : loc.type === 'Yard' ? '#fde68a' : '#a7f3d0',
                                                        color: loc.type === 'Warehouse' ? '#1e40af' : loc.type === 'Yard' ? '#92400e' : '#065f46'
                                                    }}>{loc.type}</span>
                                                    <h3 style={{ margin: '0', fontSize: '15px' }}>{loc.name}</h3>
                                                </div>

                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>CURRENT STOCK ({loc.materials.length})</h4>
                                                <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                                    {loc.materials.length > 0 ? loc.materials.map(mat => (
                                                        <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '2px 0' }}>
                                                            <span style={{ fontWeight: 500 }}>{mat.name}</span>
                                                            <span>{mat.quantity} {mat.unit}</span>
                                                        </div>
                                                    )) : <div style={{ fontSize: '12px', color: '#94a3b8' }}>No stock available.</div>}
                                                </div>

                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>SOURCED ORDERS ({loc.activeOrders?.length || 0})</h4>
                                                <div>
                                                    {loc.activeOrders && loc.activeOrders.length > 0 ? loc.activeOrders.map(order => (
                                                        <div key={order.id} style={{ fontSize: '12px', padding: '2px 0' }}>
                                                            <a href={`/orders/${order.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>{order.orderNumber}</a> - {order.status}
                                                        </div>
                                                    )) : <div style={{ fontSize: '12px', color: '#94a3b8' }}>No active orders sourced here.</div>}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* Render Active Deliveries */}
                            {showDeliveries && orders.map(order => {
                                const latLng = [order.liveLocation.lat, order.liveLocation.lng];
                                const path = (order.routePath || []).map(p => [p.lat, p.lng]);
                                
                                // Draw a line from the sourced location if available
                                const sourceLoc = locations.find(l => l.name === order.sourcedLocation);
                                const sourceLine = sourceLoc ? [[sourceLoc.lat, sourceLoc.lng], latLng] : null;

                                return (
                                    <React.Fragment key={order._id || order.id}>
                                        {/* Line connecting source location to the current delivery position */}
                                        {sourceLine && (
                                            <Polyline positions={sourceLine} color="#94a3b8" weight={2} dashArray="5, 10" opacity={0.7} />
                                        )}

                                        {/* Polyline for route trail */}
                                        {path.length > 1 && (
                                            <Polyline positions={path} color="#3b82f6" weight={4} opacity={0.6} />
                                        )}
                                        
                                        {/* Current Position Marker */}
                                        <Marker position={latLng} icon={truckIcon}>
                                            <Popup>
                                                <div style={{ minWidth: '200px' }}>
                                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>{order.orderNumber}</h3>
                                                    {order.sourcedLocation && (
                                                        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 6px', borderRadius: '4px' }}>
                                                            Sourced from: <strong>{order.sourcedLocation}</strong>
                                                        </div>
                                                    )}
                                                    <div style={{ marginBottom: '4px', fontSize: '12px' }}>
                                                        <strong>Status:</strong> {order.trackingStatus}
                                                    </div>
                                                    <div style={{ marginBottom: '4px', fontSize: '12px' }}>
                                                        <strong>ETA:</strong> {order.deliveryETA ? new Date(order.deliveryETA).toLocaleTimeString() : 'Unknown'}
                                                    </div>
                                                    <div style={{ marginBottom: '4px', fontSize: '12px' }}>
                                                        <strong>Dist:</strong> {order.distanceRemaining ? order.distanceRemaining.toFixed(1) + ' km' : '-'}
                                                    </div>
                                                    {order.trackingStatus === 'Delayed' && (
                                                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                                                            <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                                            {order.holdReason || 'Delayed'}
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '12px' }}>
                                                        <a href={`/orders/${order._id || order.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
                                                            View Order details →
                                                        </a>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    )}
                    
                </div>
            </DetailViewContainer>
        </PageContainer>
    );
};

export default GPSTracking;

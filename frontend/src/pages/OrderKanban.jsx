import React, { useState, useEffect } from 'react';
import { 
    Box, Navigation, Truck, MapPin, Search, AlertCircle, CheckCircle, PackageCheck, Signal, X, LayoutDashboard
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api/axios';
import './GPSTracking.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const OrderKanban = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'map'
    const [selectedShipment, setSelectedShipment] = useState(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const res = await API.get('/materials');
            const data = res.data;
            
            // Map status to ensure we have standard stages for UI demonstration
            const enriched = data.map(m => {
                let normalizedStatus = m.gpsStatus;
                // Treat Signal Lost as In Transit for Kanban placement, but keep a flag
                if (m.gpsStatus === 'Signal Lost') {
                    normalizedStatus = 'In Transit';
                }
                
                return { 
                    ...m, 
                    kanbanStatus: normalizedStatus || 'At Warehouse',
                    isDelayed: m.gpsStatus === 'Signal Lost'
                };
            });

            setMaterials(enriched);
        } catch (error) {
            console.error('Failed to fetch materials for tracking', error);
        } finally {
            setLoading(false);
        }
    };

    const activeShipments = materials.filter(m => m.kanbanStatus === 'In Transit');
    const delayedShipments = materials.filter(m => m.isDelayed);
    const deliveredToday = materials.filter(m => m.kanbanStatus === 'Delivered');
    const totalTracked = materials.length;

    const filteredMaterials = materials.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group materials for Kanban
    const columns = {
        'At Warehouse': {
            title: 'At Warehouse',
            color: '#64748b',
            bgColor: '#f1f5f9',
            items: filteredMaterials.filter(m => m.kanbanStatus === 'At Warehouse')
        },
        'Dispatched': {
            title: 'Dispatched',
            color: '#f59e0b',
            bgColor: '#fffbeb',
            items: filteredMaterials.filter(m => m.kanbanStatus === 'Dispatched')
        },
        'In Transit': {
            title: 'In Transit',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            items: filteredMaterials.filter(m => m.kanbanStatus === 'In Transit')
        },
        'Delivered': {
            title: 'Delivered',
            color: '#10b981',
            bgColor: '#f0fdf4',
            items: filteredMaterials.filter(m => m.kanbanStatus === 'Delivered')
        }
    };

    // Get color for Map Pins
    const getPinColor = (status) => {
        switch(status) {
            case 'In Transit': return '#10b981'; // Green
            case 'Signal Lost': return '#ef4444'; // Red
            case 'Delivered': return '#3b82f6'; // Blue
            default: return '#f59e0b'; // Orange (At Warehouse/Dispatched)
        }
    };

    const ShipmentModal = () => {
        if (!selectedShipment) return null;
        const item = selectedShipment;

        return (
            <div className="gps-modal-overlay" onClick={() => setSelectedShipment(null)}>
                <div className="gps-modal-content" onClick={e => e.stopPropagation()}>
                    <div style={{ padding: 24, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: 20, color: '#0f172a' }}>{item.name}</h2>
                            <span style={{ fontSize: 13, padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontFamily: 'monospace' }}>
                                {item.sku || `MAT-${item.id}`}
                            </span>
                        </div>
                        <button onClick={() => setSelectedShipment(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Origin</div>
                                <div style={{ fontWeight: 500, color: '#0f172a' }}>{item.warehouse || 'Main Warehouse'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Destination</div>
                                <div style={{ fontWeight: 500, color: '#0f172a' }}>{item.deliveryDestination || 'Customer Site'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Current Stage</div>
                                <div style={{ fontWeight: 600, color: item.isDelayed ? '#ef4444' : '#3b82f6' }}>
                                    {item.gpsStatus}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>ETA</div>
                                <div style={{ fontWeight: 500, color: '#0f172a' }}>
                                    {item.deliveryEta ? new Date(item.deliveryEta).toLocaleDateString() : 'Pending'}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Timestamp Log</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {item.locationUpdatedAt && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                        <span style={{ color: '#64748b' }}>Last Location Update</span>
                                        <span style={{ fontWeight: 500, color: '#0f172a' }}>{new Date(item.locationUpdatedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {item.deliveryDispatchedAt && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                        <span style={{ color: '#64748b' }}>Dispatched At</span>
                                        <span style={{ fontWeight: 500, color: '#0f172a' }}>{new Date(item.deliveryDispatchedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {item.deliveryCompletedAt && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                        <span style={{ color: '#64748b' }}>Completed At</span>
                                        <span style={{ fontWeight: 500, color: '#0f172a' }}>{new Date(item.deliveryCompletedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {!item.locationUpdatedAt && !item.deliveryDispatchedAt && (
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>No timestamp data available for this stage yet.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="rd-page">
            <PageHeader 
                title="GPS Tracking"
                subtitle="Live location tracking of materials & equipment"
                badge="MATERIAL TRACKING"
            />

            {/* KPI Row - Fixed Grid Layout */}
            <div className="gps-kpi-grid">
                <div className="rd-kpi-card" style={{ background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)' }}>
                    <div className="rd-kpi-header">
                        <span className="rd-kpi-title">Total Shipments</span>
                        <div className="rd-kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                            <Box size={18} />
                        </div>
                    </div>
                    <div className="rd-kpi-value">{totalTracked}</div>
                    <div className="rd-kpi-footer">
                        <span style={{color: '#64748b', fontSize: 13}}>Across all regions</span>
                    </div>
                </div>

                <div className="rd-kpi-card" style={{ background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)' }}>
                    <div className="rd-kpi-header">
                        <span className="rd-kpi-title">In Transit</span>
                        <div className="rd-kpi-icon-wrap" style={{ background: '#bbf7d0', color: '#16a34a' }}>
                            <Truck size={18} />
                        </div>
                    </div>
                    <div className="rd-kpi-value">{activeShipments.length}</div>
                    <div className="rd-kpi-footer">
                        <span style={{color: '#64748b', fontSize: 13}}>Currently moving</span>
                    </div>
                </div>

                <div className="rd-kpi-card" style={{ background: 'linear-gradient(145deg, #eff6ff, #dbeafe)' }}>
                    <div className="rd-kpi-header">
                        <span className="rd-kpi-title">Delivered Today</span>
                        <div className="rd-kpi-icon-wrap" style={{ background: '#bfdbfe', color: '#2563eb' }}>
                            <PackageCheck size={18} />
                        </div>
                    </div>
                    <div className="rd-kpi-value">{deliveredToday.length}</div>
                    <div className="rd-kpi-footer">
                        <span style={{color: '#64748b', fontSize: 13}}>Successfully arrived</span>
                    </div>
                </div>

                <div className="rd-kpi-card" style={{ background: 'linear-gradient(145deg, #fef2f2, #fee2e2)' }}>
                    <div className="rd-kpi-header">
                        <span className="rd-kpi-title">Delayed</span>
                        <div className="rd-kpi-icon-wrap" style={{ background: '#fecaca', color: '#dc2626' }}>
                            <AlertCircle size={18} />
                        </div>
                    </div>
                    <div className="rd-kpi-value">{delayedShipments.length}</div>
                    <div className="rd-kpi-footer">
                        <span style={{color: '#dc2626', fontSize: 13, fontWeight: 500}}>Signal lost or late</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="rd-section" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <button 
                            onClick={() => setViewMode('board')}
                            style={{ 
                                padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                background: viewMode === 'board' ? '#f1f5f9' : 'transparent',
                                color: viewMode === 'board' ? '#0f172a' : '#64748b',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                            }}
                        >
                            <LayoutDashboard size={16} /> Kanban Board
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            style={{ 
                                padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                background: viewMode === 'map' ? '#f1f5f9' : 'transparent',
                                color: viewMode === 'map' ? '#0f172a' : '#64748b',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                            }}
                        >
                            <MapPin size={16} /> Live Map
                        </button>
                    </div>

                    <div className="rd-search-bar" style={{ background: '#fff' }}>
                        <Search size={16} style={{ color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search materials or ID..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {viewMode === 'board' ? (
                    <div className="kanban-board">
                        {loading ? (
                            <div style={{ padding: 40, width: '100%', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12 }}>Loading board data...</div>
                        ) : (
                            Object.entries(columns).map(([key, col]) => (
                                <div key={key} className="kanban-column">
                                    <div className="kanban-column-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                                            {col.title}
                                        </div>
                                        <span className="kanban-column-count">{col.items.length}</span>
                                    </div>
                                    <div className="kanban-column-body">
                                        {col.items.length === 0 ? (
                                            <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, background: 'rgba(255,255,255,0.5)', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                                                No shipments currently {key.toLowerCase()}
                                            </div>
                                        ) : (
                                            col.items.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    className="kanban-card" 
                                                    onClick={() => setSelectedShipment(item)}
                                                >
                                                    <div className="kanban-card-accent" style={{ backgroundColor: item.isDelayed ? '#ef4444' : col.color }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>
                                                            {item.name}
                                                        </div>
                                                        {item.isDelayed && <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />}
                                                    </div>
                                                    <div style={{ fontSize: 11, padding: '2px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4, fontFamily: 'monospace', display: 'inline-block', marginBottom: 12 }}>
                                                        {item.sku || `MAT-${item.id}`}
                                                    </div>
                                                    
                                                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '40%' }}>{item.warehouse || 'Origin'}</span>
                                                        <Navigation size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '40%' }}>{item.deliveryDestination || 'Destination'}</span>
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>ETA</span>
                                                        <span style={{ fontWeight: 500, color: '#475569' }}>
                                                            {item.deliveryEta ? new Date(item.deliveryEta).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div style={{ height: 600, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', zIndex: 0, background: '#fff' }}>
                        <MapContainer center={[3.1390, 101.6869]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {filteredMaterials.map(item => (
                                item.latitude && item.longitude && (
                                    <Marker 
                                        key={item.id} 
                                        position={[item.latitude, item.longitude]}
                                        icon={L.divIcon({
                                            className: 'custom-map-pin',
                                            html: `<div style="background-color: ${getPinColor(item.gpsStatus)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>`,
                                            iconSize: [24, 24],
                                            iconAnchor: [12, 12]
                                        })}
                                    >
                                        <Popup>
                                            <div style={{ padding: 4 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Status: {item.gpsStatus}</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Destination: {item.deliveryDestination || 'N/A'}</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="rd-section" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>All Shipments</h3>
                </div>
                <div className="rd-table-container">
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>STAGE</th>
                                <th>MATERIAL</th>
                                <th>ORIGIN</th>
                                <th>DESTINATION</th>
                                <th>ETA / DELIVERED</th>
                                <th style={{textAlign: 'center', width: 100}}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map(item => {
                                let bg = '#f1f5f9', color = '#64748b', border = '#e2e8f0';
                                if (item.gpsStatus === 'In Transit') { bg = '#f0fdf4'; color = '#16a34a'; border = '#bbf7d0'; }
                                else if (item.gpsStatus === 'Signal Lost') { bg = '#fef2f2'; color = '#ef4444'; border = '#fecaca'; }
                                else if (item.gpsStatus === 'Delivered') { bg = '#eff6ff'; color = '#3b82f6'; border = '#bfdbfe'; }
                                else if (item.gpsStatus === 'At Warehouse' || item.gpsStatus === 'Dispatched') { bg = '#fffbeb'; color = '#f59e0b'; border = '#fde68a'; }

                                return (
                                    <tr key={item.id}>
                                        <td data-label="STAGE">
                                            <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, borderRadius: 99, display: 'inline-block' }}>
                                                {item.gpsStatus}
                                            </span>
                                        </td>
                                        <td data-label="MATERIAL">
                                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{item.name}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{item.sku || `MAT-${item.id}`}</div>
                                        </td>
                                        <td data-label="ORIGIN" style={{ color: '#64748b', fontWeight: 500 }}>
                                            {item.warehouse || '-'}
                                        </td>
                                        <td data-label="DESTINATION" style={{ color: '#64748b', fontWeight: 500 }}>
                                            {item.deliveryDestination || '-'}
                                        </td>
                                        <td data-label="ETA" style={{ color: '#64748b' }}>
                                            {item.deliveryEta ? new Date(item.deliveryEta).toLocaleDateString() : '-'}
                                        </td>
                                        <td data-label="ACTION" style={{ textAlign: 'center' }}>
                                            <button style={{
                                                background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px',
                                                borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                                            }}
                                            onClick={() => {
                                                setViewMode('board');
                                                setSelectedShipment(item);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredMaterials.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                        No shipments found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ShipmentModal />
        </div>
    );
};

export default OrderKanban;
import React, { useState, useEffect } from 'react';
import { Search, Plus, SlidersHorizontal, ChevronDown, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './TrackingDashboard.css';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                // In a real scenario, this would be a specific tracking/deliveries endpoint.
                // We use orders to populate the tracking dashboard.
                const { data } = await API.get('/orders');
                
                // Enhance orders with dummy tracking data for the UI representation if not present
                const enhancedData = data.map((order, index) => {
                    const statuses = ['On route', 'Waiting', 'Inactive'];
                    const status = statuses[index % statuses.length];
                    
                    return {
                        id: order._id || `UL-${158902 + index}NH`,
                        status: status,
                        route: {
                            from: order.origin || 'Madrid',
                            fromSub: '18001 Granada',
                            to: order.destination || 'Malaga',
                            toSub: '29001 Malaga'
                        },
                        timeLeft: status === 'On route' ? `${Math.floor(Math.random() * 5) + 1} h ${Math.floor(Math.random() * 59)} min left` : (status === 'Waiting' ? '19 h 59 min left' : '-'),
                        distance: `${Math.floor(Math.random() * 1000) + 100} km`,
                        estimatedTime: `${Math.floor(Math.random() * 12) + 2} h ${Math.floor(Math.random() * 59)} min`
                    };
                });
                
                setDeliveries(enhancedData);
            } catch (err) {
                console.error("Failed to fetch deliveries", err);
                // Fallback dummy data matching the screenshot if API fails
                setDeliveries([
                    { id: 'UL-158902NH', status: 'On route', route: { from: 'Madrid', fromSub: '18001 Granada', to: 'Malaga', toSub: '29001 Malaga' }, timeLeft: '1 h 35 min left', distance: '529 km', estimatedTime: '5 h 27 min' },
                    { id: 'KO-158454PO', status: 'On route', route: { from: 'Warszawa', fromSub: '00-006 Warszawa', to: 'Krakow', toSub: '30-000 Krakow' }, timeLeft: '3 h 09 min left', distance: '290 km', estimatedTime: '3 h 35 min' },
                    { id: 'UK-568742NK', status: 'Waiting', route: { from: 'Madrid', fromSub: '28001 Madrid', to: 'Roma', toSub: '00100 Roma' }, timeLeft: '19 h 59 min left', distance: '1959 km', estimatedTime: '20 h 34 min' },
                    { id: 'KO-158002NH', status: 'On route', route: { from: 'Warszawa', fromSub: '97-300 Piotrkow', to: 'Katowice', toSub: '40-001 Katowice' }, timeLeft: '2 h 06 min left', distance: '295 km', estimatedTime: '3 h 16 min' },
                    { id: 'KJ-145651LK', status: 'On route', route: { from: 'Paris', fromSub: '18001 Hannover', to: 'Berlin', toSub: '10115 Berlin' }, timeLeft: '1 h 16 min left', distance: '1275 km', estimatedTime: '12 h 50 min' },
                    { id: 'GM-145125PO', status: 'Waiting', route: { from: 'Stockholm', fromSub: '58128 Linkoping', to: 'Copenhagen', toSub: '21110 Malmo' }, timeLeft: '4 h 10 min left', distance: '658 km', estimatedTime: '7 h 08 min' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveries();
    }, []);

    const counts = {
        'All': deliveries.length,
        'On route': deliveries.filter(d => d.status === 'On route').length,
        'Waiting': deliveries.filter(d => d.status === 'Waiting').length,
        'Inactive': deliveries.filter(d => d.status === 'Inactive').length,
    };

    const filteredDeliveries = activeTab === 'All' ? deliveries : deliveries.filter(d => d.status === activeTab);

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="tracking-dashboard">
            <div className="tracking-header">
                <div className="tracking-title-area">
                    <h1 className="tracking-title">Tracking</h1>
                    <span className="tracking-subtitle">{deliveries.length} deliveries</span>
                </div>
                <button className="btn-add-track">
                    <Plus size={16} strokeWidth={3} /> Add new track
                </button>
            </div>

            <div className="tracking-tabs">
                {['All', 'On route', 'Waiting', 'Inactive'].map(tab => (
                    <div 
                        key={tab} 
                        className={`track-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab} <span className="tab-count">{counts[tab]}</span>
                    </div>
                ))}
            </div>

            <div className="tracking-filters">
                <div className="track-search-wrapper">
                    <Search className="track-search-icon" size={18} />
                    <input 
                        type="text" 
                        className="track-search-input" 
                        placeholder="Search for track ID, customer, delivery status, destination"
                    />
                </div>
                <div className="track-filter-btn">
                    <SlidersHorizontal size={16} /> Filters <ChevronDown size={16} />
                </div>
                <div className="track-filter-btn">
                    <Search size={16} style={{visibility:'hidden', width:0}}/> Time <ChevronDown size={16} />
                </div>
            </div>

            <div className="tracking-grid">
                {filteredDeliveries.map((item, idx) => {
                    const statusClass = item.status.toLowerCase().replace(' ', '-');
                    return (
                        <div key={idx} className="track-card" onClick={() => navigate(`/order-tracking/${item.id}`)} style={{cursor: 'pointer'}}>
                            <div className="tc-top">
                                <div className="tc-status-col">
                                    <div className={`tc-status-badge ${statusClass}`}>
                                        <div className={`tc-dot ${statusClass}`}></div> {item.status}
                                    </div>
                                    <div className="tc-id">{item.id}</div>
                                </div>
                                <div className="tc-route-col">
                                    <div className="tc-cities">{item.route.from} - {item.route.to}</div>
                                    <div className="tc-time-left">{item.timeLeft}</div>
                                </div>
                            </div>
                            
                            <div className="tc-middle">
                                <div className="tc-route-visual">
                                    <div className="route-line-container">
                                        <div className={`route-node ${statusClass}`}></div>
                                        <div className="route-line"></div>
                                        <div className="route-node inactive" style={{background: '#cbd5e1'}}></div>
                                    </div>
                                    <div className="route-details">
                                        <div className="route-location">
                                            {item.route.fromSub}
                                        </div>
                                        <div className="route-location" style={{marginTop:'auto'}}>
                                            {item.route.toSub}
                                        </div>
                                    </div>
                                </div>
                                <div className="tc-truck-graphic">
                                    {/* Using Lucide icon as a fallback, styled with a colored box to mimic the truck graphic */}
                                    <div style={{
                                        width: '80px', height: '48px', 
                                        background: '#f1f5f9', 
                                        borderRadius: '8px 8px 4px 4px',
                                        position: 'relative',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderLeft: `20px solid ${statusClass === 'on-route' ? '#10b981' : (statusClass === 'waiting' ? '#3b82f6' : '#94a3b8')}`
                                    }}>
                                        <Truck size={24} color="#64748b" />
                                        <div style={{position:'absolute', bottom: '-4px', left: '10px', width: '12px', height: '12px', background: '#475569', borderRadius: '50%'}}></div>
                                        <div style={{position:'absolute', bottom: '-4px', right: '10px', width: '12px', height: '12px', background: '#475569', borderRadius: '50%'}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="tc-bottom">
                                <div className="tc-stat">
                                    <span className="tc-stat-label">Distance</span>
                                    <span className="tc-stat-value">{item.distance}</span>
                                </div>
                                <div className="tc-stat">
                                    <span className="tc-stat-label">Estimated time</span>
                                    <span className="tc-stat-value">{item.estimatedTime}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackingDashboard;

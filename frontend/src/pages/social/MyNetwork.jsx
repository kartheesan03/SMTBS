import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { UserPlus, UserCheck, Search, Filter } from 'lucide-react';
import './MyNetwork.css';

const MyNetwork = () => {
    const [activeTab, setActiveTab] = useState('connections'); // connections, requests, suggestions
    const [networkData, setNetworkData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                // Placeholder API calls, adjusting for tab
                const endpoint = activeTab === 'suggestions' ? '/social/network/suggestions' : '/social/network';
                const { data } = await API.get(endpoint);
                setNetworkData(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load network data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNetwork();
    }, [activeTab]);

    return (
        <div className="my-network-container">
            <div className="network-sidebar">
                <div className="network-manage-card">
                    <h3>Manage my network</h3>
                    <ul className="network-nav-list">
                        <li className={activeTab === 'connections' ? 'active' : ''} onClick={() => setActiveTab('connections')}>
                            <UserCheck size={18} /> Connections
                        </li>
                        <li className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                            <UserPlus size={18} /> Requests 
                            <span className="badge">2</span>
                        </li>
                        <li className={activeTab === 'suggestions' ? 'active' : ''} onClick={() => setActiveTab('suggestions')}>
                            <Search size={18} /> Suggestions
                        </li>
                    </ul>
                </div>
            </div>

            <div className="network-main">
                <div className="network-content-card">
                    <div className="network-header">
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                        <div className="network-actions">
                            <button className="filter-btn"><Filter size={16} /> Filters</button>
                        </div>
                    </div>

                    <div className="network-grid">
                        {loading ? (
                            <div className="network-loading">Loading...</div>
                        ) : networkData.length === 0 ? (
                            <div className="network-empty">No data available in this view.</div>
                        ) : (
                            networkData.map((item, idx) => (
                                <div key={idx} className="network-user-card">
                                    <div className="network-user-cover"></div>
                                    <div className="network-user-avatar">
                                        {(item.username || item.recipient?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="network-user-info">
                                        <h4>{item.username || item.recipient?.username || 'Employee'}</h4>
                                        <p>{item.role || 'Staff'}</p>
                                    </div>
                                    <div className="network-user-action">
                                        {activeTab === 'suggestions' ? (
                                            <button className="connect-btn-outline">Connect</button>
                                        ) : activeTab === 'requests' ? (
                                            <div className="request-actions">
                                                <button className="accept-btn">Accept</button>
                                                <button className="reject-btn">Ignore</button>
                                            </div>
                                        ) : (
                                            <button className="message-btn-outline">Message</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyNetwork;

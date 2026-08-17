import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { UserPlus, UserCheck, Search, Filter, MessageSquare, Eye } from 'lucide-react';
import './MyNetwork.css';

const MyNetwork = () => {
    const [activeTab, setActiveTab] = useState('connections');
    const [networkData, setNetworkData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                // Placeholder API calls, adjusting for tab
                const endpoint = activeTab === 'suggestions' ? '/social/network/suggestions' : '/social/network';
                const { data } = await API.get(endpoint);
                
                // Add mock dates and presence for UI demonstration
                const enrichedData = (Array.isArray(data) ? data : []).map((item, i) => ({
                    ...item,
                    connectedSince: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
                    presence: i % 3 === 0 ? 'away' : i % 2 === 0 ? 'online' : 'offline',
                    department: i % 2 === 0 ? 'Engineering' : 'Sales'
                }));
                
                setNetworkData(enrichedData);
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
            {/* Top Stat Cards */}
            <div className="network-stats-row">
                <div className="network-stat-card" onClick={() => setActiveTab('connections')}>
                    <div className="stat-icon-wrapper blue">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>142</h3>
                        <span>Connections</span>
                    </div>
                </div>
                <div className="network-stat-card" onClick={() => setActiveTab('requests')}>
                    <div className="stat-icon-wrapper amber">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>2</h3>
                        <span>Pending requests</span>
                    </div>
                </div>
                <div className="network-stat-card">
                    <div className="stat-icon-wrapper teal">
                        <Eye size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>38</h3>
                        <span>Profile views</span>
                    </div>
                </div>
            </div>

            <div className="network-main-panel">
                <div className="network-header">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <div className="network-actions">
                        <div className="network-search">
                            <Search size={16} />
                            <input type="text" placeholder="Search connections..." />
                        </div>
                        <button className="filter-btn"><Filter size={16} /> Filters</button>
                    </div>
                </div>

                <div className="network-list-container">
                    {loading ? (
                        <div className="network-loading">Loading...</div>
                    ) : networkData.length === 0 ? (
                        <div className="network-empty">No data available in this view.</div>
                    ) : (
                        <table className="network-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role / Department</th>
                                    <th>Connected Since</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {networkData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="table-user-cell">
                                                <div className="table-avatar-wrapper">
                                                    <div className="table-avatar">
                                                        {(item.username || item.recipient?.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`presence-dot ${item.presence}`}></span>
                                                </div>
                                                <div className="table-user-name">
                                                    <strong>{item.username || item.recipient?.username || 'Employee'}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-role-cell">
                                                <span>{item.role || 'Staff'}</span>
                                                <span className="table-department">{item.department}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="table-date">{item.connectedSince}</span>
                                        </td>
                                        <td>
                                            <div className="table-action-cell">
                                                {activeTab === 'suggestions' ? (
                                                    <button className="connect-btn-outline"><UserPlus size={16}/> Connect</button>
                                                ) : activeTab === 'requests' ? (
                                                    <div className="request-actions">
                                                        <button className="accept-btn">Accept</button>
                                                        <button className="reject-btn">Ignore</button>
                                                    </div>
                                                ) : (
                                                    <button className="message-btn-outline"><MessageSquare size={16}/> Message</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyNetwork;

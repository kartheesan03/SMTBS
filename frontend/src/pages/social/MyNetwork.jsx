import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { UserPlus, UserCheck, Search, ArrowLeft, Users, UserX } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { toggleFollow } from '../../api/posts';
import toast from 'react-hot-toast';
import './MyNetwork.css';

const AVATAR_COLOR = '#0a66c2';

const MyNetwork = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('connections');
    const [connections, setConnections] = useState([]);   // people I follow
    const [suggestions, setSuggestions] = useState([]);   // people I don't follow yet
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [unfollowLoading, setUnfollowLoading] = useState(new Set());
    const [followLoading, setFollowLoading] = useState(new Set());

    const fetchData = async () => {
        setLoading(true);
        try {
            const [followingRes, suggestionsRes] = await Promise.all([
                API.get('/feed/following'),
                API.get('/feed/suggestions')
            ]);
            setConnections(Array.isArray(followingRes.data) ? followingRes.data : []);
            setSuggestions(Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []);
        } catch (error) {
            console.error('Failed to load network data', error);
            toast.error('Failed to load network data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUnfollow = async (userId, userName) => {
        if (unfollowLoading.has(userId)) return;
        setUnfollowLoading(prev => new Set([...prev, userId]));
        try {
            await toggleFollow(userId);
            setConnections(prev => prev.filter(c => c.id !== userId));
            setSuggestions(prev => [...prev, connections.find(c => c.id === userId)].filter(Boolean));
            toast(`Unfollowed ${userName}`, { icon: '👋' });
        } catch {
            toast.error('Failed to unfollow');
        } finally {
            setUnfollowLoading(prev => { const n = new Set(prev); n.delete(userId); return n; });
        }
    };

    const handleFollow = async (userId, userName) => {
        if (followLoading.has(userId)) return;
        setFollowLoading(prev => new Set([...prev, userId]));
        try {
            await toggleFollow(userId);
            const user = suggestions.find(s => s.id === userId);
            if (user) {
                setSuggestions(prev => prev.filter(s => s.id !== userId));
                setConnections(prev => [{ ...user, followedAt: new Date().toISOString() }, ...prev]);
            }
            toast.success(`Now following ${userName}`);
        } catch {
            toast.error('Failed to follow');
        } finally {
            setFollowLoading(prev => { const n = new Set(prev); n.delete(userId); return n; });
        }
    };

    const filtered = (activeTab === 'connections' ? connections : suggestions)
        .filter(p => !search || (p.name || '').toLowerCase().includes(search.toLowerCase()));

    const initials = (name) => (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const avatarColor = () => AVATAR_COLOR;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="my-network-container">
            {/* Back Button */}
            <div style={{ marginBottom: '16px' }}>
                <button
                    onClick={() => navigate('/feed')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'transparent', border: 'none',
                        color: '#555', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer', padding: '4px 0',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#0a66c2'}
                    onMouseOut={e => e.currentTarget.style.color = '#555'}
                >
                    <ArrowLeft size={16} /> Back to Feed
                </button>
            </div>

            {/* Stat Cards */}
            <div className="network-stats-row">
                <div className="network-stat-card" onClick={() => setActiveTab('connections')}
                    style={{ cursor: 'pointer', border: activeTab === 'connections' ? '2px solid #0a66c2' : undefined }}>
                    <div className="stat-icon-wrapper blue"><UserCheck size={24} /></div>
                    <div className="stat-info">
                        <h3>{connections.length}</h3>
                        <span>Following</span>
                    </div>
                </div>
                <div className="network-stat-card" onClick={() => setActiveTab('suggestions')}
                    style={{ cursor: 'pointer', border: activeTab === 'suggestions' ? '2px solid #0a66c2' : undefined }}>
                    <div className="stat-icon-wrapper amber"><UserPlus size={24} /></div>
                    <div className="stat-info">
                        <h3>{suggestions.length}</h3>
                        <span>Suggested</span>
                    </div>
                </div>
            </div>

            <div className="network-main-panel">
                <div className="network-header">
                    <h2>{activeTab === 'connections' ? 'People You Follow' : 'People You May Know'}</h2>
                    <div className="network-actions">
                        <div className="network-search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="network-list-container">
                    {loading ? (
                        <div className="network-loading">Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div className="network-empty" style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
                            <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>
                                {activeTab === 'connections' ? "You're not following anyone yet" : 'No suggestions available'}
                            </div>
                            <div style={{ fontSize: '13px', marginTop: '6px' }}>
                                {activeTab === 'connections' ? 'Follow colleagues from the Feed to see them here.' : 'Check back later!'}
                            </div>
                        </div>
                    ) : (
                        <table className="network-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    {activeTab === 'connections' && <th>Followed Since</th>}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((person, idx) => (
                                    <tr key={person.id || idx}>
                                        <td>
                                            <div className="table-user-cell">
                                                <div className="table-avatar-wrapper">
                                                    <div className="table-avatar" style={{ background: avatarColor(person.id, idx), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                                                        {person.picture
                                                            ? <img src={person.picture} alt={person.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                            : initials(person.name)}
                                                    </div>
                                                </div>
                                                <div className="table-user-name">
                                                    <strong>{person.name || 'Employee'}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-role-cell">
                                                <span>{person.role || 'Member'}</span>
                                                {person.department && (
                                                    <span className="table-department">{person.department}</span>
                                                )}
                                            </div>
                                        </td>
                                        {activeTab === 'connections' && (
                                            <td>
                                                <span className="table-date">{formatDate(person.followedAt)}</span>
                                            </td>
                                        )}
                                        <td>
                                            <div className="table-action-cell">
                                                {activeTab === 'connections' ? (
                                                    <button
                                                        className="connect-btn-outline"
                                                        onClick={() => handleUnfollow(person.id, person.name)}
                                                        disabled={unfollowLoading.has(person.id)}
                                                        style={{ opacity: unfollowLoading.has(person.id) ? 0.5 : 1 }}
                                                    >
                                                        Unfollow
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="connect-btn-outline follow-filled"
                                                        onClick={() => handleFollow(person.id, person.name)}
                                                        disabled={followLoading.has(person.id)}
                                                        style={{ opacity: followLoading.has(person.id) ? 0.5 : 1 }}
                                                    >
                                                        Follow
                                                    </button>
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

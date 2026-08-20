import React, { useState, useEffect } from 'react';
import { X, Search, Link as LinkIcon } from 'lucide-react';
import { getSuggestedConnections } from '../../../api/posts';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['#0a3d62', '#155e75', '#166534', '#7c2d12', '#4338ca', '#b45309'];

const ShareModal = ({ isOpen, onClose, authorName, postUrl, postText }) => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    useEffect(() => {
        if (!isOpen) return;
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Using suggested connections as a proxy for "all employees" for the share modal
                const res = await getSuggestedConnections();
                setUsers(res || []);
            } catch (err) {
                console.error("Failed to load users for sharing:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (u.role || '').toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (id) => {
        const next = new Set(selectedUsers);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedUsers(next);
    };

    const handleCopyLink = () => {
        let textToCopy = postUrl;
        if (postText) {
            // strip markdown or basic HTML tags to get clean text
            const cleanText = postText.replace(/<[^>]*>?/gm, '').trim();
            const previewText = cleanText.length > 120 ? cleanText.substring(0, 120) + '...' : cleanText;
            textToCopy = `Check out this post by ${authorName}:\n\n"${previewText}"\n\n${postUrl}`;
        }
        navigator.clipboard.writeText(textToCopy);
        toast.success('Link copied to clipboard');
        onClose();
    };

    const handleSend = () => {
        if (selectedUsers.size === 0) return;
        // Mock send
        toast.success(`Post sent to ${selectedUsers.size} person${selectedUsers.size > 1 ? 's' : ''}!`);
        setSelectedUsers(new Set());
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#fff', borderRadius: '8px',
                width: '90%', maxWidth: '520px', maxHeight: '85vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                        Send {authorName}'s Post
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', background: '#f1f5f9',
                        borderRadius: '6px', padding: '8px 12px'
                    }}>
                        <Search size={16} color="#64748b" style={{ marginRight: '8px' }} />
                        <input
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                border: 'none', background: 'transparent', outline: 'none',
                                width: '100%', fontSize: '14px', color: '#334155'
                            }}
                        />
                    </div>
                </div>

                {/* User List */}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No people found.</div>
                    ) : (
                        filteredUsers.map((user, i) => {
                            const isSelected = selectedUsers.has(user.id);
                            const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

                            return (
                                <div 
                                    key={user.id} 
                                    onClick={() => toggleSelect(user.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '12px 20px',
                                        borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                        background: isSelected ? '#f8fafc' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                        background: color, color: '#fff', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600,
                                        overflow: 'hidden'
                                    }}>
                                        {user.picture ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                                    </div>
                                    <div style={{ flex: 1, margin: '0 12px', minWidth: 0 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                            {user.role || '--'}
                                        </div>
                                    </div>
                                    <div style={{ flexShrink: 0 }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '4px',
                                            border: `2px solid ${isSelected ? '#0a66c2' : '#cbd5e1'}`,
                                            background: isSelected ? '#0a66c2' : '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}>
                                            {isSelected && <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>✓</div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px', borderTop: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <button
                        onClick={handleCopyLink}
                        style={{
                            display: 'flex', alignItems: 'center', background: 'none', border: 'none',
                            color: '#0a66c2', fontWeight: 600, fontSize: '14px', cursor: 'pointer', padding: '8px 0'
                        }}
                    >
                        <LinkIcon size={16} style={{ marginRight: '6px' }} /> Copy link to post
                    </button>

                    {selectedUsers.size > 0 && (
                        <button
                            onClick={handleSend}
                            style={{
                                background: '#0a66c2', color: '#fff', border: 'none',
                                padding: '8px 20px', borderRadius: '24px', fontWeight: 600,
                                fontSize: '14px', cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

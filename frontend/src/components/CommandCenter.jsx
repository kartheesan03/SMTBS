import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, ShoppingCart, Activity } from 'lucide-react';
import './CommandCenter.css';

const CommandCenter = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const searchIndex = [
        { id: 1, type: 'Module', name: 'Dashboard', icon: <Activity size={16} />, path: '/' },
        { id: 2, type: 'Module', name: 'User Management', icon: <Users size={16} />, path: '/users' },
        { id: 3, type: 'Module', name: 'Order Management', icon: <ShoppingCart size={16} />, path: '/orders' },
        { id: 4, type: 'Module', name: 'Material Management', icon: <FileText size={16} />, path: '/materials' },
        { id: 5, type: 'Module', name: 'HR Dashboard', icon: <Users size={16} />, path: '/hr' },
        { id: 6, type: 'Module', name: 'Vendors', icon: <ShoppingCart size={16} />, path: '/vendors' },
        { id: 7, type: 'Module', name: 'Settings', icon: <Activity size={16} />, path: '/settings' },
        { id: 8, type: 'Module', name: 'Support', icon: <FileText size={16} />, path: '/support' }
    ];

    const filtered = query ? searchIndex.filter(r => r.name.toLowerCase().includes(query.toLowerCase())) : searchIndex.slice(0, 4);

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            <div className="cmd-overlay" onClick={onClose}></div>
            <div className="cmd-modal">
                <div className="cmd-input-container">
                    <Search className="cmd-icon" size={20} />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search for employees, orders, or pages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="cmd-badge">ESC to close</div>
                </div>
                
                {query && (
                    <div className="cmd-results">
                        <div className="cmd-group-label">Top Results</div>
                        {filtered.length > 0 ? (
                            filtered.map(res => (
                                <button key={res.id} className="cmd-result-item" onClick={() => handleNavigate(res.path)}>
                                    <div className="cmd-res-icon">{res.icon}</div>
                                    <div className="cmd-res-info">
                                        <span className="cmd-res-name">{res.name}</span>
                                        <span className="cmd-res-type">{res.type}</span>
                                    </div>
                                    <span className="cmd-res-arrow">&rarr;</span>
                                </button>
                            ))
                        ) : (
                            <div className="cmd-no-results">No results found for "{query}"</div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default CommandCenter;

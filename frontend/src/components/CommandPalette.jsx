import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, ShoppingCart, Briefcase, FileText, X } from 'lucide-react';
import api from '../api/axios';
import './CommandPalette.css';

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    
    // Quick Actions - Static fallback when query is empty
    const quickActions = [
        { id: 'qa-1', title: 'Add Material', icon: <Package size={16} />, path: '/materials/add' },
        { id: 'qa-2', title: 'Add Employee', icon: <Users size={16} />, path: '/hrms/add-employee' },
        { id: 'qa-3', title: 'Create Order', icon: <ShoppingCart size={16} />, path: '/orders/select-type' },
        { id: 'qa-4', title: 'Add Vendor', icon: <Briefcase size={16} />, path: '/vendors/add' }
    ];

    const pages = [
        { id: 'pg-1', title: 'Dashboard', icon: <FileText size={16} />, path: '/' },
        { id: 'pg-2', title: 'Inventory', icon: <Package size={16} />, path: '/materials' },
        { id: 'pg-3', title: 'Employee Directory', icon: <Users size={16} />, path: '/hrms' },
        { id: 'pg-4', title: 'Vendor Directory', icon: <Briefcase size={16} />, path: '/vendors' },
        { id: 'pg-5', title: 'Movement Tracking', icon: <FileText size={16} />, path: '/erp' },
    ];

    // Combine current render list into a flat array for keyboard navigation
    const getFlattenedList = () => {
        let list = [];
        if (!query) {
            list = [...quickActions, ...pages];
        } else if (results) {
            if (results.materials) list = [...list, ...results.materials];
            if (results.employees) list = [...list, ...results.employees];
            if (results.vendors) list = [...list, ...results.vendors];
            if (results.orders) list = [...list, ...results.orders];
        }
        return list;
    };

    const flatList = getFlattenedList();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults(null);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0); // Reset selection when list changes
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else document.dispatchEvent(new CustomEvent('open-command-palette'));
            }
            
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < flatList.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatList.length - 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedItem = flatList[selectedIndex];
                if (selectedItem && selectedItem.path) {
                    navigate(selectedItem.path);
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, flatList, selectedIndex, navigate, onClose]);

    if (!isOpen) return null;

    const renderIcon = (type) => {
        switch(type) {
            case 'material': return <Package size={16} className="cp-item-icon material" />;
            case 'employee': return <Users size={16} className="cp-item-icon employee" />;
            case 'vendor': return <Briefcase size={16} className="cp-item-icon vendor" />;
            case 'order': return <ShoppingCart size={16} className="cp-item-icon order" />;
            default: return <FileText size={16} className="cp-item-icon default" />;
        }
    };

    let currentIndex = 0; // manual tracking for group rendering to match flatList index

    const renderGroup = (title, items) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="cp-group">
                <div className="cp-group-title">{title}</div>
                {items.map(item => {
                    const idx = currentIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                        <div 
                            key={item.id}
                            className={`cp-item ${isSelected ? 'selected' : ''}`}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => { navigate(item.path); onClose(); }}
                        >
                            <div className="cp-item-icon-wrapper">
                                {item.icon || renderIcon(item.type)}
                            </div>
                            <div className="cp-item-content">
                                <div className="cp-item-title">{item.title}</div>
                                {item.subtitle && <div className="cp-item-subtitle">{item.subtitle}</div>}
                            </div>
                            {isSelected && <div className="cp-item-action">Jump to</div>}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="cp-overlay" onClick={onClose}>
            <div className="cp-modal" onClick={e => e.stopPropagation()}>
                <div className="cp-header">
                    <Search size={18} className="cp-search-icon" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="cp-input" 
                        placeholder="Search materials, employees, orders..." 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="cp-esc-badge">ESC</div>
                </div>
                
                <div className="cp-body">
                    {!query ? (
                        <>
                            {renderGroup("Quick Actions", quickActions)}
                            {renderGroup("Pages", pages)}
                        </>
                    ) : (
                        <div className="cp-results">
                            {isLoading ? (
                                <div className="cp-loading">Searching...</div>
                            ) : results && results.totalCount > 0 ? (
                                <>
                                    {renderGroup("Materials", results.materials)}
                                    {renderGroup("Employees", results.employees)}
                                    {renderGroup("Vendors", results.vendors)}
                                    {renderGroup("Orders", results.orders)}
                                </>
                            ) : (
                                <div className="cp-empty">No results found for "{query}"</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;

import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, UserCheck, Shield, UserX, Search, Filter, 
    MoreVertical, Edit2, Lock, Trash2, Clock, User as UserIcon,
    ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import './UserManagement.css';

import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await API.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const kpis = [
        { label: 'Total Users', value: users.length, icon: <Users size={20} />, color: 'blue' },
        { label: 'Active', value: users.filter(u => u.active !== false).length, icon: <UserCheck size={20} />, color: 'green' },
        { label: 'Admins & Managers', value: users.filter(u => ['Super Admin', 'Admin', 'Manager'].includes(u.role)).length, icon: <Shield size={20} />, color: 'purple' },
        { label: 'Suspended', value: users.filter(u => u.active === false).length, icon: <UserX size={20} />, color: 'red' }
    ];

    const getRoleBadge = (role) => {
        if(!role) return 'role-badge employee';
        const roleLower = role.toLowerCase();
        if (roleLower.includes('admin')) return 'role-badge admin';
        if (roleLower.includes('manager')) return 'role-badge manager';
        if (roleLower.includes('hr')) return 'role-badge hr';
        if (roleLower.includes('sales')) return 'role-badge sales';
        if (roleLower.includes('vendor') || roleLower.includes('customer')) return 'role-badge external';
        return 'role-badge employee';
    };

    const getStatusBadge = (active) => {
        if (active !== false) return 'status-badge active';
        return 'status-badge suspended';
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const UserKPICard = ({ title, val, color, icon: Icon }) => {
        const themeClass = color ? `ent-theme-${color === 'green' ? 'success' : color === 'red' ? 'danger' : color === 'purple' ? 'purple' : 'primary'}` : 'ent-theme-primary';
        
        return (
        <div className={`ent-module-card ${typeof themeClass !== 'undefined' ? themeClass : (color ? `ent-theme-${color}` : 'ent-theme-primary')}`}>
            <div>
                <div className="ent-card-header">
                    <span className="ent-card-title">{title}</span>
                    <div className="ent-card-icon-wrapper">
                        {Icon && <Icon size={18} strokeWidth={2.5} />}
                    </div>
                </div>
                <div className="ent-card-value">{val}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ent-text-secondary)', marginBottom: '12px' }}>
                    {'Monitoring Level'}
                </div>
            </div>
            
            <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    Updated Today
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

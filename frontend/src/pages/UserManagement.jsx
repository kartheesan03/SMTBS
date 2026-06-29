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

    return (
        <div className="users-page">
            <div className="breadcrumb">
                <span>ADMINISTRATION</span> / <strong>User Management</strong>
            </div>

            {/* KPI Row */}
            <div className="users-kpi-row">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`um-kpi-card ${kpi.color}`}>
                        <div className="um-kpi-content">
                            <p>{kpi.label}</p>
                            <h2>{kpi.value}</h2>
                        </div>
                        <div className="um-kpi-icon">
                            {kpi.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="um-table-card">
                <div className="um-table-header">
                    <div>
                        <h3>User Roster</h3>
                        <p>Live roster of everyone with access to the system</p>
                    </div>
                    <div className="um-table-actions">
                        <div className="um-search">
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search users by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="um-btn-filter">
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="um-table-wrapper">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>USER <ChevronDown size={14} /></th>
                                <th>ROLE</th>
                                <th>PHONE</th>
                                <th>STATUS</th>
                                <th>JOINED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8">Loading users...</td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="um-user-cell">
                                            <div className="um-avatar" style={{ background: `#3b82f622`, color: '#3b82f6' }}>
                                                {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <div className="um-user-info">
                                                <span className="um-name">{user.name}</span>
                                                <span className="um-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={getRoleBadge(user.role)}>{user.role || 'User'}</span></td>
                                    <td className="um-dept">{user.phone || 'N/A'}</td>
                                    <td>
                                        <span className={getStatusBadge(user.active)}>
                                            <span className="status-dot"></span> {user.active !== false ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="um-last-active">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="um-row-actions">
                                            <button className="um-action-icon" title="View Profile"><UserIcon size={16} /></button>
                                            <button className="um-action-icon" title="Edit User"><Edit2 size={16} /></button>
                                            <button className="um-action-icon danger" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="um-table-footer">
                    <div className="um-showing">
                        Showing <strong>{filteredUsers.length}</strong> users
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

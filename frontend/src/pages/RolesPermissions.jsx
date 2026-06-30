import React, { useState, useEffect } from 'react';
import { Lock, Plus, FileText, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import API from '../api/axios';
import './RolesPermissions.css';
import toast from 'react-hot-toast';

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await API.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const getColorForRole = (roleName) => {
        const lower = roleName.toLowerCase();
        if (lower.includes('admin')) return { color: '#8b5cf6', name: 'purple' };
        if (lower.includes('manager')) return { color: '#3b82f6', name: 'blue' };
        if (lower.includes('hr')) return { color: '#f59e0b', name: 'orange' };
        return { color: '#10b981', name: 'green' };
    };

    return (
        <div className="rp-container">
            <div className="rp-header">
                <div className="rp-title-section">
                    <div className="rp-icon-box">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h3>Roles & Permissions</h3>
                        <p>Manage system access levels and module permissions for different user roles.</p>
                    </div>
                </div>
                <button className="rp-btn-primary" onClick={() => toast.success('Create role dialog opening...')}>
                    <Plus size={16} /> Create New Role
                </button>
            </div>

            <div className="rp-grid">
                {loading ? (
                    <div style={{ padding: '20px', color: '#64748b' }}>Loading roles...</div>
                ) : roles.map((role) => {
                    const styleInfo = getColorForRole(role.name);
                    const perms = Array.isArray(role.permissions) ? role.permissions : [];
                    const isInvalid = !Array.isArray(role.permissions) && role.permissions != null;
                    
                    return (
                    <div key={role._id || role.id} className="rp-card">
                        <div className="rp-card-header">
                            <div className={`rp-card-icon ${styleInfo.name}`}>
                                <ShieldCheck size={32} color={styleInfo.color} />
                            </div>
                            <div className="rp-card-title">
                                <h4>{role.name}</h4>
                                <span>{perms.length} Permissions</span>
                            </div>
                        </div>
                        <div className="rp-card-body">
                            <div className="rp-tags">
                                {isInvalid && <span className="rp-tag" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>Invalid Data Format</span>}
                                {!isInvalid && perms.slice(0, 5).map((perm, i) => (
                                    <span key={i} className="rp-tag">{perm}</span>
                                ))}
                                {perms.length > 5 && (
                                    <span className="rp-tag">+{perms.length - 5} more</span>
                                )}
                            </div>
                        </div>
                        <div className="rp-card-footer">
                            <button className="rp-btn-link" onClick={() => toast.success('Opening access overview...')}>View Access <ArrowRight size={14} /></button>
                            <button className="rp-btn-outline" onClick={() => toast.success('Opening edit dialog...')}>Edit</button>
                        </div>
                    </div>
                )})}
            </div>

            <div className="rp-bottom-info">
                <div className="rp-info-banner">
                    <span className="rp-badge">System Note</span>
                    <p>Logged in as: <strong>Admin</strong>. You have full access to modify roles.</p>
                </div>
                <button className="rp-btn-help">
                    <HelpCircle size={16} /> Need help with roles? View Documentation
                </button>
            </div>
        </div>
    );
};

export default RolesPermissions;

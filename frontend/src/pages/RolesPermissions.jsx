import React, { useState, useEffect } from 'react';
import { Lock, Plus, FileText, ArrowRight, ShieldCheck, HelpCircle, X } from 'lucide-react';
import API from '../api/axios';
import './RolesPermissions.css';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [viewingRole, setViewingRole] = useState(null);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [newRolePerms, setNewRolePerms] = useState([]);
    const [editRolePerms, setEditRolePerms] = useState([]);
    const [customPerm, setCustomPerm] = useState('');

    const fetchPermissions = async () => {
        try {
            const response = await API.get('/roles/permissions');
            setAvailablePermissions(response.data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        setEditRoleName(role.name || '');
        setEditRolePerms(Array.isArray(role.permissions) ? role.permissions : []);
    };

    const handleEditRole = async (e) => {
        e.preventDefault();
        if (!editRoleName.trim()) return toast.error('Role name is required');
        
        try {
            setSubmitting(true);
            await API.put(`/roles/${editingRole._id || editingRole.id}`, { name: editRoleName, description: '', permissions: editRolePerms });
            toast.success('Role updated successfully');
            setEditingRole(null);
            fetchRoles();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error(error.response?.data?.message || 'Failed to update role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return toast.error('Role name is required');
        
        try {
            setSubmitting(true);
            await API.post('/roles', { name: newRoleName, description: '', permissions: newRolePerms });
            toast.success('Role created successfully');
            setIsModalOpen(false);
            setNewRoleName('');
            setNewRolePerms([]);
            fetchRoles();
        } catch (error) {
            console.error('Error creating role:', error);
            toast.error(error.response?.data?.message || 'Failed to create role');
        } finally {
            setSubmitting(false);
        }
    };

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
        fetchPermissions();
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
            <div className="rp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <PageHeader title="Roles & Permissions" badge="SYSTEM" subtitle="Manage system access levels and module permissions for different user roles." />
                <button className="rp-btn-primary" onClick={() => setIsModalOpen(true)}>
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
                            <button className="rp-btn-link" onClick={() => setViewingRole(role)}>View Access <ArrowRight size={14} /></button>
                            <button className="rp-btn-outline" onClick={() => openEditModal(role)}>Edit</button>
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

            {/* Create Role Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="modal-content" style={{background: 'white', borderRadius: 12, width: 400, maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 0, overflow: 'hidden'}}>
                        <div style={{padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{margin: 0, fontSize: 18, color: '#0f172a'}}>Create New Role</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0}}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateRole} style={{padding: 24}}>
                            <div style={{marginBottom: 16}}>
                                <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8}}>Role Name <span style={{color: '#ef4444'}}>*</span></label>
                                <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Content Editor" style={{width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none', boxSizing: 'border-box', fontSize: 14}} required />
                            </div>
                            <div style={{marginBottom: 24}}>
                                <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8}}>Permissions</label>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc'}}>
                                    {availablePermissions.map(p => (
                                        <label key={p} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', margin: 0, color: '#475569'}}>
                                            <input type="checkbox" checked={newRolePerms.includes(p)} onChange={e => {
                                                if (e.target.checked) setNewRolePerms([...newRolePerms, p]);
                                                else setNewRolePerms(newRolePerms.filter(x => x !== p));
                                            }} />
                                            <span style={{textTransform: 'capitalize'}}>{p.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                                    <input type="text" value={customPerm} onChange={e => setCustomPerm(e.target.value)} placeholder="Type custom permission..." style={{flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, outline: 'none'}} />
                                    <button type="button" onClick={() => {
                                        const p = customPerm.trim().toLowerCase().replace(/ /g, '_');
                                        if (p && !newRolePerms.includes(p)) {
                                            setNewRolePerms([...newRolePerms, p]);
                                            if (!availablePermissions.includes(p)) setAvailablePermissions([...availablePermissions, p]);
                                        }
                                        setCustomPerm('');
                                    }} style={{padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>Add</button>
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 6, color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14}}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontSize: 14}}>
                                    {submitting ? 'Creating...' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {editingRole && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="modal-content" style={{background: 'white', borderRadius: 12, width: 400, maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 0, overflow: 'hidden'}}>
                        <div style={{padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{margin: 0, fontSize: 18, color: '#0f172a'}}>Edit Role</h3>
                            <button onClick={() => setEditingRole(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0}}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditRole} style={{padding: 24}}>
                            <div style={{marginBottom: 16}}>
                                <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8}}>Role Name <span style={{color: '#ef4444'}}>*</span></label>
                                <input type="text" value={editRoleName} onChange={e => setEditRoleName(e.target.value)} placeholder="e.g. Content Editor" style={{width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none', boxSizing: 'border-box', fontSize: 14}} required />
                            </div>
                            <div style={{marginBottom: 24}}>
                                <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8}}>Permissions</label>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc'}}>
                                    {availablePermissions.map(p => (
                                        <label key={p} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', margin: 0, color: '#475569'}}>
                                            <input type="checkbox" checked={editRolePerms.includes(p)} onChange={e => {
                                                if (e.target.checked) setEditRolePerms([...editRolePerms, p]);
                                                else setEditRolePerms(editRolePerms.filter(x => x !== p));
                                            }} />
                                            <span style={{textTransform: 'capitalize'}}>{p.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                                    <input type="text" value={customPerm} onChange={e => setCustomPerm(e.target.value)} placeholder="Type custom permission..." style={{flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, outline: 'none'}} />
                                    <button type="button" onClick={() => {
                                        const p = customPerm.trim().toLowerCase().replace(/ /g, '_');
                                        if (p && !editRolePerms.includes(p)) {
                                            setEditRolePerms([...editRolePerms, p]);
                                            if (!availablePermissions.includes(p)) setAvailablePermissions([...availablePermissions, p]);
                                        }
                                        setCustomPerm('');
                                    }} style={{padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>Add</button>
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                                <button type="button" onClick={() => setEditingRole(null)} style={{padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 6, color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14}}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontSize: 14}}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Access Modal */}
            {viewingRole && (
                <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="modal-content" style={{background: 'white', borderRadius: 12, width: 500, maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 0, overflow: 'hidden'}}>
                        <div style={{padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{margin: 0, fontSize: 18, color: '#0f172a'}}>Access Overview: {viewingRole.name}</h3>
                            <button onClick={() => setViewingRole(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 0}}><X size={20} /></button>
                        </div>
                        <div style={{padding: 24, maxHeight: '60vh', overflowY: 'auto'}}>
                            <p style={{marginTop: 0, marginBottom: 16, fontSize: 14, color: '#475569'}}>{viewingRole.description || 'No description available for this role.'}</p>
                            <h4 style={{margin: '0 0 12px 0', fontSize: 14, color: '#0f172a'}}>Assigned Permissions ({Array.isArray(viewingRole.permissions) ? viewingRole.permissions.length : 0})</h4>
                            <div className="rp-tags" style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                                {(!Array.isArray(viewingRole.permissions) || viewingRole.permissions.length === 0) ? (
                                    <span style={{fontSize: 13, color: '#94a3b8'}}>No specific permissions configured.</span>
                                ) : viewingRole.permissions.map((perm, i) => (
                                    <span key={i} className="rp-tag" style={{background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0'}}>{perm}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end'}}>
                            <button onClick={() => setViewingRole(null)} style={{padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14}}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPermissions;

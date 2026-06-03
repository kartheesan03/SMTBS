import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import { Plus, Search, UserPlus, Mail, Phone, Calendar, Trash2 } from 'lucide-react';

const HRMS = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '', firstName: '', lastName: '', 
        department: 'Employee', designation: '', contact: '',
        address: '', password: '', joinDate: new Date().toISOString().split('T')[0]
    });

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchEmployees = async () => {
        try {
            const { data } = await API.get('/employees');
            setEmployees(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();

    useEffect(() => {
        fetchEmployees();
        if (location.state?.openModal) {
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await API.put(`/employees/${editingId}`, formData);
            } else {
                await API.post('/employees', formData);
            }
            setShowModal(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({
                employeeId: '', firstName: '', lastName: '', 
                department: 'Employee', designation: '', contact: '',
                address: '', password: '', joinDate: new Date().toISOString().split('T')[0]
            });
            fetchEmployees();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handleDelete = async (employee) => {
        try {
            await API.delete(`/employees/${employee._id}`);
            setDeleteConfirm(null);
            setSelectedEmployee(null);
            fetchEmployees();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting employee');
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div className="header-top">
                    <h1>Employee Management</h1>
                    <button className="btn-primary flex-center gap-10" onClick={() => {
                        setIsEditing(false);
                        setFormData({
                            employeeId: '', firstName: '', lastName: '', 
                            department: 'Employee', designation: '', contact: '',
                            address: '', password: '', joinDate: new Date().toISOString().split('T')[0]
                        });
                        setShowModal(true);
                    }}>
                        <UserPlus size={18} /> Add Employee
                    </button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Employee Profile' : 'Add New Employee'}</h2>
                            <button className="close-btn" onClick={() => {
                                setShowModal(false);
                                setIsEditing(false);
                            }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <input type="text" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="e.g. EMP-001" />
                                </div>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <input type="text" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Manager" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="email@company.com" />
                                </div>
                                <div className="form-group">
                                    <label>{isEditing ? 'New Password (Min 8 chars, Optional)' : 'Set Password (Min 8 chars)'}</label>
                                    <input 
                                        type="password" 
                                        required={!isEditing} 
                                        minLength={8}
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Join Date</label>
                                    <input type="date" required value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Address</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                }}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Create Profile'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop profile-modal">
                        <div className="modal-header">
                            <h2>Employee Profile</h2>
                            <button className="close-btn" onClick={() => setSelectedEmployee(null)}>✕</button>
                        </div>
                        <div className="profile-view">
                            <div className="profile-top">
                                <div className="emp-avatar-lg">
                                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName?.[0]}
                                </div>
                                <div className="profile-titles">
                                    <h3>{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                                    <p className="designation">{selectedEmployee.designation}</p>
                                    <span className="dept-badge">{selectedEmployee.department}</span>
                                </div>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-item">
                                    <label>Employee ID</label>
                                    <p>{selectedEmployee.employeeId}</p>
                                </div>
                                <div className="profile-item">
                                    <label>Join Date</label>
                                    <p>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                                </div>
                                <div className="profile-item full-width">
                                    <label>Contact Info</label>
                                    <p>{selectedEmployee.contact || 'Not provided'}</p>
                                </div>
                                <div className="profile-item full-width">
                                    <label>Address</label>
                                    <p>{selectedEmployee.address || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-delete" onClick={() => setDeleteConfirm(selectedEmployee)}>
                                <Trash2 size={15} /> Delete
                            </button>
                            <div style={{flex: 1}} />
                            <button type="button" className="btn-cancel" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormData({
                                    employeeId: selectedEmployee.employeeId,
                                    firstName: selectedEmployee.firstName,
                                    lastName: selectedEmployee.lastName,
                                    department: selectedEmployee.department,
                                    designation: selectedEmployee.designation,
                                    contact: selectedEmployee.contact,
                                    address: selectedEmployee.address,
                                    password: '',
                                    joinDate: new Date(selectedEmployee.joinDate).toISOString().split('T')[0]
                                });
                                setEditingId(selectedEmployee._id);
                                setIsEditing(true);
                                setShowModal(true);
                                setSelectedEmployee(null);
                            }}>Edit Profile</button>
                            <button className="btn-primary" onClick={() => setSelectedEmployee(null)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop delete-confirm-modal">
                        <div className="delete-confirm-icon">
                            <Trash2 size={32} />
                        </div>
                        <h2>Delete Employee</h2>
                        <p className="delete-confirm-text">
                            Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="employee-grid">
                {employees.length > 0 ? employees.map((emp) => (
                    <div key={emp._id} className="glass-card employee-card">
                        <div className="emp-avatar">
                            {emp.firstName[0]}{emp.lastName?.[0]}
                        </div>
                        <h3>{emp.firstName} {emp.lastName}</h3>
                        <p className="designation">{emp.designation}</p>
                        <div className="emp-details">
                            <div className="detail-item">
                                <Mail size={14} /> <span>{emp.contact || 'No email'}</span>
                            </div>
                            <div className="detail-item">
                                <Calendar size={14} /> <span>Joined {new Date(emp.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="emp-footer">
                            <span className="dept-badge">{emp.department}</span>
                            <div className="emp-footer-actions">
                                <button className="action-btn-sm" onClick={() => setSelectedEmployee(emp)}>View Profile</button>
                                <button className="delete-btn-sm" title="Delete Employee" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(emp); }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="glass-card p-30 text-center w-full">
                        <p className="text-muted">No employees found in the system.</p>
                    </div>
                )}
            </div>
            <style jsx="true">{`
                .module-container { padding: 30px; color: var(--text-primary); }
                .employee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 25px; }
                .employee-card { text-align: center; display: flex; flex-direction: column; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); padding: 24px; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; }
                .employee-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
                
                .emp-avatar { width: 64px; height: 64px; background: var(--primary-50); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; margin-bottom: 16px; border: 2px solid var(--bg-body); box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent); }
                .employee-card h3 { font-size: 18px; font-weight: 800; margin: 0 0 4px 0; color: var(--text-primary); }
                .designation { color: var(--text-muted); font-size: 14px; margin: 0 0 20px 0; font-weight: 600; }
                
                .emp-details { width: 100%; text-align: left; margin-bottom: 20px; border-top: 1px dashed var(--border); padding-top: 15px; }
                .detail-item { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 13px; margin-bottom: 10px; font-weight: 500; }
                .emp-footer { width: 100%; display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); }
                .emp-footer-actions { display: flex; align-items: center; gap: 8px; }
                .dept-badge { background: var(--primary-50); color: var(--primary); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                
                .action-btn-sm { background: var(--bg-body); border: 1px solid var(--border); color: var(--text-primary); padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: 0.2s; cursor: pointer; }
                .action-btn-sm:hover { background: var(--bg-hover); border-color: var(--primary); color: var(--primary); }
                
                .delete-btn-sm { background: var(--bg-body); border: 1px solid var(--border); color: var(--text-muted); padding: 6px 10px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
                .delete-btn-sm:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-light); }
                
                .btn-delete { background: var(--danger-light); border: 1px solid transparent; color: var(--danger); padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; font-size: 14px; }
                .btn-delete:hover { background: color-mix(in srgb, var(--danger) 20%, transparent); border-color: var(--danger); }
                
                .btn-danger { background: linear-gradient(135deg, var(--danger), #b91c1c); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); font-size: 14px; }
                .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }
                
                .delete-confirm-modal { text-align: center; max-width: 420px; padding: 32px; }
                .delete-confirm-modal h2 { color: var(--danger); margin: 0 0 12px 0; font-size: 24px; font-weight: 800; }
                .delete-confirm-icon { width: 72px; height: 72px; background: var(--danger-light); color: var(--danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                .delete-confirm-text { color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
                .delete-confirm-modal .modal-actions { justify-content: center; margin-top: 0; }
                .w-full { grid-column: 1 / -1; }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 32px; position: relative; text-align: left; max-height: 90vh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); color: var(--text-primary); box-shadow: var(--shadow-lg); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
                .modal-header h2 { color: var(--text-primary); font-size: 20px; font-weight: 800; margin: 0; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .modal-form { display: flex; flex-direction: column; gap: 24px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); }
                .form-group input, .form-group select { padding: 12px 16px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); width: 100%; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                
                .full-width { grid-column: 1 / -1; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
                .btn-cancel { background: var(--bg-body); color: var(--text-secondary); border: 1px solid var(--border); padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; }
                .btn-cancel:hover { background: var(--bg-hover); border-color: var(--border-hover); color: var(--text-primary); }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                /* Profile View Styles */
                .profile-view { background: var(--bg-body); border-radius: 12px; padding: 24px; border: 1px solid var(--border); }
                .profile-top { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; border-bottom: 1px dashed var(--border); padding-bottom: 24px; }
                .emp-avatar-lg { width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%); color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; flex-shrink: 0; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2); }
                .profile-titles h3 { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: var(--text-primary); }
                .profile-titles .designation { font-size: 15px; margin-bottom: 12px; }
                .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .profile-item label { display: block; font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
                .profile-item p { font-size: 15px; color: var(--text-primary); font-weight: 600; margin: 0; }
                
                .input-btn-group { display: flex; gap: 10px; }
                .input-btn-group input { flex: 1; }
                .input-btn-group .action-btn-sm { white-space: nowrap; height: 45px; margin-top: 0; align-self: flex-end; }
                .input-btn-group .action-btn-sm:hover { background: var(--primary); color: white; border-color: var(--primary); }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 20px; }
                    .employee-grid { grid-template-columns: 1fr; }
                    .form-grid, .profile-grid { grid-template-columns: 1fr; }
                    .profile-top { flex-direction: column; text-align: center; }
                    .modal-content { padding: 24px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; justify-content: center; }
                    .profile-view { padding: 20px; }
                    .header-top { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .header-top h1 { font-size: 24px; margin: 0; }
                    .header-top button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default HRMS;

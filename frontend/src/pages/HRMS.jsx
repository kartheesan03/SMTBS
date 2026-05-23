import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import { Plus, Search, UserPlus, Mail, Phone, Calendar } from 'lucide-react';

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
                                    <label>Office Address</label>
                                    <p>{selectedEmployee.address || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
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
                            <button className="action-btn-sm" onClick={() => setSelectedEmployee(emp)}>View Profile</button>
                        </div>
                    </div>
                )) : (
                    <div className="glass-card p-30 text-center w-full">
                        <p className="text-muted">No employees found in the system.</p>
                    </div>
                )}
            </div>
            <style jsx="true">{`
                .module-container { padding: 30px; }
                .employee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 25px; }
                .employee-card { text-align: center; display: flex; flex-direction: column; align-items: center; }
                .emp-avatar { width: 60px; height: 60px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                .designation { color: var(--primary); font-size: 14px; margin-bottom: 20px; font-weight: 500; }
                .emp-details { width: 100%; text-align: left; margin-bottom: 20px; border-top: 1px solid var(--border); padding-top: 15px; }
                .detail-item { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 13px; margin-bottom: 8px; }
                .emp-footer { width: 100%; display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--border); }
                .dept-badge { background: rgba(20, 184, 166, 0.1); color: var(--secondary); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .action-btn-sm { background: transparent; border: 1px solid var(--border); color: white; padding: 5px 12px; border-radius: 6px; font-size: 12px; transition: 0.3s; }
                .action-btn-sm:hover { border-color: var(--primary); color: var(--primary); }
                .w-full { grid-column: 1 / -1; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; text-align: left; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; }
                .form-group select option { background: #1e293b; color: white; }
                .full-width { grid-column: 1 / -1; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                /* Profile View Styles */
                .profile-view { background: rgba(255,255,255,0.02); border-radius: 15px; padding: 25px; border: 1px solid var(--border); }
                .profile-top { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 20px; }
                .emp-avatar-lg { width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; flex-shrink: 0; }
                .profile-titles h3 { font-size: 20px; margin-bottom: 5px; }
                .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                .profile-item label { display: block; font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; }
                .profile-item p { font-size: 15px; color: white; font-weight: 500; }
                
                .input-btn-group { display: flex; gap: 10px; }
                .input-btn-group input { flex: 1; }
                .input-btn-group .action-btn-sm { white-space: nowrap; height: 45px; margin-top: 0; align-self: flex-end; }
                .input-btn-group .action-btn-sm:hover { background: var(--primary); color: white; border-color: var(--primary); }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .employee-grid { grid-template-columns: 1fr; }
                    .form-grid, .profile-grid { grid-template-columns: 1fr; }
                    .profile-top { flex-direction: column; text-align: center; }
                    .modal-content { padding: 20px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                    .profile-view { padding: 15px; }
                    .header-top { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-top h1 { font-size: 24px; }
                    .header-top button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default HRMS;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Plus, Search, UserPlus, Mail, Phone, Calendar, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const HRMS = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '', firstName: '', lastName: '', 
        department: 'Employee', designation: '', contact: '', phone: '',
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
    const navigate = useNavigate();

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
                department: 'Employee', designation: '', contact: '', phone: '',
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

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Employee Directory', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        const tableData = employees.map(e => [
            e.employeeId, `${e.firstName} ${e.lastName || ''}`, e.department, e.designation, e.contact || 'N/A', new Date(e.joinDate).toLocaleDateString()
        ]);
        doc.autoTable({
            head: [['Emp ID', 'Name', 'Department', 'Designation', 'Contact', 'Join Date']],
            body: tableData,
            startY: 36,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save('employees_report.pdf');
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Employees');
        sheet.columns = [
            { header: 'Emp ID', key: 'employeeId', width: 15 },
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Designation', key: 'designation', width: 25 },
            { header: 'Contact', key: 'contact', width: 25 },
            { header: 'Join Date', key: 'joinDate', width: 15 },
            { header: 'Address', key: 'address', width: 30 }
        ];
        employees.forEach(e => {
            sheet.addRow({
                employeeId: e.employeeId,
                firstName: e.firstName,
                lastName: e.lastName || '',
                department: e.department,
                designation: e.designation,
                contact: e.contact || '',
                joinDate: new Date(e.joinDate).toLocaleDateString(),
                address: e.address || ''
            });
        });
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'employees_report.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
                <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                <p style={{ fontWeight: 600 }}>Loading Employee Data...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Employee Management</h1>
                    <p className="page-subtitle">Manage your organization's workforce and access profiles.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-primary flex-center gap-8" onClick={() => navigate('/hrms/add-employee')}>
                        <UserPlus size={18} /> Add Employee
                    </button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="premium-card modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Edit Employee Profile</h2>
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
                                    <label>Join Date</label>
                                    <input type="date" required value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input type="tel" pattern="[0-9\-\+\s\(\)]+" maxLength="15" title="Valid mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" required />
                                </div>
                                <div className="form-group full-width">
                                    <label>{isEditing ? 'New Password (Optional)' : 'Set Password'}</label>
                                    <input 
                                        type="password" 
                                        required={!isEditing} 
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                        placeholder="Enter password"
                                    />
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
                                <button type="submit" className="btn-primary">Save Changes</button>
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
                                <div className="profile-item">
                                    <label>Email Address</label>
                                    <p className="flex-center gap-10" style={{justifyContent: 'flex-start'}}><Mail size={16} /> {selectedEmployee.contact || 'N/A'}</p>
                                </div>
                                <div className="profile-item">
                                    <label>Contact Number</label>
                                    <p className="flex-center gap-10" style={{justifyContent: 'flex-start'}}><Phone size={16} /> {selectedEmployee.phone || 'N/A'}</p>
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
                                
                                let safeJoinDate = new Date().toISOString().split('T')[0];
                                if (selectedEmployee.joinDate) {
                                    try {
                                        safeJoinDate = new Date(selectedEmployee.joinDate).toISOString().split('T')[0];
                                    } catch (err) {
                                        console.error('Invalid date', err);
                                    }
                                }

                                setFormData({
                                    employeeId: selectedEmployee.employeeId || '',
                                    firstName: selectedEmployee.firstName || '',
                                    lastName: selectedEmployee.lastName || '',
                                    department: selectedEmployee.department || 'Employee',
                                    designation: selectedEmployee.designation || '',
                                    contact: selectedEmployee.contact || '',
                                    phone: selectedEmployee.phone || '',
                                    address: selectedEmployee.address || '',
                                    password: '',
                                    joinDate: safeJoinDate
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
                    <div key={emp._id} className="premium-card employee-card">
                        <div className="emp-avatar">
                            {emp.firstName[0]}{emp.lastName?.[0]}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{emp.firstName} {emp.lastName}</h3>
                        <p className="designation">{emp.designation}</p>
                        <div className="emp-details">
                            <div className="detail-item">
                                <Mail size={14} /> <span>{emp.contact || 'No email'}</span>
                            </div>
                            <div className="detail-item">
                                <Phone size={14} /> <span>{emp.phone || 'No phone'}</span>
                            </div>
                            <div className="detail-item">
                                <Calendar size={14} /> <span>Joined {new Date(emp.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="emp-footer">
                            <span className="dept-badge">{emp.department}</span>
                            <div className="emp-footer-actions">
                                <button className="action-btn-sm" style={{ background: 'var(--bg-app)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', padding: '6px 8px' }} onClick={() => setSelectedEmployee(emp)}>View Profile</button>
                                <button className="action-btn-sm" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', padding: '6px 8px', display: 'flex', alignItems: 'center' }} title="Delete Employee" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(emp); }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="premium-card p-30 text-center w-full" style={{ padding: '30px' }}>
                        <p className="text-muted">No employees found in the system.</p>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default HRMS;

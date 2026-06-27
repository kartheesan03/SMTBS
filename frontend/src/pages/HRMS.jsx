import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Plus, Search, UserPlus, Mail, Phone, Calendar, Trash2, Download, Edit2, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import './FarmakuUser.css';

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
        <div className="farmaku-user-page">
            <div className="farmaku-user-header">
                <h1>User</h1>
                <div className="farmaku-user-header-right">
                    <div className="farmaku-search-bar" style={{minWidth: '250px'}}>
                        <Search size={16} color="#9ca3af" />
                        <input type="text" placeholder="Search anything" />
                    </div>
                    <button className="icon-btn" style={{border: '1px solid #e5e7eb', borderRadius: '50%', padding: '8px', background: '#fff', color: '#6b7280'}}>
                        <RefreshCw size={16} />
                    </button>
                    {/* The profile header is usually outside the page, but we'll add a dummy one if it matches the screenshot */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px'}}>
                        <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'}}>A</div>
                        <span style={{fontSize: '14px', fontWeight: '600'}}>Admin</span>
                    </div>
                </div>
            </div>

            <div className="farmaku-table-container">
                <div className="farmaku-table-controls">
                    <div className="left-controls">
                        <div className="farmaku-search-bar" style={{background: '#f9fafb', minWidth: '350px'}}>
                            <Search size={16} color="#9ca3af" />
                            <input type="text" placeholder="Search anything" />
                        </div>
                    </div>
                    <div className="right-controls">
                        <div className="farmaku-filter-role">
                            Role: 
                            <select>
                                <option value="All">All</option>
                                <option value="Admin">Admin</option>
                                <option value="Cashier">Cashier</option>
                                <option value="Employee">Employee</option>
                            </select>
                        </div>
                        <button className="farmaku-add-btn" onClick={() => navigate('/hrms/add-employee')}>
                            <Plus size={16} /> Add New
                        </button>
                    </div>
                </div>

                <table className="farmaku-user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => {
                            const role = emp.designation || emp.department || 'Employee';
                            const roleLower = role.toLowerCase();
                            let roleClass = 'other';
                            if (roleLower.includes('admin')) roleClass = 'admin';
                            else if (roleLower.includes('cashier')) roleClass = 'cashier';

                            return (
                                <tr key={emp._id}>
                                    <td>{emp.firstName} {emp.lastName}</td>
                                    <td className="email-col">{emp.contact || 'No email'}</td>
                                    <td className="phone-col">{emp.phone || 'No phone'}</td>
                                    <td>
                                        <span className={`farmaku-role-pill ${roleClass}`}>
                                            {role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="farmaku-action-icons">
                                            <button onClick={() => {
                                                setFormData({ ...emp, joinDate: new Date(emp.joinDate).toISOString().split('T')[0] });
                                                setEditingId(emp._id);
                                                setIsEditing(true);
                                                setShowModal(true);
                                            }}><Edit2 size={16} /></button>
                                            <button onClick={() => setDeleteConfirm(emp)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{margin: 0, fontSize: '20px'}}>Edit Employee Profile</h2>
                            <button className="icon-btn" onClick={() => { setShowModal(false); setIsEditing(false); }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Employee ID</label>
                                    <input type="text" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>First Name</label>
                                    <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Department</label>
                                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Designation</label>
                                    <input type="text" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Email Address</label>
                                    <input type="email" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Join Date</label>
                                    <input type="date" required value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Contact Number</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>{isEditing ? 'New Password (Optional)' : 'Set Password'}</label>
                                    <input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Address</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)'}}>
                                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setIsEditing(false); }}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600}}>
                                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 style={{margin: '0 0 4px 0', fontSize: '20px'}}>{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                                    <p style={{margin: 0, color: 'var(--text-muted)'}}>{selectedEmployee.designation}</p>
                                    <span style={{display: 'inline-block', marginTop: '6px', padding: '4px 10px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', fontWeight: 600}}>{selectedEmployee.department}</span>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedEmployee(null)}>✕</button>
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)'}}>
                            <div>
                                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)'}}>Employee ID</p>
                                <p style={{margin: 0, fontWeight: 500}}>{selectedEmployee.employeeId}</p>
                            </div>
                            <div>
                                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)'}}>Join Date</p>
                                <p style={{margin: 0, fontWeight: 500}}>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)'}}>Email</p>
                                <p style={{margin: 0, fontWeight: 500}}>{selectedEmployee.contact || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)'}}>Phone</p>
                                <p style={{margin: 0, fontWeight: 500}}>{selectedEmployee.phone || 'N/A'}</p>
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)'}}>Address</p>
                                <p style={{margin: 0, fontWeight: 500}}>{selectedEmployee.address || 'Not specified'}</p>
                            </div>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px'}}>
                            <button type="button" className="btn-secondary" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => setDeleteConfirm(selectedEmployee)}>
                                <Trash2 size={15} style={{marginRight: '6px'}} /> Delete
                            </button>
                            <div style={{display: 'flex', gap: '12px'}}>
                                <button type="button" className="btn-secondary" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    let safeJoinDate = new Date().toISOString().split('T')[0];
                                    if (selectedEmployee.joinDate) {
                                        try { safeJoinDate = new Date(selectedEmployee.joinDate).toISOString().split('T')[0]; } catch (err) {}
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
                                }}>Edit</button>
                                <button className="btn-primary" onClick={() => setSelectedEmployee(null)}>Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '32px', borderRadius: '12px', width: '400px', textAlign: 'center'}}>
                        <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
                            <Trash2 size={32} />
                        </div>
                        <h2 style={{margin: '0 0 12px 0'}}>Delete Employee</h2>
                        <p style={{margin: '0 0 24px 0', color: 'var(--text-muted)'}}>
                            Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>? This action cannot be undone.
                        </p>
                        <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-primary" style={{background: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRMS;

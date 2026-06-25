const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/HRMS.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.search(/return \([\s\S]{0,100}<div className="page-container">/);
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* KPI Section */}
            <div className="module-kpi-section">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Employees</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <UserPlus size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{employees.length}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">New Joiners (30d)</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{employees.filter(e => new Date(e.joinDate) > new Date(new Date().setDate(new Date().getDate() - 30))).length}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Departments</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(139,92,246,0.1)', color: '#8B5CF6'}}>
                            <Search size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{[...new Set(employees.map(e => e.department))].length}</div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Employee Directory</h1>
                    <p>Manage workforce, roles, and profiles.</p>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-secondary" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-primary" onClick={() => navigate('/hrms/add-employee')}>
                        <UserPlus size={16} /> Add Employee
                    </button>
                </div>
            </div>

            {/* Data Section */}
            <div className="module-data-section" style={{background: 'transparent', boxShadow: 'none', padding: 0}}>
                <div className="employee-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                    {employees.length > 0 ? employees.map((emp) => (
                        <div key={emp._id} className="analytics-card" style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600}}>
                                    {emp.firstName[0]}{emp.lastName?.[0]}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-main)' }}>{emp.firstName} {emp.lastName}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{emp.designation}</p>
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)'}}>
                                    <Mail size={14} /> <span>{emp.contact || 'No email'}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)'}}>
                                    <Phone size={14} /> <span>{emp.phone || 'No phone'}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)'}}>
                                    <Calendar size={14} /> <span>Joined {new Date(emp.joinDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto'}}>
                                <span style={{padding: '4px 10px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)'}}>{emp.department}</span>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button className="btn-secondary" style={{padding: '6px 12px', fontSize: '12px'}} onClick={() => setSelectedEmployee(emp)}>Profile</button>
                                    <button className="icon-btn" style={{color: 'var(--danger)', background: 'rgba(239,68,68,0.1)'}} onClick={(e) => { e.stopPropagation(); setDeleteConfirm(emp); }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No employees found in the system.</p>
                        </div>
                    )}
                </div>
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
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('HRMS.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

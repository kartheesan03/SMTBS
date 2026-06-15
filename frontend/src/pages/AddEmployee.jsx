import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, UserPlus } from 'lucide-react';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        employeeId: '', firstName: '', lastName: '', 
        department: 'Employee', designation: '', contact: '', phone: '',
        address: '', password: '', joinDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/employees', formData);
            navigate('/hrms');
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving employee');
            setLoading(false);
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div className="header-top">
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button className="back-btn" onClick={() => navigate('/hrms')} title="Back to HRMS">
                                <ArrowLeft size={24} />
                            </button>
                            Add New Employee
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginLeft: '36px' }}>
                            Create a new employee profile in HRMS.
                        </p>
                    </div>
                </div>
            </header>

            <div className="glass-card form-container animate-pop">
                {error && <div className="error-alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="employee-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Employee ID</label>
                            <input type="text" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="e.g. EMP-001" />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First name" />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Last name" />
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
                            <label>Set Password (Min 8 chars)</label>
                            <input 
                                type="password" 
                                required
                                minLength={8}
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder="Enter secure password"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Address</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/hrms')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; color: var(--text-primary); }
                .module-header { margin-bottom: 24px; padding: 24px; }
                .header-top { display: flex; justify-content: space-between; align-items: center; }
                .header-top h1 { margin: 0; font-size: 24px; font-weight: 800; }
                
                .back-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 8px; transition: 0.2s; }
                .back-btn:hover { background: var(--bg-hover); color: var(--primary); }

                .form-container { padding: 32px; max-width: 900px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-sm); }
                
                .error-alert { background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 14px 20px; border-radius: 8px; margin-bottom: 24px; font-weight: 600; font-size: 14px; }

                .employee-form { display: flex; flex-direction: column; gap: 32px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
                .form-group input, .form-group select { padding: 14px 16px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 10px; color: var(--text-primary); width: 100%; font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-50); background: var(--bg-card); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
                
                .full-width { grid-column: 1 / -1; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 24px; }
                .btn-cancel { background: var(--bg-body); color: var(--text-secondary); border: 1px solid var(--border); padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s; }
                .btn-cancel:hover { background: var(--bg-hover); border-color: var(--border-hover); color: var(--text-primary); }
                .btn-primary { background: var(--primary); color: white; border: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent); }
                .btn-primary:hover:not(:disabled) { background: var(--primary-dark, #1d4ed8); transform: translateY(-1px); box-shadow: 0 6px 16px color-mix(in srgb, var(--primary) 40%, transparent); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .animate-pop { animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .module-container { padding: 16px; }
                    .form-container { padding: 24px; }
                    .form-grid { grid-template-columns: 1fr; }
                    .form-actions { flex-direction: column-reverse; }
                    .form-actions button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default AddEmployee;

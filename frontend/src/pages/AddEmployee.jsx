import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import PasswordInput from '../components/ui/PasswordInput';
import { UserPlus } from 'lucide-react';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';

const AddEmployee = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        employeeId: '', firstName: '', lastName: '', 
        department: 'Employee', designation: '', contact: '', phone: '',
        address: '', password: '', joinDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode && id) {
            fetchEmployee();
        }
    }, [isEditMode, id]);

    const fetchEmployee = async () => {
        try {
            const { data } = await API.get(`/employees/${id}`);
            setFormData({
                employeeId: data.employeeId || '', 
                firstName: data.firstName || '', 
                lastName: data.lastName || '', 
                department: data.department || 'Employee', 
                designation: data.designation || '', 
                contact: data.contact || '', 
                phone: data.phone || '',
                address: data.address || '', 
                password: '', // Do not populate password
                joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            toast.error('Failed to fetch employee data');
            navigate('/hrms');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                const dataToSubmit = { ...formData };
                if (!dataToSubmit.password) delete dataToSubmit.password;
                await API.put(`/employees/${id}`, dataToSubmit);
                toast.success('Employee updated successfully');
                navigate(`/employees/${id}`);
            } else {
                const res = await API.post('/employees', formData);
                toast.success('Employee created successfully');
                navigate(`/employees/${res.data._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving employee');
            toast.error(err.response?.data?.message || 'Error saving employee');
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;

    return (
        <StandardPageLayout
            title={isEditMode ? "Edit Employee" : "Add New Employee"}
            subtitle={isEditMode ? "Update employee details in the system." : "Create a new employee profile in HRMS."}
            breadcrumbs={[
                { label: 'HRMS', path: '/hrms' },
                { label: 'Employees', path: '/hrms' },
                { label: isEditMode ? 'Edit' : 'New' }
            ]}
            onSave={handleSubmit}
            onCancel={() => navigate('/hrms')}
            isEditMode={isEditMode}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? `${formData.firstName} ${formData.lastName}` : 'New Employee Profile'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Please complete all required fields below.</p>
                    </div>
                </div>
            }
        >
            <div className="standard-section">
                <div className="standard-section-header">Basic Details</div>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}
                
                <form id="employee-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Employee ID *</label>
                            <input type="text" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="e.g. EMP-001" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>First Name *</label>
                            <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First name" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Last Name</label>
                            <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Last name" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Role / Department *</label>
                            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                                <option value="Employee">Employee</option>
                                <option value="HR">HR</option>
                                <option value="Manager">Manager</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Designation *</label>
                            <input type="text" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Manager" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Join Date *</label>
                            <input type="date" required value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                    </div>
                </form>
            </div>

            <div className="standard-section">
                <div className="standard-section-header">Contact & Security</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Email Address *</label>
                        <input type="email" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="email@company.com" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Phone Number *</label>
                        <input type="tel" pattern="[0-9\-\+\s\(\)]+" maxLength="15" title="Valid mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" required style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Address</label>
                        <textarea rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address..." style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Password {isEditMode ? '(Leave blank to keep current)' : '*'}</label>
                        <PasswordInput 
                            required={!isEditMode}
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            placeholder={isEditMode ? "Enter new password..." : "Enter initial password"}
                            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default AddEmployee;

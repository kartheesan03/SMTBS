import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Building2, Briefcase, Calendar, CheckCircle, Tag, Clock } from 'lucide-react';

const EmployeeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const { data } = await API.get(`/employees/${id}`);
                setEmployee(data);
            } catch (err) {
                console.error('Failed to load employee details:', err);
                toast.error(`Failed to load employee details: ${err.response?.data?.message || err.message}`);
                navigate('/hrms');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id, navigate]);

    if (loading) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;
    if (!employee) return null;

    const infoCard = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#8b5cf6', borderRadius: '0px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {employee.firstName.substring(0, 1).toUpperCase()}{employee.lastName ? employee.lastName.substring(0, 1).toUpperCase() : ''}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{employee.firstName} {employee.lastName}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {employee.designation}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {employee.department}</span>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '0px', fontSize: '14px', fontWeight: 500 }}>
                    Active
                </span>
                <button onClick={() => navigate(`/employees/${employee._id}/edit`)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '0px', cursor: 'pointer', fontWeight: 600 }}>
                    Edit Profile
                </button>
            </div>
        </div>
    );

    const sidebarContent = (
        <div className="standard-section">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Contact Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Mail size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Email Address</div>
                        <a href={`mailto:${employee.userId?.email || employee.email || employee.contact}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>{employee.userId?.email || employee.email || employee.contact || 'N/A'}</a>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Phone size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Phone Number</div>
                        <a href={`tel:${employee.phone || (employee.contact && employee.contact.match(/^[0-9+\-\\s]+$/) ? employee.contact : '')}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 500 }}>{employee.phone || (employee.contact && employee.contact.match(/^[0-9+\-\\s]+$/) ? employee.contact : 'N/A')}</a>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Tag size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Employee ID</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{employee.employeeId}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <StandardPageLayout
            title="Employee Details"
            breadcrumbs={[
                { label: 'HRMS', path: '/hrms' },
                { label: 'Employees', path: '/hrms' },
                { label: `${employee.firstName} ${employee.lastName}` }
            ]}
            infoCard={infoCard}
            sidebarContent={sidebarContent}
            onCancel={() => navigate('/hrms')}
        >
            <div className="standard-section">
                <div className="standard-section-header">Employment Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Department</div>
                        <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{employee.department}</div>
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Designation</div>
                        <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{employee.designation}</div>
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Date of Joining</div>
                        <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="standard-section">
                <div className="standard-section-header">Address Details</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="#64748b" />
                    <div>
                        <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>{employee.address || 'Address not provided.'}</p>
                    </div>
                </div>
            </div>
            
            <div className="standard-section">
                <div className="standard-section-header">Quick Stats</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '0px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Tenure</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                            {employee.joinDate ? `${Math.floor((new Date() - new Date(employee.joinDate)) / (1000 * 60 * 60 * 24 * 30.44))} months` : 'N/A'}
                        </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '0px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Attendance</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>98%</div>
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default EmployeeDetails;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Building2, Globe, FileText, Briefcase, Tag, Calendar, Activity } from 'lucide-react';

const CustomerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const { data } = await API.get(`/customers/${id}`);
                setCustomer(data);
            } catch (err) {
                toast.error('Failed to load customer details');
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id, navigate]);

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;
    if (!customer) return null;

    const infoCard = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#3b82f6', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{customer.name}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {customer.industry}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {customer.customerType}</span>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 12px', background: customer.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: customer.status === 'Active' ? '#166534' : '#475569', borderRadius: '20px', fontSize: '14px', fontWeight: 500 }}>
                    {customer.status}
                </span>
                <button onClick={() => navigate(`/customers/${customer._id}/edit`)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
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
                        <a href={`mailto:${customer.email}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>{customer.email}</a>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Phone size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Phone Number</div>
                        <a href={`tel:${customer.phone}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 500 }}>{customer.phone}</a>
                    </div>
                </div>
                {customer.website && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Globe size={16} color="#64748b" style={{ marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Website</div>
                            <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>{customer.website}</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <StandardPageLayout
            title="Customer Details"
            breadcrumbs={[
                { label: 'CRM', path: '/customers' },
                { label: 'Customers', path: '/customers' },
                { label: customer.name }
            ]}
            infoCard={infoCard}
            sidebarContent={sidebarContent}
            onCancel={() => navigate('/customers')}
        >
            <div className="standard-section">
                <div className="standard-section-header">Address & Location</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="#64748b" />
                    <div>
                        <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>{customer.address}</p>
                    </div>
                </div>
            </div>

            {customer.notes && (
                <div className="standard-section">
                    <div className="standard-section-header">Notes & Internal Details</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <FileText size={20} color="#64748b" />
                        <div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{customer.notes}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="standard-section">
                <div className="standard-section-header">Activity & Orders</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Total Orders</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>0</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Active Tickets</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>0</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Customer Since</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{new Date(customer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default CustomerDetails;

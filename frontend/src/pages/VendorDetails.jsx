import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Building2, Globe, FileText, CheckCircle, Package } from 'lucide-react';
import DataTable from '../components/Dashboard/DataTable';

const VendorDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const { data: vendorData } = await API.get(`/vendors/${id}`);
                setVendor(vendorData);
                
                const { data: materialsData } = await API.get('/materials');
                const vId = String(vendorData.id || vendorData._id);
                const vMaterials = materialsData.filter(m => String(m.vendorId) === vId || String(m.vendor?.id || m.vendor?._id || m.vendor) === vId);
                setMaterials(vMaterials);
            } catch (err) {
                toast.error('Failed to load vendor details');
                navigate('/vendors');
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id, navigate]);

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;
    if (!vendor) return null;

    const infoCard = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#3b82f6', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {vendor.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{vendor.name}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {vendor.category || 'Vendor'}</span>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '14px', fontWeight: 500 }}>
                    Active Partner
                </span>
                <button onClick={() => navigate(`/vendors/${vendor._id}/edit`)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
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
                        <a href={`mailto:${vendor.email}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>{vendor.email}</a>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Phone size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Phone Number</div>
                        <a href={`tel:${vendor.phone}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 500 }}>{vendor.phone || 'N/A'}</a>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Globe size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Website</div>
                        {vendor.website ? (
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>{vendor.website}</a>
                        ) : (
                            <span style={{ color: '#94a3b8' }}>N/A</span>
                        )}
                    </div>
                </div>
            </div>
            
            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />
            
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Business Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <FileText size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>GST Number</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{vendor.gstNumber || 'Not Provided'}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const materialColumns = [
        { key: 'name', label: 'Material Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Stock Level' },
        { key: 'price', label: 'Unit Price (₹)' }
    ];

    return (
        <StandardPageLayout
            title="Vendor Details"
            breadcrumbs={[
                { label: 'Procurement', path: '/vendors' },
                { label: 'Vendors', path: '/vendors' },
                { label: vendor.name }
            ]}
            infoCard={infoCard}
            sidebarContent={sidebarContent}
            onCancel={() => navigate('/vendors')}
        >
            <div className="standard-section">
                <div className="standard-section-header">Address Details</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="#64748b" />
                    <div>
                        <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>{vendor.address || 'Address not provided.'}</p>
                    </div>
                </div>
            </div>
            
            <div className="standard-section">
                <div className="standard-section-header">Quick Stats</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={16} /> Catalog Size</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{materials.length} Items</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Status</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>Approved</div>
                    </div>
                </div>
            </div>

            <div className="standard-section">
                <div className="standard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Provided Materials</span>
                </div>
                {materials.length > 0 ? (
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <DataTable 
                            columns={materialColumns}
                            data={materials}
                            searchPlaceholder="Search materials..."
                            actions={[]}
                        />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                        <Package size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No materials registered for this vendor.</p>
                    </div>
                )}
            </div>
        </StandardPageLayout>
    );
};

export default VendorDetails;

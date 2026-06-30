import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Search, Truck } from 'lucide-react';

const SelectVendor = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await API.get('/vendors');
                setVendors(res.data);
            } catch (err) {
                console.error("Error fetching vendors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v => 
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id) => {
        navigate(`/orders/create/purchase?vendorId=${id}`);
    };

    return (
        <div className="page-container">
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/erp')}>ERP Operations</span>
                <span className="separator">/</span>
                <span className="crumb" onClick={() => navigate('/orders/select-type')}>Select Order Type</span>
                <span className="separator">/</span>
                <span className="crumb active">Select Vendor</span>
            </div>

            <header className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <button className="btn-icon" onClick={() => navigate('/orders/select-type')} style={{ background: 'var(--bg-hover)', borderRadius: '50%', padding: '8px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Select Vendor / Supplier</h1>
                    </div>
                    <p className="header-subtitle">Choose a vendor to create a purchase order for.</p>
                </div>
                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <input 
                        type="text" 
                        placeholder="Search vendors..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
                    />
                </div>
            </header>

            <div className="table-card" >
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading vendors...</div>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No vendors found.</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table className="enterprise-table" style={{minWidth: 1000}}>
                            <thead>
                                <tr>
                                <th>Company Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Materials Supplied</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map((v) => (
                                <tr key={v.id || v._id}>
                                    <td><strong>{v.name}</strong></td>
                                    <td>{v.contactPerson || '-'}</td>
                                    <td>{v.email || '-'}</td>
                                    <td>{v.phone || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {(v.materialsSupplied || []).map((m, idx) => (
                                                <span key={idx} style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{m}</span>
                                            ))}
                                            {(!v.materialsSupplied || v.materialsSupplied.length === 0) && '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge-inline approved">Active</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            className="btn-primary-blue" 
                                            style={{ padding: '6px 16px', background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => handleSelect(v.id || v._id)}
                                        >
                                            <Truck size={14} /> Select
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <style jsx="true">{`
                .module-container { padding: 24px; background-color: var(--bg-body); min-height: 100vh; color: var(--text-primary); }
                .breadcrumb-nav { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px; }
                .crumb { cursor: pointer; }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .module-header { margin-bottom: 24px; }
                .header-title { font-size: 26px; font-weight: 800; }
                .header-subtitle { color: var(--text-muted); margin-top: 4px; }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 16px; font-size: 13px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.02); }
                .modern-table td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-primary); }
                .modern-table tbody tr:hover { background: rgba(0,0,0,0.01); }
                .status-badge-inline { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .status-badge-inline.approved { background: #dcfce7; color: #15803d; }
                .btn-primary-blue { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
                .btn-primary-blue:hover { opacity: 0.9; }
                .btn-icon { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); }
                .btn-icon:hover { background: rgba(0,0,0,0.05) !important; }
            `}</style>
        </div>
    );
};

export default SelectVendor;

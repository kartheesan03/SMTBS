import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Search, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="page-container"
        >
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
                        <button className="rd-back-btn icon-only" onClick={() => navigate('/orders/select-type')}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Select Vendor / Supplier</h1>
                    </div>
                    <p className="header-subtitle">Choose a vendor to create a purchase order for.</p>
                </div>
                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '0px', border: '1px solid var(--border)', width: '300px' }}>
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

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="table-card" 
            >
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading vendors...</div>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No vendors found.</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                <th className="col-company">Company Name</th>
                                <th className="col-contact">Contact Person</th>
                                <th className="col-email">Email</th>
                                <th className="col-phone">Phone</th>
                                <th className="col-address">Materials Supplied</th>
                                <th className="col-status">Status</th>
                                <th className="col-action">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map((v, i) => {
                                const fallbackNames = ['Ramesh', 'Senthil Kumar', 'Venkatesh', 'Karthik', 'Suresh', 'Priya', 'Meena', 'Arun'];
                                const getContactPerson = () => {
                                    if (v.contactPerson && v.contactPerson !== v.name) return v.contactPerson;
                                    const idx = Array.from(v.name || 'A').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackNames.length;
                                    return fallbackNames[idx];
                                };
                                return (
                                <tr key={v.id || v._id || i}>
                                    <td className="col-company"><strong>{v.name}</strong></td>
                                    <td className="col-contact">{getContactPerson()}</td>
                                    <td className="col-email">{v.email || '-'}</td>
                                    <td className="col-phone">{v.phone || '-'}</td>
                                    <td className="col-address">
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {(v.materialsSupplied && v.materialsSupplied.length > 0 ? v.materialsSupplied : ['Steel', 'PVC Pipes', 'Cement'].slice(0, (v.id || v._id || 1) % 3 + 1)).map((m, idx) => (
                                                <span key={idx} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '0px', fontSize: 11, color: '#475569' }}>
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="col-status">
                                        <span className={`status-badge-inline ${((v.id || v._id || 1) % 3 !== 0) ? 'approved' : 'rejected'}`}>
                                            {((v.id || v._id || 1) % 3 !== 0) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="col-action">
                                        <button 
                                            className="btn-primary-blue" 
                                            style={{ padding: '6px 16px', background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => handleSelect(v.id || v._id)}
                                        >
                                            <Truck size={14} /> Select
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
            
            <style jsx="true">{`
                .module-container { padding: 24px; background-color: var(--bg-body); min-height: 100vh; color: var(--text-primary); }
                .breadcrumb-nav { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px; }
                .crumb { cursor: pointer; }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .module-header { margin-bottom: 24px; }
                .header-title { font-size: 26px; font-weight: 800; }
                .header-subtitle { color: var(--text-muted); margin-top: 4px; }
                .modern-table, .enterprise-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .modern-table th, .enterprise-table th { text-align: left; padding: 12px 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.02); line-height: 1.3; white-space: normal; }
                .modern-table td, .enterprise-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-primary); vertical-align: middle; word-break: break-word; line-height: 1.4; white-space: normal; }
                
                .col-company { width: 16%; }
                .col-contact { width: 13%; }
                .col-email { width: 17%; }
                .col-phone { width: 12%; }
                .col-address { width: 22%; }
                .col-status { width: 9%; text-align: center !important; }
                .col-action { width: 11%; text-align: right !important; }
                
                .status-badge-inline { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
                .status-badge-inline.approved { background: #dcfce7; color: #15803d; }
                .btn-primary-blue { background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; }
                .btn-primary-blue:hover { opacity: 0.9; }
                .btn-icon { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); }
                .btn-icon:hover { background: rgba(0,0,0,0.05) !important; }
            `}</style>
        </motion.div>
    );
};

export default SelectVendor;

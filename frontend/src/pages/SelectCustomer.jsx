import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Search, UserCheck } from 'lucide-react';

const SelectCustomer = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await API.get('/customers');
                setCustomers(res.data);
            } catch (err) {
                console.error("Error fetching customers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id) => {
        navigate(`/orders/create/sales?customerId=${id}`);
    };

    return (
        <div className="erp-workspace">
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/erp')}>ERP Operations</span>
                <span className="separator">/</span>
                <span className="crumb" onClick={() => navigate('/orders/select-type')}>Select Order Type</span>
                <span className="separator">/</span>
                <span className="crumb active">Select Customer</span>
            </div>

            <header className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <button className="btn-icon" onClick={() => navigate('/orders/select-type')} style={{ background: 'var(--bg-hover)', borderRadius: '50%', padding: '8px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Select Customer</h1>
                    </div>
                    <p className="header-subtitle">Choose a customer to create a sales order for.</p>
                </div>
                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <input 
                        type="text" 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
                    />
                </div>
            </header>

            <div className="table-card" style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1px', border: '1px solid var(--border)' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</div>
                ) : filteredCustomers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c) => (
                                <tr key={c.id || c._id}>
                                    <td><strong>{c.companyName || c.name}</strong></td>
                                    <td>{c.name}</td>
                                    <td>{c.email || '-'}</td>
                                    <td>{c.phone || '-'}</td>
                                    <td>{c.address || '-'}</td>
                                    <td>
                                        <span className="status-badge-inline approved">Active</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            className="btn-primary-blue" 
                                            style={{ padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => handleSelect(c.id || c._id)}
                                        >
                                            <UserCheck size={14} /> Select
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style jsx="true">{`
                .erp-workspace { padding: 24px; background-color: var(--bg-body); min-height: 100vh; color: var(--text-primary); }
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

export default SelectCustomer;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Users, UserCheck, AlertCircle, DollarSign, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const Customers = ({ directoryOnly }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/customers');
            let fetchedData = Array.isArray(data) ? data : [];
            if (directoryOnly) {
                fetchedData = fetchedData.filter(c => c.status !== 'Lead' && c.customerType !== 'Lead');
            }
            setCustomers(fetchedData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (row) => {
        const id = row._id || row.id;
        if (!id) return toast.error("Invalid customer ID");

        if (window.confirm(`Are you sure you want to delete ${row.name || row.company}?`)) {
            try {
                await API.delete(`/customers/${id}`);
                toast.success('Customer deleted successfully');
                fetchCustomers();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Error deleting customer');
            }
        }
    };

    // KPI computations
    const activeAccounts = customers.filter(c => (c.status || 'Active') === 'Active');
    const atRisk = customers.filter(c => c.status === 'At Risk' || c.status === 'Inactive');
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.revenue) || Number(c.totalRevenue) || 0), 0);

    const formatCurrency = (val) => {
        if (!val || val === 0) return '₹0';
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Customer / Company', 
            sortable: true,
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <div style={{fontWeight: 600, color: '#0f172a'}}>{row.company || val}</div>
                        <div style={{fontSize: 12, color: '#64748b'}}>{row.contactPerson || val}</div>
                    </div>
                </div>
            )
        },
        { 
            key: 'email', 
            label: 'Contact Info', 
            sortable: true,
            render: (val, row) => (
                <div>
                    <div style={{color: '#3b82f6'}}>{val}</div>
                    <div style={{fontSize: 12, color: '#64748b'}}>{row.phone || 'No phone'}</div>
                </div>
            )
        },
        { key: 'industry', label: 'Industry', sortable: true },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const status = val || 'Active';
                let badgeClass = 'default';
                if (status === 'Active') badgeClass = 'success';
                else if (status === 'Lead') badgeClass = 'info';
                else if (status === 'At Risk' || status === 'Inactive') badgeClass = 'danger';
                return <span className={`ui-badge ${badgeClass}`}>{status}</span>;
            }
        }
    ];

    const actions = [
        { label: 'View Profile', icon: Eye, onClick: (row) => navigate(`/customers/${row._id || row.id}`) },
        { label: 'Edit', icon: Edit, onClick: (row) => navigate(`/customers/${row._id || row.id}/edit`) },
        { label: 'Delete', icon: Trash2, onClick: handleDelete, color: 'danger', hidden: !isAdmin }
    ];

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Customer Data Hub</span>
                            <span className="rd-module-badge">CUSTOMERS</span>
                        </div>
                        </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="rd-kpi-row"
                >
                    <CustomerKPICard title="Total Accounts" val={customers.length} icon={Users} color="blue" data={barData} />
                    <CustomerKPICard title="Active" val={activeAccounts.length} icon={UserCheck} color="green" data={barData} />
                    <CustomerKPICard title="At Risk" val={atRisk.length} icon={AlertCircle} color="orange" data={barData} />
                    <CustomerKPICard title="LTV / Revenue" val={formatCurrency(totalRevenue)} icon={DollarSign} color="purple" data={barData} />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ marginTop: '24px' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            Loading customer data...
                        </div>
                    ) : (
                        <DataTable 
                            title="Customer Directory"
                            subtitle="Manage and track all registered clients and leads"
                            columns={columns}
                            data={customers}
                            actions={actions}
                            searchPlaceholder="Search by name, company, or email..."
                            primaryAction={{
                                label: 'Add Customer',
                                icon: Plus,
                                onClick: () => navigate('/customers/new')
                            }}
                        />
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const CustomerKPICard = ({ title, val, icon: Icon, color, data }) => {
    return (
        <div className={`rd-kpi-card ${color}`} style={{minHeight: 130, padding: 20}}>
            <div className="rd-kpi-header">
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 600, opacity: 0.9}}>{title}</span>
                    <span style={{fontSize: 26, fontWeight: 800}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 42, height: 42, opacity: 0.9}}>
                    <Icon size={22} color="#fff" />
                </div>
            </div>
            <div style={{marginTop: 16, height: 30, opacity: 0.6}}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <Bar dataKey="v" fill="#fff" radius={[2,2,0,0]} barSize={6} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Customers;

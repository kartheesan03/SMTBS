import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FileText, Plus, Search, FileDown, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader, DataTable } from '../components/ui';
import { motion } from 'framer-motion';

const Badge = ({ children, type = 'default' }) => (
    <span className={`ui-badge ${type}`}>
        {children}
    </span>
);

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorMap = {
        primary: '#3b82f6',
        warning: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444'
    };
    const c = colorMap[color] || colorMap.primary;
    return (
        <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${c}15`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-heading)' }}>{value}</h3>
            </div>
        </div>
    );
};

const Quotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const { data } = await API.get('/quotations');
                setQuotations(data);
            } catch (err) {
                toast.error('Failed to load quotations');
            } finally {
                setLoading(false);
            }
        };
        fetchQuotations();
    }, []);

    const columns = [
        { key: 'quotationNumber', label: 'Quote #', sortable: true },
        { 
            key: 'customerName', 
            label: 'Customer', 
            sortable: true,
            render: (val, row) => row.customer?.name || val
        },
        { 
            key: 'date', 
            label: 'Date', 
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString()
        },
        { 
            key: 'validUntil', 
            label: 'Valid Until', 
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString()
        },
        { 
            key: 'grandTotal', 
            label: 'Total Amount', 
            sortable: true,
            render: (val) => `₹${val.toFixed(2)}`
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            render: (val) => {
                const colors = {
                    Draft: 'secondary',
                    Sent: 'primary',
                    Accepted: 'success',
                    Rejected: 'danger',
                    Expired: 'warning',
                    Converted: 'info'
                };
                return <Badge type={colors[val] || 'secondary'}>{val}</Badge>;
            }
        }
    ];

    const actions = [
        { 
            label: 'View Details', 
            icon: ArrowRight, 
            onClick: (row) => navigate(`/quotations/${row._id}`) 
        }
    ];

    const stats = [
        { title: 'Total Quotes', value: quotations.length, icon: FileText, color: 'primary' },
        { title: 'Pending Approval', value: quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length, icon: Clock, color: 'warning' },
        { title: 'Accepted/Converted', value: quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted').length, icon: CheckCircle, color: 'success' },
        { title: 'Expired', value: quotations.filter(q => q.status === 'Expired').length, icon: XCircle, color: 'danger' }
    ];

    return (
        <PageContainer>
            <PageHeader 
                title="Quotations" 
                subtitle="Manage and track customer quotations and proposals"
                actions={[
                    { label: 'Create Quote', icon: Plus, primary: true, onClick: () => navigate('/quotations/create') }
                ]}
            />
            
            <div className="ui-grid-4" style={{ marginBottom: '24px' }}>
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}}>
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.4}}>
                <DataTable 
                    columns={columns} 
                    data={quotations} 
                    loading={loading}
                    actions={actions}
                    searchPlaceholder="Search by quote number or customer..."
                />
            </motion.div>
        </PageContainer>
    );
};

export default Quotations;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Package, Truck, CheckCircle, Store, Clock, ShoppingBag,
    Phone, Mail, MapPin, User, FileText, Tag, TrendingUp, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import { LoadingState, EmptyState } from '../components/DataStates';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/vendors/my-profile');
                setProfile(res.data.vendor);
                setMaterials(res.data.materials || []);
                setOrders(res.data.orders || []);
            } catch (error) {
                console.error('Error fetching vendor data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingState message="Loading Vendor Dashboard..." height="100vh" />;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const activePOs = orders.filter(o => !['Completed', 'Delivered', 'Cancelled'].includes(o.status)).length;
    const completedPOs = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;
    const totalValue = orders.reduce((s, o) => s + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
    const formatCurrency = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}K` : `₹${v}`;

    const statusColor = (s) => {
        if (!s) return '#94a3b8';
        const m = { 'Delivered': '#10b981', 'Completed': '#10b981', 'Processing': '#3b82f6', 'Pending': '#f59e0b', 'Cancelled': '#ef4444', 'Shipped': '#8b5cf6' };
        return m[s] || '#64748b';
    };
    const statusBg = (s) => {
        if (!s) return '#f1f5f9';
        const m = { 'Delivered': '#d1fae5', 'Completed': '#d1fae5', 'Processing': '#dbeafe', 'Pending': '#fef3c7', 'Cancelled': '#fee2e2', 'Shipped': '#ede9fe' };
        return m[s] || '#f1f5f9';
    };

    return (
        <div className="rd-container theme-vendor" style={{ '--theme-accent': '#0ea5e9' }}>
            <div className="rd-content">

                {/* ── Hero Banner ── */}
                <WelcomeBanner 
                    user={user}
                    greeting={`${getGreeting()}`}
                    subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Vendor Portal`}
                    badges={[
                        { icon: Package, text: `${materials.length} Materials`, type: 'neutral' },
                        { type: 'status', text: `${activePOs} Active POs` }
                    ]}
                    rightVisuals={
                        <>
                            <div className="rd-visual-card">
                                                            <div className="rd-vc-label">Completed</div>
                                                            <div className="rd-vc-value">{completedPOs}</div>
                                                            <div className="rd-vc-chart"></div>
                                                        </div>
                                                        <div className="rd-visual-card">
                                                            <div className="rd-vc-label">Revenue</div>
                                                            <div className="rd-vc-bars">
                                                                <div className="rd-vc-bar" style={{ height: '60%' }}></div>
                                                                <div className="rd-vc-bar" style={{ height: '80%' }}></div>
                                                                <div className="rd-vc-bar" style={{ height: '70%' }}></div>
                                                                <div className="rd-vc-bar" style={{ height: '100%' }}></div>
                                                                <div className="rd-vc-bar" style={{ height: '75%' }}></div>
                                                            </div>
                                                        </div>
                        </>
                    }
                    actions={[
                        { label: 'View Orders', icon: Truck, variant: 'primary', onClick: () => navigate('/erp/orders') },
                        { label: 'Materials', icon: Package, variant: 'secondary', onClick: () => navigate('/materials') }
                    ]}
                />

                {/* ── KPI Row ── */}
                <StatGrid columns={4}>
                    <StatCard title="Materials Supplied" value={materials.length} colorTheme="blue" icon={Package} trendValue="Listed materials" trendPositive={true} />
                    <StatCard title="Active POs" value={activePOs} colorTheme="peach" icon={Store} trendValue="Pending fulfillment" trendPositive={activePOs === 0} />
                    <StatCard title="Completed POs" value={completedPOs} colorTheme="mint" icon={CheckCircle} trendValue="Successfully delivered" trendPositive={true} />
                    <StatCard title="Total Value" value={formatCurrency(totalValue)} colorTheme="yellow" icon={TrendingUp} trendValue="Lifetime orders" trendPositive={true} />
                </StatGrid>

                {/* ── Main Content Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}
                >
                    {/* Purchase Orders Table */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">My Purchase Orders</div>
                            <button
                                className="panel-action-btn"
                                onClick={() => navigate('/erp/orders')}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                View All <ExternalLink size={12} />
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            {orders.length === 0 ? (
                                <EmptyState icon={ShoppingBag} title="No purchase orders yet" message="Orders placed with you will appear here." />
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            {['ORDER', 'DATE', 'AMOUNT', 'STATUS'].map(h => (
                                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 8).map((order, i) => (
                                            <tr key={order._id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#3b82f6', fontSize: 13 }}>{order.orderNumber || `PO-${i + 1}`}</td>
                                                <td style={{ padding: '10px 12px', fontSize: 13, color: '#64748b' }}>
                                                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                                                    ₹{(Number(order.grandTotal) || Number(order.totalAmount) || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 0,
                                                        background: statusBg(order.status), color: statusColor(order.status)
                                                    }}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Business Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="dashboard-panel" style={{ flex: 1 }}>
                            <div className="panel-header">
                                <div className="panel-title">Business Details</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: User, label: 'Contact Person', value: profile?.contactPerson },
                                    { icon: Mail, label: 'Email', value: profile?.email },
                                    { icon: Phone, label: 'Phone', value: profile?.phone },
                                    { icon: MapPin, label: 'Address', value: profile?.address },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon size={14} color="#64748b" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value || 'N/A'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Materials Quick List */}
                        <div className="dashboard-panel" style={{ flex: 1 }}>
                            <div className="panel-header">
                                <div className="panel-title">My Materials</div>
                            </div>
                            {materials.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: 13 }}>No materials listed.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {materials.slice(0, 5).map((m, i) => (
                                        <div key={m._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < materials.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{m.name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.category || 'General'}</div>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', background: '#eff6ff', padding: '2px 8px', borderRadius: 0 }}>
                                                {m.quantity} {m.unit}
                                            </span>
                                        </div>
                                    ))}
                                    {materials.length > 5 && (
                                        <div style={{ textAlign: 'center', fontSize: 12, color: '#3b82f6', fontWeight: 600, paddingTop: 8, cursor: 'pointer' }}
                                            onClick={() => navigate('/materials')}>
                                            +{materials.length - 5} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default VendorDashboard;

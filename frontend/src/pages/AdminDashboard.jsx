import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
    Box, ShoppingCart, DollarSign, AlertCircle,
    TrendingUp, BarChart2, PieChart as PieChartIcon, Activity,
    ArrowUpRight, ArrowDownRight, Package, Truck, Clock, Users,
    Briefcase, FileText, Settings, Bell, Shield, LifeBuoy,
    ChevronRight, CheckCircle, CalendarDays, Receipt, ShieldCheck,
    Search, RefreshCw, ChevronDown
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [materialsData, setMaterialsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, matRes, ordRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ data: {} })),
                API.get('/materials').catch(e => ({ data: [] })),
                API.get('/orders').catch(e => ({ data: [] }))
            ]);
            
            setDashboardData(dashRes.data || {});
            setMaterialsData(matRes.data || []);
            setOrdersData(ordRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
                <SkeletonLoader type="dashboard" />
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const orders = ordersData || [];
    const materials = materialsData || [];
    
    // Core metrics (top cards)
    const totalMaterials = dashboard.totalMaterials || materials.length || 0;
    const openOrders = dashboard.openOrders || orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length || 0;
    const totalEmployees = dashboard.hrStats?.totalEmployees || dashboard.totalEmployees || 0;
    const activeCustomers = dashboard.activeCustomers || 0;
    const totalCustomers = dashboard.totalCustomers || activeCustomers;

    // Material Stats
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;
    let inTransitCount = dashboard.materialStats?.inTransitCount || 0;

    materials.forEach(item => {
        if (item.quantity <= 0) outOfStockCount++;
        else if (item.quantity <= (item.lowStockThreshold || 10)) lowStockCount++;
        else inStockCount++;
    });

    const matTotal = totalMaterials || 1;
    const inventoryData = [
        { name: 'In Stock', value: inStockCount, color: '#05CD99' },
        { name: 'Low Stock', value: lowStockCount, color: '#FFCE20' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#EE5D50' },
        { name: 'In Transit', value: inTransitCount, color: '#4318FF' }
    ];

    // ERP Stats
    let inProgress = 0;
    let onHold = 0;
    let completed = 0;
    let overdue = 0;

    orders.forEach(o => {
        const stat = (o.status || 'Pending').toLowerCase();
        if (stat === 'delivered' || stat === 'completed') completed++;
        else if (stat === 'cancelled') onHold++;
        else inProgress++;
    });

    const erpTotal = inProgress + onHold + completed + overdue || 1;
    const erpPieData = [
        { name: 'In Progress', value: inProgress, color: '#4318FF' },
        { name: 'On Hold', value: onHold, color: '#FFCE20' },
        { name: 'Completed', value: completed, color: '#05CD99' },
        { name: 'Overdue', value: overdue, color: '#EE5D50' }
    ];

    // HRMS Stats
    const hPresent = dashboard.hrStats?.presentToday || 0;
    const hOnLeave = dashboard.hrStats?.onLeave || 0;
    const hAbsent = dashboard.hrStats?.absentToday || 0;
    const hMissing = Math.max(0, totalEmployees - hPresent - hOnLeave - hAbsent);
    
    const hrmsPieData = [
        { name: 'Present', value: hPresent, color: '#4318FF' },
        { name: 'On Leave', value: hOnLeave, color: '#05CD99' },
        { name: 'Absent', value: hAbsent, color: '#EE5D50' }
    ];
    if (hMissing > 0) {
        hrmsPieData.splice(2, 0, { name: 'Not Marked', value: hMissing, color: '#8b5cf6' });
    }

    // CRM Stats 
    const cNew = dashboard.salesStats?.recentCustomers || 0;
    const cActive = activeCustomers - cNew > 0 ? activeCustomers - cNew : 0;
    const cInactive = Math.max(0, totalCustomers - activeCustomers);
    
    const crmTotal = totalCustomers || 1;
    const crmPieData = [
        { name: 'New (This Month)', value: cNew, color: '#4318FF' },
        { name: 'Active', value: cActive, color: '#05CD99' },
        { name: 'Inactive', value: cInactive, color: '#EE5D50' }
    ];

    // Overview Chart (Linear sync logic mapped to real totals)
    const finalHRMS = totalEmployees;
    const finalMaterial = totalMaterials;
    const finalCRM = crmTotal;
    const finalERP = erpTotal;

    const overviewData = [
        { name: 'May 1', HRMS: Math.floor(finalHRMS * 0.6), Material: Math.floor(finalMaterial * 0.8), CRM: Math.floor(finalCRM * 0.8), ERP: Math.floor(finalERP * 0.2) },
        { name: 'May 8', HRMS: Math.floor(finalHRMS * 0.7), Material: Math.floor(finalMaterial * 0.85), CRM: Math.floor(finalCRM * 0.85), ERP: Math.floor(finalERP * 0.4) },
        { name: 'May 15', HRMS: Math.floor(finalHRMS * 0.8), Material: Math.floor(finalMaterial * 0.9), CRM: Math.floor(finalCRM * 0.9), ERP: Math.floor(finalERP * 0.6) },
        { name: 'May 22', HRMS: Math.floor(finalHRMS * 0.9), Material: Math.floor(finalMaterial * 0.95), CRM: Math.floor(finalCRM * 0.95), ERP: Math.floor(finalERP * 0.8) },
        { name: 'May 29', HRMS: Math.floor(finalHRMS * 0.95), Material: Math.floor(finalMaterial * 0.98), CRM: Math.floor(finalCRM * 0.98), ERP: Math.floor(finalERP * 0.9) },
        { name: 'Jun 5', HRMS: finalHRMS, Material: finalMaterial, CRM: finalCRM, ERP: finalERP },
    ];

    const recentActivitiesMock = [
        { id: 1, title: 'New Employee John Doe joined HR Dept.', time: '2m ago', color: '#4318FF', icon: Users },
        { id: 2, title: 'Low stock alert for Laptop - Qty below 5', time: '15m ago', color: '#05CD99', icon: Package },
        { id: 3, title: 'New lead ABC Corp. added by Sales Team', time: '1h ago', color: '#8b5cf6', icon: Briefcase },
        { id: 4, title: 'Project Website Redesign updated', time: '2h ago', color: '#FFCE20', icon: ShoppingCart },
        { id: 5, title: 'Payment ₹85K received from XYZ Ltd.', time: '3h ago', color: '#05CD99', icon: DollarSign },
    ];

    const formatDateTime = () => {
        const d = new Date();
        const str = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `${str} \u00A0\u00A0 ${time}`;
    };

    const getInitials = (name) => {
        if (!name) return 'AU';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const userRole = user?.role || 'Admin User';
    const isAdmin = user?.email === 'admin@smtbms.com' || user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super admin';

    return (
        <div className="dashboard-wrapper">


            <div className="page-container">
                {/* Modules Summary Row */}
                <div className="responsive-grid-4">
                    <div className="premium-card">
                        <div className="module-header">
                            <div className="module-icon-wrap blue-bg"><Users size={20} /></div>
                            <div className="module-title">
                                <h3>HRMS</h3>
                                <p>Total Employees</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{totalEmployees}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill blue-pill"><Clock size={12} /> {dashboard.hrStats?.newJoiners || 0} New Joiners</div>
                            <div className="pill lightblue-pill"><Clock size={12} /> {hOnLeave} On Leave</div>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="module-header">
                            <div className="module-icon-wrap orange-bg"><Package size={20} /></div>
                            <div className="module-title">
                                <h3>MATERIAL</h3>
                                <p>Total Items</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{matTotal}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill orange-pill"><AlertCircle size={12} /> {lowStockCount} Low Stock Alerts</div>
                            <div className="pill red-pill"><ArrowDownRight size={12} /> {outOfStockCount} Out of Stock</div>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="module-header">
                            <div className="module-icon-wrap green-bg"><Briefcase size={20} /></div>
                            <div className="module-title">
                                <h3>CRM</h3>
                                <p>Total Leads</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{crmTotal}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill green-pill"><TrendingUp size={12} /> {cNew} New Leads</div>
                            <div className="pill lightgreen-pill"><CalendarDays size={12} /> {dashboard.salesStats?.recentCustomers || 0} This Month</div>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="module-header">
                            <div className="module-icon-wrap blue-bg"><ShoppingCart size={20} /></div>
                            <div className="module-title">
                                <h3>ERP</h3>
                                <p>Active Projects</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{erpTotal}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill lightblue-pill"><Clock size={12} /> {inProgress} In Progress</div>
                            <div className="pill red-pill"><AlertCircle size={12} /> {overdue} Overdue</div>
                        </div>
                    </div>
                </div>

                {/* Charts & Actions Row */}
                <div className="responsive-grid-4-5-3">
                    <div className="premium-card main-chart">
                        <div className="card-header">
                            <div>
                                <h2>Overview Summary</h2>
                                <p>Business pulse — all modules · May → Jun</p>
                            </div>
                            <button className="outline-select-btn">This Month <ChevronDown size={14} /></button>
                        </div>
                        
                        <div className="chart-legend-top">
                            <span className="legend-item"><div className="dot blue-dot"></div> HRMS <strong>{finalHRMS}</strong> <small className="text-success">↑+18%</small></span>
                            <span className="legend-item"><div className="dot orange-dot"></div> Material <strong>{finalMaterial}</strong> <small className="text-success">↑+12%</small></span>
                            <span className="legend-item"><div className="dot green-dot"></div> CRM <strong>{finalCRM}</strong> <small className="text-success">↑+24%</small></span>
                            <span className="legend-item"><div className="dot lightblue-dot"></div> ERP <strong>{finalERP}</strong> <small className="text-success">↑+16%</small></span>
                        </div>

                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={overviewData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={6} barSize={10}>
                                    <defs>
                                        <linearGradient id="colorHRMS" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4318FF" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0.8}/>
                                        </linearGradient>
                                        <linearGradient id="colorMaterial" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF7E00" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#FFAA00" stopOpacity={0.8}/>
                                        </linearGradient>
                                        <linearGradient id="colorCRM" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#05CD99" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#00FFB0" stopOpacity={0.8}/>
                                        </linearGradient>
                                        <linearGradient id="colorERP" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3965FF" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#00C3FF" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.4)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3AED0', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3AED0', fontWeight: 600 }} />
                                    <RechartsTooltip cursor={{fill: 'rgba(244, 247, 254, 0.5)'}} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0px 10px 30px rgba(112, 144, 176, 0.15)', padding: '14px', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.9)' }} />
                                    <Bar dataKey="HRMS" fill="url(#colorHRMS)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="Material" fill="url(#colorMaterial)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="CRM" fill="url(#colorCRM)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="ERP" fill="url(#colorERP)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="actions-list">
                            <NavLink to="/hrms" className="qa-item">
                                <div className="qa-icon-wrap blue-bg"><Users size={16}/></div>
                                <span>Add New Employee</span>
                                <ArrowUpRight size={16} className="qa-arrow"/>
                            </NavLink>
                            <NavLink to="/materials" className="qa-item">
                                <div className="qa-icon-wrap green-bg"><Box size={16}/></div>
                                <span>Add New Material</span>
                                <ArrowUpRight size={16} className="qa-arrow"/>
                            </NavLink>
                            <NavLink to="/crm" className="qa-item">
                                <div className="qa-icon-wrap purple-bg"><ShieldCheck size={16}/></div>
                                <span>Add New Lead</span>
                                <ArrowUpRight size={16} className="qa-arrow"/>
                            </NavLink>
                            <NavLink to="/erp" className="qa-item">
                                <div className="qa-icon-wrap yellow-bg"><Briefcase size={16}/></div>
                                <span>Create New Project</span>
                                <ArrowUpRight size={16} className="qa-arrow"/>
                            </NavLink>
                            <NavLink to="/" className="qa-item">
                                <div className="qa-icon-wrap lightblue-bg"><Box size={16}/></div>
                                <span>View All Modules</span>
                                <ArrowUpRight size={16} className="qa-arrow"/>
                            </NavLink>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header">
                            <h2>Recent Activities</h2>
                            <button className="outline-select-btn">View All</button>
                        </div>
                        <div className="activity-list">
                            {recentActivitiesMock.map((act) => (
                                <div key={act.id} className="activity-item">
                                    <div className="activity-icon-circle" style={{ color: act.color, backgroundColor: `${act.color}15` }}>
                                        <act.icon size={16} />
                                    </div>
                                    <div className="activity-details">
                                        <h4>{act.title}</h4>
                                        <span className="activity-time">{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Pie Charts Row */}
                <div className="pie-charts-grid">
                    <div className="premium-card">
                        <div className="pie-header">
                            <h3>HRMS - Employee Overview</h3>
                        </div>
                        <div className="pie-wrapper">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={hrmsPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                        {hrmsPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E5F2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <strong>{totalEmployees}</strong>
                                <span>Total</span>
                            </div>
                        </div>
                        <div className="pie-legend-box">
                            {hrmsPieData.map((item, idx) => (
                                <div className="pie-legend-row" key={idx}>
                                    <div className="legend-left">
                                        <div className="dot" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="legend-right">
                                        <strong>{item.value}</strong>
                                        <small>({Math.round((item.value / totalEmployees) * 100 || 0)}%)</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="view-report-btn blue-text">View Full Report →</button>
                    </div>
                    
                    <div className="premium-card">
                        <div className="pie-header">
                            <h3>Material - Stock Overview</h3>
                        </div>
                        <div className="pie-wrapper">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={inventoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                        {inventoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E5F2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <strong>{matTotal}</strong>
                                <span>Items</span>
                            </div>
                        </div>
                        <div className="pie-legend-box">
                            {inventoryData.map((item, idx) => (
                                <div className="pie-legend-row" key={idx}>
                                    <div className="legend-left">
                                        <div className="dot" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="legend-right">
                                        <strong>{item.value}</strong>
                                        <small>({Math.round((item.value / matTotal) * 100 || 0)}%)</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="view-report-btn orange-text">View Full Report →</button>
                    </div>

                    <div className="premium-card">
                        <div className="pie-header">
                            <h3>CRM - Lead Status</h3>
                        </div>
                        <div className="pie-wrapper">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={crmPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                        {crmPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E5F2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <strong>{activeCustomers}</strong>
                                <span>Leads</span>
                            </div>
                        </div>
                        <div className="pie-legend-box">
                            {crmPieData.map((item, idx) => (
                                <div className="pie-legend-row" key={idx}>
                                    <div className="legend-left">
                                        <div className="dot" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="legend-right">
                                        <strong>{item.value}</strong>
                                        <small>({Math.round((item.value / activeCustomers) * 100 || 0)}%)</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="view-report-btn green-text">View Full Report →</button>
                    </div>

                    <div className="premium-card">
                        <div className="pie-header">
                            <h3>ERP - Projects Overview</h3>
                        </div>
                        <div className="pie-wrapper">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={erpPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                        {erpPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E5F2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-center">
                                <strong>{erpTotal}</strong>
                                <span>Projects</span>
                            </div>
                        </div>
                        <div className="pie-legend-box">
                            {erpPieData.map((item, idx) => (
                                <div className="pie-legend-row" key={idx}>
                                    <div className="legend-left">
                                        <div className="dot" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="legend-right">
                                        <strong>{item.value}</strong>
                                        <small>({Math.round((item.value / erpTotal) * 100 || 0)}%)</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="view-report-btn blue-text">View Full Report →</button>
                    </div>
                </div>

            </div>

            
        </div>
    );
};

export default AdminDashboard;

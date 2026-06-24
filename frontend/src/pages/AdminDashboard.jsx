import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
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
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const orders = ordersData || [];
    const materials = materialsData || [];
    
    // Core metrics
    const totalMaterials = materials.length;
    const openOrders = orders.filter(o => !['Delivered', 'Completed', 'Cancelled'].includes(o.status)).length;
    const totalEmployees = dashboard.totalEmployees || dashboard.hrStats?.totalEmployees || 128;
    const activeCustomers = dashboard.activeCustomers || 256;

    // Material Stats
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    materials.forEach(item => {
        if (item.quantity <= 0) outOfStockCount++;
        else if (item.quantity <= (item.lowStockThreshold || 10)) lowStockCount++;
        else inStockCount++;
    });

    const matTotal = inStockCount + lowStockCount + outOfStockCount || 1;
    const inventoryData = [
        { name: 'In Stock', value: inStockCount || 240, color: '#05CD99' },
        { name: 'Low Stock', value: lowStockCount || 18, color: '#FFCE20' },
        { name: 'Out of Stock', value: outOfStockCount || 12, color: '#EE5D50' },
        { name: 'In Transit', value: 50, color: '#4318FF' }
    ];

    // ERP Stats
    let inProgress = 0;
    let onHold = 0;
    let completed = 0;
    let overdue = 0;

    if (orders.length > 0) {
        orders.forEach(o => {
            const stat = (o.status || 'Pending').toLowerCase();
            if (stat === 'delivered' || stat === 'completed') completed++;
            else if (stat === 'cancelled') onHold++;
            else inProgress++;
        });
    } else {
        inProgress = 10; onHold = 4; completed = 8; overdue = 2;
    }
    const erpTotal = inProgress + onHold + completed + overdue || 1;
    const erpPieData = [
        { name: 'In Progress', value: inProgress, color: '#4318FF' },
        { name: 'On Hold', value: onHold, color: '#FFCE20' },
        { name: 'Completed', value: completed, color: '#05CD99' },
        { name: 'Overdue', value: overdue, color: '#EE5D50' }
    ];

    // HRMS Stats (Mocked proportional to totalEmployees)
    const hPresent = Math.floor(totalEmployees * 0.67);
    const hOnLeave = Math.floor(totalEmployees * 0.14);
    const hWfh = Math.floor(totalEmployees * 0.09);
    const hAbsent = totalEmployees - hPresent - hOnLeave - hWfh;
    const hrmsPieData = [
        { name: 'Present', value: hPresent, color: '#4318FF' },
        { name: 'On Leave', value: hOnLeave, color: '#05CD99' },
        { name: 'Work From Home', value: hWfh, color: '#8b5cf6' },
        { name: 'Absent', value: hAbsent, color: '#FFCE20' }
    ];

    // CRM Stats (Mocked proportional to activeCustomers)
    const cNew = Math.floor(activeCustomers * 0.38);
    const cContacted = Math.floor(activeCustomers * 0.30);
    const cQualified = Math.floor(activeCustomers * 0.20);
    const cClosed = activeCustomers - cNew - cContacted - cQualified;
    const crmPieData = [
        { name: 'New', value: cNew, color: '#4318FF' },
        { name: 'Contacted', value: cContacted, color: '#05CD99' },
        { name: 'Qualified', value: cQualified, color: '#8b5cf6' },
        { name: 'Closed Won', value: cClosed, color: '#FFCE20' }
    ];

    // MOCK DATA FOR CHARTS & LISTS
    const overviewData = [
        { name: 'May 1', HRMS: 110, Material: 140, CRM: 80, ERP: 60 },
        { name: 'May 8', HRMS: 120, Material: 150, CRM: 90, ERP: 70 },
        { name: 'May 15', HRMS: 130, Material: 160, CRM: 100, ERP: 80 },
        { name: 'May 22', HRMS: 140, Material: 170, CRM: 110, ERP: 90 },
        { name: 'May 29', HRMS: 150, Material: 180, CRM: 120, ERP: 100 },
        { name: 'Jun 5', HRMS: 160, Material: 190, CRM: 130, ERP: 110 },
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
            {/* Top Navbar Component */}
            <div className="top-navbar">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search materials, PO, vendors..." />
                    <span className="search-shortcut">⌘K</span>
                </div>
                
                <div className="nav-right">
                    <div className="nav-date">
                        <CalendarDays size={16} />
                        <span>{formatDateTime()}</span>
                    </div>
                    
                    <button className="nav-icon-btn">
                        <RefreshCw size={18} />
                    </button>
                    
                    <button className="nav-icon-btn notification-btn">
                        <Bell size={18} />
                        <span className="notification-dot"></span>
                    </button>
                    
                    <div className="nav-profile">
                        <div className="nav-avatar">
                            {getInitials(user?.name || 'Admin User')}
                        </div>
                        <div className="nav-user-info">
                            <strong>{user?.name || 'Admin User'}</strong>
                            <span>{isAdmin ? 'ADMIN' : userRole.toUpperCase()}</span>
                        </div>
                        <ChevronDown size={16} className="nav-chevron" />
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Modules Summary Row */}
                <div className="modules-grid">
                    <div className="module-card">
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
                            <div className="pill blue-pill"><Clock size={12} /> 12 New Joiners</div>
                            <div className="pill lightblue-pill"><Clock size={12} /> 4 On Leave</div>
                        </div>
                    </div>

                    <div className="module-card">
                        <div className="module-header">
                            <div className="module-icon-wrap orange-bg"><Package size={20} /></div>
                            <div className="module-title">
                                <h3>MATERIAL</h3>
                                <p>Total Items</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{totalMaterials || 320}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill orange-pill"><AlertCircle size={12} /> {lowStockCount || 18} Low Stock Alerts</div>
                            <div className="pill red-pill"><ArrowDownRight size={12} /> {outOfStockCount || 7} Out of Stock</div>
                        </div>
                    </div>

                    <div className="module-card">
                        <div className="module-header">
                            <div className="module-icon-wrap green-bg"><Briefcase size={20} /></div>
                            <div className="module-title">
                                <h3>CRM</h3>
                                <p>Total Leads</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{activeCustomers}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill green-pill"><TrendingUp size={12} /> 35 New Leads</div>
                            <div className="pill lightgreen-pill"><CalendarDays size={12} /> 15 This Month</div>
                        </div>
                    </div>

                    <div className="module-card">
                        <div className="module-header">
                            <div className="module-icon-wrap blue-bg"><ShoppingCart size={20} /></div>
                            <div className="module-title">
                                <h3>ERP</h3>
                                <p>Active Projects</p>
                            </div>
                        </div>
                        <div className="module-value">
                            <h2>{openOrders || 24}</h2>
                        </div>
                        <div className="module-footer">
                            <div className="pill lightblue-pill"><Clock size={12} /> 6 Due This Month</div>
                            <div className="pill red-pill"><AlertCircle size={12} /> 3 Overdue</div>
                        </div>
                    </div>
                </div>

                {/* Charts & Actions Row */}
                <div className="charts-actions-grid">
                    <div className="chart-card main-chart">
                        <div className="card-header">
                            <div>
                                <h2>Overview Summary</h2>
                                <p>Business pulse — all modules · May → Jun</p>
                            </div>
                            <button className="outline-select-btn">This Month <ChevronDown size={14} /></button>
                        </div>
                        
                        <div className="chart-legend-top">
                            <span className="legend-item"><div className="dot blue-dot"></div> HRMS <strong>128</strong> <small className="text-success">↑+18%</small></span>
                            <span className="legend-item"><div className="dot orange-dot"></div> Material <strong>320</strong> <small className="text-success">↑+12%</small></span>
                            <span className="legend-item"><div className="dot green-dot"></div> CRM <strong>256</strong> <small className="text-success">↑+24%</small></span>
                            <span className="legend-item"><div className="dot lightblue-dot"></div> ERP <strong>24</strong> <small className="text-success">↑+16%</small></span>
                        </div>

                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={overviewData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3AED0' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A3AED0' }} />
                                    <RechartsTooltip cursor={{fill: '#f4f7fe'}} contentStyle={{ borderRadius: '12px', border: '1px solid #E0E5F2', boxShadow: '0px 8px 24px rgba(112, 144, 176, 0.12)', padding: '12px' }} />
                                    <Bar dataKey="HRMS" fill="#4318FF" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Material" fill="#FF7E00" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="CRM" fill="#05CD99" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="ERP" fill="#3965FF" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="quick-actions-card">
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

                    <div className="recent-activity-card">
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
                    <div className="pie-card">
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
                    
                    <div className="pie-card">
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

                    <div className="pie-card">
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

                    <div className="pie-card">
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

                <div className="footer-copyright">
                    <span>© 2026 SMTBMS · All rights reserved</span>
                    <span>Made with ♥ for smarter management</span>
                </div>
            </div>

            <style jsx="true">{`
                .dashboard-wrapper {
                    background-color: var(--bg-app);
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }

                /* TOP NAVBAR */
                .top-navbar {
                    height: 80px;
                    background: #ffffff;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    background: #F4F7FE;
                    border-radius: 20px;
                    padding: 8px 16px;
                    width: 320px;
                }
                .search-icon { color: var(--text-muted); margin-right: 8px; }
                .search-bar input {
                    border: none; background: transparent; outline: none;
                    font-size: 14px; width: 100%; color: var(--text-heading);
                }
                .search-shortcut {
                    background: #ffffff; border: 1px solid var(--border-light);
                    padding: 2px 6px; border-radius: 6px; font-size: 11px;
                    color: var(--text-muted); font-weight: 600;
                }

                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .nav-date {
                    display: flex; align-items: center; gap: 8px;
                    color: #EE5D50; font-weight: 600; font-size: 13px;
                    background: #FDE8E8; padding: 6px 12px; border-radius: 8px;
                    margin-right: 8px;
                }

                .nav-icon-btn {
                    width: 36px; height: 36px; border-radius: 50%;
                    border: 1px solid var(--border-light); background: #ffffff;
                    display: flex; align-items: center; justify-content: center;
                    color: var(--text-muted); cursor: pointer; transition: all 0.2s;
                }
                .nav-icon-btn:hover { background: #F4F7FE; color: var(--text-heading); }
                .notification-btn { position: relative; }
                .notification-dot {
                    position: absolute; top: 8px; right: 10px;
                    width: 6px; height: 6px; border-radius: 50%; background: #EE5D50;
                }

                .nav-profile {
                    display: flex; align-items: center; gap: 12px;
                    background: #ffffff; border: 1px solid #FFCDD2;
                    padding: 4px 12px 4px 4px; border-radius: 24px;
                    cursor: pointer; margin-left: 8px;
                }
                .nav-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: #EE5D50; color: white; font-weight: 700; font-size: 13px;
                    display: flex; align-items: center; justify-content: center;
                }
                .nav-user-info { display: flex; flex-direction: column; }
                .nav-user-info strong { font-size: 13px; color: var(--text-heading); line-height: 1.2; }
                .nav-user-info span { font-size: 10px; color: #EE5D50; font-weight: 700; }
                .nav-chevron { color: var(--text-muted); }

                .dashboard-content {
                    padding: 24px 32px;
                }

                /* MODULES GRID */
                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .module-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                }

                .module-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .module-icon-wrap {
                    width: 48px; height: 48px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                }
                .blue-bg { background: #E9E3FF; color: #4318FF; }
                .orange-bg { background: #FFF5EB; color: #FF7E00; }
                .green-bg { background: #E5FAF4; color: #05CD99; }
                
                .module-title h3 { font-size: 14px; font-weight: 700; color: var(--text-heading); margin: 0 0 4px 0; }
                .module-title p { font-size: 12px; color: var(--text-muted); margin: 0; font-weight: 500; }

                .module-value h2 {
                    font-size: 36px;
                    font-weight: 800;
                    color: var(--text-heading);
                    margin: 0 0 16px 0;
                    line-height: 1;
                    text-align: center;
                }

                .module-footer {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }

                .pill {
                    display: flex; align-items: center; gap: 4px;
                    padding: 4px 8px; border-radius: 6px;
                    font-size: 11px; font-weight: 600;
                }
                .blue-pill { background: #E9E3FF; color: #4318FF; }
                .lightblue-pill { background: #EAF0FF; color: #3965FF; }
                .orange-pill { background: #FFF5EB; color: #FF7E00; }
                .red-pill { background: #FDE8E8; color: #EE5D50; }
                .green-pill { background: #E5FAF4; color: #05CD99; }
                .lightgreen-pill { background: #EAFDF6; color: #10B981; }

                /* CHARTS & ACTIONS GRID */
                .charts-actions-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.2fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .chart-card, .quick-actions-card, .recent-activity-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid var(--border-light);
                }

                .card-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 20px;
                }
                .card-header h2 { font-size: 16px; font-weight: 700; color: var(--text-heading); margin: 0 0 4px 0; }
                .card-header p { font-size: 12px; color: var(--text-muted); margin: 0; }
                
                .outline-select-btn {
                    padding: 6px 12px; border-radius: 20px;
                    border: 1px solid var(--border-light);
                    background: #ffffff; font-size: 12px; font-weight: 600;
                    color: var(--text-heading); cursor: pointer;
                    display: flex; align-items: center; gap: 6px;
                }

                .chart-legend-top {
                    display: flex; gap: 16px; margin-bottom: 24px;
                    padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-light);
                }
                .legend-item {
                    display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); font-weight: 500;
                }
                .legend-item strong { color: var(--text-heading); font-size: 14px; }
                .text-success { color: #05CD99; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .blue-dot { background: #4318FF; }
                .orange-dot { background: #FF7E00; }
                .green-dot { background: #05CD99; }
                .lightblue-dot { background: #3965FF; }

                /* Quick Actions */
                .actions-list {
                    display: flex; flex-direction: column; gap: 12px;
                }
                .qa-item {
                    display: flex; align-items: center; gap: 16px;
                    padding: 12px 16px; border-radius: 12px;
                    text-decoration: none; font-size: 13px; font-weight: 600; color: var(--text-heading);
                    border: 1px solid var(--border-light);
                    transition: all 0.2s;
                }
                .qa-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
                .qa-icon-wrap {
                    width: 32px; height: 32px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                }
                .purple-bg { background: #F3E8FF; color: #8b5cf6; }
                .yellow-bg { background: #FFFBF0; color: #FFCE20; }
                .lightblue-bg { background: #EAF0FF; color: #3965FF; }
                .qa-arrow { margin-left: auto; color: var(--text-muted); }

                /* Recent Activities */
                .activity-list {
                    display: flex; flex-direction: column; gap: 20px;
                }
                .activity-item {
                    display: flex; align-items: flex-start; gap: 16px;
                }
                .activity-icon-circle {
                    width: 36px; height: 36px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .activity-details h4 {
                    font-size: 13px; font-weight: 600; color: var(--text-heading);
                    margin: 0 0 4px 0; line-height: 1.4;
                }
                .activity-time { font-size: 12px; color: var(--text-muted); font-weight: 500; }

                /* BOTTOM PIE CHARTS */
                .pie-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .pie-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid var(--border-light);
                    display: flex; flex-direction: column;
                }
                .pie-header h3 {
                    font-size: 14px; font-weight: 700; color: var(--text-heading);
                    margin: 0 0 16px 0; text-align: center;
                }
                .pie-wrapper {
                    position: relative; margin-bottom: 24px;
                }
                .pie-center {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    display: flex; flex-direction: column; align-items: center;
                }
                .pie-center strong { font-size: 20px; font-weight: 800; color: var(--text-heading); line-height: 1; }
                .pie-center span { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 4px; }

                .pie-legend-box {
                    display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;
                }
                .pie-legend-row {
                    display: flex; justify-content: space-between; align-items: center;
                }
                .legend-left {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 12px; color: var(--text-muted); font-weight: 500;
                }
                .legend-right {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 13px; color: var(--text-heading);
                }
                .legend-right small { color: var(--text-muted); font-size: 11px; font-weight: 500;}

                .view-report-btn {
                    margin-top: auto;
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    background: #F4F7FE;
                    border: none;
                    font-weight: 600; font-size: 13px;
                    cursor: pointer; transition: all 0.2s;
                }
                .view-report-btn:hover { background: #E0E5F2; }
                .blue-text { color: #4318FF; }
                .orange-text { color: #FF7E00; }
                .green-text { color: #05CD99; }

                /* Footer */
                .footer-copyright {
                    display: flex; justify-content: space-between;
                    padding: 16px 0;
                    color: var(--text-muted); font-size: 13px; font-weight: 500;
                }

                /* RESPONSIVE */
                @media (max-width: 1400px) {
                    .charts-actions-grid { grid-template-columns: 1fr 1fr; }
                    .main-chart { grid-column: span 2; }
                }
                @media (max-width: 1200px) {
                    .modules-grid, .pie-charts-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .modules-grid, .pie-charts-grid { grid-template-columns: 1fr; }
                    .charts-actions-grid { grid-template-columns: 1fr; }
                    .main-chart { grid-column: span 1; }
                    .dashboard-content { padding: 16px; }
                    .top-navbar { padding: 0 16px; }
                    .search-bar { display: none; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { 
    CheckCircle, Calendar, FileText, Shield, UserPlus, Users,
    Package, Briefcase, ChevronRight, Activity, Bell, ShoppingCart, DollarSign, 
    LayoutDashboard, UserCheck, AlertCircle, Clock, PieChart as PieChartIcon, 
    BarChart2, Truck, Box
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import AttendanceWidget from '../components/Dashboard/AttendanceWidget';
import SkeletonLoader from '../components/SkeletonLoader';

const CustomDonut = ({ data, total, label, isLoading }) => {
    if (isLoading) return <SkeletonLoader type="pie" />;
    return (
        <div className="donut-chart-container">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <RechartsTooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-text">
                <div className="donut-total">{total}</div>
                <div className="donut-label">{label}</div>
            </div>
            <div className="donut-legend">
                {data.map((item, index) => (
                    <div key={index} className="legend-row">
                        <div className="legend-name">
                            <span className="dot" style={{ backgroundColor: item.color }}></span>
                            {item.name}
                        </div>
                        <div className="legend-value">
                            <span className="val">{item.value}</span>
                            <span className="perc">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [attStatus, setAttStatus] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [tasksData, setTasksData] = useState([]);
    const [ticketsData, setTicketsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, tasksRes, ticketsRes] = await Promise.allSettled([
                    API.get('/dashboard/stats'),
                    API.get('/tasks/my').catch(() => ({ data: [] })),
                    API.get('/tickets').catch(() => ({ data: [] }))
                ]);
                
                if (dashRes.status === 'fulfilled' && dashRes.value.data) {
                    setDashboardData(dashRes.value.data);
                }
                if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
                    setTasksData(tasksRes.value.data);
                }
                if (ticketsRes.status === 'fulfilled' && ticketsRes.value.data) {
                    setTicketsData(ticketsRes.value.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    let statusText = "Not Checked In";
    let statusColor = "#64748b"; 
    if (attStatus && attStatus.status && attStatus.status !== 'Not Checked In' && attStatus.status !== '-') {
        if (attStatus.checkIn && !attStatus.checkOut) {
            statusText = "Checked In";
            statusColor = "#10b981"; 
        } else if (attStatus.checkIn && attStatus.checkOut) {
            statusText = "Completed";
            statusColor = "#f59e0b"; 
        }
    }

    if (isLoading) {
        return (
            <div style={{ padding: '24px' }}>
                <SkeletonLoader type="dashboard" />
            </div>
        );
    }

    const d = dashboardData || {};
    const hr = d.hrStats || {};
    const stats = d.stats || {};
    const materials = d.materialStats || {};
    const tables = d.tables || {};
    const charts = d.charts || {};
    const vendors = d.vendorStats || {};

    const pendingApprovals = (stats.pendingOrders || 0) + (stats.pendingSalaries || 0) + (hr.pending || 0);
    const todayTasks = tasksData.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
    const openTickets = Array.isArray(ticketsData) ? ticketsData.filter(t => t.status === 'Open').length : 0;

    // Chart Data Preparation
    const hrmsPie = hr.employeeDistribution ? hr.employeeDistribution.map(item => ({
        name: item.name,
        value: item.value,
        color: item.color || '#3b82f6'
    })) : [];

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
    const materialPie = charts.categoryData ? charts.categoryData.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: COLORS[idx % COLORS.length]
    })) : [];

    const vendorPie = vendors.vendorsByCategory ? vendors.vendorsByCategory.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: COLORS[(idx + 2) % COLORS.length]
    })) : [];

    const attendancePie = [
        { name: 'Present', value: hr.presentToday || 0, color: '#10b981' },
        { name: 'Absent', value: hr.absentToday || 0, color: '#ef4444' },
        { name: 'On Leave', value: hr.onLeave || 0, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    const monthlyPayroll = charts.payrollData || [];
    
    return (
        <div className="admin-dashboard-clone">
            
            {/* ROW 1: Header & Quick Stats */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>{greeting}, {user?.name ? user.name.split(' ')[0] : 'Admin'}</h1>
                        <p className="subtitle">
                            <Shield size={16} className="text-blue-500" />
                            <span className="role-text">{user?.role || 'System Administrator'}</span>
                            <span className="dot-sep">&middot;</span>
                            <span className="date-text">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </p>
                    </div>
                    
                    <div className="user-context-bar">
                        <div className="context-item">
                            <span className="c-label">Department</span>
                            <span className="c-value">{user?.department || 'Administration'}</span>
                        </div>
                        <div className="context-item">
                            <span className="c-label">Status</span>
                            <span className="c-value" style={{ color: statusColor, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                {statusText === 'Checked In' && <CheckCircle size={14}/>}
                                {statusText}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <AttendanceWidget onStatusChange={setAttStatus} />
                </div>

                <div className="top-stat-cards">
                    <div className="top-stat-card">
                        <div className="ts-icon blue"><Users size={24} /></div>
                        <div className="ts-info">
                            <h3>{d.totalEmployees || 0}</h3>
                            <p>Total<br/><span>Employees</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon green"><UserCheck size={24} /></div>
                        <div className="ts-info">
                            <h3>{hr.presentToday || 0}</h3>
                            <p>Present<br/><span>Today</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon orange"><AlertCircle size={24} /></div>
                        <div className="ts-info">
                            <h3>{pendingApprovals}</h3>
                            <p>Pending<br/><span>Approvals</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon purple"><Box size={24} /></div>
                        <div className="ts-info">
                            <h3>{d.totalMaterials || 0}</h3>
                            <p>Total<br/><span>Materials</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Additional Metrics */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon-wrap bg-blue-100 text-blue-600"><Calendar size={20}/></div>
                    <div className="kpi-details">
                        <h4>{hr.onLeave || 0}</h4>
                        <span>On Leave Today</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-wrap bg-red-100 text-red-600"><AlertCircle size={20}/></div>
                    <div className="kpi-details">
                        <h4>{d.lowStockItems || 0}</h4>
                        <span>Low Stock Items</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-wrap bg-green-100 text-green-600"><Truck size={20}/></div>
                    <div className="kpi-details">
                        <h4>{vendors.totalVendors || 0}</h4>
                        <span>Active Vendors</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-wrap bg-orange-100 text-orange-600"><CheckCircle size={20}/></div>
                    <div className="kpi-details">
                        <h4>{todayTasks}</h4>
                        <span>Today's Tasks</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon-wrap bg-purple-100 text-purple-600"><Activity size={20}/></div>
                    <div className="kpi-details">
                        <h4>{openTickets}</h4>
                        <span>Open Tickets</span>
                    </div>
                </div>
            </div>

            {/* ROW 3: Summary Cards (Donut Charts) */}
            <div className="summary-cards-row">
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">Employee Distribution</h3>
                    <CustomDonut data={hrmsPie} total={d.totalEmployees || 0} label="Employees" />
                </div>

                <div className="summary-card card-green">
                    <h3 className="sc-header-center">Attendance Today</h3>
                    <CustomDonut data={attendancePie} total={d.totalEmployees || 0} label="Employees" />
                </div>
                
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Material Categories</h3>
                    <CustomDonut data={materialPie} total={d.totalMaterials || 0} label="Types" />
                </div>

                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">Vendor Categories</h3>
                    <CustomDonut data={vendorPie} total={vendors.totalVendors || 0} label="Vendors" />
                </div>
            </div>

            {/* ROW 4: Charts & Actions */}
            <div className="middle-row">
                <div className="chart-section panel-white">
                    <div className="panel-header">
                        <div>
                            <h3>Monthly Payroll Summary</h3>
                            <p>Salary disbursements over the last 6 months</p>
                        </div>
                        <select className="dropdown-select"><option>Last 6 Months</option></select>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={monthlyPayroll} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `₹${value}`} />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="quick-actions-section panel-white">
                    <div className="panel-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="header-actions">
                        <button className="qa-btn blue" onClick={() => navigate('/hrms/add-employee')}>
                            <div className="qa-icon"><UserPlus size={18}/></div>
                            <span>Add New Employee</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn green" onClick={() => navigate('/materials')}>
                            <div className="qa-icon"><Box size={18}/></div>
                            <span>Manage Materials</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn purple" onClick={() => navigate('/vendors/add-vendor')}>
                            <div className="qa-icon"><Briefcase size={18}/></div>
                            <span>Add New Vendor</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn orange" onClick={() => navigate('/erp')}>
                            <div className="qa-icon"><ShoppingCart size={18}/></div>
                            <span>View Orders (ERP)</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn cyan" onClick={() => navigate('/reports/attendance')}>
                            <div className="qa-icon"><BarChart2 size={18}/></div>
                            <span>Generate Reports</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                    </div>
                </div>

                <div className="recent-activities-section panel-white">
                    <div className="panel-header">
                        <h3>Recent Activities & Notifications</h3>
                        <Link to="/notifications" className="view-all-btn">View All</Link>
                    </div>
                    <div className="activity-list">
                        {tables.recentActivity && tables.recentActivity.length > 0 ? (
                            tables.recentActivity.map((act, idx) => (
                                <div className="activity-item" key={idx}>
                                    <div className={`act-icon ${act.type === 'error' ? 'red' : act.type === 'success' ? 'green' : 'blue'}`}>
                                        <Bell size={16}/>
                                    </div>
                                    <div className="act-content">
                                        <h4>{act.text}</h4>
                                        <span>{new Date(act.time).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <div className="act-content">
                                    <h4>No recent activity</h4>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .kpi-icon-wrap {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bg-blue-100 { background: #dbeafe; } .text-blue-600 { color: #2563eb; }
                .bg-red-100 { background: #fee2e2; } .text-red-600 { color: #dc2626; }
                .bg-green-100 { background: #d1fae5; } .text-green-600 { color: #059669; }
                .bg-orange-100 { background: #ffedd5; } .text-orange-600 { color: #ea580c; }
                .bg-purple-100 { background: #f3e8ff; } .text-purple-600 { color: #9333ea; }
                .kpi-details h4 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                    color: #0f172a;
                }
                .kpi-details span {
                    font-size: 13px;
                    color: #64748b;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;

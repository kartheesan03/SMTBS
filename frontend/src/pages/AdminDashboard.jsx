import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    CheckCircle, Calendar, FileText, Shield, UserPlus, Users,
    Package, Briefcase, ChevronRight, Activity, Bell, ShoppingCart, DollarSign, LayoutDashboard
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import AttendanceWidget from '../components/Dashboard/AttendanceWidget';

// Mock Data for Charts
const barData = [
    { name: 'May 1', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
    { name: 'May 8', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
    { name: 'May 15', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
    { name: 'May 22', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
    { name: 'May 29', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
    { name: 'Jun 5', HRMS: 0, Material: 0, CRM: 0, ERP: 0 },
];

const hrmsPie = [
    { name: 'Present', value: 0, color: '#3b82f6' },
    { name: 'On Leave', value: 0, color: '#10b981' },
    { name: 'Work From Home', value: 0, color: '#8b5cf6' },
    { name: 'Absent', value: 0, color: '#f59e0b' },
];

const materialPie = [
    { name: 'In Stock', value: 0, color: '#10b981' },
    { name: 'Low Stock', value: 0, color: '#f59e0b' },
    { name: 'Out of Stock', value: 0, color: '#ef4444' },
    { name: 'In Transit', value: 0, color: '#3b82f6' },
];

const crmPie = [
    { name: 'New', value: 0, color: '#3b82f6' },
    { name: 'Contacted', value: 0, color: '#10b981' },
    { name: 'Qualified', value: 0, color: '#8b5cf6' },
    { name: 'Closed Won', value: 0, color: '#f59e0b' },
];

const erpPie = [
    { name: 'In Progress', value: 0, color: '#3b82f6' },
    { name: 'On Hold', value: 0, color: '#f59e0b' },
    { name: 'Completed', value: 0, color: '#10b981' },
    { name: 'Overdue', value: 0, color: '#ef4444' },
];

const CustomDonut = ({ data, total, label }) => (
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
                        <span className="perc">({Math.round((item.value / total) * 100)}%)</span>
                    </div>
                </div>
            ))}
        </div>
        <button className="view-full-report">View Full Report &rarr;</button>
    </div>
);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [attStatus, setAttStatus] = useState(null);
    const [dashboardData, setDashboardData] = useState({});

    useEffect(() => {
        API.get('/dashboard/stats')
            .then(res => {
                if (res.data) setDashboardData(res.data);
            })
            .catch(err => console.error('Error fetching dashboard stats:', err));
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    let statusText = "Not Checked In";
    let statusColor = "#64748b"; // gray
    if (attStatus && attStatus.status && attStatus.status !== 'Not Checked In' && attStatus.status !== '-') {
        if (attStatus.checkIn && !attStatus.checkOut) {
            statusText = "Checked In";
            statusColor = "#10b981"; // green
        } else if (attStatus.checkIn && attStatus.checkOut) {
            statusText = "Completed";
            statusColor = "#f59e0b"; // orange
        }
    }

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
                            <span className="c-value">IT / Systems</span>
                        </div>
                        <div className="context-item">
                            <span className="c-label">Reporting To</span>
                            <span className="c-value">Board</span>
                        </div>
                        <div className="context-item">
                            <span className="c-label">Location</span>
                            <span className="c-value">Head Office</span>
                        </div>
                        <div className="context-item">
                            <span className="c-label">Status</span>
                            <span className="c-value" style={{ color: statusColor, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                {statusText === 'Checked In' && <CheckCircle size={14}/>}
                                {statusText}
                            </span>
                        </div>
                    </div>

                    <div className="quick-action-buttons" style={{ display: 'none' }}>
                        <button className="btn-primary"><CheckCircle size={16}/> Check In</button>
                        <button className="btn-secondary"><Calendar size={16}/> Apply Leave</button>
                        <button className="btn-secondary"><DollarSign size={16}/> View Payslip</button>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <AttendanceWidget onStatusChange={setAttStatus} />
                </div>

                <div className="top-stat-cards">
                    <div className="top-stat-card">
                        <div className="ts-icon red"><Shield size={24} /></div>
                        <div className="ts-info">
                            <h3>0%</h3>
                            <p>Performance<br/><span>This Quarter</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon orange"><Activity size={24} /></div>
                        <div className="ts-info">
                            <h3>0%</h3>
                            <p>System Health<br/><span>Live Status</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon green"><CheckCircle size={24} /></div>
                        <div className="ts-info">
                            <h3>{dashboardData.totalOrders || 0}</h3>
                            <p>Tasks Done<br/><span>This Month</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Summary Cards (Donut Charts) */}
            <div className="summary-cards-row">
                {/* HRMS Card */}
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">HRMS &mdash; Employee Overview</h3>
                    <CustomDonut data={hrmsPie} total={dashboardData.totalEmployees || 0} label="Total" />
                </div>

                {/* Material Card */}
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Material &mdash; Stock Overview</h3>
                    <CustomDonut data={materialPie} total={dashboardData.totalMaterials || 0} label="Items" />
                </div>
                
                {/* CRM Card */}
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">CRM &mdash; Leads Overview</h3>
                    <CustomDonut data={crmPie} total={dashboardData.totalCustomers || 0} label="Leads" />
                </div>

                {/* ERP Card */}
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">ERP &mdash; Project Overview</h3>
                    <CustomDonut data={erpPie} total={dashboardData.totalOrders || 0} label="Projects" />
                </div>
            </div>

            {/* ROW 3: Charts & Actions */}
            <div className="middle-row">
                <div className="chart-section panel-white">
                    <div className="panel-header">
                        <div>
                            <h3>Overview Summary</h3>
                            <p>Business pulse &mdash; all modules &middot; May &rarr; Jun</p>
                        </div>
                        <select className="dropdown-select"><option>This Month</option></select>
                    </div>
                    
                    <div className="chart-legends-top">
                        <span className="cl"><span className="dot blue"></span> HRMS <strong>{dashboardData.totalEmployees || 0}</strong> <span className="up">&uarr;0%</span></span>
                        <span className="cl"><span className="dot orange"></span> Material <strong>{dashboardData.totalMaterials || 0}</strong> <span className="up">&uarr;0%</span></span>
                        <span className="cl"><span className="dot green"></span> CRM <strong>{dashboardData.totalCustomers || 0}</strong> <span className="up">&uarr;0%</span></span>
                        <span className="cl"><span className="dot purple"></span> ERP <strong>{dashboardData.totalOrders || 0}</strong> <span className="up">&uarr;0%</span></span>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barData} margin={{top: 20, right: 0, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="HRMS" fill="#3b82f6" radius={[4,4,0,0]} barSize={8} />
                                <Bar dataKey="Material" fill="#f59e0b" radius={[4,4,0,0]} barSize={8} />
                                <Bar dataKey="CRM" fill="#10b981" radius={[4,4,0,0]} barSize={8} />
                                <Bar dataKey="ERP" fill="#8b5cf6" radius={[4,4,0,0]} barSize={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="quick-actions-section panel-white">
                    <div className="panel-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="header-actions">
                        <button className="qa-btn blue">
                            <div className="qa-icon"><UserPlus size={18}/></div>
                            <span>Add New Employee</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn green">
                            <div className="qa-icon"><Package size={18}/></div>
                            <span>Add New Material</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn purple">
                            <div className="qa-icon"><Briefcase size={18}/></div>
                            <span>Add New Lead</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn orange">
                            <div className="qa-icon"><FileText size={18}/></div>
                            <span>Create New Project</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                        <button className="qa-btn cyan">
                            <div className="qa-icon"><LayoutDashboard size={18}/></div>
                            <span>View All Modules</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </button>
                    </div>
                </div>

                <div className="recent-activities-section panel-white">
                    <div className="panel-header">
                        <h3>Recent Activities</h3>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="act-icon blue"><UserPlus size={16}/></div>
                            <div className="act-content">
                                <h4>New Employee John Doe joined HR Dept.</h4>
                                <span>2m ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="act-icon green"><Package size={16}/></div>
                            <div className="act-content">
                                <h4>Low stock alert for Laptop - Qty below 5</h4>
                                <span>15m ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="act-icon purple"><Briefcase size={16}/></div>
                            <div className="act-content">
                                <h4>New lead ABC Corp. added by Sales Team</h4>
                                <span>1h ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="act-icon orange"><ShoppingCart size={16}/></div>
                            <div className="act-content">
                                <h4>Project Website Redesign updated</h4>
                                <span>2h ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="act-icon emerald"><DollarSign size={16}/></div>
                            <div className="act-content">
                                <h4>Payment ₹85K received from XYZ Ltd.</h4>
                                <span>3h ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;

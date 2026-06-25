import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
    { name: 'May 1', HRMS: 120, Material: 200, CRM: 150, ERP: 10 },
    { name: 'May 8', HRMS: 122, Material: 210, CRM: 160, ERP: 12 },
    { name: 'May 15', HRMS: 125, Material: 230, CRM: 180, ERP: 15 },
    { name: 'May 22', HRMS: 125, Material: 250, CRM: 210, ERP: 18 },
    { name: 'May 29', HRMS: 126, Material: 290, CRM: 230, ERP: 20 },
    { name: 'Jun 5', HRMS: 128, Material: 320, CRM: 256, ERP: 24 },
];

const hrmsPie = [
    { name: 'Present', value: 86, color: '#3b82f6' },
    { name: 'On Leave', value: 18, color: '#10b981' },
    { name: 'Work From Home', value: 12, color: '#8b5cf6' },
    { name: 'Absent', value: 12, color: '#f59e0b' },
];

const materialPie = [
    { name: 'In Stock', value: 240, color: '#10b981' },
    { name: 'Low Stock', value: 18, color: '#f59e0b' },
    { name: 'Out of Stock', value: 12, color: '#ef4444' },
    { name: 'In Transit', value: 50, color: '#3b82f6' },
];

const crmPie = [
    { name: 'New', value: 98, color: '#3b82f6' },
    { name: 'Contacted', value: 78, color: '#10b981' },
    { name: 'Qualified', value: 52, color: '#8b5cf6' },
    { name: 'Closed Won', value: 28, color: '#f59e0b' },
];

const erpPie = [
    { name: 'In Progress', value: 10, color: '#3b82f6' },
    { name: 'On Hold', value: 4, color: '#f59e0b' },
    { name: 'Completed', value: 8, color: '#10b981' },
    { name: 'Overdue', value: 2, color: '#ef4444' },
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

    return (
        <div className="admin-dashboard-clone">
            
            {/* ROW 1: Header & Quick Stats */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>Good Afternoon, {user?.name ? user.name.split(' ')[0] : 'Admin'}</h1>
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
                            <span className="c-value status-good"><CheckCircle size={14}/> Checked In</span>
                        </div>
                    </div>

                    <div className="quick-action-buttons" style={{ display: 'none' }}>
                        <button className="btn-primary"><CheckCircle size={16}/> Check In</button>
                        <button className="btn-secondary"><Calendar size={16}/> Apply Leave</button>
                        <button className="btn-secondary"><DollarSign size={16}/> View Payslip</button>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <AttendanceWidget />
                </div>

                <div className="top-stat-cards">
                    <div className="top-stat-card">
                        <div className="ts-icon red"><Shield size={24} /></div>
                        <div className="ts-info">
                            <h3>92%</h3>
                            <p>Performance<br/><span>This Quarter</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon orange"><Activity size={24} /></div>
                        <div className="ts-info">
                            <h3>87%</h3>
                            <p>System Health<br/><span>Live Status</span></p>
                        </div>
                    </div>
                    <div className="top-stat-card">
                        <div className="ts-icon green"><CheckCircle size={24} /></div>
                        <div className="ts-info">
                            <h3>128</h3>
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
                    <CustomDonut data={hrmsPie} total={128} label="Total" />
                </div>

                {/* Material Card */}
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Material &mdash; Stock Overview</h3>
                    <CustomDonut data={materialPie} total={320} label="Items" />
                </div>
                
                {/* CRM Card */}
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">CRM &mdash; Leads Overview</h3>
                    <CustomDonut data={crmPie} total={256} label="Leads" />
                </div>

                {/* ERP Card */}
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">ERP &mdash; Project Overview</h3>
                    <CustomDonut data={erpPie} total={24} label="Projects" />
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
                        <span className="cl"><span className="dot blue"></span> HRMS <strong>128</strong> <span className="up">&uarr;18%</span></span>
                        <span className="cl"><span className="dot orange"></span> Material <strong>320</strong> <span className="up">&uarr;12%</span></span>
                        <span className="cl"><span className="dot green"></span> CRM <strong>256</strong> <span className="up">&uarr;24%</span></span>
                        <span className="cl"><span className="dot purple"></span> ERP <strong>24</strong> <span className="up">&uarr;16%</span></span>
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
                    <div className="action-buttons">
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

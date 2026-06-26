import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Search, CheckCircle, Award, Briefcase, 
    MoreHorizontal, Calendar, ChevronDown, Download
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import './EnlightDashboard.css';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [tasksData, setTasksData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [taskRes, salRes] = await Promise.all([
                API.get('/tasks/my').catch(() => API.get('/tasks').catch(() => ({ data: [] }))),
                API.get('/salaries').catch(() => ({ data: [] }))
            ]);
            setTasksData(taskRes.data || []);
            setSalariesData(salRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const userId = user?.id || user?._id;
    const safeArray = (data, key) => Array.isArray(data) ? data : data?.[key] || data?.data || [];
    
    const tasksArray = safeArray(tasksData, 'tasks');
    const salariesArray = safeArray(salariesData, 'salaries');

    const parseJSON = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
        return [];
    };

    const myTasksList = tasksArray.map(task => {
        const completions = parseJSON(task.completions);
        const userStatus = completions.find(c => {
            const uid = c.user?._id || c.user?.id || c.user;
            return String(uid) === String(userId);
        })?.status || 'Pending';
        return { ...task, userStatus };
    });

    const mySalariesList = salariesArray.filter(s => s.employeeId === userId || s.userId === userId);

    const completedTasks = myTasksList.filter(t => t.userStatus === 'Completed' || t.userStatus === 'Done').length;
    const totalTasks = myTasksList.length || 1; // prevent div by zero visual
    
    // Mock performance data for the chart to match the UI screenshot
    const performanceData = [
        { name: 'Jan', performance: 2.8, average: 3.1 },
        { name: 'Feb', performance: 2.7, average: 3.2 },
        { name: 'Mar', performance: 3.2, average: 3.0 },
        { name: 'Apr', performance: 3.1, average: 2.9 },
        { name: 'May', performance: 3.6, average: 3.1 },
        { name: 'Jun', performance: 3.5, average: 3.3 },
        { name: 'Jul', performance: 3.8, average: 3.4 },
        { name: 'Aug', performance: 4.2, average: 3.5 },
        { name: 'Sep', performance: 4.1, average: 3.6 },
    ];

    // Mock schedule data matching the right side panel
    const scheduleData = [
        { id: 1, title: 'Project Kickoff', time: '08:30 AM - 09:30 AM', person: 'Sarah Jenkins', room: 'Conference A', tag: 'High Priority', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=e0e7ff&color=4f46e5' },
        { id: 2, title: 'Risk Management', time: '09:30 AM - 11:00 AM', person: 'Dr. Alan Smith', room: 'Meeting Room 2', tag: 'Internal', avatar: 'https://ui-avatars.com/api/?name=Alan+Smith&background=fef3c7&color=d97706' },
        { id: 3, title: 'Networking Align', time: '01:30 PM - 03:30 PM', person: 'Michael Ross', room: 'Virtual', tag: 'Client', avatar: 'https://ui-avatars.com/api/?name=Michael+Ross&background=dcfce7&color=16a34a' }
    ];

    return (
        <div className="enlight-dashboard">
            {/* Header */}
            <div className="enlight-header">
                <h1 className="enlight-header-title">Welcome Back, {user?.name || 'Rohmad Khoirudin'}</h1>
                <div className="enlight-search-container">
                    <Search className="enlight-search-icon" size={18} />
                    <input type="text" className="enlight-search-input" placeholder="Search Here" />
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="enlight-kpi-grid">
                <div className="enlight-card">
                    <div className="kpi-header">
                        <div className="kpi-title-area">
                            <div className="kpi-icon-wrapper"><CheckCircle size={20} /></div>
                            Tasks Completed
                        </div>
                        <MoreHorizontal className="kpi-more-options" size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-area">
                            <div className="kpi-numbers">
                                <span className="kpi-numerator">{completedTasks > 0 ? completedTasks : 120}</span>
                                <span className="kpi-denominator">/{totalTasks > 1 ? totalTasks : 144}</span>
                            </div>
                            <span className="kpi-subtitle">Compared To Last Month</span>
                        </div>
                        <div className="kpi-pill positive">+24 Tasks</div>
                    </div>
                </div>

                <div className="enlight-card">
                    <div className="kpi-header">
                        <div className="kpi-title-area">
                            <div className="kpi-icon-wrapper" style={{color: '#8b5cf6'}}><Award size={20} /></div>
                            Performance Score
                        </div>
                        <MoreHorizontal className="kpi-more-options" size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-area">
                            <div className="kpi-numbers">
                                <span className="kpi-numerator">3.75</span>
                                <span className="kpi-denominator">/4.00</span>
                            </div>
                            <span className="kpi-subtitle">Compared To Last Month</span>
                        </div>
                        <div className="kpi-pill negative">-0.25 Points</div>
                    </div>
                </div>

                <div className="enlight-card">
                    <div className="kpi-header">
                        <div className="kpi-title-area">
                            <div className="kpi-icon-wrapper" style={{color: '#0ea5e9'}}><Briefcase size={20} /></div>
                            Active Projects
                        </div>
                        <MoreHorizontal className="kpi-more-options" size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-area">
                            <div className="kpi-numbers">
                                <span className="kpi-numerator">15</span>
                                <span className="kpi-denominator">/18</span>
                            </div>
                            <span className="kpi-subtitle">Active Projects This Quarter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Grid */}
            <div className="enlight-middle-grid">
                <div className="enlight-card enlight-chart-card">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Performance Trend Analysis</h3>
                            <p className="chart-subtitle">Comparison between your performance and company average</p>
                        </div>
                        <div className="chart-filter">
                            All Quarters <ChevronDown size={16} />
                        </div>
                    </div>
                    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-dot" style={{background: '#8b5cf6'}}></div>
                                <span>Your Score</span>
                                <span className="legend-value">3.75</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot" style={{background: '#f43f5e'}}></div>
                                <span>Average Score</span>
                                <span className="legend-value">3.25</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[1, 5]} ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                />
                                <Line type="monotone" dataKey="performance" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2}} />
                                <Line type="monotone" dataKey="average" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="enlight-card">
                    <div className="schedule-header">
                        <h3 className="schedule-title">Daily Schedule</h3>
                        <MoreHorizontal className="kpi-more-options" size={20} />
                    </div>
                    <p className="schedule-subtitle" style={{marginBottom: '20px'}}>Schedule for your meetings today</p>
                    
                    <div className="enlight-schedule-list">
                        {scheduleData.map(item => (
                            <div className="schedule-item" key={item.id}>
                                <img src={item.avatar} alt={item.person} className="schedule-avatar" />
                                <div className="schedule-details">
                                    <div className="schedule-name">{item.title}</div>
                                    <div className="schedule-time">{item.time}</div>
                                    <div className="schedule-meta-grid">
                                        <div className="schedule-meta-item">
                                            <Briefcase size={14} /> {item.person}
                                        </div>
                                        <div className="schedule-meta-item">
                                            <CheckCircle size={14} /> {item.tag}
                                        </div>
                                        <div className="schedule-meta-item" style={{gridColumn: '1 / -1', marginTop: '4px'}}>
                                            <Search size={14} /> Room: {item.room}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Table */}
            <div className="enlight-card enlight-table-card">
                <div className="table-header">
                    <div>
                        <h3 className="table-title">Payroll & Salary History</h3>
                        <p className="table-subtitle">Complete data about your compensation history</p>
                    </div>
                    <a href="#" className="view-all-link">View All History</a>
                </div>
                
                <div style={{overflowX: 'auto'}}>
                    <table className="enlight-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {mySalariesList.length > 0 ? mySalariesList.map((salary, idx) => (
                                <tr key={idx}>
                                    <td>PID - {salary._id?.substring(0, 8).toUpperCase() || `9928${idx}`}</td>
                                    <td>{salary.month} {salary.year} Salary</td>
                                    <td>{new Date(salary.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    <td>
                                        <span className={`status-pill ${salary.status === 'Paid' ? 'completed' : 'pending'}`}>
                                            {salary.status}
                                        </span>
                                    </td>
                                    <td><Download className="table-action-icon" size={18} /></td>
                                </tr>
                            )) : (
                                // Dummy data matching the visual style if no salaries exist
                                <>
                                    <tr>
                                        <td>PID - 331829</td>
                                        <td>October 2024 Salary</td>
                                        <td>23 October 2024</td>
                                        <td><span className="status-pill pending">On-Verification</span></td>
                                        <td><Download className="table-action-icon" size={18} /></td>
                                    </tr>
                                    <tr>
                                        <td>PID - 331828</td>
                                        <td>September 2024 Salary</td>
                                        <td>23 September 2024</td>
                                        <td><span className="status-pill completed">Completed</span></td>
                                        <td><Download className="table-action-icon" size={18} /></td>
                                    </tr>
                                    <tr>
                                        <td>PID - 331827</td>
                                        <td>August 2024 Salary</td>
                                        <td>23 August 2024</td>
                                        <td><span className="status-pill completed">Completed</span></td>
                                        <td><Download className="table-action-icon" size={18} /></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default EmployeeDashboard;

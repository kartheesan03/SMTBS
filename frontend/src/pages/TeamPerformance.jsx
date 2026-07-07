import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, ThumbsUp, ThumbsDown , Award} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';

const TeamPerformance = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState('All Ratings');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, taskRes] = await Promise.all([
                API.get('/employees'),
                API.get('/tasks')
            ]);
            
            setEmployees(empRes.data || []);
            setTasks(taskRes.data || []);
        } catch (err) {
            console.error('Failed to fetch performance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate Performance Metrics dynamically
    const perfData = employees.map(emp => {
        const userIdStr = String(emp.userId?._id || emp.userId || '');
        
        // Find tasks assigned to this employee
        const empTasks = tasks.filter(t => {
            let assigned = t.assignedTo;
            if (typeof assigned === 'string') {
                try { assigned = JSON.parse(assigned); } catch (e) { assigned = []; }
            }
            if (!Array.isArray(assigned)) assigned = [];
            return assigned.some(id => String(id) === userIdStr);
        });

        const totalTasks = empTasks.length;
        let completedTasks = 0;

        empTasks.forEach(t => {
            let completions = t.completions;
            if (typeof completions === 'string') {
                try { completions = JSON.parse(completions); } catch (e) { completions = []; }
            }
            if (!Array.isArray(completions)) completions = [];
            const userComp = completions.find(c => String(c.user) === userIdStr);
            if (userComp && userComp.status === 'Completed') {
                completedTasks++;
            }
        });

        // Compute simulated metrics based on tasks
        // Fallback to average score (75) if no tasks
        let taskScore = 75; 
        if (totalTasks > 0) {
            taskScore = Math.round((completedTasks / totalTasks) * 100);
        }
        
        // Target score: 80% weight on tasks, 20% random variance
        const targetScore = Math.max(0, Math.min(100, Math.round(taskScore * 0.8)));
        
        // Use 100 for attendance if not tracked, or 0
        const attendanceScore = 100;
        
        // Overall is average
        const overall = Math.round((taskScore + attendanceScore + targetScore) / 3);
        
        let rating = 'Below Average';
        if (overall >= 90) rating = 'Excellent';
        else if (overall >= 75) rating = 'Good';
        else if (overall >= 60) rating = 'Average';

        let appraisal = '0%';
        if (rating === 'Excellent') appraisal = '12%';
        else if (rating === 'Good') appraisal = '8%';
        else if (rating === 'Average') appraisal = '4%';

        return {
            id: emp.employeeId,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            dept: emp.department || 'General',
            kpi: taskScore,
            attendance: attendanceScore,
            targets: targetScore,
            overall,
            rating,
            appraisal
        };
    });

    // Compute KPIs
    const teamAvg = perfData.length > 0 ? Math.round(perfData.reduce((sum, p) => sum + p.overall, 0) / perfData.length) : 0;
    const excellentCount = perfData.filter(p => p.rating === 'Excellent').length;
    const goodCount = perfData.filter(p => p.rating === 'Good').length;
    const belowAvgCount = perfData.filter(p => p.rating === 'Below Average' || p.rating === 'Average').length;

    // Trend mock generator
    

    const getInitials = (name) => {
        const parts = name.split(' ');
        return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??';
    };
    
    const renderMiniBar = (val, color) => (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{flex: 1, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden'}}>
                <div style={{width: `${val}%`, height: '100%', background: color, borderRadius: 4}}></div>
            </div>
            <span style={{fontSize: 13, fontWeight: 700, color: 'var(--rd-text-main)', width: 28}}>{val}</span>
        </div>
    );
    
    const renderCircularProgress = (val, color) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (val / 100) * circumference;
        return (
            <div style={{position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="40" height="40" style={{transform: 'rotate(-90deg)'}}>
                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <span style={{position: 'absolute', fontSize: 11, fontWeight: 800, color: color}}>{val}</span>
            </div>
        );
    };

    // Filter Logic
    const departments = ['All', ...new Set(perfData.map(p => p.dept))];
    
    const filteredData = perfData.filter(record => {
        const matchesSearch = !searchTerm || record.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === 'All' || record.dept === deptFilter;
        const matchesRating = ratingFilter === 'All Ratings' || record.rating === ratingFilter || (ratingFilter === 'Average' && record.rating === 'Below Average'); // Grouping
        return matchesSearch && matchesDept && matchesRating;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Performance Reviews</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard title="Team Avg. Score" value={`${teamAvg}%`} colorTheme="blue" icon={TrendingUp} trendValue="Overall performance" trendPositive={teamAvg >= 75} />
                    <PastelKPICard title="Excellent" value={excellentCount} colorTheme="mint" icon={Award} trendValue="Score ≥ 90" trendPositive={true} />
                    <PastelKPICard title="Good" value={goodCount} colorTheme="yellow" icon={ThumbsUp} trendValue="Score 75–89" trendPositive={true} />
                    <PastelKPICard title="Below Average" value={belowAvgCount} colorTheme="peach" icon={ThumbsDown} trendValue="Score < 75" trendPositive={false} />
                </PastelKPIGrid>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: 'none', flexWrap: 'wrap', gap: 16}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 250, flexShrink: 0, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    className="rd-search-input"
                                    placeholder="Search employee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                            </select>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                <option value="All Ratings">All Ratings</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Average">Avg / Below</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th style={{width: 140}}>Task Score</th>
                                <th style={{width: 140}}>Attendance (Est)</th>
                                <th style={{width: 140}}>Target Score</th>
                                <th>Overall</th>
                                <th>Rating</th>
                                <th>Est. Appraisal</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading performance data...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No performance data found</td>
                                </tr>
                            ) : (
                                filteredData.map((emp, i) => (
                                    <tr key={emp.id || i}>
                                        <td>
                                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: emp.overall >= 85 ? '#10b981' : '#3b82f6'}}>
                                                    {getInitials(emp.name)}
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                                    <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{background: emp.dept === 'Finance' || emp.dept === 'Sales' ? '#fff7ed' : '#ecfdf5', color: emp.dept === 'Finance' || emp.dept === 'Sales' ? '#f59e0b' : '#10b981', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>
                                                {emp.dept}
                                            </span>
                                        </td>
                                        <td>{renderMiniBar(emp.kpi, '#3b82f6')}</td>
                                        <td>{renderMiniBar(emp.attendance, '#10b981')}</td>
                                        <td>{renderMiniBar(emp.targets, '#8b5cf6')}</td>
                                        <td>{renderCircularProgress(emp.overall, emp.overall >= 85 ? '#10b981' : emp.overall >= 60 ? '#f59e0b' : '#ef4444')}</td>
                                        <td>
                                            <span className={`rd-status-badge ${emp.rating === 'Excellent' ? 'rd-status-green' : emp.rating === 'Good' ? 'rd-status-blue' : 'rd-status-orange'}`}>
                                                <span className="rd-legend-dot" style={{background: emp.rating === 'Excellent' ? '#10b981' : emp.rating === 'Good' ? '#3b82f6' : '#f59e0b', display:'inline-block', marginRight: 6}}></span>
                                                {emp.rating}
                                            </span>
                                        </td>
                                        <td style={{fontWeight: 700, color: '#10b981'}}>{emp.appraisal}</td>
                                        <td>
                                            <button onClick={() => navigate(`/employees/${emp.id}`)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>•••</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TeamPerformance;

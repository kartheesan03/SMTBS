import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Users, Target, Zap, Award, Loader, Activity } from 'lucide-react';

const TeamPerformance = () => {
    const [teamData, setTeamData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [kpiData, setKpiData] = useState({
        teamTarget: 0,
        avgVelocity: 0,
        totalCompleted: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                setLoading(true);
                const [tasksRes, usersRes] = await Promise.all([
                    API.get('/tasks'),
                    API.get('/auth/users')
                ]);

                const tasks = tasksRes.data || [];
                const users = usersRes.data || [];

                // Map users to their performance metrics
                const userMetrics = {};
                users.forEach(u => {
                    userMetrics[u._id] = {
                        name: u.name,
                        tasksAssigned: 0,
                        tasksCompleted: 0,
                        velocity: 0 // completed tasks / active days (simplified as just completed tasks for now)
                    };
                });

                let totalTeamAssigned = 0;
                let totalTeamCompleted = 0;

                tasks.forEach(task => {
                    // task.completions is a JSON string
                    let completions = [];
                    try {
                        if (typeof task.completions === 'string') {
                            completions = JSON.parse(task.completions);
                        } else if (Array.isArray(task.completions)) {
                            completions = task.completions;
                        }
                    } catch (e) {
                        completions = [];
                    }

                    completions.forEach(c => {
                        const uid = c.user?._id || c.user;
                        if (userMetrics[uid]) {
                            userMetrics[uid].tasksAssigned += 1;
                            totalTeamAssigned += 1;
                            if (c.status === 'Completed') {
                                userMetrics[uid].tasksCompleted += 1;
                                totalTeamCompleted += 1;
                            }
                        }
                    });
                });

                // Format data for tables and charts
                const formattedTeamData = [];
                const formattedChartData = [];

                Object.values(userMetrics).forEach(metric => {
                    if (metric.tasksAssigned > 0) { // Only show users with assigned tasks
                        const efficiencyNum = metric.tasksAssigned > 0 
                            ? Math.round((metric.tasksCompleted / metric.tasksAssigned) * 100) 
                            : 0;
                        
                        let status = 'Active';
                        if (efficiencyNum >= 90) status = 'Top Performer';
                        else if (efficiencyNum < 50) status = 'Needs Improvement';

                        formattedTeamData.push({
                            name: metric.name,
                            tasks: metric.tasksCompleted,
                            efficiency: `${efficiencyNum}%`,
                            efficiencyNum,
                            status
                        });

                        formattedChartData.push({
                            name: metric.name.split(' ')[0], // First name for chart
                            tasks: metric.tasksCompleted
                        });
                    }
                });

                // Sort by efficiency
                formattedTeamData.sort((a, b) => b.efficiencyNum - a.efficiencyNum);
                // Sort chart by tasks completed
                formattedChartData.sort((a, b) => b.tasks - a.tasks);

                setTeamData(formattedTeamData);
                setChartData(formattedChartData.slice(0, 8)); // Top 8 for chart

                const teamTarget = totalTeamAssigned > 0 
                    ? Math.round((totalTeamCompleted / totalTeamAssigned) * 100) 
                    : 0;

                // Simplistic avg velocity: completed tasks per user per day (assuming 30 days for demo, or just total completed / users)
                const activeUsersCount = formattedTeamData.length;
                const avgVelocity = activeUsersCount > 0 
                    ? (totalTeamCompleted / activeUsersCount).toFixed(1) 
                    : 0;

                setKpiData({
                    teamTarget,
                    avgVelocity,
                    totalCompleted: totalTeamCompleted
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching performance data:", err);
                setError("Failed to load performance metrics.");
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, []);

    if (loading) {
        return (
            <div className="module-container flex-center" style={{ height: '80vh' }}>
                <Loader size={40} className="spin-icon" color="#6366f1" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="module-container flex-center" style={{ height: '80vh' }}>
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    const hasData = teamData.length > 0;

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Team Performance Metrics</h1>
                    <p className="text-muted">Analyze workforce efficiency, task completion rates, and individual contributions.</p>
                </div>
            </header>

            {!hasData ? (
                <div className="glass-card flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '15px' }}>
                    <Activity size={48} color="#94a3b8" opacity={0.5} />
                    <h3 style={{ color: '#64748b' }}>No performance data available</h3>
                    <p className="text-muted">Task completions and team metrics will appear here once tasks are assigned and updated.</p>
                </div>
            ) : (
                <>
                    <div className="performance-viz-grid">
                        <div className="glass-card main-viz">
                            <h3>Volume of Tasks Completed</h3>
                            <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                        <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={index % 2 === 0 ? '#6366f1' : '#14b8a6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="kpi-column">
                            <div className="glass-card kpi-box">
                                <Target color="#6366f1" size={24}/>
                                <div>
                                    <h4>Team Target</h4>
                                    <p>{kpiData.teamTarget}% Complete</p>
                                </div>
                            </div>
                            <div className="glass-card kpi-box">
                                <Zap color="#f59e0b" size={24}/>
                                <div>
                                    <h4>Avg. Velocity</h4>
                                    <p>{kpiData.avgVelocity} Tasks/Person</p>
                                </div>
                            </div>
                            <div className="glass-card kpi-box">
                                <Award color="#10b981" size={24}/>
                                <div>
                                    <h4>Tasks Completed</h4>
                                    <p>{kpiData.totalCompleted} Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="module-content mt-30">
                        <DataTable 
                            title="Individual Contribution Breakdown"
                            headers={['Employee Name', 'Tasks Completed', 'Efficiency Score', 'Status']}
                            data={teamData}
                            renderRow={(e) => (
                                <>
                                    <td><strong>{e.name}</strong></td>
                                    <td>{e.tasks} Tasks</td>
                                    <td>
                                        <div className="efficiency-cell">
                                            <strong>{e.efficiency}</strong>
                                            <div className="tiny-bar"><div className="tiny-fill" style={{width: e.efficiency, background: e.efficiencyNum < 50 ? '#ef4444' : e.efficiencyNum < 80 ? '#f59e0b' : '#14b8a6'}}></div></div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${e.status.toLowerCase().replace(' ', '-')}`}>
                                            <Award size={12}/> {e.status}
                                        </span>
                                    </td>
                                </>
                            )}
                        />
                    </div>
                </>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { margin-bottom: 30px; }
                
                .performance-viz-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
                .main-viz { padding: 25px; }
                .kpi-column { display: flex; flex-direction: column; gap: 20px; }
                .kpi-box { display: flex; align-items: center; gap: 20px; padding: 25px; }
                .kpi-box h4 { font-size: 13px; color: var(--text-muted); margin-bottom: 5px; }
                .kpi-box p { font-size: 18px; font-weight: 700; color: var(--text-main); }
                
                .efficiency-cell { display: flex; align-items: center; gap: 10px; min-width: 120px; }
                .tiny-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; }
                .tiny-fill { height: 100%; border-radius: 20px; transition: width 0.3s ease; }
                
                .status-badge { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; width: fit-content; }
                .status-badge.top-performer { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .status-badge.active { background: rgba(255,255,255,0.03); color: var(--text-muted); }
                .status-badge.needs-improvement { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .mt-30 { margin-top: 30px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .performance-viz-grid { grid-template-columns: 1fr; }
                    .kpi-column { flex-direction: column; }
                    .main-viz { padding: 15px; }
                    .kpi-box { padding: 15px; }
                }
            `}</style>
        </div>
    );
};

export default TeamPerformance;

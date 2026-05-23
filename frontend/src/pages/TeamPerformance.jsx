import React from 'react';
import DataTable from '../components/Dashboard/DataTable';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Users, Target, Zap, Award } from 'lucide-react';

const TeamPerformance = () => {
    const teamData = [
        { name: 'John Doe', tasks: 12, efficiency: '98%', status: 'Top Performer' },
        { name: 'Sarah Connor', tasks: 10, efficiency: '94%', status: 'Active' },
        { name: 'Alice Johnson', tasks: 8, efficiency: '88%', status: 'Active' },
        { name: 'Mike Ross', tasks: 15, efficiency: '92%', status: 'Top Performer' },
    ];

    const chartData = [
        { name: 'John', tasks: 12 },
        { name: 'Sarah', tasks: 10 },
        { name: 'Alice', tasks: 8 },
        { name: 'Mike', tasks: 15 },
    ];

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Team Performance Metrics</h1>
                    <p className="text-muted">Analyze workforce efficiency, task completion rates, and individual contributions.</p>
                </div>
            </header>

            <div className="performance-viz-grid">
                <div className="glass-card main-viz">
                    <h3>Volume of Tasks Completed</h3>
                    <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
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
                        <div><h4>Team Target</h4><p>84% Complete</p></div>
                    </div>
                    <div className="glass-card kpi-box">
                        <Zap color="#f59e0b" size={24}/>
                        <div><h4>Avg. Velocity</h4><p>4.2 Tasks/Day</p></div>
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
                                    <div className="tiny-bar"><div className="tiny-fill" style={{width: e.efficiency}}></div></div>
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
                .tiny-fill { height: 100%; background: #14b8a6; border-radius: 20px; }
                
                .status-badge { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                .status-badge.top-performer { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .status-badge.active { background: rgba(255,255,255,0.03); color: var(--text-muted); }
                
                .mt-30 { margin-top: 30px; }

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

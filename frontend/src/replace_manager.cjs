const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/ManagerDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('return (');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Manager Overview</h1>
                    <p>Team & Project Command Center</p>
                </div>
                <div className="action-buttons">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-body)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* Core KPIs */}
            <div className="module-kpi-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className="kpi-icon-wrapper" style={{background: \`\${kpi.color}15\`, color: kpi.color}}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className={\`kpi-trend \${kpi.trendType === 'down' ? 'negative' : 'positive'}\`}>
                            {kpi.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} 
                            {kpi.trend} vs last month
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics */}
            <div className="module-analytics-section" style={{ gridTemplateColumns: '5fr 4fr 3fr' }}>
                {/* Team Performance */}
                <div className="analytics-card">
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Team Performance</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {teamPerformanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={teamPerformanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <RechartsTooltip cursor={{fill: 'var(--bg-surface-hover)'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'var(--text-main)' }} iconType="circle" />
                                    <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="pending" name="Pending Tasks" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)', fontSize: '14px' }}>No Records Found</div>
                        )}
                    </div>
                </div>

                {/* Team Attendance */}
                <div className="analytics-card">
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Team Attendance</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
                        {teamAttendanceData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={teamAttendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                                {teamAttendanceData.map((entry, index) => (
                                                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                formatter={(value, name) => {
                                                    const pct = totalAttendanceEmployees > 0 ? ((value / totalAttendanceEmployees) * 100) : 0;
                                                    return [value + " (" + Number(pct.toFixed(1)) + "%)", name];
                                                }}
                                                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} 
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalAttendanceEmployees}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Total Employees</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                    {teamAttendanceData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
                                <Users size={24} style={{ opacity: 0.5 }} />
                                <span>No Records Found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Quick Actions */}
                    <div className="analytics-card" style={{ padding: '20px' }}>
                        <div className="analytics-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { path: '/tasks', name: 'Tasks', icon: ListTodo, color: '#3b82f6' },
                                { path: '/projects', name: 'Projects', icon: FolderGit2, color: '#8b5cf6' },
                                { path: '/team', name: 'Team', icon: Users, color: '#10b981' },
                                { path: '/approvals', name: 'Approvals', icon: CheckCircle, color: '#ef4444' }
                            ].map((link, idx) => (
                                <NavLink to={link.path} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-heading)', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: \`\${link.color}15\`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                        <link.icon size={18} />
                                    </div>
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Project Status */}
                    <div className="analytics-card" style={{ flex: 1, padding: '20px' }}>
                        <div className="analytics-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> Project Status</h3>
                        </div>
                        <div style={{ overflowY: 'auto' }}>
                            {projectStatusData.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {projectStatusData.map(proj => (
                                        <div key={proj.id} style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{proj.name}</span>
                                                <span style={{ 
                                                    fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                                    background: proj.status === 'Completed' ? 'rgba(16,185,129,0.1)' : proj.status === 'At Risk' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                                                    color: proj.status === 'Completed' ? '#10B981' : proj.status === 'At Risk' ? '#EF4444' : '#3B82F6'
                                                }}>{proj.status}</span>
                                            </div>
                                            <div style={{ background: 'var(--border-light)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    height: '100%', width: \`\${proj.progress}%\`, borderRadius: '2px',
                                                    background: proj.status === 'Completed' ? '#10B981' : proj.status === 'At Risk' ? '#EF4444' : '#3B82F6'
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-center" style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>No Active Projects</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('ManagerDashboard.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

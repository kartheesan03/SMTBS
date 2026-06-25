const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/EmployeeDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('return (');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Employee Workspace</h1>
                    <p>Welcome back, {user?.firstName || 'User'}!</p>
                </div>
                <div className="action-buttons">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-body)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <Clock size={16} style={{ color: 'var(--primary)' }} /> 
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
                        <div className="kpi-value" style={{ color: kpi.isStatus ? kpi.color : 'inherit', fontSize: kpi.isStatus ? '20px' : '28px' }}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="module-analytics-section" style={{ gridTemplateColumns: '5fr 3fr' }}>
                {/* Left Side: Tasks Table */}
                <div className="analytics-card" style={{ flex: 1 }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ListTodo size={18} /> My Pending Tasks</h3>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px' }}>
                        {myTasks.length > 0 ? (
                            <table className="enterprise-table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th>Task Description</th>
                                        <th>Priority</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.map((task, i) => (
                                        <tr key={i}>
                                            <td><strong>{task.title}</strong></td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.priority === 'High' ? 'rgba(239,68,68,0.1)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                                                    color: task.priority === 'High' ? '#EF4444' : task.priority === 'Medium' ? '#F59E0B' : '#64748B'
                                                }}>{task.priority}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{task.due}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.status === 'Completed' ? 'rgba(16,185,129,0.1)' : task.status === 'In Progress' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                                                    color: task.status === 'Completed' ? '#10B981' : task.status === 'In Progress' ? '#3B82F6' : '#64748B'
                                                }}>{task.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>No pending tasks</div>
                        )}
                    </div>
                </div>

                {/* Right Side: Quick Actions & Attendance Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Quick Actions */}
                    <div className="analytics-card" style={{ padding: '20px' }}>
                        <div className="analytics-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { path: '/my-tasks', name: 'My Tasks', icon: ListTodo, color: '#3b82f6' },
                                { path: '/leave-management', name: 'Apply Leave', icon: Calendar, color: '#8b5cf6' },
                                { path: '/my-attendance', name: 'Mark Attendance', icon: Fingerprint, color: '#10b981' },
                                { path: '/my-salary', name: 'Salary Slips', icon: FileText, color: '#f59e0b' }
                            ].map((link, idx) => (
                                <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: \`\${link.color}15\`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                                        <link.icon size={16} />
                                    </div>
                                    {link.name}
                                    <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Chart */}
                    <div className="analytics-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="analytics-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> My Attendance</h3>
                        </div>
                        <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {myAttendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                        <Pie
                                            data={myAttendanceData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            stroke="none"
                                        >
                                            {myAttendanceData.map((entry, index) => (
                                                <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-center" style={{ color: 'var(--text-muted)' }}>No attendance data available</div>
                            )}
                        </div>
                        {myAttendanceData.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                {myAttendanceData.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.fill }}></span>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('EmployeeDashboard.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

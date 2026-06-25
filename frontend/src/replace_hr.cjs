const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/HRDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('return (');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>HR Overview</h1>
                    <p>Human Resources & Analytics Dashboard</p>
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
                        <div className={\`kpi-trend \${kpi.trendType === 'down' && kpi.title !== 'Pending Approvals' && kpi.title !== 'On Leave' ? 'negative' : 'positive'}\`}>
                            {kpi.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} 
                            {kpi.trend} vs last month
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics */}
            <div className="module-analytics-section" style={{ gridTemplateColumns: '4fr 5fr 3fr' }}>
                
                {/* Employee Distribution */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={18} /> Employee Distribution</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {employeeDistributionData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={employeeDistributionData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={85}
                                                paddingAngle={2}
                                                dataKey="value" stroke="none"
                                            >
                                                {employeeDistributionData.map((entry, index) => (
                                                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalEmployees}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Total</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                    {employeeDistributionData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Department Headcount */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Department Headcount</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {departmentHeadcountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentHeadcountData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }} barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} interval={0} angle={-25} textAnchor="end" dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <RechartsTooltip cursor={{fill: 'var(--bg-surface-hover)'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {departmentHeadcountData.map((entry, index) => (
                                            <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Birthdays + Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Upcoming Birthdays */}
                    <div className="analytics-card" style={{ padding: '20px' }}>
                        <div className="analytics-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Cake size={18} /> Upcoming Birthdays</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((bday, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                                        <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{bday.date.split(' ')[0]}</span>
                                        <span style={{ fontSize: '14px', color: 'var(--text-heading)', fontWeight: 800, lineHeight: 1, marginTop: '2px' }}>{bday.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>{bday.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bday.dept}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No upcoming birthdays</div>
                            )}
                        </div>
                    </div>

                    {/* Recent HR Activity */}
                    <div className="analytics-card" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div className="analytics-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Recent Activity</h3>
                        </div>
                        <div style={{ overflowY: 'auto' }}>
                            {recentActivities.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {recentActivities.slice(0, 5).map((act, i) => (
                                        <div key={act.id || i} style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-body)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Activity size={14} />
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: i < recentActivities.slice(0, 5).length - 1 ? '12px' : '0', borderBottom: i < recentActivities.slice(0, 5).length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.description}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>{formatTime(act.time)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-center" style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0' }}>No activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Leaves Table */}
            <div className="analytics-card" style={{ marginTop: '24px' }}>
                <div className="analytics-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> Pending Leave Requests</h3>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                    {leavesData.filter(l => l.status === 'Pending').length > 0 ? (
                        <table className="enterprise-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leavesData.filter(l => l.status === 'Pending').slice(0, 5).map((l, i) => (
                                    <tr key={i}>
                                        <td><strong>{l.employeeName || 'Unknown'}</strong></td>
                                        <td>{l.leaveType}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                background: 'rgba(245,158,11,0.1)', color: '#F59E0B'
                                            }}>{l.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>No pending leave requests</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('HRDashboard.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

const fs = require('fs');

const fixDashboard = (file, newReturn) => {
    let content = fs.readFileSync(file, 'utf8');
    const returnIndex = content.lastIndexOf('return (');
    if(returnIndex !== -1) {
       const beforeReturn = content.slice(0, returnIndex);
       fs.writeFileSync(file, beforeReturn + newReturn);
       console.log(file + ' successfully replaced');
    } else {
        console.log('Could not find return statement in ' + file);
    }
};

const managerReturn = `return (
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
                                                    return [\`\${value} (\${Number(pct.toFixed(1))}%) \`, name];
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
fixDashboard('c:/Users/Admin/Documents/project/frontend/src/pages/ManagerDashboard.jsx', managerReturn);

const employeeReturn = `return (
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
fixDashboard('c:/Users/Admin/Documents/project/frontend/src/pages/EmployeeDashboard.jsx', employeeReturn);

const hrReturn = `return (
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
fixDashboard('c:/Users/Admin/Documents/project/frontend/src/pages/HRDashboard.jsx', hrReturn);

const salesReturn = `return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Sales Overview</h1>
                    <p>Pipeline & Revenue Dashboard</p>
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
            <div className="module-analytics-section" style={{ gridTemplateColumns: '4fr 5fr 3fr' }}>
                
                {/* Lead Sources */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Lead Sources</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {leadSourceData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                                {leadSourceData.map((entry, index) => (
                                                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalLeads}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Leads</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                    {leadSourceData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name} ({item.percentage}%)
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No Lead Data Available</div>
                        )}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><TrendingUp size={18} /> Revenue Trend</h3>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>6-Month Total</div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(trendTotalRevenue)}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {monthsWithRevenue >= 2 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={formatYAxis} width={60} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatIndianCurrency, fill: 'var(--text-heading)', fontSize: 12, fontWeight: 600, dy: -5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : monthsWithRevenue === 1 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px', height: '100%', justifyContent: 'center' }}>
                                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Revenue</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(thisMonthRevenue)}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Growth Trend</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: revGrowth >= 0 ? 'var(--success)' : 'var(--danger)' }}>{growthTrend}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No Revenue Data</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="analytics-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3>Sales Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                        {[
                            { path: '/crm/leads', name: 'Leads', icon: Filter, color: '#3b82f6' },
                            { path: '/crm/pipeline', name: 'Pipeline', icon: Layers, color: '#8b5cf6' },
                            { path: '/crm/customers', name: 'Customers', icon: Users, color: '#10b981' },
                            { path: '/sales/revenue', name: 'Revenue', icon: DollarSign, color: '#f59e0b' },
                            { path: '/sales/goals', name: 'Goals', icon: Target, color: '#ec4899' },
                            { path: '/quotations', name: 'Quotes', icon: FileText, color: '#64748b' }
                        ].map((link, idx) => (
                            <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: \`\${link.color}15\`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                    <link.icon size={18} />
                                </div>
                                {link.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Executives Table */}
            <div className="analytics-card" style={{ marginTop: '24px' }}>
                <div className="analytics-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} /> Top Sales Executives</h3>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                    {topExecutives.length > 0 ? (
                        <table className="enterprise-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topExecutives.map((exec, i) => (
                                    <tr key={i}>
                                        <td><strong>{exec.name}</strong></td>
                                        <td>{exec.deliveries}</td>
                                        <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>{exec.revenue}</span></td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                background: exec.rank === 1 ? 'rgba(245,158,11,0.1)' : 'var(--bg-surface-hover)', 
                                                color: exec.rank === 1 ? '#F59E0B' : 'var(--text-muted)'
                                            }}>
                                                #{exec.rank}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>No Sales Performance Data Available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
`;
fixDashboard('c:/Users/Admin/Documents/project/frontend/src/pages/SalesDashboard.jsx', salesReturn);

const fs = require('fs');

const path = 'c:/Users/Admin/Documents/project/frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

// The original code has <div className="db-main-grid"> containing everything.
// We will replace everything inside db-content with our new structure.
const startIndex = code.indexOf('<div className="db-main-grid">');
const endIndex = code.indexOf('</div>\n    </div>\n  );\n};');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find replacement bounds");
    process.exit(1);
}

const newLayout = `
      {/* ── MASTER LAYOUT ── */}
      <div className="db-master-grid">
        
        {/* LEFT PANE: 9 columns */}
        <div className="db-left-pane">
          
          {/* KPI Cards */}
          <div className="db-kpi-grid">
            <KpiCard title="SYSTEM HEALTH" value="100%" subtitle="All services running" icon={Activity} color="#16A34A" badge="Excellent" badgeColor="#DCFCE7" badgeText="#16A34A" />
            <KpiCard title="REVENUE TODAY" value="₹74.8k" subtitle="Year-to-date" icon={DollarSign} color="#2563EB" badge="vs yesterday" badgeColor="#DCFCE7" badgeText="#16A34A" trend="up" />
            <KpiCard title="ORDERS TODAY" value="2" subtitle="Active orders" icon={ShoppingCart} color="#EA580C" badge="0 pending" badgeColor="#FEE2E2" badgeText="#DC2626" trend="down" />
            <KpiCard title="ACTIVE EMPLOYEES" value="5" subtitle="0 present today" icon={Users} color="#9333EA" badge="vs last month" badgeColor="#DCFCE7" badgeText="#16A34A" trend="up" />
          </div>

          {/* Quick Actions */}
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Quick Actions</div></div>
            <div className="db-card-body">
              <div className="db-qa-grid">
                <QuickAction icon={Calendar} label="Attendance" color="#ef4444" bg="#fef2f2" path="/attendance" />
                <QuickAction icon={UserPlus} label="Employee" color="#8b5cf6" bg="#f5f3ff" path="/employees" />
                <QuickAction icon={CreditCard} label="Payroll" color="#22c55e" bg="#f0fdf4" path="/payroll" />
                <QuickAction icon={Package} label="Inventory" color="#f97316" bg="#fff7ed" path="/materials" />
                <QuickAction icon={LineChartIcon} label="Sales" color="#ec4899" bg="#fdf2f8" path="/sales" />
                <QuickAction icon={Briefcase} label="Vendors" color="#6366f1" bg="#eef2ff" path="/vendors" />
                <QuickAction icon={FileText} label="Reports" color="#3b82f6" bg="#eff6ff" path="/reports" />
                <QuickAction icon={Settings} label="Settings" color="#475569" bg="#f8fafc" path="/settings" />
              </div>
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="db-stats-mini-grid">
            <MiniStat title="Total Employees" value="256" subtitle="↓ this month" subColor="#22C55E" icon={Users} iconColor="#3B82F6" />
            <MiniStat title="Present Today" value="245" subtitle="95.7%" subColor="#22C55E" icon={UserCheck} iconColor="#22C55E" />
            <MiniStat title="Pending Leaves" value="12" subtitle="Needs Approval" subColor="#F97316" icon={Calendar} iconColor="#F97316" />
            <MiniStat title="Active Materials" value="1,245" subtitle="In inventory" subColor="#3B82F6" icon={Layers} iconColor="#3B82F6" />
            <MiniStat title="Open P.O Orders" value="18" subtitle="Total Open" subColor="#EF4444" icon={ShoppingCart} iconColor="#EF4444" />
            <MiniStat title="Today's Revenue" value="₹4.28L" subtitle="↑ 18.6%" subColor="#22C55E" icon={DollarSign} iconColor="#22C55E" />
            <MiniStat title="Monthly Sales" value="₹28.45L" subtitle="↑ 12.4%" subColor="#22C55E" icon={LineChartIcon} iconColor="#3B82F6" />
            <MiniStat title="Pending Tasks" value="23" subtitle="Due Soon" subColor="#F97316" icon={List} iconColor="#F97316" />
          </div>

        </div>

        {/* RIGHT PANE: 3 columns */}
        <div className="db-right-pane">
          <div className="db-card" style={{ height: '100%' }}>
            <div className="db-profile-banner profile-banner-admin">
              <div className="db-profile-avatar profile-avatar-admin">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>
            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name || "Karthik"}</div>
              <div className="db-profile-role">{user?.role || "System Administrator"}</div>
              <div className="db-profile-badge profile-badge-admin">Full Access</div>
              <div className="db-profile-info">
                <div className="db-profile-info-row"><span className="db-profile-info-label">Admin ID</span><span className="db-profile-info-val">ADM-1001</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Department</span><span className="db-profile-info-val">Administration</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val">{user?.email || "admin@smtbms.com"}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Last Login</span><span className="db-profile-info-val">{fmtTime(new Date())}</span></div>
              </div>
              <button className="db-profile-btn" onClick={() => navigate("/profile")}>
                View Profile <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRID (12 columns) ── */}
      <div className="db-bottom-grid">
        
        {/* ROW 4 */}
        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title">System Status</div><span className="db-card-link">View All</span></div>
          <div className="db-status-list">
            <StatusRow name="Backend API" status="Healthy" />
            <StatusRow name="Database" status="Healthy" />
            <StatusRow name="Authentication" status="Healthy" />
            <StatusRow name="Storage" status="Healthy" />
            <StatusRow name="Backup" status="Healthy" />
            <StatusRow name="Mail Service" status="Healthy" />
          </div>
        </div>

        <div className="db-card db-col-3">
          <div className="db-card-header">
            <div className="db-card-title">Revenue Trend</div>
            <select className="db-panel-select" value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)}><option value="current">This Month</option></select>
          </div>
          <div className="db-card-body">
            <div className="db-chart-wrap">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="db-empty">No revenue data available</div>}
            </div>
          </div>
        </div>

        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title">Employee Attendance</div><span style={{fontSize: 11, color: "#6B7280"}}>This Week</span></div>
          <div className="db-card-body" style={{alignItems:"center", gap: 12}}>
            <div className="db-donut-wrap" style={{position:"relative"}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                <div style={{fontSize: 20, fontWeight: 800, color: "#111827"}}>{attendancePct}%</div>
                <div style={{fontSize: 10, color: "#6B7280"}}>Present</div>
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 12}}>
              <span style={{color: "#16A34A", fontWeight: 600}}>● Present {attendanceTotal} (95.7%)</span>
              <span style={{color: "#DC2626", fontWeight: 600}}>● Absent {attendanceAbsent} (4.3%)</span>
            </div>
          </div>
        </div>

        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title">Recent Activity</div><span className="db-card-link">View All</span></div>
          <div className="db-activity-list">
            <ActivityItem icon={UserPlus} iconBg="#F3E8FF" iconColor="#9333EA" title="Employee Added" desc="New employee John Doe added" time="10:25 AM" />
            <ActivityItem icon={CreditCard} iconBg="#FCE7F3" iconColor="#DB2777" title="Payroll Generated" desc="June payroll generated successfully" time="09:45 AM" />
            <ActivityItem icon={Package} iconBg="#FEF08A" iconColor="#CA8A04" title="Material Updated" desc="Cement stock updated" time="09:15 AM" />
            <ActivityItem icon={Calendar} iconBg="#DCFCE7" iconColor="#16A34A" title="Leave Approved" desc="Leave request approved" time="08:55 AM" />
            <ActivityItem icon={Database} iconBg="#DBEAFE" iconColor="#2563EB" title="Backup Completed" desc="Daily backup completed" time="08:20 AM" />
          </div>
        </div>

        <div className="db-card db-col-3">
          <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link">View All</span></div>
          <div className="db-notif-list">
            {notifications.length > 0 ? notifications.slice(0, 5).map((n, i) => {
              const colors = ["#22c55e", "#f97316", "#a855f7", "#ef4444", "#3b82f6"];
              return (
                <div key={i} className="db-notif-item">
                  <div className="db-notif-dot" style={{ background: colors[i % colors.length] }} />
                  <div className="db-notif-body">
                    <div className="db-notif-text">{n.message}</div>
                    <div className="db-notif-time">{fmtTime(n.date)}</div>
                  </div>
                </div>
              );
            }) : <div className="db-empty">All caught up! ✨</div>}
          </div>
        </div>

        {/* ROW 5 */}
        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title"><Cpu size={16} style={{display:"inline", color:"#8b5cf6"}}/> AI Insights</div></div>
          <div className="db-ai-insights">
            <div className="db-ai-item"><div className="db-ai-dot" style={{background:"#3B82F6"}}/><div className="db-ai-text">Revenue increased 18% compared to yesterday.</div></div>
            <div className="db-ai-item"><div className="db-ai-dot" style={{background:"#22C55E"}}/><div className="db-ai-text">12 leave requests require approval.</div></div>
            <div className="db-ai-item"><div className="db-ai-dot" style={{background:"#F97316"}}/><div className="db-ai-text">Inventory for Cement is below threshold.</div></div>
            <div className="db-ai-item"><div className="db-ai-dot" style={{background:"#EF4444"}}/><div className="db-ai-text">Payroll deadline is tomorrow.</div></div>
            <div className="db-ai-item"><div className="db-ai-dot" style={{background:"#8B5CF6"}}/><div className="db-ai-text">Expected monthly profit: ₹8.4 Lakhs.</div></div>
          </div>
        </div>

        <div className="db-card db-col-3">
          <div className="db-card-header"><div className="db-card-title">Top Selling Materials</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
          <div className="db-bar-list">
            <div className="db-bar-item">
              <div className="db-bar-label"><span>Cement</span><span>1,250 Tons</span></div>
              <div className="db-bar-track"><div className="db-bar-fill" style={{width: '90%', background: '#3B82F6'}} /></div>
            </div>
            <div className="db-bar-item">
              <div className="db-bar-label"><span>Steel</span><span>980 Tons</span></div>
              <div className="db-bar-track"><div className="db-bar-fill" style={{width: '75%', background: '#3B82F6'}} /></div>
            </div>
            <div className="db-bar-item">
              <div className="db-bar-label"><span>Bricks</span><span>750 Tons</span></div>
              <div className="db-bar-track"><div className="db-bar-fill" style={{width: '60%', background: '#3B82F6'}} /></div>
            </div>
            <div className="db-bar-item">
              <div className="db-bar-label"><span>Sand</span><span>620 Tons</span></div>
              <div className="db-bar-track"><div className="db-bar-fill" style={{width: '45%', background: '#3B82F6'}} /></div>
            </div>
            <div className="db-bar-item">
              <div className="db-bar-label"><span>Paint</span><span>410 Units</span></div>
              <div className="db-bar-track"><div className="db-bar-fill" style={{width: '30%', background: '#3B82F6'}} /></div>
            </div>
          </div>
        </div>

        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title">Sales Analytics</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
          <div className="db-card-body" style={{alignItems:"center", gap: 12}}>
            <div className="db-donut-wrap" style={{position:"relative"}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{value: 40}, {value: 30}, {value: 20}, {value: 10}]} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                    <Cell fill="#3B82F6" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#10B981" />
                    <Cell fill="#6366F1" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                <div style={{fontSize: 12, color: "#6B7280"}}>Total Sales</div>
                <div style={{fontSize: 16, fontWeight: 800, color: "#111827"}}>₹28.45L</div>
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 11}}>
              <span style={{color: "#3B82F6", fontWeight: 600}}>● Construction (40%)</span>
              <span style={{color: "#F59E0B", fontWeight: 600}}>● Real Estate (30%)</span>
              <span style={{color: "#10B981", fontWeight: 600}}>● Manufacturing (20%)</span>
              <span style={{color: "#6366F1", fontWeight: 600}}>● Others (10%)</span>
            </div>
          </div>
        </div>

        <div className="db-card db-col-2">
          <div className="db-card-header"><div className="db-card-title">Monthly Profit</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
          <div className="db-card-body" style={{padding:0, paddingTop: 10}}>
            <div className="db-profit-val">₹8.45L</div>
            <div className="db-profit-sub" style={{color: "#16A34A", fontWeight: 600}}>↑ 14.6% vs last month</div>
            <div style={{width:"100%", height:"120px", marginTop: "auto"}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARK.map((v,i)=>({i,v}))}>
                  <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="db-card db-col-3">
          <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
          <div className="db-event-list">
             <div className="db-event-item">
               <div className="db-event-date" style={{background: "#FEE2E2", color: "#DC2626"}}><div className="db-event-day">31</div><div className="db-event-mon">JUL</div></div>
               <div className="db-event-body"><div className="db-event-title">Payroll Processing</div><div className="db-event-sub">31 July, 2026</div></div>
             </div>
             <div className="db-event-item">
               <div className="db-event-date" style={{background: "#DBEAFE", color: "#2563EB"}}><div className="db-event-day">05</div><div className="db-event-mon">AUG</div></div>
               <div className="db-event-body"><div className="db-event-title">Management Meeting</div><div className="db-event-sub">05 August, 2026</div></div>
             </div>
             <div className="db-event-item">
               <div className="db-event-date" style={{background: "#DCFCE7", color: "#16A34A"}}><div className="db-event-day">15</div><div className="db-event-mon">AUG</div></div>
               <div className="db-event-body"><div className="db-event-title">Monthly Audit</div><div className="db-event-sub">15 August, 2026</div></div>
             </div>
          </div>
        </div>

      </div>
`;

code = code.substring(0, startIndex) + newLayout + '\n    </div>\n  );\n};\nexport default AdminDashboard;';
fs.writeFileSync(path, code);
console.log('JSX rebuilt with perfect master grid.');

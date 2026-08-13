const fs = require('fs');

const path = 'c:/Users/Admin/Documents/project/frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

// We need to reorder the bento grid items.
// Let's just rewrite the bento grid section.

const startIdx = code.indexOf('{/* ── Bento Grid ── */}');
const endIdx = code.indexOf('</div>\n    </div>\n  );\n};');

if (startIdx !== -1 && endIdx !== -1) {
    let newGrid = `
        {/* ── Bento Grid ── */}
        <div className="db-bento">
          
          {/* Row 1: Main Charts */}
          <div className="db-card db-col-8">
            <div className="db-card-header">
              <div className="db-card-title">Revenue Trend</div>
              <select className="db-panel-select" value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)}>
                <option value="current">This Month</option>
                <option value="last">Last Month</option>
              </select>
            </div>
            <div className="db-card-body">
              <div className="db-chart-wrap">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="db-empty">No revenue data available</div>
                )}
              </div>
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">Employee Attendance</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Week</span>
            </div>
            <div className="db-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="db-donut-wrap" style={{ position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                      {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{attendancePct}%</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>Present</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <span style={{ color: "#6366f1", fontWeight: 600 }}>● Present {attendanceTotal}</span>
                <span style={{ color: "#E2E8F0", fontWeight: 600 }}>● Absent {attendanceAbsent}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Activity and Profile */}
          <div className="db-card db-col-8">
            <div className="db-card-header">
              <div className="db-card-title">Recent Activity</div>
              <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
            </div>
            <div className="db-activity-list">
              {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((a, i) => {
                const lo = (a.text || "").toLowerCase();
                let Icon = Activity, bg = "#EFF6FF", col = "#3B82F6";
                if (lo.includes("order") || lo.includes("sale")) { Icon = ShoppingCart; bg = "#FFEDD5"; col = "#F97316"; }
                else if (lo.includes("stock") || lo.includes("inventory")) { Icon = Box; bg = "#ECFEFF"; col = "#06B6D4"; }
                else if (lo.includes("user") || lo.includes("logged")) { Icon = Users; bg = "#F3E8FF"; col = "#A855F7"; }
                else if (lo.includes("payment") || lo.includes("invoice")) { Icon = DollarSign; bg = "#DCFCE7"; col = "#22C55E"; }
                return (
                  <ActivityItem
                    key={i} icon={Icon} iconBg={bg} iconColor={col}
                    title={a.user || "System"} desc={a.text} time={fmtTime(a.timestamp || new Date())}
                  />
                );
              }) : (
                <div className="db-empty">No recent activity</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-profile-banner profile-banner-admin">
              <div className="db-profile-avatar profile-avatar-admin">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>
            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name || "Karthik Raja"}</div>
              <div className="db-profile-role">{user?.role || "System Administrator"}</div>
              <div className="db-profile-badge profile-badge-admin">Full Access</div>
              <div className="db-profile-info">
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Admin ID</span>
                  <span className="db-profile-info-val">ADM-1001</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Email</span>
                  <span className="db-profile-info-val">{user?.email || "admin@smtbms.com"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Last Login</span>
                  <span className="db-profile-info-val">{fmtTime(new Date())}</span>
                </div>
              </div>
              <button className="db-profile-btn" onClick={() => navigate("/profile")}>
                View Profile <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Row 3: Status, Alerts, Notifications */}
          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">System Status</div>
              <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
            </div>
            <div className="db-status-list">
              <StatusRow name="Backend API" status="Healthy" />
              <StatusRow name="Database" status="Healthy" />
              <StatusRow name="Authentication" status="Healthy" />
              <StatusRow name="Storage" status="Healthy" />
              <StatusRow name="Backup" status="Healthy" />
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">Inventory Alerts</div>
            </div>
            <div className="db-status-list">
              {lowStock.length === 0 ? (
                <div className="db-empty">No low-stock alerts 🎉</div>
              ) : lowStock.slice(0, 5).map((m, i) => (
                <div key={i} className="db-status-row">
                  <span className="db-status-name">{m.name || m.materialName}</span>
                  <span className="db-status-badge status-critical">{m.currentStock ?? m.quantity ?? 0} left</span>
                </div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">Notifications</div>
              <span className="db-card-link" onClick={() => navigate("/settings")}>View All</span>
            </div>
            <div className="db-notif-list">
              {notifications.length > 0 ? notifications.slice(0, 4).map((n, i) => {
                const colors = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#eab308"];
                return (
                  <div key={i} className="db-notif-item">
                    <div className="db-notif-dot" style={{ background: colors[i % colors.length] }} />
                    <div className="db-notif-body">
                      <div className="db-notif-text">{n.message}</div>
                      <div className="db-notif-time">{fmtTime(n.date)}</div>
                    </div>
                  </div>
                );
              }) : (
                <div className="db-empty">All caught up! ✨</div>
              )}
            </div>
          </div>

          {/* Row 4: Analytics */}
          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Profit</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">₹1.50L</div>
              <div className="db-profit-sub">↑ 6.7% vs last month</div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v, i) => ({ i, v }))}>
                    <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title">Upcoming Events</div>
            </div>
            <div className="db-event-list">
              <br/>
              {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
                <div key={i} className="db-event-item">
                  <div className="db-event-date" style={{ background: e.color }}>
                    <div className="db-event-day">{e.day}</div>
                    <div className="db-event-mon">{e.mon}</div>
                  </div>
                  <div className="db-event-body">
                    <div className="db-event-title">{e.title}</div>
                    <div className="db-event-sub">{e.sub}</div>
                  </div>
                </div>
              )) : (
                <div className="db-empty" style={{padding: "10px"}}>No events scheduled</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-4">
            <div className="db-card-header">
              <div className="db-card-title"><Cpu size={16} style={{display:"inline", color:"#8b5cf6"}}/> AI Insights</div>
            </div>
            <div className="db-ai-insights">
              <br/>
              {aiInsights.length > 0 ? aiInsights.map((ins, i) => {
                const colors = ["#6366f1", "#f97316", "#22c55e", "#ef4444"];
                return (
                  <div key={i} className="db-ai-item">
                    <div className="db-ai-dot" style={{ background: colors[i % colors.length] }} />
                    <div className="db-ai-text">{ins}</div>
                  </div>
                );
              }) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

        </div>
    `;
    code = code.substring(0, startIdx) + newGrid + '\n      </div>\n    </div>\n  );\n};\nexport default AdminDashboard;';
    fs.writeFileSync(path, code);
    console.log('Successfully reordered Bento Grid in AdminDashboard.jsx');
} else {
    console.log('Could not find replace targets');
}

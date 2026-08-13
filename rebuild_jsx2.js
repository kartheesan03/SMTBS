const fs = require('fs');

const path = 'c:/Users/Admin/Documents/project/frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

const startIndex = code.indexOf('{/* ── Greeting Bar ── */}');
const endIndex = code.lastIndexOf('</div>\n    </div>\n  );\n};');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find replacement bounds");
    process.exit(1);
}

const newLayout = `
        {/* ── Greeting Bar ── */}
        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">Good Morning, {user?.name?.split(" ")[0] || "Admin"}! 👋</div>
            <div className="db-greeting-sub">Welcome back! You're doing great today.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">
              <Calendar size={14} style={{display:"inline", marginRight:4}} />
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              &nbsp;&nbsp;&nbsp;
              <Clock size={14} style={{display:"inline", marginRight:4}} />
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="db-status-pill"><div className="db-status-dot" />All Systems Operational</div>
          </div>
        </div>

        {/* ── MASTER LAYOUT ── */}
        <div className="db-master-grid">
          
          {/* LEFT PANE: 9 columns */}
          <div className="db-left-pane">
            
            {/* KPI Cards */}
            <div className="db-kpi-grid">
              <KpiCard icon={Activity} iconClass="green" label="System Health" value="100%" trend="Excellent" trendUp={true} sub="All services running" />
              <KpiCard icon={DollarSign} iconClass="blue" label="Revenue Today" value={fmtINR(totalRevenue)} trend="vs yesterday" trendUp={true} sub="Year-to-date" />
              <KpiCard icon={ShoppingCart} iconClass="orange" label="Orders Today" value={activeOrders} trend={pendingOrders+" pending"} trendUp={false} sub="Active orders" />
              <KpiCard icon={Users} iconClass="purple" label="Active Employees" value={totalEmployees} trend="vs last month" trendUp={true} sub={attendanceTotal+" present today"} />
            </div>

            {/* Quick Actions */}
            <div className="db-card" style={{padding: "16px 20px"}}>
              <div style={{fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 16}}>Quick Actions</div>
              <div className="db-qa-grid" style={{display: 'flex', justifyContent: 'space-between'}}>
                <QaBtn icon={Calendar} label="Attendance" colorClass="qa-red" onClick={() => navigate("/attendance")} />
                <QaBtn icon={UserPlus} label="Employee" colorClass="qa-purple" onClick={() => navigate("/employees")} />
                <QaBtn icon={CreditCard} label="Payroll" colorClass="qa-green" onClick={() => navigate("/payroll")} />
                <QaBtn icon={Box} label="Inventory" colorClass="qa-orange" onClick={() => navigate("/materials")} />
                <QaBtn icon={LineChartIcon} label="Sales" colorClass="qa-pink" onClick={() => navigate("/orders")} />
                <QaBtn icon={Briefcase} label="Vendors" colorClass="qa-indigo" onClick={() => navigate("/vendors")} />
                <QaBtn icon={FileText} label="Reports" colorClass="qa-blue" onClick={() => navigate("/analytics")} />
                <QaBtn icon={Settings} label="Settings" colorClass="qa-slate" onClick={() => navigate("/settings")} />
              </div>
            </div>

            {/* Mini Stats */}
            <div className="db-card" style={{padding: "16px 20px"}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 16}}>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Total Employees</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Users size={16} color="#3B82F6"/> {totalEmployees}</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ this month</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Present Today</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><UserCheck size={16} color="#22c55e"/> {attendanceTotal}</div><div style={{fontSize: 10, color: "#22c55e"}}>{attendancePct}%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Pending Leaves</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Calendar size={16} color="#f97316"/> {dashboardData?.hrStats?.pendingLeaves || 0}</div><div style={{fontSize: 10, color: "#f97316"}}>Needs Approval</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Active Materials</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Layers size={16} color="#3B82F6"/> {totalMaterials}</div><div style={{fontSize: 10, color: "#3B82F6"}}>In inventory</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Open P.O Orders</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><ShoppingCart size={16} color="#ef4444"/> 18</div><div style={{fontSize: 10, color: "#ef4444"}}>Total Open</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Today's Revenue</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><DollarSign size={16} color="#22c55e"/> {fmtINR(totalRevenue)}</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ 18.6%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Monthly Sales</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><LineChartIcon size={16} color="#3b82f6"/> ₹28.45L</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ 12.4%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Pending Tasks</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><ListTodo size={16} color="#f97316"/> {pendingTasks}</div><div style={{fontSize: 10, color: "#f97316"}}>Due Soon</div></div>
              </div>
            </div>

          </div>

          {/* RIGHT PANE: 3 columns */}
          <div className="db-right-pane">
            <div className="db-card" style={{ height: '100%' }}>
              <div className="db-card-body" style={{ alignItems: "center", textAlign: "center", paddingTop: 40 }}>
                <div style={{width: 80, height: 80, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold", color: "#64748b", marginBottom: 16}}>
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div style={{fontSize: 18, fontWeight: 700, color: "#111827"}}>{user?.name || "Karthik"}</div>
                <div style={{fontSize: 12, color: "#64748b", marginBottom: 16}}>{user?.role || "System Administrator"}</div>
                <div style={{background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4, marginBottom: 24}}>Full Access</div>
                
                <div style={{width: "100%", textAlign: "left", fontSize: 11, display: "flex", flexDirection: "column", gap: 12}}>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Admin ID</span><span style={{fontWeight: 600}}>ADM-1001</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Department</span><span style={{fontWeight: 600}}>Administration</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Email</span><span style={{fontWeight: 600}}>{user?.email || "admin@smtbms.com"}</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Last Login</span><span style={{fontWeight: 600}}>{now.toLocaleDateString()}</span></div>
                </div>

                <div style={{marginTop: "auto", width: "100%", paddingTop: 20}}>
                  <button onClick={() => navigate("/profile")} style={{width: "100%", padding: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer"}}>View Profile →</button>
                </div>
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
            <div className="db-card-body" style={{padding:0}}>
              <div className="db-chart-wrap">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={{r:3, fill:"#3b82f6"}} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="db-empty">No revenue data available</div>}
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Employee Attendance</div><span style={{fontSize: 11, color: "#6B7280"}}>This Week</span></div>
            <div className="db-card-body" style={{alignItems:"center", justifyContent:"center"}}>
              <div className="db-donut-wrap" style={{position:"relative", height: 160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#16A34A" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                  <div style={{fontSize: 20, fontWeight: 800, color: "#111827"}}>{attendancePct}%</div>
                  <div style={{fontSize: 10, color: "#6B7280"}}>Present</div>
                </div>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 11, marginTop: 16}}>
                <div style={{display: "flex", alignItems: "center", gap: 4}}><div style={{width: 8, height: 8, borderRadius: "50%", background: "#16A34A"}}/> <span style={{fontWeight: 600}}>Present</span> <span style={{marginLeft: "auto"}}>{attendanceTotal} ({attendancePct}%)</span></div>
                <div style={{display: "flex", alignItems: "center", gap: 4}}><div style={{width: 8, height: 8, borderRadius: "50%", background: "#ef4444"}}/> <span style={{fontWeight: 600}}>Absent</span> <span style={{marginLeft: "auto"}}>{attendanceAbsent} ({100-attendancePct}%)</span></div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Recent Activity</div><span className="db-card-link">View All</span></div>
            <div className="db-activity-list" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#e11d48", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>A</div>
                <div><div style={{fontSize: 11, fontWeight: 600}}>Employee Added</div><div style={{fontSize: 10, color: "#64748b"}}>New employee John Doe added</div></div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>10:25 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>S</div>
                <div><div style={{fontSize: 11, fontWeight: 600}}>Payroll Generated</div><div style={{fontSize: 10, color: "#64748b"}}>June payroll generated successfully</div></div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>09:45 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>C</div>
                <div><div style={{fontSize: 11, fontWeight: 600}}>Material Updated</div><div style={{fontSize: 10, color: "#64748b"}}>Cement stock updated</div></div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>09:15 AM</div>
              </div>
              <div style={{display: "flex", gap: 12}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}><CheckCircle2 size={12}/></div>
                <div><div style={{fontSize: 11, fontWeight: 600}}>Leave Approved</div><div style={{fontSize: 10, color: "#64748b"}}>Leave request approved</div></div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>08:55 AM</div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link">View All</span></div>
            <div className="db-notif-list" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center"}}><UserPlus size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500}}>New employee registered</div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>10:20 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center"}}><Box size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500}}>Inventory low for Cement</div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>09:50 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#f3e8ff", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center"}}><CreditCard size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500}}>Payroll for June pending</div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>09:45 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center"}}><ShoppingCart size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500}}>New order received</div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>09:30 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center"}}><Database size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500}}>Backup completed successfully</div>
                <div style={{fontSize: 10, color: "#64748b", marginLeft: "auto"}}>08:20 AM</div>
              </div>
            </div>
          </div>

          {/* ROW 5 */}
          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">AI Insights</div></div>
            <div className="db-ai-insights" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 8, marginBottom: 12}}><div style={{width: 20}}><Cpu size={14} color="#3b82f6"/></div><div style={{fontSize: 11, color: "#475569"}}>Revenue increased <span style={{color: "#10b981"}}>18%</span> compared to yesterday.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 12}}><div style={{width: 20}}><Cpu size={14} color="#10b981"/></div><div style={{fontSize: 11, color: "#475569"}}>12 leave requests require approval.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 12}}><div style={{width: 20}}><Cpu size={14} color="#f59e0b"/></div><div style={{fontSize: 11, color: "#475569"}}>Inventory for Cement is below threshold.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 12}}><div style={{width: 20}}><Cpu size={14} color="#ef4444"/></div><div style={{fontSize: 11, color: "#475569"}}>Payroll deadline is tomorrow.</div></div>
              <div style={{display: "flex", gap: 8}}><div style={{width: 20}}><Cpu size={14} color="#8b5cf6"/></div><div style={{fontSize: 11, color: "#475569"}}>Expected monthly profit: ₹8.4 Lakhs.</div></div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Top Selling Materials</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-bar-list" style={{padding: "0 20px 20px"}}>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4}}><span style={{fontWeight: 500}}>Cement</span><span style={{color: "#64748b"}}>1,250 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '90%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4}}><span style={{fontWeight: 500}}>Steel</span><span style={{color: "#64748b"}}>980 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '75%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4}}><span style={{fontWeight: 500}}>Bricks</span><span style={{color: "#64748b"}}>750 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '60%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4}}><span style={{fontWeight: 500}}>Sand</span><span style={{color: "#64748b"}}>620 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '45%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4}}><span style={{fontWeight: 500}}>Paint</span><span style={{color: "#64748b"}}>410 Units</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '30%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Sales Analytics</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-card-body" style={{alignItems:"center", justifyContent:"center"}}>
              <div className="db-donut-wrap" style={{position:"relative", height: 160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{value: 40}, {value: 30}, {value: 20}, {value: 10}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#3B82F6" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#10B981" />
                      <Cell fill="#6366F1" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                  <div style={{fontSize: 10, color: "#6B7280"}}>Total Sales</div>
                  <div style={{fontSize: 16, fontWeight: 800, color: "#111827"}}>₹28.45L</div>
                </div>
              </div>
              <div style={{display: "flex", flexWrap: "wrap", gap: 12, fontSize: 10, marginTop: 16, justifyContent: "center"}}>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#3B82F6"}}/> Construction 40%</div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#F59E0B"}}/> Real Estate 30%</div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#10B981"}}/> Manufacturing 20%</div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#6366F1"}}/> Others 10%</div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Monthly Profit</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-card-body" style={{padding:0, paddingTop: 10}}>
              <div style={{fontSize: 10, color: "#64748b", padding: "0 20px"}}>Total Profit</div>
              <div style={{fontSize: 24, fontWeight: 800, color: "#111827", padding: "0 20px"}}>₹8.45L</div>
              <div style={{fontSize: 11, color: "#16A34A", padding: "4px 20px", fontWeight: 500}}>↑ 14.6% vs last month</div>
              <div style={{width:"100%", height:"100px", marginTop: "auto"}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({i,v}))} margin={{top: 10, right: 0, left: 0, bottom: 0}}>
                    <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={3} dot={{r: 3, fill: "#22c55e"}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
            <div style={{padding: "0 20px 20px"}}>
               <div style={{display: "flex", gap: 16, marginBottom: 16}}>
                 <div style={{textAlign: "center", color: "#64748b"}}>
                   <div style={{fontSize: 14, fontWeight: 800, color: "#111827"}}>31</div>
                   <div style={{fontSize: 10, color: "#ef4444", fontWeight: 700}}>JUL</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Payroll Processing</div><div style={{fontSize: 11, color: "#64748b"}}>31 July, 2026</div></div>
               </div>
               <div style={{display: "flex", gap: 16, marginBottom: 16}}>
                 <div style={{textAlign: "center", color: "#64748b"}}>
                   <div style={{fontSize: 14, fontWeight: 800, color: "#111827"}}>05</div>
                   <div style={{fontSize: 10, color: "#ef4444", fontWeight: 700}}>AUG</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Management Meeting</div><div style={{fontSize: 11, color: "#64748b"}}>05 August, 2026</div></div>
               </div>
               <div style={{display: "flex", gap: 16}}>
                 <div style={{textAlign: "center", color: "#64748b"}}>
                   <div style={{fontSize: 14, fontWeight: 800, color: "#111827"}}>15</div>
                   <div style={{fontSize: 10, color: "#ef4444", fontWeight: 700}}>AUG</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Monthly Audit</div><div style={{fontSize: 11, color: "#64748b"}}>15 August, 2026</div></div>
               </div>
            </div>
          </div>

        </div>
`;

code = code.substring(0, startIndex) + newLayout + '\n      </div>\n    </div>\n  );\n};\nexport default AdminDashboard;';
fs.writeFileSync(path, code);
console.log('JSX rebuilt successfully');

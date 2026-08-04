import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  CheckCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  UserCheck,
  AlertCircle,
  Quote,
  Star,
  Award,
  Shield,
  CheckSquare,
  Activity,
  Book,
  MapPin,
  Coffee,
  MessageSquare,
  LayoutGrid,
  Bell,
  Cpu,
  Layers,
  Server,
  ListTodo,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import PageHeader from "../components/PageHeader";
import CommandCenter from "../components/CommandCenter";
import { IconQuickAction, InvRow } from "./AdminDashboard";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import WelcomeBanner from "../components/ui/WelcomeBanner";
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueTrendYear, setRevenueTrendYear] = useState("current");
  const [myTasks, setMyTasks] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, attRes, allTasksRes] = await Promise.all([
          API.get("/dashboard/stats").catch((e) => ({ data: {} })),
          API.get("/tasks/my").catch((e) => ({ data: [] })),
          API.get("/attendance/my-history").catch((e) => ({ data: [] })),
          API.get("/tasks").catch((e) => ({ data: [] })),
        ]);
        setDashboardData(statsRes.data || {});
        setMyTasks((tasksRes.data || []).slice(0, 5));
        setAttendanceStats(attRes.data || {});
        const now = new Date();
        const futureTasks = (allTasksRes.data || [])
          .filter((t) => t.dueDate && new Date(t.dueDate) >= now)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 3)
          .map((t) => {
            const d = new Date(t.dueDate);
            let col = "#4f46e5";
            let bg = "#e0e7ff";
            if (t.priority === "High") {
              col = "#ef4444";
              bg = "#fee2e2";
            }
            if (t.priority === "Low") {
              col = "#10b981";
              bg = "#d1fae5";
            }
            return {
              day: String(d.getDate()).padStart(2, "0"),
              month: d
                .toLocaleString("default", { month: "short" })
                .toUpperCase(),
              bg,
              col,
              title: t.title,
              desc: `${d.getDate()} ${d.toLocaleString("default", {
                month: "long",
              })} • ${d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            };
          });
        setUpcomingEvents(futureTasks);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#64748b",
        }}
      >
        Loading your dashboard...
      </div>
    );
  }
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const completedTasks = myTasks.filter(
    (t) => t.status === "Completed" || t.status === "Done"
  ).length;
  const pendingTasks = myTasks.filter(
    (t) => t.status !== "Completed" && t.status !== "Done"
  ).length;
  const employeeStats = dashboardData?.employeeStats || {};
  const attendanceRate = attendanceStats?.attendanceRate ?? dashboardData?.hrStats?.attendanceRate ?? "N/A";
  const leaveBalance = attendanceStats?.leaveBalance ?? "N/A";
  const currentStreak = attendanceStats?.currentStreak ?? 0;
  const leaveTaken = attendanceStats?.leaveTaken ?? 0;
  const pendingLeaves = employeeStats.myPendingLeaves || 0;
  const attendanceToday = employeeStats.attendanceToday || "-";
  return (
    <div className="rd-container theme-employee">
      <div className="rd-content">
        {/* ── 1. Hero Banner ── */}
        <WelcomeBanner
          user={user}
          greeting={`${getGreeting()}`}
          subtitle={`${new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })} · Your Daily Overview`}
          badges={[
            {
              icon: Activity,
              text: `${attendanceRate}% Attendance`,
              type: "neutral",
            },
            { type: "status", text: `${leaveBalance} Leave Days Left` },
          ]}
          rightVisuals={
            <>
              <div className="rd-visual-card">
                <div className="rd-vc-label">Performance</div>
                <div className="rd-vc-value">{typeof attendanceRate === 'number' ? `${attendanceRate}%` : attendanceRate}</div>
                <div
                  className="rd-vc-chart"
                  style={{ "--progress": `${typeof attendanceRate === 'number' ? attendanceRate : 0}%` }}
                ></div>
              </div>
              <div className="rd-visual-card">
                <div className="rd-vc-label">Activity</div>
                <div className="rd-vc-bars">
                  <div className="rd-vc-bar" style={{ height: "30%" }}></div>
                  <div className="rd-vc-bar" style={{ height: "60%" }}></div>
                  <div className="rd-vc-bar" style={{ height: "100%" }}></div>
                  <div className="rd-vc-bar" style={{ height: "80%" }}></div>
                  <div className="rd-vc-bar" style={{ height: "50%" }}></div>
                </div>
              </div>
            </>
          }
          actions={[
            {
              label: "Apply Leave",
              icon: CheckCircle,
              variant: "primary",
              onClick: () => navigate("/leave-management/history"),
            },
            {
              label: "Check In",
              icon: Clock,
              variant: "secondary",
              onClick: () => navigate("/attendance"),
            },
          ]}
        />
        {/* ── 2. KPI Row (6 columns) ── */}
        <StatsGrid columns={6}>
          <StatsCard
            title="Completed Tasks"
            value={completedTasks}
            colorTheme="mint"
            icon={CheckCircle}
            trendValue="This week"
            trendPositive={true}
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks}
            colorTheme="peach"
            icon={Clock}
            trendValue="Requires attention"
            trendPositive={false}
          />
          <StatsCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            colorTheme="blue"
            icon={Activity}
            trendValue="Excellent"
            trendPositive={true}
          />
          <StatsCard
            title="Leave Balance"
            value={leaveBalance}
            colorTheme="purple"
            icon={Calendar}
            trendValue="Days remaining"
            trendPositive={true}
          />
          <StatsCard
            title="Current Streak"
            value={`${currentStreak} days`}
            colorTheme="yellow"
            icon={TrendingUp}
            trendValue="Without absence"
            trendPositive={true}
          />
          <StatsCard
            title="Pending Leaves"
            value={pendingLeaves}
            colorTheme="pink"
            icon={AlertCircle}
            trendValue="Awaiting approval"
            trendPositive={false}
          />
        </StatsGrid>
        {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
        <div className="rd-middle-row">
          {/* Left: Quick Actions Grid */}
          <div className="dashboard-panel type-glass">
            <div className="panel-header">
              <div className="panel-title">Quick Actions</div>
            </div>
            <div className="qa-grid">
              <IconQuickAction
                icon={CheckCircle2}
                label="Check In"
                colorClass="bg-light-green"
                onClick={() => navigate("/attendance")}
              />
              <IconQuickAction
                icon={Calendar}
                label="Apply Leave"
                colorClass="bg-light-orange"
                onClick={() => navigate("/leave-management/history")}
              />
              <IconQuickAction
                icon={FileText}
                label="Pay Slips"
                colorClass="bg-light-purple"
                onClick={() => navigate("/coming-soon/payslips")}
              />
              <IconQuickAction
                icon={CheckSquare}
                label="My Tasks"
                colorClass="bg-light-blue"
                onClick={() => navigate("/my-tasks")}
              />
              <IconQuickAction
                icon={Book}
                label="Policies"
                colorClass="bg-light-gray"
                onClick={() => navigate("/coming-soon/policies")}
              />
              <IconQuickAction
                icon={MessageSquare}
                label="Messages"
                colorClass="bg-light-pink"
                onClick={() => navigate("/coming-soon/messages")}
              />
              <IconQuickAction
                icon={Coffee}
                label="Breaks"
                colorClass="bg-light-teal"
                onClick={() => navigate("/coming-soon/breaks")}
              />
              <IconQuickAction
                icon={MapPin}
                label="WFH Req."
                colorClass="bg-light-blue"
                onClick={() => navigate("/coming-soon/wfh")}
              />
              <IconQuickAction
                icon={Activity}
                label="Activity"
                colorClass="bg-light-orange"
                onClick={() => navigate("/coming-soon/activity")}
              />
              <IconQuickAction
                icon={Bell}
                label="Notifs"
                colorClass="bg-light-red"
                onClick={() => navigate("/notifications")}
              />
              <IconQuickAction
                icon={Star}
                label="Kudos"
                colorClass="bg-light-purple"
                onClick={() => navigate("/coming-soon/kudos")}
              />
              <IconQuickAction
                icon={LayoutGrid}
                label="Tasks"
                colorClass="bg-light-green"
                onClick={() => navigate("/my-tasks")}
              />
            </div>
          </div>
          <div className="dashboard-panel type-gradient" style={{ height: "100%", padding: 0, overflow: 'hidden' }}>
            <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
              <div className="panel-title">Task Performance</div>
            </div>
            
            <style>{`
              .kpi-list-container {
                display: flex;
                flex-direction: column;
              }
              .kpi-list-item {
                display: flex;
                align-items: center;
                padding: 16px 24px;
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.2s ease;
              }
              .kpi-list-item:hover {
                background-color: #f8fafc;
              }
              .kpi-list-item:last-child {
                border-bottom: none;
              }
              .kpi-list-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #f1f5f9;
                color: #475569;
                margin-right: 16px;
                flex-shrink: 0;
              }
              .kpi-list-content {
                flex: 1;
                min-width: 0;
              }
              .kpi-list-title {
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                margin-bottom: 2px;
              }
              .kpi-list-desc {
                font-size: 13px;
                color: #64748b;
              }
              .kpi-list-value {
                font-size: 20px;
                font-weight: 700;
                color: #0f172a;
                font-family: 'Inter', sans-serif;
                margin-left: 16px;
              }
            `}</style>
            
            <div className="kpi-list-container">
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><CheckSquare size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Total Tasks</div>
                  <div className="kpi-list-desc">Assigned</div>
                </div>
                <div className="kpi-list-value">{myTasks.length}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><AlertCircle size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Overdue</div>
                  <div className="kpi-list-desc">Tasks</div>
                </div>
                <div className="kpi-list-value">0</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Star size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">On Time</div>
                  <div className="kpi-list-desc">Delivery</div>
                </div>
                <div className="kpi-list-value">100%</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Clock size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Meetings</div>
                  <div className="kpi-list-desc">Today</div>
                </div>
                <div className="kpi-list-value">2</div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-panel type-glass" style={{ height: "100%", padding: 0, overflow: 'hidden' }}>
            <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
              <div className="panel-title">Engagement &amp; Growth</div>
            </div>
            
            <div className="kpi-list-container">
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Calendar size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Leave Taken</div>
                  <div className="kpi-list-desc">Days</div>
                </div>
                <div className="kpi-list-value">{leaveTaken}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Award size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Kudos</div>
                  <div className="kpi-list-desc">Received</div>
                </div>
                <div className="kpi-list-value">{dashboardData?.employeeStats?.kudos ?? "N/A"}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Book size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Training</div>
                  <div className="kpi-list-desc">Completed</div>
                </div>
                <div className="kpi-list-value">{dashboardData?.employeeStats?.trainingCompletion != null ? `${dashboardData.employeeStats.trainingCompletion}%` : "N/A"}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Activity size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Perf Score</div>
                  <div className="kpi-list-desc">/ 5.0</div>
                </div>
                <div className="kpi-list-value">{dashboardData?.employeeStats?.performanceScore ?? "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
        {/* ── 4. Chart Row 1: Productivity (wide) + Task Distribution ── */}
        <div className="rd-chart-row-wide">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Productivity Trend</div>
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
                value={revenueTrendYear}
                onChange={(e) => setRevenueTrendYear(e.target.value)}
              >
                <option value="current">This Year</option>
                <option value="last">Last Year</option>
              </select>
            </div>
            <div style={{ height: 220, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardData?.analytics?.employeeTrend || []}
                  margin={{ top: 4, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    width={48}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 0,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                    verticalAlign="top"
                    height={36}
                  />
                  <Line
                    type="monotone"
                    dataKey={
                      revenueTrendYear === "current"
                        ? "tasksCompleted"
                        : "lastTasksCompleted"
                    }
                    name="Tasks Completed"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={
                      revenueTrendYear === "current"
                        ? "hoursLogged"
                        : "lastHoursLogged"
                    }
                    name="Hours Logged"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={
                      revenueTrendYear === "current"
                        ? "efficiency"
                        : "lastEfficiency"
                    }
                    name="Efficiency (%)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Task Distribution</div>
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
              >
                <option>Current ▾</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: "100%", height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.charts?.erpDonut || []}
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                    >
                      {(dashboardData?.charts?.erpDonut || []).map(
                        (entry, index) => {
                          const colors = ["#3b82f6", "#f59e0b", "#8b5cf6"];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        }
                      )}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  width: "100%",
                }}
              >
                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => {
                  const colors = ["#3b82f6", "#f59e0b", "#8b5cf6"];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 11,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: "#475569",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "0px",
                            background: colors[idx % colors.length],
                          }}
                        ></div>
                        {entry.name}
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        {entry.value}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* ── 5. Activity Row: Recent Activity + Tasks ── */}
        <div className="rd-two-col">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">My Recent Activity</div>
              <a href="/notifications" className="panel-action">
                View All
              </a>
            </div>
            <div className="feed-list">
              {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                (dashboardData?.tables?.recentActivity || [])
                  .slice(0, 8)
                  .map((activity, idx) => {
                    // Derive icon and colors from iconType field set by backend
                    let IconComp = Activity;
                    let iconColor = "#6366f1";
                    let iconBg = "#eef2ff";
                    const iType = activity.iconType || "";
                    if (iType === "checkin")          { IconComp = Clock;         iconColor = "#3b82f6"; iconBg = "#eff6ff"; }
                    else if (iType === "checkout")    { IconComp = UserCheck;     iconColor = "#10b981"; iconBg = "#d1fae5"; }
                    else if (iType === "task_done")   { IconComp = CheckCircle2;  iconColor = "#10b981"; iconBg = "#d1fae5"; }
                    else if (iType === "task_assigned"){ IconComp = CheckSquare;  iconColor = "#4f46e5"; iconBg = "#e0e7ff"; }
                    else if (iType === "leave")       { IconComp = Calendar;      iconColor = "#f59e0b"; iconBg = "#fef3c7"; }
                    else if (iType === "payslip")     { IconComp = FileText;      iconColor = "#8b5cf6"; iconBg = "#f3e8ff"; }
                    else if (activity.type === "warning") { IconComp = AlertTriangle; iconColor = "#f59e0b"; iconBg = "#fef3c7"; }
                    // Format timestamp
                    const actDate = new Date(activity.time);
                    const isToday = new Date().toDateString() === actDate.toDateString();
                    const timeLabel = isToday
                      ? actDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : actDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                    return (
                      <div className="feed-item" key={activity.id || idx} style={{ alignItems: "flex-start" }}>
                        <div className="feed-time" style={{ paddingTop: 2 }}>{timeLabel}</div>
                        <div
                          className="feed-icon-wrapper"
                          style={{ background: iconBg, color: iconColor, flexShrink: 0 }}
                        >
                          <IconComp size={12} />
                        </div>
                        <div className="feed-content">
                          <div className="feed-title" style={{ fontWeight: 600, color: "#1e293b" }}>
                            {activity.title || activity.type}
                          </div>
                          <div className="feed-desc" style={{ marginTop: 2 }}>{activity.text}</div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div
                  style={{
                    padding: "28px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  <Activity size={28} style={{ marginBottom: 8, opacity: 0.4, display: "block", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>No recent employee activities</div>
                  <div style={{ fontSize: "12px", marginTop: 4, color: "#cbd5e1" }}>Your work events will appear here</div>
                </div>
              )}
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">My Tasks</div>
              <a href="/tasks" className="panel-action">
                View All
              </a>
            </div>
            <div className="feed-list">
              {myTasks && myTasks.length > 0 ? (
                myTasks.slice(0, 5).map((task, idx) => {
                  let col = "#4f46e5";
                  let bg = "#e0e7ff";
                  if (task.priority === "High") {
                    col = "#ef4444";
                    bg = "#fee2e2";
                  }
                  if (task.priority === "Low") {
                    col = "#10b981";
                    bg = "#d1fae5";
                  }
                  return (
                    <div className="feed-item" key={idx}>
                      <div
                        className="feed-icon-wrapper"
                        style={{ background: bg, color: col }}
                      >
                        <CheckSquare size={12} />
                      </div>
                      <div className="feed-content">
                        <div className="feed-title">{task.title}</div>
                        <div
                          className="feed-desc"
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: col, fontWeight: 500 }}>
                            {task.status}
                          </span>
                          <span>•</span>
                          <span>
                            Due:{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "20px",
                    fontSize: "13px",
                    color: "#94a3b8",
                    textAlign: "center",
                  }}
                >
                  No pending tasks.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ── 6. Bottom Row: 5 panels in a 5-column grid ── */}
        <div className="rd-five-col">
          {/* Personal Insights */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Cpu
                  size={15}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 5,
                  }}
                  color="#3b82f6"
                />{" "}
                Personal Insights
              </div>
            </div>
            <div className="ai-insights-list">
              <div className="ai-insight-item">
                <div className="ai-dot"></div>
                <div>
                  Your attendance rate is <strong>{attendanceRate}</strong>.
                </div>
              </div>
              <div className="ai-insight-item">
                <div className="ai-dot"></div>
                <div>
                  You have taken <strong>{leaveTaken}</strong> leave days.
                </div>
              </div>
              <div className="ai-insight-item">
                <div className="ai-dot"></div>
                <div>
                  You have <strong>{myTasks.length}</strong> active tasks.
                </div>
              </div>
            </div>
          </div>
          {/* Skills Progression */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Skills</div>
              <select className="panel-dropdown">
                <option>Current ▾</option>
              </select>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={dashboardData?.charts?.categoryData || []}
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#475569" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Time Allocation */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Time</div>
              <select className="panel-dropdown">
                <option>This Week ▾</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: "100%", height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.charts?.crmDonut || []}
                      innerRadius={38}
                      outerRadius={56}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                    >
                      {(dashboardData?.charts?.crmDonut || []).map(
                        (entry, index) => {
                          const colors = ["#10b981", "#f59e0b", "#3b82f6"];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        }
                      )}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  width: "100%",
                  fontSize: 10,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                }}
              >
                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => {
                  const colors = ["#10b981", "#f59e0b", "#3b82f6"];
                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "0px",
                          background: colors[idx % colors.length],
                        }}
                      ></div>
                      <span>
                        <b>{entry.value}</b> {entry.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Work Hours */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Work Hours</div>
              <select className="panel-dropdown">
                <option>This Month ▾</option>
              </select>
            </div>
            <div style={{ padding: "5px 0" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                164 hrs
              </div>
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                On Track
              </div>
            </div>
            <div style={{ height: 100, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#10b981" }}
                  />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Upcoming Company Events */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">Company Events</div>
              <span
                onClick={() => navigate("/tasks/calendar")}
                className="panel-action"
                style={{ cursor: "pointer" }}
              >
                View All
              </span>
            </div>
            <div className="feed-list" style={{ gap: 12, marginTop: 8 }}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev, i) => (
                  <div className="event-item" key={i}>
                    <div
                      className="event-date"
                      style={{
                        background: ev.bg,
                        color: ev.col,
                        padding: "4px 6px",
                      }}
                    >
                      <span className="event-month" style={{ fontSize: 10 }}>
                        {ev.month}
                      </span>
                      <span
                        className="event-day"
                        style={{ color: ev.col, fontSize: 13 }}
                      >
                        {ev.day}
                      </span>
                    </div>
                    <div className="feed-content">
                      <div className="feed-title" style={{ fontSize: 13 }}>
                        {ev.title}
                      </div>
                      <div className="feed-desc" style={{ fontSize: 11 }}>
                        {ev.desc}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No upcoming events
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CommandCenter
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
      />
    </div>
  );
};
export default EmployeeDashboard;

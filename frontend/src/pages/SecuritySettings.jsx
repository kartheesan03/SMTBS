import React, { useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  Download,
  ArrowUpRight,
  Users,
  FileText,
  Target,
  Shield,
  Search,
  ChevronDown,
  LogIn,
  Edit,
  Trash2,
} from "lucide-react";
import "./SecuritySettings.css";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";

const SecuritySettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const auditLogs = [
    {
      id: 1,
      user: "Admin User",
      action: "Login",
      actionColor: "green",
      module: "Authentication",
      detail: "Signed in from Chrome on Windows",
      time: "23 Jun 2026, 23:31",
      icon: <LogIn size={16} color="#10b981" />,
    },
    {
      id: 2,
      user: "Priya Nair",
      action: "Update",
      actionColor: "orange",
      module: "Material Tracking",
      detail: "Updated stock count for SKU-4471 (Copper Wire 2mm)",
      time: "23 Jun 2026, 22:54",
      icon: <Edit size={16} color="#f59e0b" />,
    },
    {
      id: 3,
      user: "System",
      action: "Delete",
      actionColor: "red",
      module: "User Management",
      detail: "Removed inactive user account (ID: 1042)",
      time: "23 Jun 2026, 21:15",
      icon: <Trash2 size={16} color="#ef4444" />,
    },
  ];

  return (
    <div className="sec-container">
      {/* Header */}
      <div className="sec-header-row">
        <div className="sec-header-left">
          <div className="sec-header-icon">
            <ClipboardList size={24} color="#8b5cf6" />
          </div>
          <div>
            <span className="sec-pre-title">SECURITY & COMPLIANCE</span>
            <h2>Audit Logs</h2>
            <p>A complete, timestamped trail of activity across SMTBMS.</p>
          </div>
        </div>
        <div className="sec-header-actions">
          <button className="sec-btn-outline">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="sec-btn-primary">
            <Download size={14} /> Export Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsGrid>
        <StatsCard
          title="TOTAL EVENTS (24H)"
          value="12"
          trendValue="Across all modules"
          icon={Target}
          colorTheme="purple"
          trendPositive={true}
        />
        <StatsCard
          title="TOTAL LOGINS"
          value="4"
          trendValue="System access events"
          icon={Users}
          colorTheme="mint"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS UPDATED"
          value="5"
          trendValue="Modified recently"
          icon={FileText}
          colorTheme="purple"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS CREATED"
          value="2"
          trendValue="New entries added"
          icon={Target}
          colorTheme="blue"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS DELETED"
          value="1"
          trendValue="Removed by admins"
          icon={Shield}
          colorTheme="peach"
          trendPositive={false}
        />
      </StatsGrid>

      {/* Logs List Section */}
      <div className="sec-logs-container">
        <div className="sec-logs-toolbar">
          <div className="sec-search-bar">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by user, module, or det..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sec-filter-dropdown">
            <select>
              <option>All</option>
              <option>Login</option>
              <option>Update</option>
              <option>Delete</option>
            </select>
          </div>
          <div className="sec-logs-count">12 events</div>
        </div>
        <div className="sec-logs-list">
          {auditLogs.map((log) => (
            <div key={log.id} className="sec-log-row">
              <div className="sec-log-left">
                <div className={`sec-log-icon-bg ${log.actionColor}`}>
                  {log.icon}
                </div>
                <div className="sec-log-info">
                  <div className="sec-log-user-row">
                    <h4>{log.user}</h4>
                    <span className={`sec-badge ${log.actionColor}`}>
                      {log.action}
                    </span>
                    <span className="sec-log-module">&bull; {log.module}</span>
                  </div>
                  <p className="sec-log-detail">{log.detail}</p>
                </div>
              </div>
              <div className="sec-log-right">
                <span className="sec-log-time">{log.time}</span>
                <ChevronDown size={16} color="#94a3b8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

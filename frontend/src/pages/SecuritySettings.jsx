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
import PageHeader from "../components/PageHeader";
import "./SecuritySettings.css";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";

const SecuritySettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const auditLogs = [];

  return (
    <div className="sec-container">
      {/* Header */}
      <PageHeader
        title="Security Settings"
        badge="SECURITY & COMPLIANCE"
        subtitle="A complete, timestamped trail of activity across SMTBMS."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: () => {},
            style: { background: "white", color: "#64748b", border: "1px solid #e2e8f0" }
          },
          {
            label: "Export Logs",
            icon: Download,
            primary: true,
            onClick: () => {}
          }
        ]}
      />

      {/* KPI Cards */}
      <StatsGrid>
        <StatsCard
          title="TOTAL EVENTS (24H)"
          value="0"
          trendValue="Across all modules"
          icon={Target}
          colorTheme="purple"
          trendPositive={true}
        />
        <StatsCard
          title="TOTAL LOGINS"
          value="0"
          trendValue="System access events"
          icon={Users}
          colorTheme="mint"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS UPDATED"
          value="0"
          trendValue="Modified recently"
          icon={FileText}
          colorTheme="purple"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS CREATED"
          value="0"
          trendValue="New entries added"
          icon={Target}
          colorTheme="blue"
          trendPositive={true}
        />
        <StatsCard
          title="RECORDS DELETED"
          value="0"
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
          <div className="sec-logs-count">0 events</div>
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

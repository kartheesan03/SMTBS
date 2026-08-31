import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "../../styles/erp-design-system.css";

/* ─── PAGE LAYOUT ───────────────────────────────────────────── */
export const ERPPage = ({ children }) => {
  return <div className="erp-layout">{children}</div>;
};

/* ─── PAGE HEADER ───────────────────────────────────────────── */
export const PageHeader = ({ breadcrumb, title, subtitle, action }) => {
  return (
    <div className="erp-page-header">
      <div>
        <div className="erp-breadcrumb">{breadcrumb}</div>
        <h1 className="erp-page-title">{title}</h1>
        <p className="erp-page-subtitle">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/* ─── KPI GRID ──────────────────────────────────────────────── */
export const KpiGrid = ({ children }) => {
  return <div className="erp-kpi-grid">{children}</div>;
};


export const KpiCard = ({ title, value, icon: Icon, sub, trendUp, iconColor, iconBg }) => {
  // Determine colors based on trendUp if not explicitly provided
  const defaultIconColor = iconColor || "var(--erp-primary)";
  const defaultIconBg = iconBg || "var(--erp-primary-light)";

  // Parse sub string for trend percentage and remaining text
  let trendText = "";
  let remainingText = sub || "";
  if (sub && trendUp !== undefined) {
    const firstSpace = sub.indexOf(" ");
    if (firstSpace > -1) {
      trendText = sub.slice(0, firstSpace);
      if (trendText.startsWith("+") || trendText.startsWith("-")) {
        trendText = trendText.substring(1);
      }
      remainingText = sub.slice(firstSpace);
    } else {
      trendText = sub;
      remainingText = "";
      if (trendText.startsWith("+") || trendText.startsWith("-")) {
        trendText = trendText.substring(1);
      }
    }
  }

  return (
    <div className="erp-kpi-card">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        {Icon && (
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: defaultIconBg, color: defaultIconColor,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon size={18} />
          </div>
        )}
        <span className="erp-kpi-title">{title}</span>
      </div>
      
      <div className="erp-kpi-value">{value}</div>
      
      {sub && (
        <div className="erp-kpi-sub">
          {trendUp !== undefined ? (
            <>
              <span style={{ 
                color: trendUp ? "var(--erp-status-active-dot)" : "var(--erp-status-inactive-dot)", 
                display: "flex", alignItems: "center", gap: "2px", fontWeight: 600 
              }}>
                {trendUp ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                {trendText}
              </span>
              <span>{remainingText}</span>
            </>
          ) : (
            <span>{sub}</span>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── SECTION CONTAINER ─────────────────────────────────────── */
export const SectionCard = ({ children, title }) => {
  return (
    <div className="erp-section-container">
      {title && <h2 style={{ fontSize: "var(--erp-font-size-md)", fontWeight: 700, marginBottom: "16px", color: "var(--erp-text-main)" }}>{title}</h2>}
      <div className="erp-data-table-card">
        {children}
      </div>
    </div>
  );
};

/* ─── STATUS BADGE ──────────────────────────────────────────── */
export const StatusBadge = ({ status, customLabel }) => {
  let mappedStatus = "info"; // default
  
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "completed" || s === "delivered" || s === "approved") {
    mappedStatus = "active";
  } else if (s === "inactive" || s === "cancelled" || s === "expired" || s === "rejected") {
    mappedStatus = "inactive";
  } else if (s === "pending" || s === "lead" || s === "at risk" || s === "in progress") {
    mappedStatus = "pending";
  }
  
  return (
    <span className="erp-status-badge" style={{
      backgroundColor: `var(--erp-status-${mappedStatus}-bg)`,
      color: `var(--erp-status-${mappedStatus}-text)`
    }}>
      <span className="erp-status-dot" style={{ backgroundColor: `var(--erp-status-${mappedStatus}-dot)` }} />
      {customLabel || status}
    </span>
  );
};

/* ─── DATA TABLE ────────────────────────────────────────────── */
export const DataTable = ({
  columns,
  data,
  title,
  subtitle,
  primaryAction,
  searchPlaceholder = "Search...",
  searchQuery,
  onSearchChange,
  loading,
  filters
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentData = data?.slice(startIdx, endIdx) || [];
  
  return (
    <div className="erp-data-table-card" style={{ boxShadow: "none", border: "none", borderRadius: 0 }}>
      {/* Toolbar */}
      <div className="erp-table-toolbar">
        <div className="erp-table-toolbar-left">
          {title && (
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--erp-text-main)" }}>{title}</div>
              {subtitle && <div style={{ fontSize: "13px", color: "var(--erp-text-muted)", marginTop: "2px" }}>{subtitle}</div>}
            </div>
          )}
          
          {(title || subtitle) && (onSearchChange || filters) && <div style={{ width: "1px", height: "24px", background: "var(--erp-border)", margin: "0 12px" }} />}
          
          {onSearchChange && (
            <div className="erp-search-input-wrapper">
              <Search className="erp-search-icon" size={14} />
              <input
                type="text"
                className="erp-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          
          {filters && (
            <button className="erp-btn erp-btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 12px", border: "1px solid var(--erp-border)" }}>
              <Filter size={14} /> Filters <ChevronDown size={14} />
            </button>
          )}
        </div>
        
        <div className="erp-table-toolbar-right">
          {primaryAction && (
            <button className="erp-btn erp-btn-primary" onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon size={14} />} {primaryAction.label}
            </button>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ width: col.width }}>{col.label || col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px", color: "var(--erp-text-muted)" }}>
                  Loading data...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "32px", color: "var(--erp-text-muted)" }}>
                  No records found.
                </td>
              </tr>
            ) : (
              currentData.map((row, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j}>
                      {col.render ? col.render(row[col.key || col.accessor], row) : (col.accessor && typeof col.accessor === 'function' ? col.accessor(row) : row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="erp-pagination">
        <div>
          Showing {data?.length === 0 ? 0 : startIdx + 1}-{Math.min(endIdx, data?.length || 0)} of {data?.length || 0}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Rows per page:</span>
            <select style={{ border: "1px solid var(--erp-border)", borderRadius: "4px", padding: "2px 4px", fontSize: "12px", outline: "none", color: "var(--erp-text-main)" }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button 
              className="erp-btn-icon" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="erp-btn-icon" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── DETAIL HEADER ─────────────────────────────────────────── */
export const DetailHeader = ({ title, subtitle, avatarText, badges, actions }) => {
  return (
    <div className="erp-page-header" style={{ alignItems: "center" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {avatarText && (
          <div style={{
            width: "48px", height: "48px", borderRadius: "var(--erp-radius-md)",
            backgroundColor: "var(--erp-border-light)", color: "var(--erp-text-main)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "1.25rem", border: "1px solid var(--erp-border)"
          }}>
            {avatarText}
          </div>
        )}
        <div>
          <h1 className="erp-page-title" style={{ marginBottom: "6px" }}>{title}</h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="erp-page-subtitle">{subtitle}</span>
            {badges && badges.length > 0 && (
              <div style={{ display: "flex", gap: "6px" }}>
                {badges.map((b, i) => (
                  <StatusBadge key={i} status={b.label || b} customLabel={b.label || b} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div style={{ display: "flex", gap: "8px" }}>
          {actions.map((act, i) => (
            <button key={i} className={`erp-btn ${act.primary ? "erp-btn-primary" : "erp-btn-secondary"}`} onClick={act.onClick}>
              {act.icon && <act.icon size={14} />} {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── TABS ────────────────────────────────────────────────────── */
export const DetailTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--erp-border)", padding: "0 32px", backgroundColor: "var(--erp-bg-card)", marginBottom: "24px" }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === tab.id ? "2px solid var(--erp-primary)" : "2px solid transparent",
            color: activeTab === tab.id ? "var(--erp-primary)" : "var(--erp-text-muted)",
            fontWeight: activeTab === tab.id ? 600 : 500,
            padding: "16px 0",
            cursor: "pointer",
            fontSize: "var(--erp-font-size-sm)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          {tab.icon && <tab.icon size={16} />} {tab.label}
        </button>
      ))}
    </div>
  );
};

/* ─── KEY-VALUE CARD ────────────────────────────────────────── */
export const KeyValueCard = ({ title, items }) => {
  return (
    <div className="erp-kpi-card" style={{ gap: "16px" }}>
      {title && <div style={{ fontSize: "var(--erp-font-size-md)", fontWeight: 700, color: "var(--erp-text-main)", borderBottom: "1px solid var(--erp-border)", paddingBottom: "12px", marginBottom: "8px" }}>{title}</div>}
      <div style={{ display: "grid", gap: "12px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "var(--erp-font-size-xs)", color: "var(--erp-text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>{item.label}</span>
            <span style={{ fontSize: "var(--erp-font-size-sm)", color: "var(--erp-text-main)", fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── TIMELINE ──────────────────────────────────────────────── */
export const Timeline = ({ items }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--erp-primary)", marginTop: "4px" }} />
            {i !== items.length - 1 && <div style={{ width: "2px", flex: 1, backgroundColor: "var(--erp-border)", marginTop: "4px", minHeight: "40px" }} />}
          </div>
          <div>
            <div style={{ fontSize: "var(--erp-font-size-sm)", fontWeight: 600, color: "var(--erp-text-main)" }}>{item.title}</div>
            <div style={{ fontSize: "var(--erp-font-size-xs)", color: "var(--erp-text-light)", marginTop: "2px", marginBottom: "4px" }}>{item.time}</div>
            {item.description && <div style={{ fontSize: "var(--erp-font-size-sm)", color: "var(--erp-text-muted)" }}>{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

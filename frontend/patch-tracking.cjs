const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TrackingDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add viewMode state
content = content.replace(
  'const [materialTimeline, setMaterialTimeline] = useState([]);',
  `const [materialTimeline, setMaterialTimeline] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");`
);

// 2. Add renderGlobalKPICards and renderTableView before the final return
const newFunctions = `
  const renderGlobalKPICards = () => {
    const inMovs = movements.filter((m) => String(m.type).toLowerCase() === "in").length;
    const outMovs = movements.filter((m) => String(m.type).toLowerCase() === "out").length;
    const transferred = movements.filter(
      (m) => String(m.type).toLowerCase() === "transfer" || String(m.type).toLowerCase() === "adjustment"
    ).length;
    const pending = movements.filter((m) => String(m.status).toLowerCase() === "pending").length;

    return (
      <StatsGrid>
        <StatsCard title="Total Movements" value={movements.length} trendValue="All time" trendPositive={true} icon={Layers} colorTheme="blue" />
        <StatsCard title="IN Movements" value={inMovs} trendValue="Stock additions" trendPositive={true} icon={ArrowDownRight} colorTheme="mint" />
        <StatsCard title="OUT Movements" value={outMovs} trendValue="Stock reductions" trendPositive={true} icon={ArrowUpRight} colorTheme="peach" />
        <StatsCard title="Transfers / Adj." value={transferred} trendValue="Internal moves" trendPositive={true} icon={ArrowRightLeft} colorTheme="purple" />
        <StatsCard title="Pending" value={pending} trendValue="Awaiting action" trendPositive={pending === 0} icon={Clock} colorTheme="yellow" />
      </StatsGrid>
    );
  };

  const renderTableView = () => {
    const filteredMovements = movements.filter((m) => {
      const matName = String(m.materialName || "").toLowerCase();
      const matSku = String(m.materialSku || "").toLowerCase();
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || matName.includes(sTerm) || matSku.includes(sTerm);
      const matchesType = !filterType || String(m.type).toLowerCase() === filterType.toLowerCase();
      const matchesLoc = !filterLocation || String(m.materialLocation || "").toLowerCase().includes(filterLocation.toLowerCase());
      return matchesSearch && matchesType && matchesLoc;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {renderGlobalKPICards()}
        <div className="mcc-section">
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, display: "flex", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 16px", alignItems: "center" }}>
              <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
              <input type="text" placeholder="Search movements by material name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", width: "100%" }} />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
              <option value="">All Movement Types</option>
              <option value="in">IN</option>
              <option value="out">OUT</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
              <option value="">All Locations</option>
              <option value="warehouse 1">Warehouse 1</option>
              <option value="warehouse 2">Warehouse 2</option>
              <option value="warehouse 3">Warehouse 3</option>
              <option value="warehouse 4">Warehouse 4</option>
            </select>
          </div>
          <style>
            {\`
              .mcc-hover-row:hover { background: #f8fafc; }
            \`}
          </style>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: 12 }}>Date/Time</th>
                  <th style={{ padding: 12 }}>Material</th>
                  <th style={{ padding: 12 }}>Type</th>
                  <th style={{ padding: 12 }}>Qty Changed</th>
                  <th style={{ padding: 12 }}>Location</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr key={m.id || m._id} className="mcc-hover-row" style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => { setSelectedMaterialId(m.materialId || m.material); setViewMode("detail"); }}>
                    <td style={{ padding: 12 }}>{formatDate(m.createdAt)} <span style={{ color: "#94a3b8", fontSize: 12 }}>{formatTime(m.createdAt)}</span></td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{m.materialName}<br/><span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>{m.materialSku}</span></td>
                    <td style={{ padding: 12 }}>
                      <span className="mcc-badge" style={{ background: String(m.type).toLowerCase() === 'in' ? '#d1fae5' : String(m.type).toLowerCase() === 'out' ? '#fee2e2' : '#dbeafe', color: String(m.type).toLowerCase() === 'in' ? '#10b981' : String(m.type).toLowerCase() === 'out' ? '#ef4444' : '#3b82f6', display: "inline-block" }}>
                        {String(m.type).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: 12, color: String(m.type).toLowerCase() === 'in' ? '#10b981' : String(m.type).toLowerCase() === 'out' ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                      {String(m.type).toLowerCase() === 'in' ? '+' : String(m.type).toLowerCase() === 'out' ? '-' : ''}{m.quantity} {m.unit || 'pcs'}
                    </td>
                    <td style={{ padding: 12 }}>
                      {m.materialLocation || "Unassigned"}
                    </td>
                    <td style={{ padding: 12 }}>{m.status || "Completed"}</td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && <tr><td colSpan="6" style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No movements found for these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
`;

// Find the main return using reverse indexOf to get the last one (line 1147)
const lastReturnIndex = content.lastIndexOf('  return (');
content = content.substring(0, lastReturnIndex) + newFunctions + content.substring(lastReturnIndex + 10);

// Now replace the JSX inside the return
const oldJSX = `    <div className="mcc-container">
      {/* Header */}
      <div className="mcc-header">
        <div className="rd-module-title-row">
          <h1 className="rd-module-title" style={{ margin: 0, fontSize: 24 }}>
            Movement Tracking
          </h1>
          <span className="rd-module-badge">ERP DASHBOARD</span>
        </div>
        <div className="mcc-actions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 0,
              padding: "0 12px",
            }}
          >
            <Search size={16} color="#94a3b8" />
            <select
              value={selectedMaterialId || ""}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                padding: "10px",
                fontSize: 14,
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
                boxShadow: "none",
                width: "220px",
                cursor: "pointer",
              }}
            >
              <option value="">Search material...</option>
              {materialsList.map((m) => (
                <option key={m.id || m._id} value={m.id || m._id}>
                  {m.sku} - {m.name}
                </option>
              ))}
            </select>
          </div>
          <button className="mcc-btn" onClick={fetchDashboardData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="mcc-btn">
            <Download size={16} /> Export
          </button>
          <button className="mcc-btn">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
      {!selectedMaterialId || !materialDetails ? (
        <div
          style={{ textAlign: "center", padding: "100px 0", color: "#94a3b8" }}
        >
          <Package size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, color: "#475569", margin: "0 0 8px 0" }}>
            No Material Selected
          </h3>
          <p style={{ fontSize: 14 }}>
            Please select a material from the dropdown above to view its
            Movement Tracking details.
          </p>
        </div>
      ) : (
        <>
          {/* Top Section */}
          {renderMaterialSummary()}
          {/* KPI Cards */}
          {renderKPICards()}
          {/* Main Content Layout */}
          <div className="mcc-main-grid">
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {renderWarehouseInfo()}
              {renderSupplierInfo()}
              {renderDocsAndQR()}
              {renderAIInsights()}
            </div>
            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {renderWorkflowTimeline()}
              {renderRecentActivities()}
              {renderInventoryAnalytics()}
            </div>
          </div>
        </>
      )}
    </div>`;

const newJSX = `    <div className="mcc-container">
      {/* Header */}
      <div className="mcc-header">
        <div className="rd-module-title-row">
          <h1 className="rd-module-title" style={{ margin: 0, fontSize: 24 }}>
            Movement Tracking
          </h1>
          <span className="rd-module-badge">ERP DASHBOARD</span>
        </div>
        <div className="mcc-actions">
          {viewMode === "detail" && (
            <button className="mcc-btn" onClick={() => { setViewMode("table"); setSelectedMaterialId(null); }} style={{ background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0" }}>
              ← Back to All Movements
            </button>
          )}
          <button className="mcc-btn" onClick={fetchDashboardData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="mcc-btn">
            <Download size={16} /> Export
          </button>
          <button className="mcc-btn">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
      
      {viewMode === "table" ? renderTableView() : (
        !selectedMaterialId || !materialDetails ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "#94a3b8" }}>
            <Package size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, color: "#475569", margin: "0 0 8px 0" }}>No Material Selected</h3>
            <p style={{ fontSize: 14 }}>Please select a material from the table to view its detailed Movement Tracking.</p>
          </div>
        ) : (
          <>
            {renderMaterialSummary()}
            {renderKPICards()}
            <div className="mcc-main-grid">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {renderWarehouseInfo()}
                {renderSupplierInfo()}
                {renderDocsAndQR()}
                {renderAIInsights()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {renderWorkflowTimeline()}
                {renderRecentActivities()}
                {renderInventoryAnalytics()}
              </div>
            </div>
          </>
        )
      )}
    </div>`;

content = content.replace(oldJSX, newJSX);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully patched TrackingDashboard.jsx');

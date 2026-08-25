import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ArrowRightLeft,
  Download,
  Layers,
  FileSearch,
  MapPin,
  Package,
  Truck,
  Building2,
  Calendar,
  Clock,
  User,
  Hash,
  Edit,
  Printer,
  Share2,
  FileText,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  Box,
  RefreshCw,
  QrCode,
  BarChart2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Link as LinkIcon,
  ThumbsUp,
  Zap,
} from "lucide-react";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import "../components/AdminDashboard/DashboardLayout.css";
import { AuthContext } from "../context/AuthContext";
import { CONSTANTS } from "../utils/constants";
import { LoadingState } from "../components/DataStates";
import PageHeader from "../components/PageHeader";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

const KpiCard = ({ icon: Icon, iconClass, label, value, trend, trendUp, sub }) => (
  <div className="bx-kpi-card">
    <div className="bx-kpi-header">
      <div className={`bx-kpi-icon ${iconClass}`}><Icon size={14} /></div>
      {label}
    </div>
    <div className="bx-kpi-val">{value}</div>
    {trend && (
      <div className={`bx-kpi-trend ${trendUp ? "up" : "down"}`}>
        {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {trend}
        {sub && <span> {sub}</span>}
      </div>
    )}
  </div>
);

const TrackingDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const { user } = useContext(AuthContext);
  const currentUserRole = user?.role || "Employee";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [movements, setMovements] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [materialDetails, setMaterialDetails] = useState(null);
  const [materialTimeline, setMaterialTimeline] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matsRes, movsRes] = await Promise.all([
        API.get("/materials"),
        API.get("/materials/movements/all"),
      ]);
      const mats = matsRes.data || [];
      const movs = movsRes.data || [];
      setMaterialsList(mats);
      setMovements(movs);
      let initialSelectionId =
        mats.length > 0 ? mats[0]._id || mats[0].id : null;
      if (initialSearch && mats.length > 0) {
        const searchLower = initialSearch.toLowerCase().trim();
        const matchedMat = mats.find(
          (m) =>
            (m.sku && m.sku.toLowerCase().trim() === searchLower) ||
            (m.name && m.name.toLowerCase().trim() === searchLower) ||
            (m.sku && m.sku.toLowerCase().includes(searchLower)) ||
            (m.name && m.name.toLowerCase().includes(searchLower))
        );
        if (matchedMat) {
          initialSelectionId = matchedMat._id || matchedMat.id;
        }
      }
      if (initialSelectionId) {
        setSelectedMaterialId(initialSelectionId);
      }
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      toast.error("Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    if (selectedMaterialId) {
      Promise.all([
        API.get(`/materials/${selectedMaterialId}`).catch(() => ({
          data: null,
        })),
        API.get(`/materials/${selectedMaterialId}/timeline`).catch(() => ({
          data: [],
        })),
      ]).then(([matRes, timeRes]) => {
        setMaterialDetails(matRes.data);
        setMaterialTimeline(timeRes.data || []);
      });
    } else {
      setMaterialDetails(null);
      setMaterialTimeline([]);
    }
  }, [selectedMaterialId]);
  const currentMaterialMovements = movements.filter(
    (m) =>
      m.materialId === selectedMaterialId || m.material === selectedMaterialId
  );
  const isLowStock =
    materialDetails &&
    materialDetails.quantity <= (materialDetails.lowStockThreshold || 10);
  const isOutOfStock = materialDetails && materialDetails.quantity === 0;
  let statusText = "In Stock";
  let statusColor = "#10b981";
  let statusBg = "#d1fae5";
  if (isOutOfStock) {
    statusText = "Out of Stock";
    statusColor = "#ef4444";
    statusBg = "#fee2e2";
  } else if (isLowStock) {
    statusText = "Low Stock";
    statusColor = "#f59e0b";
    statusBg = "#fef3c7";
  } else if (materialDetails?.status === "Reserved") {
    statusText = "Reserved";
    statusColor = "#3b82f6";
    statusBg = "#dbeafe";
  }
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const renderMaterialSummary = () => (
    <div
      className="mcc-section"
      style={{ display: "flex", gap: 24, alignItems: "center" }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 0,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Package size={48} color="#94a3b8" />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {materialDetails?.name || "Select a material"}
            </h2>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Hash size={14} /> {materialDetails?.sku || "N/A"}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Layers size={14} />{" "}
                {materialDetails?.category || "Uncategorized"}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Truck size={14} /> {materialDetails?.supplier || "N/A"}
              </span>
            </div>
          </div>
          <span
            className="mcc-badge"
            style={{ background: statusBg, color: statusColor }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 0,
                background: statusColor,
              }}
            ></span>
            {statusText}
          </span>
        </div>
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: 32,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Location
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#0f172a",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MapPin size={14} color="#3b82f6" />
              {materialDetails?.warehouse || "Unassigned"}
              {materialDetails?.rack
                ? ` • ${
                    String(materialDetails.rack).toLowerCase().includes("rack")
                      ? ""
                      : "Rack "
                  }${materialDetails.rack}`
                : ""}
              {materialDetails?.shelf
                ? ` • ${
                    String(materialDetails.shelf)
                      .toLowerCase()
                      .includes("shelf")
                      ? ""
                      : "Shelf "
                  }${materialDetails.shelf}`
                : ""}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Last Updated
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#0f172a",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={14} color="#64748b" />
              {formatDate(materialDetails?.updatedAt)}{" "}
              {formatTime(materialDetails?.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderKPICards = () => {
    const outMovs = currentMaterialMovements.filter(
      (m) => (m.type || "").toUpperCase() === "OUT"
    ).length;
    const inMovs = currentMaterialMovements.filter(
      (m) => (m.type || "").toUpperCase() === "IN"
    ).length;
    const transferred = currentMaterialMovements.filter(
      (m) =>
        (m.type || "").toUpperCase() === "ADJUSTMENT" ||
        (m.type || "").toUpperCase() === "TRANSFER"
    ).length;
    const pending = currentMaterialMovements.filter(
      (m) => (m.status || "").toUpperCase() === "PENDING"
    ).length;
    return (
      <div className="bx-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard
          title="Available Stock"
          label="Available Stock"
          value={`${materialDetails?.quantity || 0} ${materialDetails?.unit || "pcs"}`}
          trend={materialDetails?.quantity > 0 ? "In stock" : "Out of stock"}
          trendUp={materialDetails?.quantity > 0}
          icon={Box}
          iconClass="blue"
        />
        <KpiCard
          label="Total Movements"
          value={currentMaterialMovements.length}
          trend="Recorded history"
          trendUp={true}
          icon={Layers}
          iconClass="orange"
        />
        <KpiCard
          label="IN Movements"
          value={inMovs}
          trend="Stock additions"
          trendUp={true}
          icon={ArrowDownRight}
          iconClass="green"
        />
        <KpiCard
          label="OUT Movements"
          value={outMovs}
          trend="Stock reductions"
          trendUp={true}
          icon={ArrowUpRight}
          iconClass="red"
        />
      </div>
    );
  };
  const renderWarehouseInfo = () => {
    const currentWarehouse = materialDetails?.warehouse;
    let uniqueRacks = [
      ...new Set(
        materialsList
          .filter((m) => m.warehouse === currentWarehouse && m.rack)
          .map((m) => parseInt(m.rack))
      ),
    ].sort((a, b) => a - b);
    if (uniqueRacks.length === 0 && materialDetails?.rack)
      uniqueRacks.push(parseInt(materialDetails.rack));
    return (
      <div className="mcc-section">
        <h3 className="mcc-section-title">
          <Building2 size={18} color="#3b82f6" /> Warehouse Information
        </h3>
        <div className="mcc-info-grid" style={{ marginBottom: 20 }}>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Warehouse Name</span>
            <span className="mcc-info-value">
              {materialDetails?.warehouse || "Unassigned"}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Zone</span>
            <span className="mcc-info-value">
              {materialDetails?.zone || "Unassigned"}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Rack & Shelf</span>
            <span className="mcc-info-value">
              {!materialDetails?.rack && !materialDetails?.shelf
                ? "-"
                : [
                    materialDetails?.rack
                      ? String(materialDetails.rack)
                          .toLowerCase()
                          .includes("rack")
                        ? materialDetails.rack
                        : `Rack ${materialDetails.rack}`
                      : null,
                    materialDetails?.shelf
                      ? String(materialDetails.shelf)
                          .toLowerCase()
                          .includes("shelf") ||
                        String(materialDetails.shelf)
                          .toLowerCase()
                          .includes("rack")
                        ? materialDetails.shelf
                        : `Shelf ${materialDetails.shelf}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Bin</span>
            <span className="mcc-info-value">
              {materialDetails?.bin
                ? String(materialDetails.bin).toLowerCase().includes("bin")
                  ? materialDetails.bin
                  : `Bin ${materialDetails.bin}`
                : "-"}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Current Temperature</span>
            <span className="mcc-info-value">
              {materialDetails?.temperature
                ? `${materialDetails.temperature}°C`
                : "N/A"}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Humidity</span>
            <span className="mcc-info-value">
              {materialDetails?.humidity
                ? `${materialDetails.humidity}%`
                : "N/A"}
            </span>
          </div>
        </div>
        {uniqueRacks.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              Visual Map (Warehouse Racks)
            </div>
            <div
              style={{
                width: "100%",
                background: "#f8fafc",
                borderRadius: 0,
                border: "1px solid #e2e8f0",
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                  gap: 8,
                }}
              >
                {uniqueRacks.map((r) => {
                  const isCurrentRack = r === parseInt(materialDetails?.rack);
                  return (
                    <div
                      key={r}
                      style={{
                        height: 60,
                        background: isCurrentRack ? "#eff6ff" : "#fff",
                        border: `2px solid ${
                          isCurrentRack ? "#3b82f6" : "#e2e8f0"
                        }`,
                        borderRadius: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isCurrentRack ? "#2563eb" : "#64748b",
                        }}
                      >
                        Rack {r}
                      </span>
                      {isCurrentRack && (
                        <div
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 14,
                            height: 14,
                            background: "#ef4444",
                            borderRadius: "0px",
                            border: "2px solid #fff",
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 11,
                  color: "#64748b",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "0px",
                      background: "#ef4444",
                    }}
                  ></div>{" "}
                  Target Location
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 0,
                      border: "2px solid #3b82f6",
                      background: "#eff6ff",
                    }}
                  ></div>{" "}
                  Current Rack
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderSupplierInfo = () => {
    const supplierName =
      materialDetails?.vendor?.name || materialDetails?.supplier || "N/A";
    const contact =
      materialDetails?.vendor?.phone ||
      materialDetails?.vendor?.contactPerson ||
      materialDetails?.supplierContact ||
      "N/A";
    const perf = materialDetails?.supplierPerformance || "98";
    const lastPurchase = materialDetails?.lastPurchaseDate
      ? formatDate(materialDetails.lastPurchaseDate)
      : formatDate(new Date(Date.now() - 86400000 * 12));
    const lead = materialDetails?.leadTime || "4";
    const rating =
      materialDetails?.vendor?.rating ||
      materialDetails?.supplierRating ||
      "4.5";
    return (
      <div className="mcc-section">
        <h3 className="mcc-section-title">
          <Truck size={18} color="#f59e0b" /> Supplier Information
        </h3>
        <div className="mcc-info-grid">
          <div className="mcc-info-item">
            <span className="mcc-info-label">Supplier Name</span>
            <span className="mcc-info-value">{supplierName}</span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Contact</span>
            <span className="mcc-info-value">{contact}</span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Delivery Performance</span>
            <span className="mcc-info-value">{perf}%</span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Last Purchase Date</span>
            <span className="mcc-info-value">{lastPurchase}</span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Average Lead Time</span>
            <span className="mcc-info-value">{lead} Days</span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Supplier Rating</span>
            <span className="mcc-info-value">{rating} / 5.0</span>
          </div>
        </div>
      </div>
    );
  };
  const renderInventoryAnalytics = () => (
    <div className="mcc-section">
      <h3 className="mcc-section-title">
        <BarChart2 size={18} color="#0ea5e9" /> Inventory Analytics
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {materialDetails?.maxStock && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                Stock Level Progress
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                {materialDetails?.quantity || 0} / {materialDetails?.maxStock}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#f1f5f9",
                borderRadius: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    ((materialDetails?.quantity || 0) /
                      materialDetails.maxStock) *
                      100,
                    100
                  )}%`,
                  height: "100%",
                  background: "#3b82f6",
                  borderRadius: 0,
                }}
              ></div>
            </div>
          </div>
        )}
        <div className="mcc-info-grid">
          <div className="mcc-info-item">
            <span className="mcc-info-label">Reorder Level</span>
            <span className="mcc-info-value">
              {materialDetails?.lowStockThreshold || "N/A"} Units
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Inventory Health</span>
            <span
              className="mcc-info-value"
              style={{
                color:
                  materialDetails?.quantity >
                  (materialDetails?.lowStockThreshold || 10)
                    ? "#10b981"
                    : "#f59e0b",
              }}
            >
              {materialDetails?.quantity >
              (materialDetails?.lowStockThreshold || 10)
                ? "Healthy"
                : "Needs Attention"}
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Incoming</span>
            <span className="mcc-info-value">
              {materialDetails?.incoming || 0} Units
            </span>
          </div>
          <div className="mcc-info-item">
            <span className="mcc-info-label">Outgoing (Reserved)</span>
            <span className="mcc-info-value">
              {materialDetails?.reserved || 0} Units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  const handleDownload = (doc) => {
    if (!doc || !doc.url || doc.url === "#") {
      alert("Document URL not available.");
      return;
    }
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const renderDocsAndQR = () => {
    const docs = materialDetails?.documents || [];
    return (
      <div className="mcc-section">
        <h3 className="mcc-section-title">
          <FileText size={18} color="#8b5cf6" /> Documents & QR
        </h3>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <QrCode size={40} color="#0f172a" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>
              SCAN ME
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {docs.length > 0 ? (
              docs.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 12px",
                    background: "#f8fafc",
                    borderRadius: 0,
                    cursor: "pointer",
                    border: "1px solid #e2e8f0",
                  }}
                  onClick={() => handleDownload(doc)}
                >
                  <FileText size={16} color="#3b82f6" />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                      flex: 1,
                    }}
                  >
                    {doc.name || `Document ${idx + 1}`}
                  </span>
                  <Download size={14} color="#64748b" />
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "10px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  textAlign: "center",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                No documents available.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderAIInsights = () => {
    if (!materialDetails) return null;
    const lowStock = materialDetails.lowStockThreshold || 10;
    const qty = materialDetails.quantity || 0;
    const isCritical = qty <= lowStock;
    return (
      <div
        className="mcc-section"
        style={{
          background: "linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)",
          borderColor: "#bae6fd",
        }}
      >
        <h3
          className="mcc-section-title"
          style={{ borderBottomColor: "#bae6fd" }}
        >
          <Zap size={18} color="#0284c7" fill="#0284c7" /> Automated Insights
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 0,
            }}
          >
            {isCritical ? (
              <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2 }} />
            ) : (
              <ThumbsUp size={16} color="#10b981" style={{ marginTop: 2 }} />
            )}
            <span
              style={{
                fontSize: 13,
                color: "#0f172a",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {isCritical
                ? `Stock is at or below the reorder level (${lowStock}). Consider reordering immediately.`
                : `Inventory levels are currently healthy and above the reorder threshold (${lowStock}).`}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const renderWorkflowTimeline = () => {
    let stages = [];
    if (materialTimeline && materialTimeline.length > 0) {
      stages = materialTimeline.map((t) => ({
        title: t.status,
        status: "Completed",
        user: t.user || "System",
        date: formatDate(t.timestamp || t.date || t.createdAt),
        time: formatTime(t.timestamp || t.date || t.createdAt),
        remarks: t.notes || "-",
      }));
    } else {
      stages = [
        {
          title: "Material Created",
          status: "Completed",
          user: "Admin",
          date: formatDate(materialDetails?.createdAt),
          time: formatTime(materialDetails?.createdAt),
          remarks: "Initial registration",
        },
      ];
    }
    const getColorForStatus = (s) => {
      if (s === "Completed") return "#10b981";
      if (s === "Current") return "#3b82f6";
      if (s === "Waiting") return "#f59e0b";
      if (s === "Rejected/Hold") return "#ef4444";
      return "#cbd5e1";
    };
    return (
      <div className="mcc-section">
        <h3 className="mcc-section-title">
          <CheckCircle2 size={18} color="#10b981" /> Workflow Timeline
        </h3>
        <div className="mcc-timeline">
          {stages.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              No timeline data available.
            </div>
          ) : (
            stages.map((stage, i) => (
              <div className="mcc-timeline-item" key={i}>
                <div
                  className="mcc-timeline-dot"
                  style={{ background: getColorForStatus(stage.status) }}
                ></div>
                <div className="mcc-timeline-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color:
                          stage.status === "Upcoming" ? "#94a3b8" : "#0f172a",
                      }}
                    >
                      {stage.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: getColorForStatus(stage.status),
                        padding: "2px 8px",
                        background: `${getColorForStatus(stage.status)}20`,
                        borderRadius: 0,
                      }}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <User size={12} /> {stage.user}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Calendar size={12} /> {stage.date}{" "}
                      {stage.time && `• ${stage.time}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                    <strong>Remarks:</strong> {stage.remarks}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  const renderRecentActivities = () => {
    return (
      <div className="mcc-section">
        <h3 className="mcc-section-title">
          <Activity size={18} color="#f43f5e" /> Recent Activities
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {currentMaterialMovements.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              No recent activities found.
            </div>
          ) : (
            currentMaterialMovements.slice(0, 5).map((m) => {
              const typeStr = (m.type || "").toUpperCase();
              let icon = <ArrowRightLeft size={14} color="#64748b" />;
              let bg = "#f1f5f9";
              if (typeStr === "IN") {
                icon = <ArrowDownRight size={14} color="#059669" />;
                bg = "#d1fae5";
              }
              if (typeStr === "OUT") {
                icon = <ArrowUpRight size={14} color="#dc2626" />;
                bg = "#fee2e2";
              }
              return (
                <div
                  key={m.id || m._id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    paddingBottom: 16,
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 0,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {typeStr} • {m.quantity} {materialDetails?.unit || ""}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        {formatTime(m.createdAt || m.date || m.timestamp)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        lineHeight: 1.4,
                      }}
                    >
                      {m.reason ||
                        (m.referenceOrderId
                          ? `Order Ref: ${m.referenceOrderId}`
                          : "-")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  if (loading) return <LoadingState message="Loading..." height="100vh" />;

  const renderGlobalKPICards = () => {
    const inMovs = movements.filter((m) => String(m.type).toLowerCase() === "in").length;
    const outMovs = movements.filter((m) => String(m.type).toLowerCase() === "out").length;
    const transferred = movements.filter(
      (m) => String(m.type).toLowerCase() === "transfer" || String(m.type).toLowerCase() === "adjustment"
    ).length;
    const pending = movements.filter((m) => String(m.status).toLowerCase() === "pending").length;

    return (
      <div className="bx-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard label="Total Movements" value={movements.length} trend="All time" trendUp={true} icon={Layers} iconClass="blue" />
        <KpiCard label="IN Movements" value={inMovs} trend="Stock additions" trendUp={true} icon={ArrowDownRight} iconClass="green" />
        <KpiCard label="OUT Movements" value={outMovs} trend="Stock reductions" trendUp={true} icon={ArrowUpRight} iconClass="orange" />
        <KpiCard label="Pending" value={pending} trend="Awaiting action" trendUp={pending === 0} icon={Clock} iconClass="purple" />
      </div>
    );
  };

  const renderTableView = () => {
    const filteredMovements = movements.filter((m) => {
      const matName = String(m.materialName || "").toLowerCase();
      const matSku = String(m.materialSku || "").toLowerCase();
      const matRef = String(m.reference || m.referenceOrderNumber || m.note || "").toLowerCase();
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || matName.includes(sTerm) || matSku.includes(sTerm) || matRef.includes(sTerm);
      const matchesType = !filterType || String(m.type).toLowerCase() === filterType.toLowerCase();
      const matchesLoc = !filterLocation || String(m.materialLocation || "").toLowerCase().includes(filterLocation.toLowerCase());
      return matchesSearch && matchesType && matchesLoc;
    });

    const totalPages = Math.max(1, Math.ceil(filteredMovements.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageMovements = filteredMovements.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const startItem = filteredMovements.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filteredMovements.length);

    const handleFilterChange = (setter) => (e) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {renderGlobalKPICards()}
        <div className="mcc-section">
          <div style={{ display: "flex", flexWrap: "nowrap", gap: 16, marginBottom: 20, alignItems: "center", overflowX: "auto", paddingBottom: "4px" }}>
            <div style={{ flex: "2 1 300px", minWidth: "250px", position: "relative" }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: "100%", padding: "10px 16px 10px 36px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: "14px", borderRadius: "4px", boxSizing: "border-box" }}
              />
            </div>

            {(() => {
              const uniqueTypes = [...new Set(movements.map(m => m.type).filter(Boolean))].sort();
              return (
                <select value={filterType} onChange={handleFilterChange(setFilterType)} style={{ flex: "1 1 150px", minWidth: "150px", padding: "10px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", textTransform: 'capitalize', borderRadius: "4px", fontSize: "14px" }}>
                  <option value="">All Movement Types</option>
                  {uniqueTypes.map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              );
            })()}

            {(() => {
              const uniqueLocations = [...new Set(movements.map(m => m.materialLocation).filter(Boolean))].sort();
              return (
                <select value={filterLocation} onChange={handleFilterChange(setFilterLocation)} style={{ flex: "1 1 150px", minWidth: "150px", padding: "10px 16px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", borderRadius: "4px", fontSize: "14px" }}>
                  <option value="">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                  ))}
                </select>
              );
            })()}
          </div>
          <style>{`.mcc-hover-row:hover { background: #f8fafc; }`}</style>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: 12 }}>Date/Time</th>
                  <th style={{ padding: 12 }}>Material</th>
                  <th style={{ padding: 12 }}>Type</th>
                  <th style={{ padding: 12 }}>Qty Changed</th>
                  <th style={{ padding: 12 }}>Location</th>
                  <th style={{ padding: 12 }}>Reference</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageMovements.map((m) => (
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
                    <td style={{ padding: 12 }}>{m.materialLocation || "Unassigned"}</td>
                    <td style={{ padding: 12 }}>
                      {m.referenceOrderNumber ? (
                        <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 500 }} onClick={(e) => { e.stopPropagation(); alert(`Order details for ${m.referenceOrderNumber} would open here`); }}>
                          Order #{m.referenceOrderNumber}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Manual / Initial</span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>{m.status || "Completed"}</td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No movements found for these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {filteredMovements.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px 2px", borderTop: "1px solid #f1f5f9", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Showing {startItem}–{endItem} of {filteredMovements.length} movements
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 4, background: safePage === 1 ? "#f8fafc" : "#fff", color: safePage === 1 ? "#cbd5e1" : "#0f172a", fontSize: 13, cursor: safePage === 1 ? "not-allowed" : "pointer", fontWeight: 500 }}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} style={{ padding: "6px 4px", color: "#94a3b8", fontSize: 13 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{ padding: "6px 12px", border: "1px solid", borderColor: safePage === p ? "#3b82f6" : "#e2e8f0", borderRadius: 4, background: safePage === p ? "#3b82f6" : "#fff", color: safePage === p ? "#fff" : "#0f172a", fontSize: 13, cursor: "pointer", fontWeight: safePage === p ? 700 : 400, minWidth: 34 }}
                      >
                        {p}
                      </button>
                    )
                  )
                }
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 4, background: safePage === totalPages ? "#f8fafc" : "#fff", color: safePage === totalPages ? "#cbd5e1" : "#0f172a", fontSize: 13, cursor: safePage === totalPages ? "not-allowed" : "pointer", fontWeight: 500 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: 24 }}>
        <PageHeader
          title="Movement Tracking"
          badge="MATERIAL"
          subtitle="Track and trace all material movements in real-time."
        />
      </header>

      {viewMode === "detail" && (
        <div style={{ marginBottom: 16 }}>
          <button
            className="mcc-btn"
            onClick={() => { setViewMode("table"); setSelectedMaterialId(null); }}
            style={{ background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0" }}
          >
            ← Back to All Movements
          </button>
        </div>
      )}

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
    </div>
  );
};
export default TrackingDashboard;

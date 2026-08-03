import React, { useState, useEffect } from "react";
import {
  Building,
  Package,
  AlertTriangle,
  DollarSign,
  MapPin,
  Plus,
  Box,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { DataTable } from "../components/ui";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
const Warehouses = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    totalValue: 0,
    lowStock: 0,
    items: 0,
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/materials");
        const grouped = {};
        let totalValue = 0;
        let totalItems = 0;
        let lowStock = 0;
        data.forEach((item) => {
          const wh = item.warehouse || "Unassigned";
          if (!grouped[wh]) {
            grouped[wh] = {
              id: wh,
              name: wh,
              location:
                item.location ||
                (wh === "Unassigned" ? "System Default" : "Primary Location"),
              totalItems: 0,
              totalStock: 0,
              totalValue: 0,
              lowStockItems: 0,
              items: [],
            };
          }
          grouped[wh].totalItems += 1;
          grouped[wh].totalStock += item.quantity || 0;
          grouped[wh].totalValue += (item.quantity || 0) * (item.price || 0);
          if (item.quantity <= (item.lowStockThreshold || 10)) {
            grouped[wh].lowStockItems += 1;
            lowStock += 1;
          }
          grouped[wh].items.push(item);
          totalValue += (item.quantity || 0) * (item.price || 0);
          totalItems += 1;
        });
        const whArray = Object.values(grouped);
        setWarehouseData(whArray);
        setSummary({
          total: whArray.length,
          totalValue,
          lowStock,
          items: totalItems,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load warehouse data");
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);
  const columns = [
    {
      key: "name",
      label: "WAREHOUSE NAME",
      sortable: true,
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "0px",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building size={18} color="#4f46e5" />
          </div>
          <div>
            <span style={{ fontWeight: 700, color: "#1e293b" }}>{val}</span>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {val === "Unassigned"
                ? "Default Virtual Zone"
                : "Physical Location"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "LOCATION",
      align: "left",
      render: (val) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#64748b",
            fontSize: 13,
            justifyContent: "flex-start",
          }}
        >
          <MapPin size={14} /> {val}
        </div>
      ),
    },
    {
      key: "totalItems",
      label: "UNIQUE ITEMS",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "#334155" }}>{val} SKUs</span>
      ),
    },
    {
      key: "totalStock",
      label: "TOTAL STOCK",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: "#0f172a" }}>
          {val.toLocaleString()} units
        </span>
      ),
    },
    {
      key: "totalValue",
      label: "INVENTORY VALUE",
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: "#10b981" }}>
          $
          {val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (_, row) => {
        if (row.name === "Unassigned") {
          return (
            <span
              style={{
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                background: "#f1f5f9",
                color: "#64748b",
                borderRadius: 0,
              }}
            >
              Virtual
            </span>
          );
        }
        const isWarning = row.lowStockItems > 0;
        return (
          <span
            style={{
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              background: isWarning ? "#fffbeb" : "#ecfdf5",
              color: isWarning ? "#f59e0b" : "#10b981",
              border: `1px solid ${isWarning ? "#fde68a" : "#a7f3d0"}`,
              borderRadius: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {isWarning ? (
              <AlertTriangle size={12} />
            ) : (
              <ShieldCheck size={12} />
            )}
            {isWarning ? `${row.lowStockItems} Low Stock` : "Optimal"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "center",
      render: (_, row) => (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <button
            className="rd-btn-compact"
            onClick={() => setSelectedZone(row)}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 0,
              background: "#eff6ff",
              color: "#3b82f6",
              border: "1px solid #dbeafe",
              cursor: "pointer",
            }}
          >
            View Zone
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="rd-container">
      <div className="rd-content">
        <div className="rd-module-header">
          <div className="rd-module-info">
            <div className="rd-module-title-row">
              <span className="rd-module-title">Warehouse Management</span>
              <span className="rd-module-badge">FACILITIES</span>
            </div>
          </div>
        </div>
        <StatsGrid>
          <StatsCard
            title="Active Facilities"
            value={summary.total}
            colorTheme="blue"
            icon={Building}
            trendValue="Managed locations"
            trendPositive={true}
          />
          <StatsCard
            title="Total Value"
            value={`$${summary.totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}`}
            colorTheme="mint"
            icon={DollarSign}
            trendValue="Across all warehouses"
            trendPositive={true}
          />
          <StatsCard
            title="Total Items Managed"
            value={summary.items.toLocaleString()}
            colorTheme="purple"
            icon={Box}
            trendValue="Total inventory units"
            trendPositive={true}
          />
          <StatsCard
            title="Critical Alerts"
            value={summary.lowStock}
            colorTheme="peach"
            icon={AlertTriangle}
            trendValue="Items needing attention"
            trendPositive={false}
          />
        </StatsGrid>
        <div style={{ marginTop: "24px" }}>
          <DataTable
            title="Registered Warehouses"
            subtitle="Overview of all physical and virtual inventory locations"
            columns={columns}
            data={warehouseData}
            loading={loading}
            searchPlaceholder="Search warehouse..."
            searchKeys={["name", "location"]}
            primaryAction={{
              label: "Add Warehouse",
              icon: Plus,
              onClick: () => setShowAddModal(true),
            }}
          />
        </div>
      </div>
      {selectedZone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setSelectedZone(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 0,
              width: "90%",
              maxWidth: 800,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {selectedZone.name} Zone Details
                </h3>
                <p
                  style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}
                >
                  {selectedZone.location} • {selectedZone.totalItems} Unique
                  Items
                </p>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      color: "#64748b",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>
                      Material Name
                    </th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>
                      SKU
                    </th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>
                      Category
                    </th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>
                      Exact Location
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      Stock
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedZone.items.map((item) => {
                    const stock = item.quantity || 0;
                    const min = item.lowStockThreshold || 10;
                    const isLow = stock <= min;
                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td
                          style={{
                            padding: "12px 8px",
                            fontWeight: 500,
                            color: "#1e293b",
                          }}
                        >
                          {item.name}
                        </td>
                        <td style={{ padding: "12px 8px", color: "#64748b" }}>
                          {item.sku || "-"}
                        </td>
                        <td style={{ padding: "12px 8px", color: "#64748b" }}>
                          {item.category || "-"}
                        </td>
                        <td style={{ padding: "12px 8px", color: "#64748b" }}>
                          {item.location || item.rack || item.shelf || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#334155",
                          }}
                        >
                          {stock} {item.unit || "units"}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right" }}>
                          {isLow ? (
                            <span
                              style={{
                                color: "#f59e0b",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Low Stock
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "#10b981",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="rd-btn-compact"
                onClick={() => setSelectedZone(null)}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 0,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 0,
              width: "90%",
              maxWidth: 450,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Add New Warehouse
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: 6,
                  }}
                >
                  Warehouse Name
                </label>
                <input
                  type="text"
                  id="new-wh-name"
                  placeholder="e.g. Facility North"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 0,
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: 6,
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  id="new-wh-loc"
                  placeholder="e.g. 123 Industrial Ave"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 0,
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: 6,
                  }}
                >
                  Type
                </label>
                <select
                  id="new-wh-type"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 0,
                    outline: "none",
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  <option value="physical">Physical Location</option>
                  <option value="virtual">Virtual Zone</option>
                </select>
              </div>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 0,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = document.getElementById("new-wh-name").value;
                  const loc = document.getElementById("new-wh-loc").value;
                  if (!name) {
                    toast.error("Please enter a warehouse name");
                    return;
                  }
                  const newWh = {
                    id: name,
                    name: name,
                    location: loc || "Unassigned",
                    totalItems: 0,
                    totalStock: 0,
                    totalValue: 0,
                    lowStockItems: 0,
                    items: [],
                  };
                  setWarehouseData([...warehouseData, newWh]);
                  setSummary((prev) => ({ ...prev, total: prev.total + 1 }));
                  toast.success("Warehouse created successfully");
                  setShowAddModal(false);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 0,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Create Warehouse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Warehouses;

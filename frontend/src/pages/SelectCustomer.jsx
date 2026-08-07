import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import EmailCell from "../components/ui/EmailCell";
import { ArrowLeft, Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
const SelectCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  const filteredCustomers = customers.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (id) => {
    navigate(`/orders/create/sales?customerId=${id}`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="page-container"
    >
      <div className="breadcrumb-nav">
        <span className="crumb" onClick={() => navigate("/erp")}>
          ERP Operations
        </span>
        <span className="separator">/</span>
        <span className="crumb" onClick={() => navigate("/orders/select-type")}>
          Select Order Type
        </span>
        <span className="separator">/</span>
        <span className="crumb active">Select Customer</span>
      </div>
      <header
        className="module-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <PageHeader
          title="Select Customer"
          subtitle="Choose a customer to create a sales order for."
          showBack={true}
          backPath="/orders/select-type"
        />
        <div className="search-bar premium-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="table-card premium-table-wrapper"
      >
        {loading ? (
          <div className="skeleton-loader-container">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="skeleton-row">
                <div className="skeleton-cell w-16"></div>
                <div className="skeleton-cell w-13"></div>
                <div className="skeleton-cell w-17"></div>
                <div className="skeleton-cell w-12"></div>
                <div className="skeleton-cell w-22"></div>
                <div className="skeleton-cell w-9"></div>
                <div className="skeleton-cell w-11"></div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Search size={48} />
            </div>
            <h3>No customers found</h3>
            <p>Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th className="col-company">Company Name</th>
                  <th className="col-contact">Contact Person</th>
                  <th className="col-email">Email</th>
                  <th className="col-phone">Phone</th>
                  <th className="col-address">Address</th>
                  <th className="col-status">Status</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, i) => {
                  const getContactPerson = () => {
                    if (c.name && c.name !== "Individual Customer") {
                      const n1 = c.name.toLowerCase().split(" ")[0];
                      const c1 = (c.company || "").toLowerCase().split(" ")[0];
                      if (n1 && n1 !== c1) return c.name;
                    }
                    return "No Contact Person";
                  };
                  return (
                    <motion.tr
                      key={c.id || c._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="table-row-hover"
                    >
                      <td className="col-company">
                        <div className="company-info">
                          <div className="avatar-circle">
                            {String(c.company || c.name || "C")[0]}
                          </div>
                          <strong>{c.company || c.name}</strong>
                        </div>
                      </td>
                      <td className="col-contact">{getContactPerson()}</td>
                      <td className="col-email">
                        <EmailCell email={c.email || "-"} />
                      </td>
                      <td className="col-phone">{c.phone || "-"}</td>
                      <td className="col-address">{c.address || "-"}</td>
                      <td className="col-status">
                        <span className="status-badge-inline approved">
                          Active
                        </span>
                      </td>
                      <td className="col-action">
                        <button
                          className="btn-select-gradient"
                          onClick={() => handleSelect(c.id || c._id)}
                        >
                          <UserCheck size={14} /> <span>Select</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      <style jsx="true">{`
        .module-container {
          padding: 24px;
          background-color: var(--bg-body);
          min-height: 100vh;
          color: var(--text-primary);
        }
        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .crumb {
          cursor: pointer;
          transition: color 0.2s;
        }
        .crumb:hover:not(.active) {
          color: var(--primary);
        }
        .crumb.active {
          color: var(--text-primary);
          cursor: default;
        }
        .module-header {
          margin-bottom: 28px;
        }
        .header-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          color: var(--text-muted);
          margin-top: 6px;
          font-size: 15px;
        }
        /* Search Bar Premium */
        .premium-search {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          padding: 10px 18px;
          border-radius: 12px;
          border: 1px solid var(--border);
          width: 320px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .premium-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .search-icon {
          color: #94a3b8;
          margin-right: 12px;
          transition: color 0.3s;
        }
        .premium-search:focus-within .search-icon {
          color: var(--primary);
        }
        .search-input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          color: var(--text-primary);
          font-size: 14px;
        }
        .search-input::placeholder {
          color: #94a3b8;
        }
        /* Table Card */
        .premium-table-wrapper {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          overflow: hidden;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .enterprise-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          min-width: 950px;
        }
        .enterprise-table th {
          text-align: left;
          padding: 16px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.01);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .enterprise-table td {
          padding: 16px 12px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-primary);
          vertical-align: middle;
          overflow-wrap: break-word;
          word-break: normal;
          line-height: 1.5;
          white-space: normal;
        }
        .table-row-hover {
          transition: background-color 0.2s ease;
        }
        .table-row-hover:hover {
          background-color: rgba(37, 99, 235, 0.02);
        }
        .table-row-hover:last-child td {
          border-bottom: none;
        }
        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #3730a3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        .company-info strong {
          display: block;
          overflow-wrap: break-word;
          white-space: normal;
          min-width: 0;
          word-break: break-word;
        }
        .col-company {
          width: 22%;
        }
        .col-contact {
          width: 13%;
          padding-left: 10px;
        }
        .col-email {
          width: 18%;
        }
        .col-phone {
          width: 12%;
        }
        .col-address {
          width: 15%;
        }
        .col-status {
          width: 9%;
          text-align: center !important;
        }
        .col-action {
          width: 11%;
          text-align: right !important;
          padding-right: 24px !important;
        }
        .status-badge-inline {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .status-badge-inline.approved {
          background: rgba(21, 128, 61, 0.1);
          color: #15803d;
          border: 1px solid rgba(21, 128, 61, 0.2);
        }
        .btn-select-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
          padding: 8px 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }
        .btn-select-gradient:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
        }
        .btn-select-gradient:active {
          transform: translateY(1px);
        }
        /* Skeletons */
        .skeleton-loader-container {
          padding: 0;
        }
        .skeleton-row {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          gap: 20px;
        }
        .skeleton-cell {
          height: 20px;
          background: linear-gradient(
            90deg,
            #f1f5f9 25%,
            #e2e8f0 50%,
            #f1f5f9 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .w-16 {
          width: 16%;
        }
        .w-13 {
          width: 13%;
        }
        .w-17 {
          width: 17%;
        }
        .w-12 {
          width: 12%;
        }
        .w-22 {
          width: 22%;
        }
        .w-9 {
          width: 9%;
        }
        .w-11 {
          width: 11%;
        }
        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
        }
        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .empty-state h3 {
          font-size: 18px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .empty-state p {
          font-size: 14px;
        }
      `}</style>
    </motion.div>
  );
};
export default SelectCustomer;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import PasswordInput from "../components/ui/PasswordInput";
import { UserPlus } from "lucide-react";
import StandardPageLayout from "../components/StandardPageLayout/StandardPageLayout";
import toast from "react-hot-toast";
const RoleDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles = ["Admin", "HR", "Manager", "Employee", "Sales"];
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-role-dropdown")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div
      className="custom-role-dropdown"
      style={{ position: "relative", width: "100%" }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "0px",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "42px",
        }}
      >
        {value ? (
          <span
            style={{
              background: "#f1f5f9",
              color: "#64748b",
              padding: "4px 10px",
              fontWeight: 600,
              fontSize: 13,
              display: "inline-block",
            }}
          >
            {value}
          </span>
        ) : (
          <span style={{ color: "#94a3b8" }}>Select Role</span>
        )}
        <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderTop: "none",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          {roles.map((role) => (
            <div
              key={role}
              onClick={() => {
                onChange(role);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #f1f5f9",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#64748b",
                  padding: "4px 10px",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "inline-block",
                }}
              >
                {role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const AddEmployee = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    department: "Employee",
    designation: "",
    contact: "",
    phone: "",
    address: "",
    password: "",
    joinDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isEditMode && id) {
      fetchEmployee();
    }
  }, [isEditMode, id]);
  const fetchEmployee = async () => {
    try {
      const { data } = await API.get(`/employees/${id}`);
      setFormData({
        employeeId: data.employeeId || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        department: data.department || "Employee",
        designation: data.designation || "",
        contact: data.contact || "",
        phone: data.phone || "",
        address: data.address || "",
        password: "",
        joinDate: data.joinDate
          ? new Date(data.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error("Failed to fetch employee data");
      navigate("/hrms");
    } finally {
      setIsFetching(false);
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isEditMode) {
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password) delete dataToSubmit.password;
        await API.put(`/employees/${id}`, dataToSubmit);
        toast.success("Employee updated successfully");
        navigate(`/employees/${id}`);
      } else {
        const res = await API.post("/employees", formData);
        toast.success("Employee created successfully");
        navigate(`/employees/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error saving employee");
      toast.error(err.response?.data?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };
  if (isFetching)
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="loader"></div>
      </div>
    );
  return (
    <StandardPageLayout
      title={isEditMode ? "Edit Employee" : "Add New Employee"}
      subtitle={
        isEditMode
          ? "Update employee details in the system."
          : "Create a new employee profile in HRMS."
      }
      breadcrumbs={[
        { label: "HRMS", path: "/hrms" },
        { label: "Employees", path: "/hrms" },
        { label: isEditMode ? "Edit" : "New" },
      ]}
      onSave={handleSubmit}
      onCancel={() => navigate("/hrms")}
      isEditMode={isEditMode}
      infoCard={
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            style={{
              padding: "12px",
              background: "#e0e7ff",
              borderRadius: "0px",
              color: "#4f46e5",
            }}
          >
            <UserPlus size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>
              {isEditMode
                ? `${formData.firstName} ${formData.lastName}`
                : "New Employee Profile"}
            </h4>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Please complete all required fields below.
            </p>
          </div>
        </div>
      }
    >
      <div className="standard-section">
        <div className="standard-section-header">Basic Details</div>
        {error && (
          <div
            className="error-alert"
            style={{
              color: "#ef4444",
              background: "#fef2f2",
              padding: "12px",
              borderRadius: "0px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}
        <form
          id="employee-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                placeholder="e.g. EMP-001"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="First name"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Last name"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                Role / Department *
              </label>
              <RoleDropdown
                value={formData.department}
                onChange={(val) =>
                  setFormData({ ...formData, department: val })
                }
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                placeholder="e.g. Senior Manager"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
              >
                Join Date *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) =>
                  setFormData({ ...formData, joinDate: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0px",
                }}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="standard-section">
        <div className="standard-section-header">Contact & Security</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
            >
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              placeholder="email@company.com"
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "0px",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              pattern="[0-9\-\+\s\(\)]+"
              maxLength="15"
              title="Valid mobile number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+91 9876543210"
              required
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "0px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              gridColumn: "1 / -1",
            }}
          >
            <label
              style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
            >
              Address
            </label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address..."
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "0px",
              }}
            ></textarea>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              gridColumn: "1 / -1",
            }}
          >
            <label
              style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}
            >
              Password {isEditMode ? "(Leave blank to keep current)" : "*"}
            </label>
            <PasswordInput
              required={!isEditMode}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                isEditMode ? "Enter new password..." : "Enter initial password"
              }
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "0px",
              }}
            />
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
};
export default AddEmployee;

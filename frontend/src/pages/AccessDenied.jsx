import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "48px",
          borderRadius: "16px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "#fee2e2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <ShieldAlert size={40} color="#ef4444" />
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "12px",
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: "15px",
            lineHeight: "1.5",
            marginBottom: "32px",
          }}
        >
          You do not have the required role or permissions to access this page.
          Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "12px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#374151")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#111827")}
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
export default AccessDenied;

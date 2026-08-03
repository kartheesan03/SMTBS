import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
const ComingSoonPage = ({ title, subtitle }) => {
  return (
    <div
      className="main-content flex-center"
      style={{
        flexDirection: "column",
        gap: "20px",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
        }}
      >
        <PageHeader title="" showBack={true} />
      </div>
      <div
        className="premium-card"
        style={{
          padding: "40px",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            color: "#3b82f6",
          }}
        >
          <Clock size={48} />
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "12px",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: "15px",
            marginBottom: "30px",
            lineHeight: "1.6",
          }}
        >
          {subtitle ||
            "This module is currently under development and will be available in a future update."}
        </p>
      </div>
    </div>
  );
};
export default ComingSoonPage;

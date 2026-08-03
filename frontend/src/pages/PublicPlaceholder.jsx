import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import "./LandingPage.css";
const PublicPlaceholder = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div
          className="nav-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-icon"
            style={{ filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.65))" }}
          >
            <g
              stroke="#c084fc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 15 3 L 22 7 L 15 11 L 8 7 Z M 22 7 L 22 15 L 15 19 L 15 11 M 15 19 L 10.5 16.43 M 3 10 L 8 10 M 5.5 13.5 L 11.5 13.5 M 4 17 L 9.5 17" />
            </g>
          </svg>
          <span>SMTBMS</span>
        </div>
        <div className="nav-actions">
          <button className="btn-login" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="btn-signup" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </nav>
      <main
        className="hero-section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: "60vh",
        }}
      >
        <h1
          className="hero-title"
          style={{ fontSize: "48px", marginBottom: "24px" }}
        >
          {title}
        </h1>
        <p className="hero-subtitle">This page is coming soon.</p>
        <button
          className="btn-get-started"
          style={{ marginTop: "32px" }}
          onClick={() => navigate("/")}
        >
          Return Home
        </button>
      </main>
      <div className="fx-bg-orbs">
        <div className="fx-orb fx-orb-1" />
        <div className="fx-orb fx-orb-2" />
      </div>
      <div className="fx-grid-overlay" />
    </div>
  );
};
export default PublicPlaceholder;

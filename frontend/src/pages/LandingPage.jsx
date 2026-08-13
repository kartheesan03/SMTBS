import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Warehouse,
  ShieldCheck,
  Sparkles,
  Target,
  Play,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.add("landing-page-active");
    return () => {
      document.body.classList.remove("landing-page-active");
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div
          className="global-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className="nav-logo" style={{ cursor: "pointer" }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="logo-icon"
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
            <button
              className="btn-signup"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section" id="hero">
        <div className="hero-glow"></div>
        <div
          className="global-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-light">Smart Material Tracking &amp;</span>
              <br />
              <span className="title-light">Business </span>
              <span className="title-purple">Management</span>
              <br />
              <span className="title-purple">System.</span>
            </h1>
            <p className="hero-subtitle">
              SMTBMS unifies material tracking, vendor management, and business
              operations into one powerful platform — giving your team complete
              visibility across every stage of the supply chain.
            </p>
            <div className="hero-cta-group">
              <button
                className="btn-get-started"
                onClick={() => navigate("/register")}
              >
                Get Started{" "}
                <ArrowRight size={18} style={{ marginLeft: "8px" }} />
              </button>
              <button
                className="btn-play-link"
                onClick={() => navigate("/login")}
              >
                <div className="play-icon-circle">
                  <Play size={14} fill="white" />
                </div>
                <span className="play-text">Watch Demo</span>
              </button>
            </div>
            <div className="hero-feature-pills">
              <div className="feature-pill">
                <Sparkles size={16} /> AI-Powered Insights
              </div>
              <div className="feature-pill">
                <Target size={16} /> Real-Time Tracking
              </div>
              <div className="feature-pill">
                <Warehouse size={16} /> Multi-Warehouse
              </div>
              <div className="feature-pill">
                <ShieldCheck size={16} /> Secure &amp; Reliable
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decorations */}
      <div className="fx-bg-orbs">
        <div className="fx-orb fx-orb-1" />
        <div className="fx-orb fx-orb-2" />
        <div className="fx-orb fx-orb-3" />
      </div>
      <div className="fx-grid-overlay" />
    </div>
  );
};

export default LandingPage;

import React, { useState, useContext, useEffect } from "react";
import "./Auth.css";
import { useNavigate, Link, NavLink } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { useMicrosoftLogin } from "../hooks/useMicrosoftLogin";
import {
  Shield,
  Users,
  Monitor,
  User,
  TrendingUp,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Zap,
  Globe,
  Layers,
  Box,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePanel, setActivePanel] = useState("badges");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const roles = [
    { id: "Admin", icon: Shield },
    { id: "HR", icon: Users },
    { id: "Manager", icon: Monitor },
    { id: "Employee", icon: User },
    { id: "Sales", icon: TrendingUp },
  ];
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.minHeight = "unset";
    body.style.backgroundColor = "#0a0118";
    return () => {
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
      body.style.minHeight = "";
      body.style.backgroundColor = "";
    };
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
        role: selectedRole,
      });
      login(data, rememberMe);
      setError("");
      if (
        data.isProfileComplete === false &&
        (data.role === "Customer" || data.role === "Vendor")
      ) {
        navigate(
          data.role === "Customer"
            ? "/complete-customer-profile"
            : "/complete-vendor-profile"
        );
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please try again or check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await API.post("/auth/google", {
          access_token: tokenResponse.access_token,
          mode: "login",
          role: selectedRole,
        });
        login(data, rememberMe);
        if (
          data.isProfileComplete === false &&
          (data.role === "Customer" || data.role === "Vendor")
        ) {
          navigate(
            data.role === "Customer"
              ? "/complete-customer-profile"
              : "/complete-vendor-profile"
          );
        } else {
          navigate("/");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Google Sign-In failed"
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google Sign-In failed. Please try again."),
    prompt: "select_account login",
  });
  const handleMicrosoftLogin = useMicrosoftLogin({
    mode: "login",
    role: selectedRole,
    onSuccess: async ({ access_token }) => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await API.post("/auth/microsoft", {
          access_token,
          mode: "login",
          role: selectedRole,
        });
        login(data, rememberMe);
        if (
          data.isProfileComplete === false &&
          (data.role === "Customer" || data.role === "Vendor")
        ) {
          navigate(
            data.role === "Customer"
              ? "/complete-customer-profile"
              : "/complete-vendor-profile"
          );
        } else {
          navigate("/");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Microsoft Sign-In failed"
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => setError(err.message || "Microsoft Sign-In failed. Please try again."),
  });
  return (
    <div className="fx-login-shell">
      {/* Animated Background Elements */}
      <div className="fx-bg-orbs">
        <div className="fx-orb fx-orb-1" />
        <div className="fx-orb fx-orb-2" />
        <div className="fx-orb fx-orb-3" />
      </div>
      <div className="fx-grid-overlay" />
      {/* ═══ TOP NAVBAR ═══ */}
      <div className="fx-login-nav">
        <div className="fx-nav-left">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fx-nav-icon"
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
        <div className="fx-nav-center">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-nav-link" : "")}
          >
            Home
          </NavLink>
        </div>
        <div className="fx-nav-right">
          <button
            className="fx-nav-btn outline"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            className="fx-nav-btn gradient"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      </div>
      {/* ═══ CENTERED LOGIN FORM ═══ */}
      <div className="fx-login-centered">
        <div className="fx-form-card">
          <div className="fx-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your SMTBMS account</p>
          </div>
          {error && <div className="fx-error">{error}</div>}
          <form onSubmit={handleSubmit} className="fx-form">
            {/* Role Selector */}
            <div className="fx-field">
              <label className="fx-label">Role</label>
              <div className="fx-role-grid">
                {roles.map((r) => {
                  const RIcon = r.icon;
                  const isActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`fx-role-btn ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedRole(r.id)}
                    >
                      <RIcon size={14} />
                      <span>{r.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Email */}
            <div className="fx-field">
              <label className="fx-label">Email address</label>
              <div className="fx-input-wrap">
                <Mail size={16} className="fx-input-icon" />
                <input
                  id="login-form"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="fx-input"
                />
              </div>
            </div>
            {/* Password */}
            <div className="fx-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label className="fx-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" className="fx-forgot-link">
                  Forgot?
                </Link>
              </div>
              <div className="fx-input-wrap">
                <Lock size={16} className="fx-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  className="fx-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="fx-eye-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {/* Remember */}
            <div
              className="fx-remember"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div className={`fx-checkbox ${rememberMe ? "checked" : ""}`} />
              Remember me for 30 days
            </div>
            {/* Submit */}
            <button type="submit" className="fx-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="fx-spinner" />
              ) : (
                <>
                  Sign in{" "}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
            {/* Divider */}
            <div className="fx-divider">
              <span>or continue with</span>
            </div>
            {/* Social */}
            <div className="fx-social-row">
              <button
                type="button"
                className="fx-social-btn"
                onClick={() => handleGoogleLogin()}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09a6.97 6.97 0 010-4.18V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button type="button" className="fx-social-btn" onClick={handleMicrosoftLogin}>
                <svg viewBox="0 0 21 21" width="18" height="18">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                Microsoft
              </button>
            </div>
          </form>
          <p className="fx-signup-link">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;

import React, { useState, useContext } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const roles = ["Admin", "HR", "Manager", "Employee", "Sales"];

  const redirectAfterAuth = (data) => {
    if (data.isProfileComplete === false && (data.role === "Customer" || data.role === "Vendor")) {
      navigate(data.role === "Customer" ? "/complete-customer-profile" : "/complete-vendor-profile");
    } else {
      navigate("/");
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
        redirectAfterAuth(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Google Sign-In failed");
      } finally { setIsLoading(false); }
    },
    onError: () => setError("Google Sign-In failed. Please try again."),
    prompt: "select_account",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password, role: selectedRole });
      login(data, rememberMe);
      setError("");
      redirectAfterAuth(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="auth-shell">

      {/* Main Container */}
      <div className="auth-right">

        {/* SMTBMS Branding inside the container background */}
        <Link to="/" className="auth-brand-block">
          <div className="auth-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" fill="#ffffff" />
              <path d="M2 17l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="auth-brand-text">SMTBMS</span>
        </Link>

        {/* Floating White Card */}
        <div className="auth-card-wrap">
          <h2 className="auth-card-title">Welcome back</h2>
          <p className="auth-card-subtitle">Sign in to your SMTBMS account</p>

          <div className="auth-role-tabs">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                id={`role-tab-${r.toLowerCase()}`}
                className={`auth-role-tab${selectedRole === r ? " active" : ""}`}
                onClick={() => setSelectedRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-social-row">
            <button
              type="button"
              id="google-login-btn"
              className="auth-social-google"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09a6.97 6.97 0 010-4.18V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="auth-or-divider">
            <span>Or continue with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                />
                <button
                  type="button"
                  id="toggle-password"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-forgot-row">
              <Link to="/forgot-password" id="forgot-password-link" className="auth-forgot">
                Forgot password?
              </Link>
            </div>

            <button type="submit" id="login-submit-btn" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Page Footer */}
          <div className="auth-page-footer">
            Are you new? <Link to="/register">Create an Account</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;

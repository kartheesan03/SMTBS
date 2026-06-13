import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, ArrowRight, ShieldCheck, Clock, Activity, BarChart3, Users, Package } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            setError('');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Side: Brand Experience Section (60%) */}
            <div className="brand-section">
                <div className="brand-content">
                    <div className="brand-logo">
                        <div className="logo-icon-wrapper">
                            <Box size={32} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <span className="logo-text">SMTBMS</span>
                    </div>

                    <div className="brand-text-container">
                        <h1 className="brand-heading">Smart Material Tracking & Business Management System</h1>
                        <p className="brand-description">
                            Track materials, manage inventory, monitor deliveries, automate ERP operations and streamline workforce management.
                        </p>
                    </div>

                    <div className="dashboard-preview-wrapper">
                        <div className="dashboard-ui">
                            {/* Dashboard Header Mockup */}
                            <div className="dash-header">
                                <div className="dash-title-bar">
                                    <div className="dash-dot red"></div>
                                    <div className="dash-dot yellow"></div>
                                    <div className="dash-dot green"></div>
                                </div>
                                <div className="dash-nav">
                                    <div className="dash-nav-item active"></div>
                                    <div className="dash-nav-item"></div>
                                    <div className="dash-nav-item"></div>
                                    <div className="dash-nav-item"></div>
                                </div>
                            </div>

                            {/* KPI Cards */}
                            <div className="kpi-grid">
                                <div className="kpi-card hover-lift">
                                    <div className="kpi-icon-wrapper blue"><Package size={18} /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Materials Tracked</span>
                                        <h4 className="kpi-value">14,250+</h4>
                                    </div>
                                </div>
                                <div className="kpi-card hover-lift delay-1">
                                    <div className="kpi-icon-wrapper green"><BarChart3 size={18} /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Inventory Value</span>
                                        <h4 className="kpi-value">$2.4M</h4>
                                    </div>
                                </div>
                                <div className="kpi-card hover-lift delay-2">
                                    <div className="kpi-icon-wrapper purple"><Activity size={18} /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Active Orders</span>
                                        <h4 className="kpi-value">342</h4>
                                    </div>
                                </div>
                                <div className="kpi-card hover-lift delay-3">
                                    <div className="kpi-icon-wrapper orange"><Users size={18} /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Employee Count</span>
                                        <h4 className="kpi-value">1,024</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area Mockup */}
                            <div className="dash-main-area">
                                <div className="dash-chart-section">
                                    <div className="dash-skeleton-line title"></div>
                                    <div className="dash-chart-bars">
                                        <div className="bar h-60"></div>
                                        <div className="bar h-80"></div>
                                        <div className="bar h-40"></div>
                                        <div className="bar h-90"></div>
                                        <div className="bar h-50"></div>
                                        <div className="bar h-70"></div>
                                        <div className="bar h-100"></div>
                                    </div>
                                </div>
                                <div className="dash-side-section">
                                    <div className="dash-skeleton-line title"></div>
                                    <div className="dash-list-item"></div>
                                    <div className="dash-list-item"></div>
                                    <div className="dash-list-item"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Subtle Background Elements */}
                <div className="bg-glow top-right"></div>
                <div className="bg-glow bottom-left"></div>
            </div>

            {/* Right Side: Login Panel (40%) */}
            <div className="login-section">
                <div className="login-header-meta">
                    <div className="meta-item secure-badge">
                        <ShieldCheck size={14} /> Secure Login
                    </div>
                    <div className="meta-item">
                        <Clock size={14} /> {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="meta-item version-badge">
                        v2.0
                    </div>
                </div>

                <div className="login-card-wrapper">
                    <div className="login-card">
                        <div className="card-header">
                            <div className="card-logo-center">
                                <div className="logo-icon-wrapper-small">
                                    <Box size={24} color="#ffffff" strokeWidth={2.5} />
                                </div>
                                <h2>SMTBMS</h2>
                            </div>
                            <h3 className="welcome-heading">Welcome Back</h3>
                            <p className="welcome-subtext">Please enter your credentials to access your account.</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form-content">
                            <div className="input-group">
                                <label><Mail size={16} className="label-icon" /> Email Address</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="email" 
                                        placeholder="name@company.com" 
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Lock size={16} className="label-icon" /> Password</label>
                                <div className="input-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    <span>Remember me</span>
                                </label>
                                <button type="button" className="forgot-password">Forgot Password?</button>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? 'Signing In...' : (
                                    <>
                                        Sign In <ArrowRight size={18} className="btn-icon" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="login-footer">
                        <p>© 2026 SMTBMS | Enterprise Management Suite</p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .login-container {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                .brand-section {
                    flex: 0 0 60%;
                    background-color: #0B1026;
                    background-image: radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 50%),
                                      radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.08), transparent 50%);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                }

                .brand-content {
                    position: relative;
                    z-index: 10;
                    max-width: 760px;
                    width: 100%;
                }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 48px;
                }

                .logo-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
                }

                .logo-text {
                    font-size: 28px;
                    font-weight: 800;
                    color: #FFFFFF;
                    letter-spacing: -0.5px;
                }

                .brand-text-container {
                    margin-bottom: 60px;
                }

                .brand-heading {
                    font-size: 44px;
                    font-weight: 800;
                    color: #FFFFFF;
                    line-height: 1.15;
                    margin: 0 0 24px 0;
                    letter-spacing: -1px;
                }

                .brand-description {
                    font-size: 18px;
                    color: #94A3B8;
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 0;
                }

                .dashboard-preview-wrapper {
                    background: rgba(30, 41, 59, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(20px);
                    transform: perspective(1000px) rotateX(2deg) rotateY(2deg);
                    transition: transform 0.5s ease;
                }

                .dashboard-preview-wrapper:hover {
                    transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
                }

                .dashboard-ui {
                    background: #0F172A;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .dash-header {
                    height: 40px;
                    background: #1E293B;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .dash-title-bar {
                    display: flex;
                    gap: 6px;
                    margin-right: 24px;
                }

                .dash-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .dash-dot.red { background: #EF4444; }
                .dash-dot.yellow { background: #F59E0B; }
                .dash-dot.green { background: #10B981; }

                .dash-nav {
                    display: flex;
                    gap: 12px;
                }

                .dash-nav-item {
                    height: 6px;
                    width: 30px;
                    background: #334155;
                    border-radius: 4px;
                }
                .dash-nav-item.active {
                    background: #6366F1;
                    width: 40px;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    padding: 20px;
                }

                .kpi-card {
                    background: #1E293B;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .kpi-card.hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .kpi-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-icon-wrapper.blue { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
                .kpi-icon-wrapper.green { background: rgba(16, 185, 129, 0.15); color: #34D399; }
                .kpi-icon-wrapper.purple { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
                .kpi-icon-wrapper.orange { background: rgba(249, 115, 22, 0.15); color: #FB923C; }

                .kpi-data {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .kpi-label {
                    font-size: 11px;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .kpi-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #FFFFFF;
                    margin: 0;
                }

                .dash-main-area {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 16px;
                    padding: 0 20px 20px 20px;
                }

                .dash-chart-section, .dash-side-section {
                    background: #1E293B;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 16px;
                    height: 140px;
                }

                .dash-skeleton-line.title {
                    height: 8px;
                    width: 30%;
                    background: #334155;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }

                .dash-chart-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    height: 80px;
                    padding-top: 10px;
                }

                .bar {
                    flex: 1;
                    background: linear-gradient(180deg, #6366F1 0%, rgba(99, 102, 241, 0.2) 100%);
                    border-radius: 4px 4px 0 0;
                    opacity: 0.8;
                }

                .bar.h-60 { height: 60%; }
                .bar.h-80 { height: 80%; }
                .bar.h-40 { height: 40%; }
                .bar.h-90 { height: 90%; }
                .bar.h-50 { height: 50%; }
                .bar.h-70 { height: 70%; }
                .bar.h-100 { height: 100%; }

                .dash-list-item {
                    height: 16px;
                    background: #334155;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    width: 100%;
                }
                .dash-list-item:last-child { width: 80%; }

                .bg-glow {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
                    border-radius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                }
                .bg-glow.top-right { top: -200px; right: -200px; }
                .bg-glow.bottom-left { bottom: -200px; left: -200px; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%); }

                .login-section {
                    flex: 0 0 40%;
                    background-color: #F8FAFC;
                    display: flex;
                    flex-direction: column;
                    padding: 32px 48px;
                    position: relative;
                }

                .login-header-meta {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: auto;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748B;
                }

                .secure-badge {
                    color: #10B981;
                    background: rgba(16, 185, 129, 0.1);
                    padding: 6px 12px;
                    border-radius: 20px;
                }

                .version-badge {
                    background: #E2E8F0;
                    padding: 4px 8px;
                    border-radius: 6px;
                    color: #475569;
                }

                .login-card-wrapper {
                    width: 100%;
                    max-width: 440px;
                    margin: 0 auto;
                    margin-bottom: auto;
                }

                .login-card {
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 48px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 36px;
                }

                .card-logo-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .logo-icon-wrapper-small {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .card-logo-center h2 {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0B1026;
                    margin: 0;
                }

                .welcome-heading {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0B1026;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }

                .welcome-subtext {
                    font-size: 14px;
                    color: #64748B;
                    margin: 0;
                    line-height: 1.5;
                }

                .error-alert {
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 24px;
                    text-align: center;
                }

                .form-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                }

                .label-icon {
                    color: #6366F1;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 14px 16px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #0F172A;
                    transition: all 0.2s ease;
                }

                .input-wrapper input:focus {
                    background: #FFFFFF;
                    border-color: #6366F1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }

                .password-toggle:hover {
                    color: #64748B;
                }

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: -4px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                }

                .remember-me input {
                    display: none;
                }

                .checkmark {
                    width: 18px;
                    height: 18px;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.2s;
                }

                .remember-me:hover .checkmark {
                    border-color: #94A3B8;
                }

                .remember-me input:checked + .checkmark {
                    background: #6366F1;
                    border-color: #6366F1;
                }

                .remember-me input:checked + .checkmark::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 2px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .forgot-password {
                    background: none;
                    border: none;
                    padding: 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6366F1;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .forgot-password:hover {
                    color: #4F46E5;
                    text-decoration: underline;
                }

                .submit-btn {
                    background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
                }

                .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.35);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .login-footer {
                    text-align: center;
                    margin-top: 32px;
                }

                .login-footer p {
                    font-size: 13px;
                    color: #94A3B8;
                    margin: 0;
                }

                @media (max-width: 1200px) {
                    .dash-main-area {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 1024px) {
                    .brand-section {
                        padding: 40px;
                    }
                    .kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .brand-heading {
                        font-size: 36px;
                    }
                    .login-section {
                        padding: 24px 32px;
                    }
                    .login-header-meta {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) {
                    .login-container {
                        flex-direction: column;
                    }
                    .brand-section {
                        flex: none;
                        padding: 40px 20px;
                    }
                    .login-section {
                        flex: none;
                        padding: 40px 20px;
                    }
                    .login-header-meta {
                        margin-bottom: 32px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;

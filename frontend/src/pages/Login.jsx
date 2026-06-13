import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, ArrowRight, ShoppingCart, Users, Package, BarChart3, Activity, Archive, FileText, Briefcase, PieChart, Check, Truck, Monitor, Scan, LayoutGrid } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            console.log('Login successful. Received user role from API:', data.role);
            login(data);
            setError('');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            console.error('Login error:', err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await API.post('/auth/google', { credential: credentialResponse.credential });

            console.log('Google login successful. Role:', response.data.role);
            login(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google Login failed');
            console.error('Google login error:', err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-layout">
            {/* Left Side - Branding & Illustration */}
            <div className="login-brand-panel desktop-only">
                <div className="brand-content">
                    <div className="brand-logo-large">
                        <div className="logo-icon-wrapper">
                            <Box size={32} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <span className="logo-text-large">SMTBMS</span>
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title">Smart Material Tracking &<br/>Business Management System</h1>
                        <p className="brand-subtitle">End-to-End Material Tracking, Inventory Control and Enterprise Operations.</p>
                    </div>
                    
                    <div className="brand-illustration saas-corporate">
                        {/* Features List */}
                        <div className="corporate-features">
                            <div className="feature-check"><Check size={18} className="check-icon" /> Material Tracking</div>
                            <div className="feature-check"><Check size={18} className="check-icon" /> Inventory Management</div>
                            <div className="feature-check"><Check size={18} className="check-icon" /> ERP Order Processing</div>
                            <div className="feature-check"><Check size={18} className="check-icon" /> Employee & HRMS Management</div>
                            <div className="feature-check"><Check size={18} className="check-icon" /> Delivery Tracking</div>
                        </div>

                        {/* Large Enterprise Illustration */}
                        <div className="enterprise-scene">
                            <div className="scene-element el-warehouse">
                                <LayoutGrid size={28} className="scene-icon text-indigo" />
                                <span>Warehouse</span>
                            </div>
                            <div className="scene-element el-inventory">
                                <Package size={28} className="scene-icon text-green" />
                                <span>Inventory</span>
                            </div>
                            <div className="scene-element el-dashboard">
                                <Monitor size={40} className="scene-icon text-blue" />
                                <span>Dashboard</span>
                            </div>
                            <div className="scene-element el-scanner">
                                <Scan size={28} className="scene-icon text-purple" />
                                <span>Scanning</span>
                            </div>
                            <div className="scene-element el-truck">
                                <Truck size={28} className="scene-icon text-orange" />
                                <span>Logistics</span>
                            </div>

                            {/* Connecting Path */}
                            <svg className="scene-connections" viewBox="0 0 500 240">
                                <path className="track-path" d="M80,100 C150,20 350,20 420,100 C350,180 150,180 80,100" />
                                <circle className="track-dot dot1" r="3" />
                                <circle className="track-dot dot2" r="3" />
                                <circle className="track-dot dot3" r="3" />
                            </svg>
                        </div>

                        {/* Subtle Animated Line Flow Text */}
                        <div className="flow-tracker">
                            <div className="flow-nodes">
                                <span>Vendor</span>
                                <ArrowRight size={14} className="flow-arrow" />
                                <span>Inventory</span>
                                <ArrowRight size={14} className="flow-arrow" />
                                <span>Order</span>
                                <ArrowRight size={14} className="flow-arrow" />
                                <span>Delivery</span>
                                <ArrowRight size={14} className="flow-arrow" />
                                <span>Customer</span>
                            </div>
                            <div className="flow-progress-bar">
                                <div className="flow-progress-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="brand-footer">
                    <p>© 2026 SMTBMS. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <div className="mobile-logo mobile-only">
                            <div className="logo-icon-wrapper-small">
                                <Box size={24} color="#ffffff" strokeWidth={2.5} />
                            </div>
                            <span className="logo-text-small">SMTBMS</span>
                        </div>
                        <h2 className="welcome-text">Enterprise Resource Management Portal</h2>
                    </div>
                    
                    {error && (
                        <div className="error-alert">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label>Email address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
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
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
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

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : (
                                <>
                                    Sign In <ArrowRight size={18} className="btn-icon" />
                                </>
                            )}
                        </button>
                        
                        <div className="divider">
                            <span>or continue with</span>
                        </div>
                        
                        <div className="google-btn-wrapper">
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                width="360"
                                theme="outline"
                                text="signin_with"
                            />
                        </div>
                    </form>
                    
                    <div className="trust-indicators">
                        <div className="trust-item"><Lock size={14} /> Secure Login</div>
                        <div className="trust-item"><Users size={14} /> Role-Based Access</div>
                        <div className="trust-item"><Activity size={14} /> Real-Time Tracking</div>
                    </div>

                    <div className="form-footer">
                        <p>Don't have an account? <Link to="/register">Create one now</Link></p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`

                .login-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #ffffff;
                }

                /* --- Left Panel --- */
                .login-brand-panel {
                    flex: 1.2;
                    background: linear-gradient(145deg, #0B1120 0%, #0F172A 100%);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 60px;
                    color: #ffffff;
                }

                .brand-content {
                    position: relative;
                    z-index: 1;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .brand-logo-large {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 60px;
                }

                .logo-icon-wrapper {
                    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }

                .logo-text-large {
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .brand-title {
                    font-size: 42px;
                    font-weight: 800;
                    line-height: 1.2;
                    margin: 0 0 16px 0;
                    letter-spacing: -1px;
                }

                .brand-subtitle {
                    font-size: 18px;
                    color: #94a3b8;
                    line-height: 1.5;
                    max-width: 85%;
                }

                /* SaaS Corporate Illustration */
                .brand-illustration.saas-corporate {
                    position: relative;
                    margin-top: 30px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    animation: fadeIn 0.8s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .corporate-features {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .feature-check {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    color: #E2E8F0;
                    font-weight: 500;
                }

                .check-icon {
                    color: #10B981;
                }

                .enterprise-scene {
                    position: relative;
                    height: 240px;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    background: transparent;
                }

                .scene-element {
                    position: absolute;
                    background: #1E293B;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #F8FAFC;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.25);
                    transform: translate(-50%, -50%);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    z-index: 5;
                }

                .scene-element:hover {
                    transform: translate(-50%, -50%) scale(1.05);
                    box-shadow: 0 16px 32px rgba(0,0,0,0.3);
                    border-color: rgba(255,255,255,0.15);
                }

                .text-indigo { color: #818CF8; }
                .text-green { color: #34D399; }
                .text-blue { color: #60A5FA; }
                .text-purple { color: #A78BFA; }
                .text-orange { color: #FBBF24; }

                /* Positions on the path */
                .el-warehouse { top: 100px; left: 80px; }
                .el-inventory { top: 20px; left: 250px; }
                .el-dashboard { top: 100px; left: 250px; z-index: 10; padding: 20px; }
                .el-scanner { top: 180px; left: 250px; }
                .el-truck { top: 100px; left: 420px; }

                .scene-connections {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }

                .track-path {
                    stroke: rgba(255, 255, 255, 0.06);
                    stroke-width: 2;
                    fill: none;
                }

                .track-dot {
                    fill: #818CF8;
                    filter: drop-shadow(0 0 6px #818CF8);
                }

                /* Path length ~800, dot travels around */
                .dot1 { animation: flowDot 8s infinite linear; }
                .dot2 { animation: flowDot 8s infinite linear 2.6s; }
                .dot3 { animation: flowDot 8s infinite linear 5.3s; }

                @keyframes flowDot {
                    0% { cx: 80px; cy: 100px; opacity: 0; }
                    10% { opacity: 1; }
                    25% { cx: 250px; cy: 20px; }
                    50% { cx: 420px; cy: 100px; }
                    75% { cx: 250px; cy: 180px; }
                    90% { opacity: 1; }
                    100% { cx: 80px; cy: 100px; opacity: 0; }
                }

                .flow-tracker {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: auto;
                    background: transparent;
                }

                .flow-nodes {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    font-weight: 600;
                    color: #94A3B8;
                }

                .flow-arrow {
                    color: #4F46E5;
                    opacity: 0.5;
                }

                .flow-progress-bar {
                    width: 100%;
                    height: 2px;
                    background: rgba(255,255,255,0.05);
                    position: relative;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .flow-progress-fill {
                    position: absolute;
                    left: -50%;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    background: linear-gradient(90deg, transparent, #4F46E5, transparent);
                    animation: sweep 3s infinite linear;
                }

                @keyframes sweep {
                    to { left: 100%; }
                }

                /* Removed old secure-access-note */

                .flow-step {
                    font-size: 13px;
                    font-weight: 600;
                    color: #F8FAFC;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 6px 14px;
                    border-radius: 20px;
                }

                .flow-arrow {
                    color: #4F46E5;
                }

                .corporate-features {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .feature-check {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 15px;
                    color: #E2E8F0;
                    font-weight: 500;
                }

                .check-icon {
                    color: #10B981;
                    background: rgba(16, 185, 129, 0.1);
                    padding: 4px;
                    border-radius: 50%;
                }

                .brand-footer {
                    position: relative;
                    z-index: 1;
                    color: #64748b;
                    font-size: 13px;
                }

                /* --- Right Panel --- */
                .login-form-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background: #F8FAFC;
                    position: relative;
                }

                .login-form-panel::before {
                    content: '';
                    position: absolute;
                    top: -20%;
                    right: -20%;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
                    border-radius: 50%;
                    z-index: 0;
                }

                .form-container {
                    width: 100%;
                    max-width: 440px;
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    position: relative;
                    z-index: 1;
                    animation: formFadeIn 0.8s ease-out forwards;
                }

                @keyframes formFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .form-header {
                    margin-bottom: 32px;
                }

                .mobile-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .logo-icon-wrapper-small {
                    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                }

                .logo-text-small {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0B1026;
                }

                .welcome-text {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0B1026;
                    margin: 0;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                /* Removed subtitle and role badges */

                .trust-indicators {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #F1F5F9;
                }

                .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #64748b;
                }

                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 14px 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .input-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 14px 16px 14px 44px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #0f172a;
                    transition: all 0.2s;
                }

                .input-wrapper input:focus {
                    background: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .input-wrapper input::placeholder {
                    color: #cbd5e1;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    padding: 0;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .password-toggle:hover {
                    color: #64748b;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: -8px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #475569;
                    cursor: pointer;
                    user-select: none;
                }

                .remember-me input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }

                .checkmark {
                    height: 18px;
                    width: 18px;
                    background-color: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.2s;
                }

                .remember-me:hover input ~ .checkmark {
                    border-color: #94a3b8;
                }

                .remember-me input:checked ~ .checkmark {
                    background-color: #6366f1;
                    border-color: #6366f1;
                }

                .checkmark:after {
                    content: "";
                    position: absolute;
                    display: none;
                    left: 6px;
                    top: 2px;
                    width: 5px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .remember-me input:checked ~ .checkmark:after {
                    display: block;
                }

                .forgot-password {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6366f1;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .forgot-password:hover {
                    color: #4f46e5;
                }

                .login-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: #ffffff;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
                    position: relative;
                    overflow: hidden;
                }

                .login-btn::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: all 0.5s;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .login-btn:hover::after {
                    left: 100%;
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .login-btn:hover .btn-icon {
                    transform: translateX(4px);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 13px;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }
                .divider span {
                    padding: 0 10px;
                }

                .google-btn-wrapper {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .form-footer {
                    margin-top: 40px;
                    text-align: center;
                }

                .form-footer p {
                    font-size: 14px;
                    color: #64748b;
                }

                .form-footer a {
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                }
                .form-footer a:hover {
                    text-decoration: underline;
                }

                /* --- Responsive Adjustments --- */
                .mobile-only {
                    display: none;
                }
                .desktop-only {
                    display: flex;
                }

                @media (max-width: 1024px) {
                    .login-brand-panel {
                        padding: 40px;
                    }
                    .brand-title {
                        font-size: 32px;
                    }
                    .enterprise-scene {
                        transform: scale(0.85);
                        transform-origin: center;
                    }
                    .corporate-features {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex;
                    }
                    .login-layout {
                        flex-direction: column;
                    }
                    .login-form-panel {
                        padding: 30px 20px;
                        background: #f8fafc;
                        min-height: 100vh;
                        align-items: flex-start;
                        padding-top: 60px;
                    }
                    .form-container {
                        background: #ffffff;
                        padding: 40px 30px;
                        border-radius: 20px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e2e8f0;
                    }
                    .welcome-text {
                        font-size: 28px;
                    }
                }

                @media (max-width: 480px) {
                    .form-container {
                        padding: 30px 20px;
                    }
                    .welcome-text {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;

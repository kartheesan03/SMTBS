import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, Package, Archive, ShoppingCart, Truck, FileText, User, Phone, Shield } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Customer');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, email, phone, role, password };
            const { data } = await API.post('/auth/register', payload);
            login(data);
            setError('');
            if (data.isProfileComplete === false) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/google', {
                credential: credentialResponse.credential,
                signupRole: role
            });
            
            login(data);
            if (data.isProfileComplete === false) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg || 'Google Sign-up failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="split-card">
                {/* Left Side: Visual Branding Panel (55%) */}
                <div className="brand-panel">
                    <div className="brand-header">
                        <div className="logo-icon">
                            <Box size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <span className="logo-text">SMTBMS</span>
                    </div>

                    <div className="brand-content">
                        <h1 className="brand-title">Smart Material Tracking &<br/>Business Management System</h1>
                        <p className="brand-desc">
                            Enterprise ERP, Inventory Management, Material Tracking, HRMS and Delivery Operations.
                        </p>

                        {/* Enterprise-themed icons illustration */}
                        <div className="erp-illustration">
                            <div className="icon-badge">
                                <Archive size={28} color="#6366F1" />
                                <span>Inventory</span>
                            </div>
                            <div className="icon-badge">
                                <Package size={28} color="#10B981" />
                                <span>Materials</span>
                            </div>
                            <div className="icon-badge">
                                <ShoppingCart size={28} color="#F59E0B" />
                                <span>Orders</span>
                            </div>
                            <div className="icon-badge">
                                <Truck size={28} color="#EF4444" />
                                <span>Delivery</span>
                            </div>
                            <div className="icon-badge">
                                <FileText size={28} color="#8B5CF6" />
                                <span>Reports</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Register Form (45%) */}
                <div className="login-panel">
                    <div className="login-form-container">
                        <div className="login-header" style={{ marginBottom: '24px' }}>
                            <div className="login-logo-mobile">
                                <div className="logo-icon-dark">
                                    <Box size={20} color="#ffffff" strokeWidth={2.5} />
                                </div>
                                <span className="logo-text-dark">SMTBMS</span>
                            </div>
                            <h2 className="welcome-title">Create an account</h2>
                            <p className="welcome-subtitle">Get started by filling out the information below.</p>
                        </div>

                        {error && (
                            <div className="error-alert" style={{ marginBottom: '16px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form" style={{ gap: '16px' }}>
                            <div className="input-group">
                                <label><User size={16} className="label-icon" /> Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="input-group">
                                    <label><Mail size={16} className="label-icon" /> Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="name@company.com" 
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <label><Phone size={16} className="label-icon" /> Phone Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="+1 234 567 890" 
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setError(''); }}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Shield size={16} className="label-icon" /> Account Type</label>
                                <div className="select-wrapper">
                                    <select 
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Vendor">Vendor/Supplier</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="input-group">
                                    <label><Lock size={16} className="label-icon" /> Password</label>
                                    <div className="password-wrapper">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><Lock size={16} className="label-icon" /> Confirm Password</label>
                                    <div className="password-wrapper">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '0' }}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <div className="divider">
                                <span>or continue with</span>
                            </div>
                            
                            <div className="google-btn-wrapper">
                                <GoogleLogin 
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Sign-Up failed. Please try again.')}
                                    theme="outline"
                                    size="large"
                                    text="signup_with"
                                    width="300"
                                />
                            </div>
                            
                            <div className="signup-link-wrapper" style={{ marginTop: '12px' }}>
                                Already have an account? <Link to="/login" className="signup-link">Sign in here</Link>
                            </div>
                        </form>


                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .login-wrapper {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    overflow: hidden;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                .split-card {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    background: #FFFFFF;
                }

                /* Left Branding Panel (55%) */
                .brand-panel {
                    flex: 0 0 55%;
                    width: 55%;
                    background-color: #0B1026;
                    padding: 60px 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    color: #FFFFFF;
                    box-sizing: border-box;
                }

                .brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background: #6366F1;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-text {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }

                .brand-content {
                    margin-top: auto;
                    margin-bottom: auto;
                }

                .brand-title {
                    font-size: 36px;
                    font-weight: 800;
                    line-height: 1.25;
                    margin: 0 0 20px 0;
                    letter-spacing: -0.5px;
                }

                .brand-desc {
                    font-size: 16px;
                    color: #94A3B8;
                    line-height: 1.6;
                    max-width: 90%;
                    margin: 0 0 48px 0;
                }

                .erp-illustration {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .icon-badge {
                    background: #151B32;
                    border: 1px solid #1F2947;
                    border-radius: 12px;
                    padding: 20px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    width: 96px;
                    transition: transform 0.3s ease;
                }

                .icon-badge:hover {
                    transform: translateY(-4px);
                    background: #1A2242;
                }

                .icon-badge span {
                    font-size: 13px;
                    font-weight: 600;
                    color: #E2E8F0;
                }

                /* Right Login Panel (45%) */
                .login-panel {
                    flex: 0 0 45%;
                    width: 45%;
                    background-color: #FFFFFF;
                    padding: 60px 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    overflow-y: auto;
                }

                .login-form-container {
                    width: 100%;
                    max-width: 440px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex: 1;
                }

                .login-header {
                    margin-bottom: 36px;
                }

                .login-logo-mobile {
                    display: none;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .logo-icon-dark {
                    width: 32px;
                    height: 32px;
                    background: #6366F1;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-text-dark {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0B1026;
                }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0B1026;
                    margin: 0 0 8px 0;
                }

                .welcome-subtitle {
                    font-size: 15px;
                    color: #64748B;
                    margin: 0;
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
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    flex: 1;
                }

                .input-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                }

                .label-icon {
                    color: #6366F1;
                }

                .input-group input, .select-wrapper select {
                    width: 100%;
                    padding: 14px 16px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #0F172A;
                    transition: all 0.2s ease;
                }

                .input-group input:focus, .select-wrapper select:focus {
                    background: #FFFFFF;
                    border-color: #6366F1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .input-group input::placeholder {
                    color: #94A3B8;
                }

                .select-wrapper select {
                    appearance: none;
                    cursor: pointer;
                }

                .password-wrapper {
                    position: relative;
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

                .submit-btn {
                    background: #0B1026;
                    color: #FFFFFF;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.3s ease;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #1A2242;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(11, 16, 38, 0.15);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .signup-link-wrapper {
                    text-align: center;
                    margin-top: 16px;
                    font-size: 14px;
                    color: #64748B;
                }

                .signup-link {
                    color: #6366F1;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .signup-link:hover {
                    color: #4F46E5;
                    text-decoration: underline;
                }

                .login-footer {
                    text-align: center;
                    margin-top: 40px;
                }

                .login-footer p {
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 500;
                    margin: 0;
                }

                .clean-mock-google-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    width: 100%;
                    max-width: 300px;
                    margin: 0 auto;
                    background: #FFFFFF;
                    border: 1px solid #DADCE0;
                    border-radius: 4px;
                    padding: 10px 14px;
                    font-family: 'Roboto', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #3C4043;
                    cursor: pointer;
                    transition: background-color 0.2s, box-shadow 0.2s;
                }

                .clean-mock-google-btn:hover {
                    background: #F8FAFC;
                    box-shadow: 0 1px 3px rgba(60,64,67,0.3);
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .login-wrapper {
                        overflow-y: auto;
                        height: auto;
                        min-height: 100vh;
                    }
                    .split-card {
                        flex-direction: column;
                        height: auto;
                    }
                    .brand-panel, .login-panel {
                        flex: none;
                        width: 100%;
                        padding: 40px;
                    }
                    .login-logo-mobile {
                        display: flex;
                    }
                    .brand-header {
                        display: none;
                    }
                    .login-header {
                        text-align: center;
                    }
                    .login-logo-mobile {
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .brand-panel {
                        padding: 32px 24px;
                    }
                    .login-panel {
                        padding: 32px 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;

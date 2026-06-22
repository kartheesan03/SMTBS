import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Customer');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = 'hidden';
        html.style.height = '100%';
        body.style.overflow = 'hidden';
        body.style.height = '100%';
        body.style.minHeight = 'unset';
        body.style.backgroundColor = '#ffffff';
        return () => {
            html.style.overflow = '';
            html.style.height = '';
            body.style.overflow = '';
            body.style.height = '';
            body.style.minHeight = '';
            body.style.backgroundColor = '';
        };
    }, []);

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
            login(data, false);
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

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token,
                    mode: 'signup',
                    role: role
                });
                
                login(data, false);
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
        },
        onError: () => setError('Google Sign-up failed. Please try again.'),
        prompt: 'select_account login'
    });

    return (
        <div className="login-wrapper">
            <div className="login-split">
                
                {/* Left Side: Clean Artwork without overlapping text */}
                <div className="login-banner">
                </div>

                {/* Right Side: Form */}
                <div className="login-form-wrapper">
                    <div className="form-card">
                        <div className="form-header">
                            <div className="logo-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box">
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                                    <path d="m3.3 7 8.7 5 8.7-5"/>
                                    <path d="M12 22V12"/>
                                </svg>
                                <span>SMTBMS</span>
                            </div>
                            <h2>Create Account</h2>
                            <p>Register to access the enterprise platform</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    required
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Email Address</label>
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
                                    <label>Phone Number</label>
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
                                <label>Account Type</label>
                                <div className="select-wrapper">
                                    <select 
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="Customer">Customer (Buyer)</option>
                                        <option value="Vendor">Vendor/Supplier</option>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '12px' }}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                            
                            <div className="divider">
                                <span>or</span>
                            </div>
                            
                            <button type="button" className="google-btn" onClick={() => handleGoogleSignup()}>
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Sign up with Google
                            </button>

                            <div className="signup-link-wrapper">
                                Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
                            </div>
                        </form>
                    </div>
                    
                    <div className="login-footer">
                        <a href="#">Terms of Use</a>
                        <span className="footer-dot">•</span>
                        <a href="#">Privacy & Cookies</a>
                        <span className="footer-dot">•</span>
                        <span>&copy; {new Date().getFullYear()} SMTBMS</span>
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
                    font-family: 'Segoe UI', 'Inter', -apple-system, Roboto, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background-color: #ffffff;
                }

                .login-split {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }

                .login-banner {
                    flex: 1.1;
                    display: none;
                    background-color: #f3f4f6;
                    background-image: url('/enterprise_background.png');
                    background-size: cover;
                    background-position: center;
                    border-right: 1px solid #e5e7eb;
                }

                .login-form-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-color: #ffffff;
                    position: relative;
                    height: 100%;
                    overflow-y: auto;
                }
                
                .form-card {
                    margin: auto;
                    width: 100%;
                    max-width: 480px;
                    padding: 40px 20px;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #0067b8;
                    margin-bottom: 24px;
                }
                
                .logo-container span {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    letter-spacing: -0.5px;
                }

                .form-header h2 {
                    font-size: 26px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 6px 0;
                }

                .form-header p {
                    font-size: 15px;
                    color: #6b7280;
                    margin: 0 0 24px 0;
                }

                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 12px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 24px;
                }

                .input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .input-group {
                    margin-bottom: 16px;
                }

                .input-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .input-group input, .select-wrapper select {
                    width: 100%;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 15px;
                    color: #111827;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .input-group input:focus, .select-wrapper select:focus {
                    outline: none;
                    border-color: #0067b8;
                    box-shadow: 0 0 0 2px rgba(0, 103, 184, 0.2);
                }

                .input-group input::placeholder {
                    color: #9ca3af;
                }

                .select-wrapper select {
                    appearance: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px top 50%;
                    background-size: 10px auto;
                    padding-right: 32px;
                }

                .submit-btn {
                    width: 100%;
                    background: #0067b8;
                    color: #ffffff;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, box-shadow 0.2s;
                }

                .submit-btn:hover {
                    background: #005a9e;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .submit-btn:active {
                    transform: translateY(1px);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 20px 0;
                    color: #6b7280;
                    font-size: 13px;
                }

                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e5e7eb;
                }

                .divider span {
                    padding: 0 16px;
                }

                .google-btn {
                    width: 100%;
                    background: #ffffff;
                    color: #374151;
                    border: 1px solid #d1d5db;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .google-btn:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .signup-link-wrapper {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: #4b5563;
                }

                .signup-link {
                    color: #0067b8;
                    text-decoration: none;
                    font-weight: 600;
                }

                .signup-link:hover {
                    text-decoration: underline;
                }
                
                .login-footer {
                    padding: 24px;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    font-size: 12px;
                    color: #6b7280;
                    background-color: #ffffff;
                }
                
                .footer-dot {
                    color: #d1d5db;
                }
                
                .login-footer a {
                    color: #6b7280;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                .login-footer a:hover {
                    color: #374151;
                    text-decoration: underline;
                }

                @media (min-width: 992px) {
                    .login-banner {
                        display: block;
                    }
                }
                
                @media (max-width: 991px) {
                    .login-form-wrapper {
                        justify-content: center;
                    }
                }
                
                /* Fix Chrome Autofill white background in light mode */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
                    -webkit-text-fill-color: #111827 !important;
                }
            `}</style>
        </div>
    );
};

export default Register;

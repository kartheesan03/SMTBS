import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="glass-card auth-card">
                <h2 className="title-gradient">SMTBMS Login</h2>
                <p className="text-muted">Enter your credentials to access the system</p>
                
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-btn">Sign In</button>
                </form>
                
                {/* Registration link removed as per requirement */}
            </div>

            <style jsx="true">{`
                .auth-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 20px;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.005) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.005) 1px, transparent 1px),
                        radial-gradient(circle at 35% 30%, rgba(139, 92, 246, 0.18) 0%, transparent 45%),
                        radial-gradient(circle at 65% 70%, rgba(6, 182, 212, 0.18) 0%, transparent 45%);
                    background-size: 30px 30px, 30px 30px, auto, auto;
                }
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    text-align: center;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 25px rgba(6, 182, 212, 0.08);
                    border: 1px solid transparent;
                    border-image: var(--border-gradient) 1;
                    border-radius: 2px;
                    position: relative;
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .auth-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 6px;
                    height: 6px;
                    background: var(--cyber-blue);
                }
                .auth-card::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 6px;
                    height: 6px;
                    background: var(--cyber-pink);
                }
                .auth-card h2 {
                    font-size: 34px;
                    font-family: 'Share Tech Mono', monospace;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                }
                .auth-card p {
                    font-size: 13px;
                    margin-bottom: 10px;
                    letter-spacing: 0.5px;
                }
                .auth-card form {
                    margin-top: 32px;
                    text-align: left;
                }
                .form-group {
                    margin-bottom: 24px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px 18px;
                    border-radius: 4px;
                }
                .auth-btn {
                    width: 100%;
                    margin-top: 10px;
                    padding: 14px;
                    font-size: 13px;
                    border-radius: 4px;
                }
                .error-msg {
                    background: rgba(244, 63, 94, 0.08);
                    color: var(--danger);
                    padding: 12px;
                    border-radius: 4px;
                    margin-top: 20px;
                    font-size: 13px;
                    border: 1px solid rgba(244, 63, 94, 0.2);
                    text-align: left;
                    font-family: 'Share Tech Mono', monospace;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 30px 20px;
                    }
                    .auth-card h2 {
                        font-size: 28px;
                    }
                    .auth-wrapper {
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;

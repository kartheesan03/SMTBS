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
                }
                .auth-card {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .auth-card h2 {
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .auth-card form {
                    margin-top: 30px;
                    text-align: left;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .form-group input {
                    width: 100%;
                }
                .auth-btn {
                    width: 100%;
                    margin-top: 20px;
                    padding: 12px;
                }
                .auth-footer {
                    margin-top: 25px;
                    font-size: 14px;
                }
                .error-msg {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--danger);
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 20px;
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 20px 15px;
                    }
                    .auth-card h2 {
                        font-size: 24px;
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

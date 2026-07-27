import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Globe, ArrowRight, Zap, Shield, Layers, Box, FileText, Truck, Cpu, BarChart3, Bell, CheckCircle, Database, Package } from 'lucide-react';
import './LandingPage.css';
import ChatBot from '../components/ChatBot/ChatBot';

const WORKFLOW_STEPS = [
    { label: 'Order', desc: 'Automatic PO creation.' },
    { label: 'Approval', desc: 'Digital sign-offs.' },
    { label: 'Verification', desc: 'Compliance checks.' },
    { label: 'Inventory', desc: 'Stock allocation.' },
    { label: 'Purchase', desc: 'Vendor routing.' },
    { label: 'Delivery', desc: 'Live GPS tracking.' },
    { label: 'Invoice', desc: '3-way matching.' }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const appContent = document.querySelector('.app-content');
        
        const handleScroll = (e) => {
            setScrolled(e.target.scrollTop > 20);
        };

        if (appContent) {
            appContent.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (appContent) {
                appContent.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-logo" onClick={() => scrollToSection('hero')} style={{cursor: 'pointer'}}>
                    <Globe size={28} className="logo-icon" />
                    <span>SMTBMS</span>
                </div>
                <div className="nav-links">
                    <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a>
                    <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }}>Stats</a>
                    <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                    <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }}>Workflow</a>
                    <a href="#ai" onClick={(e) => { e.preventDefault(); scrollToSection('ai'); }}>AI</a>
                </div>
                <div className="nav-actions">
                    <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section" id="hero">
                <div className="hero-left">
                    <div className="hero-badge">
                        <span>✨ AI-Powered Inventory Platform</span>
                    </div>
                    <h1 className="hero-title">
                        AI-Powered Inventory &amp; Warehouse Management.
                    </h1>
                    
                    <p className="hero-subtitle">
                        SMTBMS unifies inventory tracking, vendor management, and AI analytics into one powerful platform — giving your team complete visibility across every warehouse operation.
                    </p>
                    
                    <div className="hero-cta-group">
                        <button className="btn-get-started" onClick={() => navigate('/register')}>
                            Get Started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button className="btn-learn-more" onClick={() => navigate('/login')}>
                            Watch Demo <ArrowRight size={14} style={{ marginLeft: '4px', opacity: 0.7 }} />
                        </button>
                    </div>

                    <p className="trusted-text">Trusted by 500+ Businesses Worldwide</p>
                </div>

                <div className="hero-right">
                    <div className="robot-image-container">
                        <div className="illustration-glow"></div>
                        <div className="browser-mockup">
                            <div className="browser-header">
                                <span className="dot dot-r"></span>
                                <span className="dot dot-y"></span>
                                <span className="dot dot-g"></span>
                                <div className="browser-url">app.smtbms.com</div>
                            </div>
                            <img src="/assets/dashboard_mockup.png" alt="SMTBMS Dashboard Interface" className="robot-image" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Statistics Section */}
            <section className="landing-section statistics-section" id="stats">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-val">20K+</span>
                        <span className="stat-label">Materials Tracked</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">200+</span>
                        <span className="stat-label">Warehouses</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">10K+</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">99.9%</span>
                        <span className="stat-label">Uptime SLA</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-section features-section" id="features">
                <div className="section-header">
                    <h2>Everything you need to scale</h2>
                    <p>A complete suite of tools designed to streamline your entire supply chain lifecycle.</p>
                </div>
                <div className="scroll-fade-wrapper">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="fc-icon"><Box size={24} /></div>
                            <h3>Inventory Management</h3>
                            <p>Track stock levels across multiple locations in real-time with automated reconciliation.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><Globe size={24} /></div>
                            <h3>Warehouse Management</h3>
                            <p>Optimize warehouse layouts, routing, and bin locations for maximum efficiency.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><FileText size={24} /></div>
                            <h3>Purchase Orders</h3>
                            <p>Automate PO generation based on dynamic stock thresholds and vendor lead times.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><Database size={24} /></div>
                            <h3>Vendor Management</h3>
                            <p>Maintain comprehensive vendor catalogs, performance metrics, and compliance documents.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><CheckCircle size={24} /></div>
                            <h3>Order Workflow</h3>
                            <p>Customize approval matrices and multi-stage verification for secure transactions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><Cpu size={24} /></div>
                            <h3>AI Analytics</h3>
                            <p>Leverage predictive algorithms for demand forecasting and dynamic safety stock.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><Bell size={24} /></div>
                            <h3>Notifications</h3>
                            <p>Configure real-time alerts for stockouts, shipping delays, and SLA breaches.</p>
                        </div>
                        <div className="feature-card">
                            <div className="fc-icon"><BarChart3 size={24} /></div>
                            <h3>Reports &amp; Dashboards</h3>
                            <p>Build custom KPI dashboards and export audit-ready reports instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="landing-section workflow-section" id="workflow">
                <div className="section-header">
                    <h2>Seamless End-to-End Workflow</h2>
                    <p>Experience absolute visibility from order placement to final invoice.</p>
                </div>
                <div className="workflow-pipeline">
                    {WORKFLOW_STEPS.map((step, index) => (
                        <div className="wf-step" key={step.label}>
                            <div className="wf-circle">{index + 1}</div>
                            <span className="wf-label">{step.label}</span>
                            <span className="wf-desc">{step.desc}</span>
                            {index < 6 && <div className="wf-connector" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Capabilities Section */}
            <section className="landing-section ai-section" id="ai">
                <div className="section-header">
                    <span className="section-badge">Intelligence</span>
                    <h2>Driven by AI</h2>
                    <p>Let intelligent algorithms do the heavy lifting for complex logistics planning.</p>
                </div>
                <div className="scroll-fade-wrapper">
                    <div className="ai-grid">
                        <div className="ai-card">
                            <Cpu size={28} className="ai-icon" />
                            <h3>Demand Forecasting</h3>
                            <p>Predict future material needs based on historical data and seasonal trends.</p>
                        </div>
                        <div className="ai-card">
                            <Zap size={28} className="ai-icon" />
                            <h3>Smart Search</h3>
                            <p>Find materials, orders, and vendors instantly with natural language queries.</p>
                        </div>
                        <div className="ai-card">
                            <CheckCircle size={28} className="ai-icon" />
                            <h3>Automated Reorders</h3>
                            <p>Smart thresholds automatically draft POs before you run out of stock.</p>
                        </div>
                        <div className="ai-card">
                            <BarChart3 size={28} className="ai-icon" />
                            <h3>Inventory Insights</h3>
                            <p>Identify slow-moving stock and optimize capital allocation effortlessly.</p>
                        </div>
                        <div className="ai-card">
                            <Shield size={28} className="ai-icon" />
                            <h3>Anomaly Detection</h3>
                            <p>Automatically flag unusual order volumes or sudden price spikes from vendors.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Background Decorations */}
            <div className="fx-bg-orbs">
                <div className="fx-orb fx-orb-1" />
                <div className="fx-orb fx-orb-2" />
                <div className="fx-orb fx-orb-3" />
            </div>
            <div className="fx-grid-overlay" />
            <ChatBot />
        </div>
    );
};

export default LandingPage;

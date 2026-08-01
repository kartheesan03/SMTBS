import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Globe, ArrowRight, Zap, Shield, Layers, Box, FileText, Truck, Cpu, BarChart3, Bell, CheckCircle, Database, Package, ChevronLeft, ChevronRight, Warehouse, Users, ShieldCheck, ShoppingCart, FileSignature, CreditCard, Receipt, Sparkles, Target, Play } from 'lucide-react';
import './LandingPage.css';

const WORKFLOW_STEPS = [
    { label: 'Order', desc: 'Automatic PO creation.', icon: ShoppingCart },
    { label: 'Approval', desc: 'Digital sign-offs.', icon: FileSignature },
    { label: 'Verification', desc: 'Compliance checks.', icon: ShieldCheck },
    { label: 'Inventory', desc: 'Stock allocation.', icon: Box },
    { label: 'Purchase', desc: 'Vendor routing.', icon: CreditCard },
    { label: 'Delivery', desc: 'Live GPS tracking.', icon: Truck },
    { label: 'Invoice', desc: '3-way matching.', icon: Receipt }
];

const SECTION_IDS = ['hero', 'stats', 'features', 'workflow', 'ai'];

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    
    const scrollContainerRef = useRef(null);
    const isScrolling = useRef(false);

    // Get the actual scroll container once on mount
    const getScrollContainer = () => {
        if (!scrollContainerRef.current) {
            scrollContainerRef.current = document.querySelector('.landing-container') || document.querySelector('.app-content') || window;
        }
        return scrollContainerRef.current;
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        const container = getScrollContainer();
        if (!el || !container) return;
        
        // Lock the observer from changing active state during scroll animation
        isScrolling.current = true;
        setActiveSection(id);

        // Precise scroll calculation accounting for fixed navbar height
        const navbarHeight = 72; // height of the navbar
        
        if (container === window) {
            const targetY = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        } else {
            const targetY = el.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top - navbarHeight;
            container.scrollTo({ top: targetY, behavior: 'smooth' });
        }

        // Unlock the observer after the smooth scroll animation finishes
        setTimeout(() => {
            isScrolling.current = false;
        }, 800);
    };

    useEffect(() => {
        document.body.classList.add('landing-page-active');
        return () => {
            document.body.classList.remove('landing-page-active');
        };
    }, []);

    useEffect(() => {
        const container = getScrollContainer();
        
        // Handle navbar blur on scroll
        const handleScroll = () => {
            const scrollTop = container === window ? window.scrollY : container.scrollTop;
            setScrolled(scrollTop > 20);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Handle scroll-sync active nav highlighting using IntersectionObserver
        const observerOptions = {
            root: container === window ? null : container,
            rootMargin: '0px',
            threshold: 0.5 // Require 50% visibility to trigger
        };

        const observerCallback = (entries) => {
            // Do not update from observer if we are currently mid-scroll from a nav click
            if (isScrolling.current) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        SECTION_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="global-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className="nav-logo" onClick={() => scrollToSection('hero')} style={{cursor: 'pointer'}}>
                    <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="logo-icon"
                    >
                        <g stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M 15 3 L 22 7 L 15 11 L 8 7 Z M 22 7 L 22 15 L 15 19 L 15 11 M 15 19 L 10.5 16.43 M 3 10 L 8 10 M 5.5 13.5 L 11.5 13.5 M 4 17 L 9.5 17" />
                        </g>
                    </svg>
                    <span>SMTBMS</span>
                </div>
                <div className="nav-links">
                    <a href="#hero" className={activeSection === 'hero' ? 'active-nav-link' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a>
                    <a href="#stats" className={activeSection === 'stats' ? 'active-nav-link' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }}>Stats</a>
                    <a href="#features" className={activeSection === 'features' ? 'active-nav-link' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                    <a href="#workflow" className={activeSection === 'workflow' ? 'active-nav-link' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }}>Workflow</a>
                    <a href="#ai" className={activeSection === 'ai' ? 'active-nav-link' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('ai'); }}>AI</a>
                </div>
                <div className="nav-actions">
                    <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section" id="hero">
                <div className="hero-glow"></div>
                <div className="global-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="hero-content">
                        <h1 className="hero-title">
                        <span className="title-light">Smart Material Tracking &amp;</span><br />
                        <span className="title-light">Business </span><span className="title-purple">Management</span><br />
                        <span className="title-purple">System.</span>
                    </h1>
                    
                    <p className="hero-subtitle">
                        SMTBMS unifies material tracking, vendor management, and business operations into one powerful platform — giving your team complete visibility across every stage of the supply chain.
                    </p>
                    
                    <div className="hero-cta-group">
                        <button className="btn-get-started" onClick={() => navigate('/register')}>
                            Get Started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button className="btn-play-link" onClick={() => navigate('/login')}>
                            <div className="play-icon-circle">
                                <Play size={14} fill="white" />
                            </div>
                            <span className="play-text">Watch Demo</span>
                        </button>
                    </div>

                    <div className="hero-feature-pills">
                        <div className="feature-pill"><Sparkles size={16} /> AI-Powered Insights</div>
                        <div className="feature-pill"><Target size={16} /> Real-Time Tracking</div>
                        <div className="feature-pill"><Warehouse size={16} /> Multi-Warehouse</div>
                        <div className="feature-pill"><ShieldCheck size={16} /> Secure &amp; Reliable</div>
                    </div>
                </div>
                </div>
            </main>

            {/* Statistics Section */}
            <section className="landing-section statistics-section" id="stats">
                <div className="global-container">
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-icon-wrapper">
                            <Package size={32} />
                        </div>
                        <span className="stat-val">20K+</span>
                        <span className="stat-label">Materials Tracked</span>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon-wrapper">
                            <Warehouse size={32} />
                        </div>
                        <span className="stat-val">200+</span>
                        <span className="stat-label">Warehouses</span>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon-wrapper">
                            <Users size={32} />
                        </div>
                        <span className="stat-val">10K+</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon-wrapper">
                            <ShieldCheck size={32} />
                        </div>
                        <span className="stat-val">99.9%</span>
                        <span className="stat-label">Uptime SLA</span>
                    </div>
                </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-section features-section" id="features">
                <div className="global-container">
                <div className="section-header">
                    <h2>Everything you need to scale</h2>
                    <p>A complete suite of tools designed to streamline your entire supply chain lifecycle.</p>
                </div>
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
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="landing-section workflow-section" id="workflow">
                <div className="global-container">
                <div className="section-header">
                    <h2>Seamless End-to-End Workflow</h2>
                    <p>Experience absolute visibility from order placement to final invoice.</p>
                </div>
                <div className="workflow-pipeline">
                    {WORKFLOW_STEPS.map((step, index) => (
                        <div className="wf-step" key={step.label}>
                            <div className="wf-circle">
                                <step.icon size={24} />
                            </div>
                            <span className="wf-label">{step.label}</span>
                            <span className="wf-desc">{step.desc}</span>
                            {index < 6 && <div className="wf-connector" />}
                        </div>
                    ))}
                </div>
                
                <div className="workflow-details-grid">
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

            {/* AI Capabilities Section */}
            <section className="landing-section ai-section" id="ai">
                <div className="global-container">
                <div className="section-header">
                    <h2>Driven by AI</h2>
                    <p>Let intelligent algorithms do the heavy lifting for complex logistics planning.</p>
                </div>
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
        </div>
    );
};

export default LandingPage;

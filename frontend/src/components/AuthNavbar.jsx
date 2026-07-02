import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Menu, X } from 'lucide-react';

const AuthNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className={`auth-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo & Brand */}
                <Link to="/" className="nav-brand">
                    <div className="brand-icon">
                        <Hexagon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="brand-text">SMTBMS</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="nav-links desktop-only">
                    <Link to="/" className="nav-link">Home</Link>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </nav>

                {/* Auth Buttons */}
                <div className="nav-auth desktop-only">
                    <Link
                        to="/login"
                        className={`btn-nav-ghost ${location.pathname === '/login' ? 'active' : ''}`}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className={`btn-nav-primary ${location.pathname === '/register' ? 'active' : ''}`}
                    >
                        Create Account
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-menu-btn mobile-only"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-nav-links">
                        <Link to="/" className="mobile-link">Home</Link>
                        <a href="#features" className="mobile-link">Features</a>
                        <a href="#about" className="mobile-link">About</a>
                        <a href="#contact" className="mobile-link">Contact</a>
                    </div>
                    <div className="mobile-auth-actions">
                        <Link
                            to="/login"
                            className={`btn-mobile-ghost ${location.pathname === '/login' ? 'active' : ''}`}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className={`btn-mobile-primary ${location.pathname === '/register' ? 'active' : ''}`}
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .auth-navbar {
                    --bg: #f4f5f8;
                    --surface: #ffffff;
                    --surface-tint: #f0eefb;
                    --border: #e6e7ee;
                    --border-strong: #d7d3ee;
                    --text: #2a2740;
                    --text-muted: #6b6884;
                    --accent-indigo: #3c1878;
                    --accent-indigo-dark: #2c1057;
                    --accent-orange: #f5a623;
                    --accent-orange-dark: #ec8f0e;
                    --radius-sm: 10px;
                    --radius-pill: 999px;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                    --dur: 0.28s;

                    font-family: 'Poppins', 'Inter', system-ui, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    transition: all var(--dur) var(--ease);
                    padding-top: 4px;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    box-shadow: 0 2px 18px -6px rgba(60, 24, 120, 0.08);
                }

                .auth-navbar::before {
                    content: '';
                    display: block;
                    height: 4px;
                    width: 100%;
                    background: linear-gradient(90deg, var(--accent-orange), #ef6a4c 45%, var(--accent-indigo) 100%);
                }

                .auth-navbar.scrolled {
                    box-shadow: 0 6px 24px -8px rgba(60, 24, 120, 0.16);
                }

                .navbar-container {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding: 16px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .auth-navbar.scrolled .navbar-container {
                    padding-top: 12px;
                    padding-bottom: 12px;
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .brand-icon {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--accent-orange), var(--accent-orange-dark));
                    border-radius: 11px;
                    color: #ffffff;
                    box-shadow: 0 4px 14px -3px rgba(245, 166, 35, 0.55);
                }

                .brand-text {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-size: 19px;
                    font-weight: 700;
                    color: var(--text);
                    letter-spacing: -0.01em;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-link {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 15px;
                    font-weight: 500;
                    padding: 9px 16px;
                    border-radius: var(--radius-sm);
                    transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
                }

                .nav-link:hover {
                    color: var(--accent-indigo);
                    background: var(--surface-tint);
                }

                .nav-auth {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-nav-ghost {
                    color: var(--accent-indigo);
                    text-decoration: none;
                    font-size: 14.5px;
                    font-weight: 600;
                    padding: 9px 22px;
                    border-radius: var(--radius-pill);
                    transition: all var(--dur) var(--ease);
                    border: 1.5px solid var(--border-strong);
                    background: transparent;
                }

                .btn-nav-ghost:hover {
                    background: var(--surface-tint);
                    border-color: var(--accent-indigo);
                }

                .btn-nav-ghost.active {
                    background: var(--surface-tint);
                    border-color: var(--accent-indigo);
                    color: var(--accent-indigo-dark);
                }

                .btn-nav-primary {
                    background: linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-dark));
                    color: white;
                    text-decoration: none;
                    font-size: 14.5px;
                    font-weight: 600;
                    padding: 10px 24px;
                    border-radius: var(--radius-pill);
                    transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
                    box-shadow: 0 6px 18px -4px rgba(44, 16, 87, 0.45);
                    border: 1.5px solid transparent;
                }

                .btn-nav-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 24px -4px rgba(44, 16, 87, 0.55);
                }

                .btn-nav-primary.active {
                    background: var(--accent-indigo-dark);
                    box-shadow: 0 4px 14px -4px rgba(44, 16, 87, 0.55);
                }

                /* Mobile Toggle */
                .mobile-menu-btn {
                    background: var(--surface-tint);
                    border: none;
                    color: var(--accent-indigo);
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    transition: background var(--dur) var(--ease);
                }

                .mobile-menu-btn:hover {
                    background: var(--border-strong);
                }

                .mobile-only {
                    display: none;
                }

                /* Mobile Menu Dropdown */
                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    padding: 22px 32px 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    box-shadow: 0 20px 40px -12px rgba(60, 24, 120, 0.18);
                    animation: slideDown var(--dur) var(--ease);
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .mobile-nav-links {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .mobile-link {
                    color: var(--text);
                    text-decoration: none;
                    font-size: 15.5px;
                    font-weight: 500;
                    padding: 11px 4px;
                    border-bottom: 1px solid var(--border);
                    transition: color var(--dur) var(--ease);
                }

                .mobile-link:hover {
                    color: var(--accent-indigo);
                }

                .mobile-auth-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 4px;
                }

                .btn-mobile-ghost, .btn-mobile-primary {
                    text-align: center;
                    padding: 12px;
                    border-radius: var(--radius-pill);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14.5px;
                    transition: all var(--dur) var(--ease);
                }

                .btn-mobile-ghost {
                    color: var(--accent-indigo);
                    background: var(--surface-tint);
                    border: 1.5px solid var(--border-strong);
                }

                .btn-mobile-ghost.active {
                    background: var(--border-strong);
                    border-color: var(--accent-indigo);
                }

                .btn-mobile-primary {
                    background: linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-dark));
                    color: white;
                    box-shadow: 0 6px 18px -4px rgba(44, 16, 87, 0.45);
                }

                .btn-mobile-primary.active {
                    background: var(--accent-indigo-dark);
                }

                /* Focus Accessibility */
                .nav-link:focus-visible, .nav-brand:focus-visible,
                .btn-nav-ghost:focus-visible, .btn-nav-primary:focus-visible,
                .mobile-link:focus-visible, .btn-mobile-ghost:focus-visible,
                .btn-mobile-primary:focus-visible, .mobile-menu-btn:focus-visible {
                    outline: 2px solid var(--accent-orange);
                    outline-offset: 3px;
                    border-radius: 6px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .auth-navbar, .nav-link, .btn-nav-ghost, .btn-nav-primary, .mobile-menu {
                        animation-duration: 0.001ms !important;
                        transition-duration: 0.001ms !important;
                    }
                }

                @media (max-width: 900px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                    .navbar-container { padding: 14px 24px; }
                }

                @media (max-width: 600px) {
                    .navbar-container { padding: 12px 16px; }
                    .mobile-menu { padding: 18px 16px 24px; }
                }
            `}</style>
        </header>
    );
};

export default AuthNavbar;
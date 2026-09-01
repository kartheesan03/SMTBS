import React, { useEffect, useState } from 'react';
import './AppLoader.css';

const STEPS = [
    { label: 'Authenticating session…', pct: 20 },
    { label: 'Loading dashboard data…', pct: 50 },
    { label: 'Fetching your workspace…', pct: 75 },
    { label: 'Almost ready…', pct: 95 },
];

const AppLoader = ({ error, onRetry }) => {
    const [stepIdx, setStepIdx] = useState(0);
    const [progress, setProgress] = useState(5);

    useEffect(() => {
        if (error) return;

        const timer = setInterval(() => {
            setStepIdx(prev => {
                const next = prev < STEPS.length - 1 ? prev + 1 : prev;
                setProgress(STEPS[next].pct);
                return next;
            });
        }, 900);

        return () => clearInterval(timer);
    }, [error]);

    if (error) {
        return (
            <div className="app-loader-root">
                <div className="app-loader-bg" />
                <div className="app-loader-orb app-loader-orb--1" />
                <div className="app-loader-orb app-loader-orb--2" />

                <div className="app-loader-card">
                    <div className="app-loader-logo">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" fill="#ffffff" />
                            <path d="M2 17l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M2 12l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="app-loader-brand">SMTBMS</h2>
                    <div className="app-loader-error-icon">⚠</div>
                    <p className="app-loader-error-title">Connection Failed</p>
                    <p className="app-loader-error-desc">
                        Unable to load application data. Please check your connection and try again.
                    </p>
                    <button className="app-loader-retry-btn" onClick={onRetry}>
                        ↻ Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-loader-root">
            <div className="app-loader-bg" />
            <div className="app-loader-orb app-loader-orb--1" />
            <div className="app-loader-orb app-loader-orb--2" />

            <div className="app-loader-card">
                {/* Logo */}
                <div className="app-loader-logo">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" fill="#ffffff" />
                        <path d="M2 17l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M2 12l10 5 10-5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2 className="app-loader-brand">SMTBMS</h2>
                <p className="app-loader-tagline">Smart Material Tracking &amp; Business Management</p>

                {/* Progress bar */}
                <div className="app-loader-progress-wrap">
                    <div
                        className="app-loader-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Step label */}
                <p className="app-loader-step">{STEPS[stepIdx]?.label}</p>

                {/* Dots */}
                <div className="app-loader-dots">
                    <span className="app-loader-dot" style={{ animationDelay: '0s' }} />
                    <span className="app-loader-dot" style={{ animationDelay: '0.18s' }} />
                    <span className="app-loader-dot" style={{ animationDelay: '0.36s' }} />
                </div>
            </div>
        </div>
    );
};

export default AppLoader;

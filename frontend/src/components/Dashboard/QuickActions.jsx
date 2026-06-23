import React from 'react';

const QuickActions = ({ actions }) => {
    return (
        <div className="qa-card">
            <h3 className="qa-title">Quick Actions</h3>
            <div className="qa-grid">
                {actions.map((action, i) => (
                    <button 
                        key={i} 
                        className="qa-tile"
                        onClick={action.onClick}
                    >
                        <div className="qa-icon" style={{ color: action.color || 'var(--primary)', backgroundColor: `${action.color || 'var(--primary)'}12` }}>
                            {action.icon}
                        </div>
                        <span className="qa-label">{action.label}</span>
                    </button>
                ))}
            </div>
            <style jsx="true">{`
                .qa-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 22px;
                    box-shadow: var(--shadow-sm);
                }
                .qa-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                }
                .qa-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 10px;
                }
                .qa-tile {
                    background: var(--bg-hover, #f8fafc);
                    border: 1px solid var(--border);
                    padding: 16px 10px;
                    border-radius: var(--radius-md, 12px);
                    color: var(--text-secondary);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .qa-tile:hover {
                    background: var(--primary-light, #eef2ff);
                    border-color: var(--primary-100, #e0e7ff);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                .qa-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }
                .qa-icon svg {
                    width: 24px !important;
                    height: 24px !important;
                }
                .qa-tile:hover .qa-icon {
                    transform: scale(1.08);
                }
                .qa-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-align: center;
                    color: var(--text-secondary);
                    line-height: 1.3;
                }
                .qa-tile:hover .qa-label {
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default QuickActions;

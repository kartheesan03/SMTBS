import React from 'react';

const QuickActions = ({ actions }) => {
    return (
        <div className="glass-card actions-container">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
                {actions.map((action, i) => (
                    <button 
                        key={i} 
                        className="action-tile"
                        onClick={action.onClick}
                    >
                        <div className="action-icon">{action.icon}</div>
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
            <style jsx="true">{`
                .actions-container {
                    padding: 24px;
                    border-radius: 2px !important;
                }
                .actions-container h3 {
                    font-size: 14px;
                    font-family: 'Share Tech Mono', monospace;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                    gap: 12px;
                    margin-top: 18px;
                }
                .action-tile {
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid var(--border);
                    padding: 16px;
                    border-radius: 2px;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .action-tile:hover {
                    background: var(--primary-gradient);
                    border-color: transparent;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px -4px rgba(139, 92, 246, 0.4), 0 0 10px rgba(6, 182, 212, 0.2);
                }
                .action-icon {
                    color: var(--cyber-blue);
                    background: rgba(6, 182, 212, 0.08);
                    padding: 10px;
                    border-radius: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s ease;
                }
                .action-tile:hover .action-icon {
                    color: white;
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
                }
                .action-tile span {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default QuickActions;

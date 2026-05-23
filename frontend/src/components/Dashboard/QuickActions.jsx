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
                    padding: 20px;
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 12px;
                    margin-top: 15px;
                }
                .action-tile {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    padding: 15px;
                    border-radius: 12px;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    transition: 0.2s;
                }
                .action-tile:hover {
                    background: var(--primary);
                    border-color: var(--primary);
                    transform: scale(1.02);
                }
                .action-icon {
                    color: var(--primary);
                    transition: 0.2s;
                }
                .action-tile:hover .action-icon {
                    color: white;
                }
                .action-tile span {
                    font-size: 13px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default QuickActions;

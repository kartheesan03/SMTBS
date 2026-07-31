import React from 'react';
import { Sparkles, FileText, BarChart2, Zap } from 'lucide-react';
import '../../pages/AIAssistant.css';

const CopilotDashboard = ({ onSuggestion, context, roleCards }) => {
    
    const suggestedPrompts = [
        { icon: <FileText size={16} />, text: "Show me yesterday's sales report" },
        { icon: <BarChart2 size={16} />, text: "What is our current inventory status?" },
        { icon: <Zap size={16} />, text: "Are there any pending approvals?" }
    ];

    return (
        <div className="centerpiece-hero-container">
            <div className="centerpiece-hero">
                <div className="centerpiece-icon-wrapper">
                    <Sparkles size={48} className="centerpiece-icon" />
                </div>
                <h1 className="centerpiece-greeting">
                    How can I help you today?
                </h1>
                
                <div className="centerpiece-suggestions">
                    {suggestedPrompts.map((prompt, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => onSuggestion(prompt.text)}
                            className="glass-suggestion-pill"
                        >
                            <span className="pill-icon">{prompt.icon}</span>
                            <span className="pill-text">{prompt.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CopilotDashboard;

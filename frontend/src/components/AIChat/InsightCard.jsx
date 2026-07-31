import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp, Info } from 'lucide-react';
import './RichComponents.css';

const InsightCard = ({ type, title, value, message, actionLabel, onAction }) => {
    
    const getIcon = () => {
        if (type === 'warning' || type === 'alert') return <AlertCircle size={20} className="insight-icon warning" />;
        if (type === 'positive') return <TrendingUp size={20} className="insight-icon positive" />;
        if (type === 'negative') return <TrendingDown size={20} className="insight-icon negative" />;
        return <Info size={20} className="insight-icon info" />;
    };

    return (
        <div className={`ai-insight-card ${type}`}>
            <div className="insight-header">
                {getIcon()}
                <h4>{title}</h4>
            </div>
            <div className="insight-body">
                {value && <div className="insight-value">{value}</div>}
                <p>{message}</p>
            </div>
            {actionLabel && (
                <div className="insight-footer">
                    <button className="insight-btn" onClick={onAction}>{actionLabel}</button>
                </div>
            )}
        </div>
    );
};

export default InsightCard;

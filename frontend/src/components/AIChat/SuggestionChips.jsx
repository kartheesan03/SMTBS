import React from 'react';
import { Package, TrendingUp, Users, DollarSign, Briefcase, FileText, Activity } from 'lucide-react';

const SUGGESTION_MAP = {
    'Global': [
        { text: "Business Summary", icon: <Activity size={16} /> },
        { text: "Revenue Report", icon: <DollarSign size={16} /> },
        { text: "Inventory Status", icon: <Package size={16} /> },
        { text: "Pending Orders", icon: <FileText size={16} /> }
    ],
    'Inventory': [
        { text: "Low Stock", icon: <Package size={16} /> },
        { text: "Warehouse Capacity", icon: <Activity size={16} /> },
        { text: "Supplier Performance", icon: <TrendingUp size={16} /> },
        { text: "Generate Purchase Order", icon: <FileText size={16} /> }
    ],
    'HRMS': [
        { text: "Employee Attendance", icon: <Users size={16} /> },
        { text: "Generate Payroll", icon: <DollarSign size={16} /> },
        { text: "Leave Approvals", icon: <Briefcase size={16} /> },
        { text: "Employee Performance", icon: <TrendingUp size={16} /> }
    ],
    'CRM': [
        { text: "Sales Analysis", icon: <TrendingUp size={16} /> },
        { text: "Customer Analysis", icon: <Users size={16} /> },
        { text: "Revenue Forecast", icon: <DollarSign size={16} /> },
        { text: "Active Leads", icon: <Briefcase size={16} /> }
    ]
};

const SuggestionChips = ({ onSelect, context = 'Global' }) => {
    const suggestions = SUGGESTION_MAP[context] || SUGGESTION_MAP['Global'];

    return (
        <div className="ai-suggestion-grid">
            {suggestions.map((s, i) => (
                <button 
                    key={i} 
                    className="ai-suggestion-chip"
                    onClick={() => onSelect(s.text)}
                >
                    <span className="chip-icon">{s.icon}</span>
                    <span className="chip-text">{s.text}</span>
                </button>
            ))}
        </div>
    );
};

export default SuggestionChips;

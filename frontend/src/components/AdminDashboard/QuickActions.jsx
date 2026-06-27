import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, PlusCircle, ShoppingCart, FileText, CheckCircle, Package } from 'lucide-react';
import './AdminDashboardPremium.css';

export const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { title: 'Add Employee', icon: UserPlus, path: '/employees/add' },
        { title: 'Add Material', icon: PlusCircle, path: '/materials' },
        { title: 'Create Purchase', icon: ShoppingCart, path: '/orders/purchase' },
        { title: 'Create Sales', icon: ShoppingCart, path: '/orders/sales' },
        { title: 'Generate Invoice', icon: FileText, path: '/invoices/create' },
        { title: 'Approve Leave', icon: CheckCircle, path: '/leave' },
        { title: 'Update Stock', icon: Package, path: '/materials' },
    ];

    return (
        <div className="erp-card erp-chart-full">
            <div className="erp-section-header">
                <h2 className="erp-section-title">Quick Actions</h2>
            </div>
            <div className="erp-quick-actions-grid">
                {actions.map((action, idx) => (
                    <button 
                        key={idx} 
                        className="erp-action-btn"
                        onClick={() => navigate(action.path)}
                    >
                        <action.icon size={28} className="erp-action-icon" />
                        <span>{action.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

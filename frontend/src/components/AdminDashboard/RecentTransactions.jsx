import React from 'react';
import { EmptyState } from './DashboardWidgets';
import { List } from 'lucide-react';
import './AdminDashboardPremium.css';

export const RecentTransactions = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="erp-card erp-chart-full">
                <div className="erp-section-header">
                    <h2 className="erp-section-title">Recent Transactions</h2>
                </div>
                <EmptyState icon={List} title="No Transactions" message="No recent transactions found in the system." />
            </div>
        );
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const getStatusBadge = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'completed':
            case 'delivered':
            case 'approved':
                return 'success';
            case 'pending':
            case 'awaiting approval':
            case 'processing':
                return 'warning';
            case 'cancelled':
            case 'rejected':
                return 'danger';
            default:
                return 'info';
        }
    };

    return (
        <div className="erp-card erp-chart-full">
            <div className="erp-section-header">
                <h2 className="erp-section-title">Recent Transactions</h2>
                <button className="erp-icon-btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--erp-radius-sm)', border: '1px solid var(--erp-border-light)' }}>
                    View All
                </button>
            </div>
            <div className="erp-table-wrapper">
                <table className="erp-table">
                    <thead>
                        <tr>
                            <th>Order No</th>
                            <th>Customer / Vendor</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={tx._id || index}>
                                <td><span style={{ fontWeight: 600 }}>{tx.orderNumber || `ORD-${tx._id?.substring(0,6).toUpperCase()}`}</span></td>
                                <td>{tx.customer?.name || tx.vendor?.name || 'N/A'}</td>
                                <td style={{ textTransform: 'capitalize' }}>{tx.orderType || tx.type || 'Unknown'}</td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(tx.totalAmount)}</td>
                                <td>
                                    <span className={`erp-badge ${getStatusBadge(tx.status)}`}>
                                        {tx.status || 'Pending'}
                                    </span>
                                </td>
                                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

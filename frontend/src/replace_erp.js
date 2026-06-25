const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('return (');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* KPI Section */}
            <div className="module-kpi-section">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{totalOrders}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Sales Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{salesOrders}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Purchase Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{purchaseOrders}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Pending Invoices</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(239,68,68,0.1)', color: '#EF4444'}}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{pendingInvoices}</div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>ERP Operations</h1>
                    <p>Manage procurement, sales orders, and invoices.</p>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    {(userInfo?.role?.toLowerCase() === 'admin' || userInfo?.role?.toLowerCase() === 'super admin' || userInfo?.role?.toLowerCase() === 'manager' || userInfo?.role?.toLowerCase() === 'hr') && (
                        <button className="btn-primary" onClick={() => navigate('/orders/select-type')}>
                            <Plus size={16} /> Create Order
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="module-actions-section" style={{background: 'var(--bg-surface-hover)', padding: '16px', marginTop: '-12px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                    <div className="global-search" style={{width: '300px', background: 'var(--bg-body)'}}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', outline: 'none', color: 'var(--text-main)'}}
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Orders</option>
                        <option value="Awaiting Approval">Awaiting Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            )}

            {/* Data Table Section */}
            <div className="module-data-section">
                <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                    <button className={\`btn-secondary \${activeTab === 'active' ? 'btn-primary' : ''}\`} onClick={() => setActiveTab('active')} style={activeTab === 'active' ? {background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)'} : {}}>Active Orders</button>
                    <button className={\`btn-secondary \${activeTab === 'history' ? 'btn-primary' : ''}\`} onClick={() => setActiveTab('history')} style={activeTab === 'history' ? {background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)'} : {}}>Order History</button>
                </div>
                <div className="table-container">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>Order ID {sortConfig.key === 'orderNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('orderType')} style={{ cursor: 'pointer' }}>Type</th>
                                <th onClick={() => handleSort('customerOrVendor')} style={{ cursor: 'pointer' }}>Organization</th>
                                <th>Amount</th>
                                <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>Order Date</th>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((ord) => {
                                const customerOrVendor = ord.orderType === 'sales' 
                                    ? (ord.customer?.company || ord.customer?.name || 'Walk-in')
                                    : (ord.vendor?.companyName || ord.vendor?.name || 'Walk-in');
                                
                                const amount = ord.totalAmount || ord.amount || ord.grandTotal || 0;
                                
                                return (
                                    <tr key={ord._id || ord.id}>
                                        <td><span style={{fontWeight: 600, color: 'var(--primary)', cursor: 'pointer'}} onClick={() => handleOrderClick(ord)}>{ord.orderNumber || ord.id}</span></td>
                                        <td>
                                            <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: ord.orderType === 'sales' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: ord.orderType === 'sales' ? '#10B981' : '#3B82F6'}}>
                                                {ord.orderType === 'sales' ? 'SALES' : 'PURCHASE'}
                                            </span>
                                        </td>
                                        <td>{customerOrVendor}</td>
                                        <td><strong>{formatCurrencyLocal(amount)}</strong></td>
                                        <td>{ord.orderDate ? new Date(ord.orderDate).toLocaleDateString() : new Date(ord.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>
                                                {ord.finalStatus || ord.status || "-"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                {/* Track Order Button */}
                                                {((ord.deliveryStatus && !['Not Started'].includes(ord.deliveryStatus)) || ['Cancelled', 'Rejected'].includes(ord.status)) && (
                                                    <button className="icon-btn" onClick={() => navigate(\`/orders/\${ord.id || ord._id}/tracking\`)} title="Track Order">
                                                        <Truck size={14} />
                                                    </button>
                                                )}

                                                {/* Download Invoice Button */}
                                                {(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].includes(ord.status) || ord.invoiceGenerated) && (
                                                    <button className="icon-btn" onClick={() => handleDownloadInvoice(ord)} title="Download Invoice">
                                                        <Download size={14} />
                                                    </button>
                                                )}

                                                {/* Delete Action (Admin/Manager) */}
                                                {(isAdmin || userInfo.role === 'Manager' || userInfo.role === 'Super Admin') && (
                                                    <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={() => handleDeleteOrder(ord._id || ord.id)} title="Delete Order">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                                        No orders found matching the current criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 0 && (
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px'}}>
                        <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems}</span>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <button className="btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                            <span style={{fontSize: '13px', fontWeight: 600}}>Page {currentPage} of {totalPages}</span>
                            <button className="btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showOrderDetailsModal && selectedOrderDetails && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                            <h2 style={{margin: 0}}>Order Details</h2>
                            <button className="icon-btn" onClick={() => setShowOrderDetailsModal(false)}><XCircle size={20}/></button>
                        </div>
                        <p><strong>Order ID:</strong> {selectedOrderDetails.orderNumber}</p>
                        <p><strong>Status:</strong> {selectedOrderDetails.status}</p>
                        <p><strong>Total Amount:</strong> {formatCurrencyLocal(selectedOrderDetails.totalAmount)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ERP;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('ERP.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

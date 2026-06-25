const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Customers.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('    // ── DETAIL VIEW ──');
if (returnIndex !== -1) {
    const beforeReturn = content.slice(0, returnIndex);
    const newReturn = `    // ── DETAIL VIEW ──
    if (selectedCustomer) {
        return (
            <div className="module-container">
                <div className="module-actions-section" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <button className="btn-secondary" onClick={closeCustomerDetail}><ArrowLeft size={16} /> Back</button>
                        <div>
                            <h1 style={{margin: '0 0 4px 0'}}>{selectedCustomer.name}</h1>
                            <p style={{margin: 0, color: 'var(--text-muted)'}}>{selectedCustomer.industry || 'Customer'} · <span className={\`status-pill \${selectedCustomer.status?.toLowerCase().replace(/ /g, '-') || 'active'}\`}>{selectedCustomer.status || 'Active'}</span></p>
                        </div>
                    </div>
                    <div>
                        <button className="btn-primary" onClick={() => handleEdit(selectedCustomer)}><Edit2 size={16} /> Edit Profile</button>
                    </div>
                </div>

                <div className="module-data-section" style={{padding: 0, background: 'transparent', boxShadow: 'none'}}>
                    <div className="detail-tabs" style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
                        {[
                            { key: 'profile', label: 'Profile', icon: <Building2 size={16} /> },
                            { key: 'orders', label: \`Orders (\${customerOrders.length})\`, icon: <ShoppingCart size={16} /> },
                            { key: 'communications', label: \`Communications (\${customerComms.length})\`, icon: <MessageSquare size={16} /> },
                            { key: 'tickets', label: \`Tickets (\${customerTickets.length})\`, icon: <LifeBuoy size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={\`btn-secondary \${activeTab === tab.key ? 'btn-primary' : ''}\`}
                                onClick={() => setActiveTab(tab.key)}
                                style={activeTab === tab.key ? {background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)'} : {}}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {loadingDetail ? (
                        <div className="premium-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading details...</div>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <div className="analytics-card" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 16 }}>Contact Information</h3>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
                                        <div><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Email</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.email || '—'}</p></div>
                                        <div><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Type</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.customerType || 'Individual'}</p></div>
                                        <div><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Phone</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.phone || '—'}</p></div>
                                        <div><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Industry</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.industry || '—'}</p></div>
                                        <div><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Website</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.website ? <a href={selectedCustomer.website} target="_blank" rel="noreferrer">{selectedCustomer.website}</a> : '—'}</p></div>
                                        <div style={{ gridColumn: '1 / -1' }}><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Address</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.address || '—'}</p></div>
                                        {selectedCustomer.notes && (
                                            <div style={{ gridColumn: '1 / -1' }}><p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px'}}>Notes</p><p style={{margin: 0, fontWeight: 600}}>{selectedCustomer.notes}</p></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="analytics-card" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>Order History</h3>
                                    {customerOrders.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No orders found for this customer.</p>
                                    ) : (
                                        <table className="enterprise-table">
                                            <thead><tr><th>Order #</th><th>Type</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                                            <tbody>
                                                {customerOrders.map(o => (
                                                    <tr key={o._id || o.id}>
                                                        <td><strong>{o.orderNumber}</strong></td>
                                                        <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>{o.orderType}</span></td>
                                                        <td>{o.items?.length || 0} items</td>
                                                        <td style={{ fontWeight: 600 }}>₹{(o.totalAmount || 0).toLocaleString()}</td>
                                                        <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>{o.status}</span></td>
                                                        <td className="text-muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'communications' && (
                                <div className="analytics-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: 16 }}>Communication Log</h3>
                                        <button className="btn-primary" onClick={() => setShowCommModal(true)}><Plus size={16} /> Add Entry</button>
                                    </div>
                                    {customerComms.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No communication logs yet.</p>
                                    ) : (
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                            {customerComms.map(c => (
                                                <div key={c._id || c.id} style={{padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-body)'}}>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                            <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--primary-50)', color: 'var(--primary)'}}>{c.type}</span>
                                                            <strong style={{fontSize: '14px'}}>{c.subject}</strong>
                                                        </div>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                                            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>{c.contactDate ? new Date(c.contactDate).toLocaleDateString() : '—'}</span>
                                                            <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={() => handleDeleteComm(c._id || c.id)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                    {c.notes && <p style={{fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0'}}>{c.notes}</p>}
                                                    {c.createdBy && <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>by {c.createdBy.name || 'System'}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'tickets' && (
                                <div className="analytics-card" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>Support Tickets</h3>
                                    {customerTickets.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No support tickets found.</p>
                                    ) : (
                                        <table className="enterprise-table">
                                            <thead><tr><th>Ticket #</th><th>Subject</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                                            <tbody>
                                                {customerTickets.map(t => (
                                                    <tr key={t._id || t.id}>
                                                        <td><strong>{t.ticketNumber}</strong></td>
                                                        <td>{t.subject}</td>
                                                        <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>{t.priority}</span></td>
                                                        <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>{t.status}</span></td>
                                                        <td className="text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {showCommModal && (
                    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2 style={{margin: 0}}>Add Communication</h2>
                                <button className="icon-btn" onClick={() => setShowCommModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleAddComm} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Type</label>
                                        <select value={commForm.type} onChange={e => setCommForm({...commForm, type: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                            <option value="Call">Call</option>
                                            <option value="Email">Email</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Note">Note</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Date</label>
                                        <input type="date" value={commForm.contactDate} onChange={e => setCommForm({...commForm, contactDate: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Subject</label>
                                    <input type="text" required value={commForm.subject} onChange={e => setCommForm({...commForm, subject: e.target.value})} placeholder="Subject" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Notes</label>
                                    <textarea rows="3" value={commForm.notes} onChange={e => setCommForm({...commForm, notes: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}></textarea>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'}}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowCommModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Log</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {showModal && (
                    <div className="modal-overlay" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2 style={{margin: 0}}>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                                <button className="icon-btn" onClick={handleCloseModal}>✕</button>
                            </div>
                            <CustomerForm 
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseModal}
                                isLoading={false}
                                emailDisabled={false}
                                statusDisabled={false}
                                saveButtonText={editingId ? 'Update Customer' : 'Save Customer'}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── LIST VIEW ──
    return (
        <div className="module-container">
            {/* KPI Section */}
            <div className="module-kpi-section">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Customers</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{customers.length}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Active Clients</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <UserCheck size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{customers.filter(c => c.status === 'Active').length}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">New Leads</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>
                            <Globe size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{customers.filter(c => c.status === 'Lead').length}</div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>{directoryOnly ? 'Customer Directory' : 'Customers (CRM)'}</h1>
                    <p>{directoryOnly ? 'Manage your active customer base.' : 'Manage your customers, leads, and tracking.'}</p>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={exportToPDF} title="Export PDF"><Download size={16} /> PDF</button>
                    <button className="btn-secondary" onClick={exportToExcel} title="Export Excel"><Download size={16} /> Excel</button>
                    <button className="btn-primary" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active', customerType: 'Individual', company: '', gstNumber: '' }); setFormErrors({}); setShowModal(true); }}>
                        <Plus size={16} /> Add Customer
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="module-actions-section" style={{background: 'var(--bg-surface-hover)', padding: '16px', marginTop: '-12px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                <div className="global-search" style={{width: '300px', background: 'var(--bg-body)'}}>
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Section */}
            <div className="module-data-section">
                {loading ? (
                    <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>
                ) : (
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Organization</th>
                                <th>Contact Details</th>
                                <th>Industry</th>
                                {!directoryOnly && <th>Status</th>}
                                <th style={{textAlign: 'right'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(directoryOnly ? customers.filter(c => c.status === 'Active') : customers).map(c => {
                                if (!((c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()))) return null;
                                return (
                                    <tr key={c._id} onClick={() => openCustomerDetail(c)} style={{ cursor: 'pointer' }}>
                                        <td><strong>{c.name}</strong></td>
                                        <td>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                <strong>{c.company || 'Individual'}</strong>
                                                {c.website && <a href={c.website} target="_blank" rel="noreferrer" style={{fontSize: '11px', color: 'var(--primary)'}} onClick={e => e.stopPropagation()}>Visit Site</a>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)'}}>
                                                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Mail size={12}/> {c.email}</span>
                                                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Phone size={12}/> {c.phone}</span>
                                            </div>
                                        </td>
                                        <td>{c.industry || '—'}</td>
                                        {!directoryOnly && <td><span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>{c.status || 'Active'}</span></td>}
                                        <td style={{textAlign: 'right'}}>
                                            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}} onClick={e => e.stopPropagation()}>
                                                {isAdmin && c.status === 'Pending Review' && (
                                                    <button className="icon-btn" style={{color: 'var(--primary)'}} onClick={() => handleApprove(c._id)} title="Approve Customer"><UserCheck size={14}/></button>
                                                )}
                                                <button className="icon-btn" onClick={() => handleEdit(c)}><Edit2 size={14}/></button>
                                                <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={() => handleDelete(c._id)}><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals for List View */}
            {showModal && !selectedCustomer && (
                <div className="modal-overlay" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{margin: 0}}>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <button className="icon-btn" onClick={handleCloseModal}>✕</button>
                        </div>
                        <CustomerForm 
                            formData={formData}
                            setFormData={setFormData}
                            formErrors={formErrors}
                            setFormErrors={setFormErrors}
                            onSubmit={handleSubmit}
                            onCancel={handleCloseModal}
                            isLoading={false}
                            emailDisabled={false}
                            statusDisabled={false}
                            saveButtonText={editingId ? 'Update Customer' : 'Save Customer'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
`;
    fs.writeFileSync(file, beforeReturn + newReturn);
    console.log('Customers.jsx successfully replaced');
} else {
    console.log('Could not find detail view comment');
}

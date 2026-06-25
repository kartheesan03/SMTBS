const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
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
                        <span className="kpi-title">Total Material Types</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <Box size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.totalMaterialTypes.toLocaleString()}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Stock Quantity</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.totalStockQuantity.toLocaleString()}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">In Transit</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.inTransitCount}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Low Stock Items</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(239,68,68,0.1)', color: '#EF4444'}}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.lowStockCount}</div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Material Tracking</h1>
                    <p>Monitor stock, in-transit items, low stock alerts, and barcode/QR movements.</p>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="btn-secondary" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-secondary" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-secondary" style={{color: 'var(--primary)', borderColor: 'var(--primary)'}} onClick={() => { if (materials.length > 0) setScanSKU(materials[0].sku); setShowScanner(true); }}>
                        <Camera size={16} /> Scan Item
                    </button>
                    <button className="btn-primary" onClick={() => { setEditId(null); setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: '' }); setShowNewCategoryInput(false); setShowModal(true); }}>
                        <Plus size={16} /> Add Material
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="module-actions-section" style={{background: 'var(--bg-surface-hover)', padding: '16px', marginTop: '-12px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                    <div className="global-search" style={{width: '300px', background: 'var(--bg-body)'}}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', outline: 'none', color: 'var(--text-main)'}}
                        value={catFilter} 
                        onChange={e => setCatFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Data Table Section */}
            <div className="module-data-section">
                {loading ? (
                    <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>No materials found.</div>
                ) : (
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Material Name</th>
                                <th>Category</th>
                                <th>Vendor/Supplier</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th>Unit Price</th>
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((item) => (
                                <tr key={item._id}>
                                    <td><code style={{background: 'var(--bg-hover)', padding: '4px 6px', borderRadius: '4px', fontSize: '12px'}}>{item.sku}</code></td>
                                    <td><strong>{item.name}</strong></td>
                                    <td>{item.category}</td>
                                    <td>{item.vendor?.name || '-'}</td>
                                    <td><strong>{item.quantity}</strong> {item.unit}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                            background: item.quantity === 0 ? 'rgba(239,68,68,0.1)' : item.quantity <= item.lowStockThreshold ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                            color: item.quantity === 0 ? '#EF4444' : item.quantity <= item.lowStockThreshold ? '#F59E0B' : '#10B981'
                                        }}>
                                            {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td>\${item.price}</td>
                                    <td style={{textAlign: 'right'}}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <button className="icon-btn" title="Barcode & QR Code" onClick={() => { setSelectedMaterialForCode(item); setShowGenerator(true); }}><QrCode size={14} /></button>
                                            <button className="icon-btn" title="Movement History" onClick={() => openMovementHistory(item)}><History size={14} /></button>
                                            {(item.quantity <= item.lowStockThreshold) && (
                                                <button className="icon-btn" title="Request Stock" onClick={() => handleRequestStockClick(item)}><Send size={14} /></button>
                                            )}
                                            <button className="icon-btn" title="Edit Item" onClick={() => handleEditClick(item)}><Edit2 size={14} /></button>
                                            {!isEmployee && (
                                                <button className="icon-btn" style={{color: 'var(--danger)'}} title="Delete Item" onClick={() => handleDeleteClick(item)}><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{margin: 0}}>{editId ? 'Edit Material Record' : 'Add New Material'}</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Material Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Aluminum 7075" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>SKU</label>
                                    <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. AL-7075-B" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Category</label>
                                    {!showNewCategoryInput ? (
                                        <select value={formData.category} onChange={e => { if (e.target.value === '__add_new__') { setShowNewCategoryInput(true); setFormData({ ...formData, category: '' }); } else { setFormData({ ...formData, category: e.target.value }); } }} required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                            <option value="">Select Category</option>
                                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            <option value="__add_new__" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Add New Category...</option>
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Enter new category" autoFocus style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                            <button type="button" onClick={() => { setShowNewCategoryInput(false); setFormData({ ...formData, category: '' }); }} className="btn-secondary" style={{ padding: '0 12px' }}>✕</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Quantity</label>
                                    <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Unit (kg, pcs, liters)</label>
                                    <input type="text" required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Unit Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Vendor/Supplier</label>
                                    <select value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                        <option value="">No Supplier Assigned</option>
                                        {vendors.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Low Stock Alert Threshold</label>
                                    <input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)'}}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialTracking;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('Materials.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}

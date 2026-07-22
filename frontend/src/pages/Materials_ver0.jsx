                {/* 1. Hero Header */}
                <motion.div variants={itemVariants} className="erp-header-section" style={{ alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 className="erp-header-title" style={{ margin: 0, fontSize: '28px', color: '#1e293b', fontWeight: 600, letterSpacing: '0px' }}>Inventory</h1>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            INVENTORY
                        </span>
                    </div>
                    <div className="erp-header-actions">
                        <button className="erp-btn-secondary" onClick={fetchData}>
                            <RefreshCw size={16} /> Sync
                        </button>
                        <button className="erp-btn-secondary">
                            <Download size={16} /> Export XLS
                        </button>
                        {!isReadOnly && (
                            <button className="erp-btn-primary" onClick={() => navigate('/materials/new')}>
                                <Plus size={16} /> Post Goods Receipt
                            </button>
                        )}
                    </div>
                </motion.div>
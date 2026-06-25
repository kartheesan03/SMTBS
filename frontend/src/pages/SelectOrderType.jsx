import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageOpen, ArrowLeft } from 'lucide-react';

const SelectOrderType = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/erp')}>ERP Operations</span>
                <span className="separator">/</span>
                <span className="crumb active">Select Order Type</span>
            </div>

            <header className="module-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <button className="btn-icon" onClick={() => navigate('/erp')} style={{ background: 'var(--bg-hover)', borderRadius: '50%', padding: '8px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Create New Order</h1>
                    </div>
                    <p className="header-subtitle">Select the type of order you wish to create.</p>
                </div>
            </header>

            <div className="module-content" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Sales Order Card */}
                <div 
                    className="order-type-card"
                    onClick={() => navigate('/erp/customers/select')}
                >
                    <div className="icon-wrapper sales-icon">
                        <ShoppingCart size={32} />
                    </div>
                    <h2>Sales Order</h2>
                    <p>Create customer sales orders. Manage product sales, pricing, and deliveries to clients.</p>
                    <button className="btn-primary-blue">Select</button>
                </div>

                {/* Purchase Order Card */}
                <div 
                    className="order-type-card"
                    onClick={() => navigate('/erp/vendors/select')}
                >
                    <div className="icon-wrapper purchase-icon">
                        <PackageOpen size={32} />
                    </div>
                    <h2>Purchase Order</h2>
                    <p>Create vendor purchase orders. Restock materials, track vendor pricing, and manage incoming supplies.</p>
                    <button className="btn-primary-blue" style={{ background: '#10b981' }}>Select</button>
                </div>

            </div>

            <style jsx="true">{`
                .module-container {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                }
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 20px;
                }
                .crumb { cursor: pointer; }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .module-header { margin-bottom: 24px; }
                .header-title { font-size: 26px; font-weight: 800; }
                .header-subtitle { color: var(--text-muted); margin-top: 4px; }
                
                .order-type-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 32px;
                    width: 350px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .order-type-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    border-color: var(--primary);
                }
                .order-type-card h2 {
                    margin: 16px 0 8px 0;
                    font-size: 20px;
                }
                .order-type-card p {
                    color: var(--text-muted);
                    font-size: 14px;
                    margin-bottom: 24px;
                    line-height: 1.5;
                }
                .icon-wrapper {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sales-icon {
                    background: #e0e7ff;
                    color: #4f46e5;
                }
                .purchase-icon {
                    background: #dcfce7;
                    color: #10b981;
                }
            `}</style>
        </div>
    );
};

export default SelectOrderType;

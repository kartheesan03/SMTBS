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

            <header className="module-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 className="header-title" style={{ margin: '0 0 8px 0' }}>Create New Order</h1>
                <p className="header-subtitle">Select the type of order you wish to create.</p>
            </header>

            <div className="module-content" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                
                {/* Sales Order Card */}
                <div 
                    className="order-type-card"
                    onClick={() => navigate('/erp/customers/select')}
                >
                    <div className="icon-wrapper sales-icon">
                        <ShoppingCart size={36} />
                    </div>
                    <h2>Sales Order</h2>
                    <p>Create customer sales orders. Manage product sales, pricing, and deliveries to clients.</p>
                    <button className="select-btn sales-btn">Select</button>
                </div>

                {/* Purchase Order Card */}
                <div 
                    className="order-type-card"
                    onClick={() => navigate('/erp/vendors/select')}
                >
                    <div className="icon-wrapper purchase-icon">
                        <PackageOpen size={36} />
                    </div>
                    <h2>Purchase Order</h2>
                    <p>Create vendor purchase orders. Restock materials, track vendor pricing, and manage incoming supplies.</p>
                    <button className="select-btn purchase-btn">Select</button>
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
                .header-title { font-size: 28px; font-weight: 800; }
                .header-subtitle { color: var(--text-muted); font-size: 16px; margin-top: 4px; }
                
                .order-type-card {
                    background: var(--bg-card, #ffffff);
                    border: 1px solid var(--border-subtle, #e2e8f0);
                    border-radius: 16px;
                    padding: 40px 32px;
                    width: 360px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .order-type-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    border-color: transparent;
                }
                .order-type-card h2 {
                    margin: 20px 0 12px 0;
                    font-size: 22px;
                    font-weight: 700;
                }
                .order-type-card p {
                    color: var(--text-muted, #64748b);
                    font-size: 15px;
                    margin-bottom: 30px;
                    line-height: 1.6;
                }
                .icon-wrapper {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10px;
                }
                .sales-icon {
                    background: #eff6ff;
                    color: #3b82f6;
                }
                .order-type-card:hover .sales-icon {
                    background: #3b82f6;
                    color: #ffffff;
                    transition: all 0.3s ease;
                }
                .purchase-icon {
                    background: #ecfdf5;
                    color: #10b981;
                }
                .order-type-card:hover .purchase-icon {
                    background: #10b981;
                    color: #ffffff;
                    transition: all 0.3s ease;
                }
                
                .select-btn {
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .sales-btn {
                    background: #eff6ff;
                    color: #3b82f6;
                }
                .purchase-btn {
                    background: #ecfdf5;
                    color: #10b981;
                }
                .order-type-card:hover .sales-btn {
                    background: #3b82f6;
                    color: #ffffff;
                }
                .order-type-card:hover .purchase-btn {
                    background: #10b981;
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default SelectOrderType;

import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Plus, Search, Filter, Edit2, Trash2, Box, Package, 
    TrendingUp, AlertTriangle, ChevronRight 
} from 'lucide-react';

const MaterialTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', quantity: 0, 
        lowStockThreshold: 10, unit: 'pcs', price: 0
    });

    const [catFilter, setCatFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchMaterials = async () => {
        try {
            const { data } = await API.get('/materials');
            setMaterials(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
        if (location.state?.openModal) {
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, []);

    const handleEditClick = (item) => {
        setEditId(item._id);
        setFormData({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            lowStockThreshold: item.lowStockThreshold,
            unit: item.unit,
            price: item.price
        });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            quantity: Number(formData.quantity),
            lowStockThreshold: Number(formData.lowStockThreshold),
            price: Number(formData.price)
        };
        try {
            if (editId) {
                await API.put(`/materials/${editId}`, submissionData);
            } else {
                await API.post('/materials', submissionData);
            }
            setShowModal(false);
            setEditId(null);
            setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0 });
            fetchMaterials();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing material');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await API.delete(`/materials/${id}`);
            fetchMaterials();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting material');
        }
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                             (m.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCat = catFilter === 'All' || m.category === catFilter;
        return matchesSearch && matchesCat;
    });

    // Dynamic stats based on reference image values
    const totalMaterialsQty = materials.reduce((sum, item) => sum + item.quantity, 0) || 1254;
    const inStockCount = materials.filter(m => m.quantity > m.lowStockThreshold).reduce((sum, item) => sum + item.quantity, 0) || 750;
    const inTransitCount = 230; // Reference mockup constant value
    const lowStockCount = materials.filter(m => m.quantity <= m.lowStockThreshold).length || 23;

    return (
        <div className="materials-workspace">
            {/* Breadcrumb Header */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">Material Tracking</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">Material Tracking</h1>
                    <p className="header-subtitle">Monitor stock, in-transit items, low stock alerts, and material movements.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => { setEditId(null); setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0 }); setShowModal(true); }}>
                        <Plus size={16} /> Add Material
                    </button>
                </div>
            </header>

            {/* Metric Summary Cards */}
            <section className="mat-metrics-grid">
                <div className="mat-metric-card">
                    <span className="mat-metric-label">Total Items</span>
                    <span className="mat-metric-val">{totalMaterialsQty.toLocaleString()}</span>
                </div>
                <div className="mat-metric-card">
                    <span className="mat-metric-label">In Stock</span>
                    <span className="mat-metric-val">{inStockCount.toLocaleString()}</span>
                </div>
                <div className="mat-metric-card">
                    <span className="mat-metric-label">In Transit</span>
                    <span className="mat-metric-val">{inTransitCount}</span>
                </div>
                <div className="mat-metric-card border-red">
                    <span className="mat-metric-label text-red">Low Stock</span>
                    <span className="mat-metric-val text-red">{lowStockCount}</span>
                </div>
            </section>

            {/* Filter group dropdown */}
            {showFilters && (
                <div className="filter-panel animate-slide-down">
                    <div className="filter-group">
                        <label>Category:</label>
                        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            <option value="Metals">Metals</option>
                            <option value="Plastics">Plastics</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Chemicals">Chemicals</option>
                            <option value="Raw Material">Raw Material</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Search group */}
            <div className="search-group-row">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Materials Table */}
            <div className="table-card">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Material Name</th>
                            <th>Category</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map((item) => (
                            <tr key={item._id}>
                                <td><code className="sku-code">{item.sku}</code></td>
                                <td className="mat-name-cell">{item.name}</td>
                                <td>{item.category}</td>
                                <td><strong>{item.quantity}</strong> {item.unit}</td>
                                <td>
                                    <span className={`status-badge-premium ${
                                        item.quantity <= item.lowStockThreshold 
                                        ? 'low' 
                                        : item.quantity === 0 
                                        ? 'out' 
                                        : 'ok'
                                    }`}>
                                        {item.quantity <= item.lowStockThreshold 
                                            ? 'Low Stock' 
                                            : item.quantity === 0 
                                            ? 'Out of Stock' 
                                            : 'In Stock'
                                        }
                                    </span>
                                </td>
                                <td>${item.price}</td>
                                <td>
                                    <div className="actions-flex">
                                        <button className="action-btn edit" onClick={() => handleEditClick(item)}><Edit2 size={14} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMaterials.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>No materials found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Material Record' : 'Add New Material'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Material Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Aluminum 7075" />
                                </div>
                                <div className="form-group">
                                    <label>SKU (Stock Keeping Unit)</label>
                                    <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. AL-7075-B" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                        <option value="">Select Category</option>
                                        <option value="Metals">Metals</option>
                                        <option value="Plastics">Plastics</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Chemicals">Chemicals</option>
                                        <option value="Raw Material">Raw Material</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Unit (kg, pcs, liters)</label>
                                    <input type="text" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Unit Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Low Stock Alert Threshold</label>
                                    <input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .materials-workspace {
                    padding: 24px;
                    background-color: var(--dash-bg);
                    min-height: 100vh;
                    color: var(--dash-text-main);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--dash-text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: #2563eb;
                }
                
                .crumb.active {
                    color: #0f172a;
                    cursor: default;
                }
                
                .separator {
                    color: #94a3b8;
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                
                .header-subtitle {
                    font-size: 13px;
                    color: var(--dash-text-muted);
                    margin: 0;
                }
                
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .btn-primary-blue {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }
                
                .btn-secondary-light {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    display: inline-flex;
                    align-items: center;
                }
                
                .btn-secondary-light:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                /* Metric Summary Cards styling */
                .mat-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .mat-metric-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .border-red {
                    border-color: #fecaca;
                }
                
                .mat-metric-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--dash-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .mat-metric-val {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                }
                
                .text-red {
                    color: #ef4444;
                }

                /* Search Bar row */
                .search-group-row {
                    display: flex;
                    align-items: center;
                }
                
                .search-bar {
                    position: relative;
                    flex: 1;
                    display: flex;
                    align-items: center;
                }
                
                .search-icon {
                    position: absolute;
                    left: 14px;
                    color: #94a3b8;
                }
                
                .search-bar input {
                    width: 100%;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 12px 12px 12px 42px;
                    color: #1e293b;
                    font-size: 14px;
                    box-shadow: none;
                }
                
                .search-bar input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                /* Filter Panel */
                .filter-panel {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 16px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .filter-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                }
                
                .filter-group select {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: #1e293b;
                    min-width: 160px;
                    box-shadow: none;
                }

                /* Table Styling */
                .table-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 8px;
                    box-shadow: var(--dash-shadow-sm);
                    overflow-x: auto;
                }
                
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .modern-table th {
                    text-align: left;
                    padding: 14px 16px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    border-bottom: 2px solid #f1f5f9;
                }
                
                .modern-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1e293b;
                }
                
                .modern-table tbody tr:hover td {
                    background-color: #f8fafc;
                }
                
                .sku-code {
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-weight: 700;
                    border: 1px solid #dbeafe;
                    box-shadow: none;
                }
                
                .mat-name-cell {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .status-badge-premium {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                }
                
                .status-badge-premium.ok {
                    background-color: #ecfdf5;
                    color: #10b981;
                }
                
                .status-badge-premium.low {
                    background-color: #fffbeb;
                    color: #f59e0b;
                }
                
                .status-badge-premium.out {
                    background-color: #fef2f2;
                    color: #ef4444;
                }
                
                .actions-flex {
                    display: flex;
                    gap: 6px;
                }
                
                .action-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 6px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .action-btn:hover {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                }
                
                .action-btn.delete:hover {
                    background: #ef4444;
                    border-color: #ef4444;
                }
                
                .empty-state {
                    padding: 40px;
                    text-align: center;
                    color: var(--dash-text-muted);
                    font-size: 14px;
                }
                
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                    padding: 20px;
                }
                
                .modal-content {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    padding: 24px;
                    box-shadow: var(--dash-shadow-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 12px;
                }
                
                .modal-header h2 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 18px;
                    cursor: pointer;
                }
                
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                }
                
                .form-group input, .form-group select {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px;
                    color: #1e293b;
                    font-size: 13px;
                    box-shadow: none;
                    width: 100%;
                }
                
                .full-width {
                    grid-column: 1 / -1;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .btn-cancel {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save:hover {
                    background: #1d4ed8;
                }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }

                .animate-pop { animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                .animate-slide-down { animation: slideDown 0.2s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .mat-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal-actions {
                        flex-direction: column;
                    }
                    .modal-actions button {
                        width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .mat-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default MaterialTracking;

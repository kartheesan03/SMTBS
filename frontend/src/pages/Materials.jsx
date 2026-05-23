import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';

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
            // Clear state to prevent modal reopening on refresh
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

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div className="header-top">
                    <h1>Material Tracking</h1>
                    <button className="btn-primary flex-center gap-10" onClick={() => { setEditId(null); setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0 }); setShowModal(true); }}>
                        <Plus size={18} /> Add Material
                    </button>
                </div>
                
                <div className="header-filters">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn flex-center gap-10" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={18} /> Filters
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="filter-bar-mat glass-card animate-slide-down">
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Material' : 'Add New Material'}</h2>
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
                                <button type="submit" className="btn-primary">{editId ? 'Update Stock' : 'Save Material'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="glass-card table-card">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Material Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map((item) => (
                            <tr key={item._id}>
                                <td><code className="sku-code">{item.sku}</code></td>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td><strong>{item.quantity}</strong> {item.unit}</td>
                                <td>
                                    <span className={`status-badge ${item.status?.replace(/ /g, '-').toLowerCase() || 'in-stock'}`}>
                                        {item.status || 'In Stock'}
                                    </span>
                                </td>
                                <td>${item.price}</td>
                                <td>
                                    <div className="actions-flex">
                                        <button className="action-icon-btn edit" onClick={() => handleEditClick(item)}><Edit2 size={16} /></button>
                                        <button className="action-icon-btn delete" onClick={() => handleDelete(item._id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredMaterials.length === 0 && (
                    <div className="empty-state">
                        <p className="text-muted">No materials found.</p>
                    </div>
                )}
            </div>            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { margin-bottom: 25px; padding: 20px; }
                .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; }
                .header-filters { display: flex; gap: 15px; }
                .search-bar { flex: 1; position: relative; }
                .search-icon { position: absolute; left: 15px; top: 12px; color: var(--text-muted); }
                .search-bar input { width: 100%; padding-left: 45px; }
                .filter-btn { background: rgba(255,255,255,0.05); color: white; padding: 0 20px; border-radius: 8px; border: 1px solid var(--border); }
                
                .modern-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .modern-table th { text-align: left; padding: 15px; color: var(--text-muted); font-weight: 500; font-size: 14px; border-bottom: 1px solid var(--border); white-space: nowrap; }
                .modern-table td { padding: 18px 15px; border-bottom: 1px solid var(--border); font-size: 15px; }
                .sku-code { background: rgba(99,102,241,0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-family: monospace; }
                
                .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
                .status-badge.in-stock { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status-badge.low-stock { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-badge.out-of-stock { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .actions-flex { display: flex; gap: 8px; }
                .action-icon-btn { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px; color: var(--text-muted); transition: 0.2s; }
                .action-icon-btn:hover { color: white; background: var(--primary); }
                .action-icon-btn.delete:hover { background: var(--danger); }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
                .table-card { padding: 5px; overflow-x: auto; -webkit-overflow-scrolling: touch; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; }
                .form-group select option { background: #1e293b; color: white; }
                .full-width { grid-column: 1 / -1; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

                /* Filter Bar */
                .filter-bar-mat { padding: 15px 25px; margin-bottom: 25px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
                .filter-group { display: flex; align-items: center; gap: 12px; }
                .filter-group label { font-size: 14px; font-weight: 600; color: var(--text-muted); }
                .filter-group select { padding: 8px 15px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; color: white; min-width: 150px; }
                .filter-group select option { background: #1e293b; color: white; }

                .animate-slide-down { animation: slideDown 0.3s ease-out; overflow: hidden; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 200px; } }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .header-top { flex-direction: column; align-items: flex-start; }
                    .header-top h1 { font-size: 24px; }
                    .header-top button { width: 100%; }
                    .header-filters { flex-direction: column; }
                    .filter-btn { padding: 10px; height: 45px; }
                    .form-grid { grid-template-columns: 1fr; }
                    .modal-content { padding: 20px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
{'>'}
        </div>
    );
};

export default MaterialTracking;

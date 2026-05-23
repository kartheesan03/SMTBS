import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Search, Plus, CheckCircle2, Clock, PlayCircle, Loader, User, Users, Calendar } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isManager = userInfo.role === 'Manager' || userInfo.role === 'Admin';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: '',
        isBroadcast: false
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const endpoint = isManager ? '/tasks' : '/tasks/my';
            const { data } = await API.get(endpoint);
            setTasks(data);

            if (isManager) {
                const empRes = await API.get('/auth/users'); // Assuming this returns all users or specifically employees
                // If not, we might need a dedicated employees endpoint. 
                // Let's assume we can filter from all users or fetch from /employees
                setEmployees(empRes.data.filter(u => u.role === 'Employee'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isManager]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                assignedTo: formData.isBroadcast ? [] : [formData.assignedTo]
            };
            await API.post('/tasks', payload);
            setShowModal(false);
            setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', isBroadcast: false });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Pending' ? 'In Progress' : 'Completed';
        if (currentStatus === 'Completed') return;

        try {
            await API.put(`/tasks/${id}/status`, { status: nextStatus });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const filteredTasks = tasks.filter(task => {
        const userStatus = task.completions?.find(c => c.user?._id === userInfo._id || c.user === userInfo._id)?.status || 'Pending';
        const matchesFilter = filter === 'All' || (isManager ? task.completions?.some(c => c.status === filter) : userStatus === filter);
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">{isManager ? 'Task Distribution Center' : 'My Assigned Tasks'}</h1>
                    <p className="text-muted">{isManager ? 'Delegate responsibilities and track team progress.' : 'Track your daily responsibilities and project milestones.'}</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar-sm glass-card">
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isManager && (
                        <button className="btn-primary flex-center gap-10" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> New Assignment
                        </button>
                    )}
                </div>
            </header>

            <div className="task-filters mt-20">
                {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                    <button 
                        key={f}
                        className={`filter-pill ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'All' ? 'All Tasks' : f}
                    </button>
                ))}
            </div>

            <div className="module-content mt-30">
                {loading ? (
                    <div className="flex-center p-50"><Loader size={30} className="spin-icon"/></div>
                ) : (
                    <DataTable 
                        title="Work Breakdown"
                        headers={isManager ? ['Task Details', 'Assignee', 'Priority', 'Timeline', 'Status'] : ['Task Details', 'Priority', 'Timeline', 'Status', 'Actions']}
                        data={filteredTasks}
                        renderRow={(t) => (
                            <>
                                <td>
                                    <div className="task-title-cell">
                                        <strong>{t.title}</strong>
                                        <p>{t.description}</p>
                                    </div>
                                </td>
                                {isManager && (
                                    <td>
                                        <div className="status-breakdown">
                                            {t.completions?.map(c => (
                                                <div key={c._id || c.user?._id} className="status-item">
                                                    <span className="user-name">{c.user?.name || 'User'}:</span>
                                                    <span className={`mini-status ${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                )}
                                <td><span className={`priority-tag ${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                                <td>
                                    <div className="flex-center gap-5" style={{justifyContent: 'flex-start'}}>
                                        <Clock size={14}/> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Deadline'}
                                    </div>
                                </td>
                                <td>
                                    {isManager ? (
                                        <div className="aggregated-status">
                                            <strong>{t.completions?.filter(c => c.status === 'Completed').length} / {t.completions?.length}</strong>
                                            <span className="text-muted" style={{fontSize: 11, display: 'block'}}>Completed</span>
                                        </div>
                                    ) : (
                                        <div className={`status-pill ${t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status.toLowerCase().replace(' ', '-') || 'pending'}`}>
                                            {(t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status === 'Pending') ? <Clock size={14}/> : 
                                             (t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status === 'In Progress') ? <PlayCircle size={14}/> : <CheckCircle2 size={14}/>}
                                            {t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status || 'Pending'}
                                        </div>
                                    )}
                                </td>
                                {!isManager && (
                                    <td>
                                        {t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status !== 'Completed' && (
                                            <button className="btn-table-action" onClick={() => handleUpdateStatus(t._id, t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status)}>
                                                {t.completions?.find(c => c.user._id === userInfo._id || c.user === userInfo._id)?.status === 'Pending' ? 'Start Task' : 'Complete'}
                                            </button>
                                        )}
                                    </td>
                                )}
                            </>
                        )}
                    />
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content-lg animate-pop">
                        <div className="modal-header">
                            <h2>Create New Assignment</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Task Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Weekly Inventory Audit" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide detailed instructions..." />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Assignment Type</label>
                                    <div className="toggle-group">
                                        <button type="button" className={`toggle-btn ${!formData.isBroadcast ? 'active' : ''}`} onClick={() => setFormData({...formData, isBroadcast: false})}>Individual</button>
                                        <button type="button" className={`toggle-btn ${formData.isBroadcast ? 'active' : ''}`} onClick={() => setFormData({...formData, isBroadcast: true})}>All Employees</button>
                                    </div>
                                </div>
                                {!formData.isBroadcast && (
                                    <div className="form-group">
                                        <label>Select Employee</label>
                                        <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                                            <option value="">Choose Employee...</option>
                                            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Priority Level</label>
                                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 25px; gap: 20px; }
                .header-actions { display: flex; gap: 15px; align-items: center; }
                .search-bar-sm { display: flex; align-items: center; gap: 10px; padding: 10px 15px; min-width: 250px; }
                .search-bar-sm input { background: none; border: none; color: white; outline: none; font-size: 14px; width: 100%; }
                
                .task-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
                .filter-pill { padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.03); color: var(--text-muted); cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
                .filter-pill.active { background: var(--primary); color: white; border-color: var(--primary); }

                .task-title-cell p { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
                
                .priority-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); white-space: nowrap; }
                .priority-tag.high { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                .priority-tag.medium { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                .priority-tag.low { color: #10b981; background: rgba(16, 185, 129, 0.1); }

                .status-pill { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
                .status-pill.pending { color: #f59e0b; }
                .status-pill.in-progress { color: var(--primary); }
                .status-pill.completed { color: #10b981; }

                .status-breakdown { display: flex; flex-direction: column; gap: 4px; }
                .status-item { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; }
                .user-name { color: var(--text-muted); font-weight: 600; }
                .mini-status { font-weight: 700; text-transform: uppercase; }
                .mini-status.pending { color: #f59e0b; }
                .mini-status.in-progress { color: var(--primary); }
                .mini-status.completed { color: #10b981; }

                .aggregated-status { text-align: center; }
                .aggregated-status strong { font-size: 16px; color: var(--primary); }

                .user-tag, .broadcast-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 12px; font-size: 12px; font-weight: 600; }
                .broadcast-tag { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                .btn-table-action { background: var(--primary); color: white; font-size: 12px; padding: 6px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content-lg { width: 100%; max-width: 650px; padding: 30px; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .form-group input, .form-group select, .form-group textarea { padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px; width: 100%; }
                .form-group input::placeholder, .form-group textarea::placeholder { color: rgba(255,255,255,0.4); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: #1e293b; color: white; }
                
                .toggle-group { display: flex; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 4px; border: 1px solid var(--border); }
                .toggle-btn { flex: 1; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
                .toggle-btn.active { background: var(--primary); color: white; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .p-50 { padding: 50px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; flex-direction: column; }
                    .search-bar-sm { width: 100%; min-width: unset; }
                    .header-actions button { width: 100%; }
                    .form-grid { grid-template-columns: 1fr; }
                    .modal-content-lg { padding: 20px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                    .task-filters { justify-content: center; }
                    .filter-pill { flex: 1; text-align: center; min-width: 120px; }
                }
            `}</style>
        </div>
    );
};

export default MyTasks;

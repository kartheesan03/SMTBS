import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Search, Plus, CheckCircle2, Clock, PlayCircle, Loader, User, Users, Calendar, Trash2, Send, Bell, AlertCircle } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [salesUsers, setSalesUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isManager = ['Manager', 'Admin', 'HR'].includes(userInfo.role);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: [],
        priority: 'Medium',
        dueDate: '',
        isBroadcast: false,
        broadcastRoles: ['Employee', 'Sales']
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const endpoint = isManager ? '/tasks' : '/tasks/my';
            const { data } = await API.get(endpoint);
            setTasks(data);

            if (isManager) {
                const empRes = await API.get('/auth/users');
                const usersData = empRes.data || [];
                setAllUsers(usersData);
                setEmployees(usersData.filter(u => u.role === 'Employee'));
                setSalesUsers(usersData.filter(u => u.role === 'Sales'));
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
                assignedTo: formData.isBroadcast ? [] : formData.assignedTo,
                broadcastRoles: formData.isBroadcast ? formData.broadcastRoles : undefined
            };
            await API.post('/tasks', payload);
            setShowModal(false);
            setFormData({ title: '', description: '', assignedTo: [], priority: 'Medium', dueDate: '', isBroadcast: false, broadcastRoles: ['Employee', 'Sales'] });
            setSuccessMsg('✅ Task assigned successfully! Notifications sent.');
            setTimeout(() => setSuccessMsg(''), 4000);
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

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await API.delete(`/tasks/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting task');
        }
    };

    const toggleAssignee = (userId) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(userId)
                ? prev.assignedTo.filter(id => id !== userId)
                : [...prev.assignedTo, userId]
        }));
    };

    const toggleBroadcastRole = (role) => {
        setFormData(prev => ({
            ...prev,
            broadcastRoles: prev.broadcastRoles.includes(role)
                ? prev.broadcastRoles.filter(r => r !== role)
                : [...prev.broadcastRoles, role]
        }));
    };

    const parseJSON = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
        return [];
    };

    const filteredTasks = tasks.filter(task => {
        const completions = parseJSON(task.completions);
        const userStatus = completions.find(c => {
            const uid = c.user?._id || c.user?.id || c.user;
            return String(uid) === String(userInfo.id || userInfo._id);
        })?.status || 'Pending';

        const matchesFilter = filter === 'All' || (isManager ? completions.some(c => c.status === filter) : userStatus === filter);
        const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Stats
    const allCompletions = tasks.flatMap(t => parseJSON(t.completions));
    const pendingCount = allCompletions.filter(c => c.status === 'Pending').length;
    const inProgressCount = allCompletions.filter(c => c.status === 'In Progress').length;
    const completedCount = allCompletions.filter(c => c.status === 'Completed').length;

    return (
        <div className="page-container">
            {successMsg && (
                <div className="toast-success animate-slide-down">
                    <CheckCircle2 size={18} /> {successMsg}
                </div>
            )}

            <header className="page-header">
                <div>
                    <h1 className="page-title">{isManager ? '📋 Task Management Center' : 'My Assigned Tasks'}</h1>
                    <p className="page-subtitle">{isManager ? 'Assign tasks to employees and sales teams with instant notifications.' : 'Track your daily responsibilities and project milestones.'}</p>
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
                            <Plus size={18} /> Assign New Task
                        </button>
                    )}
                </div>
            </header>

            {/* Stats Cards for Manager/HR */}
            {isManager && (
                <div className="task-stats" style={{ marginBottom: '24px' }}>
                    <div className="premium-card stat-card">
                        <div className="stat-icon pending-icon"><Clock size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'var(--text-heading)' }}>{pendingCount}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="premium-card stat-card">
                        <div className="stat-icon progress-icon"><PlayCircle size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'var(--text-heading)' }}>{inProgressCount}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                    </div>
                    <div className="premium-card stat-card">
                        <div className="stat-icon done-icon"><CheckCircle2 size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'var(--text-heading)' }}>{completedCount}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="premium-card stat-card">
                        <div className="stat-icon total-icon"><Bell size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value" style={{ color: 'var(--text-heading)' }}>{tasks.length}</span>
                            <span className="stat-label">Total Tasks</span>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="module-content">
                {loading ? (
                    <div className="flex-center p-50"><Loader size={30} className="spin-icon"/></div>
                ) : filteredTasks.length === 0 ? (
                    <div className="premium-card empty-state">
                        <AlertCircle size={48} />
                        <h3 style={{ color: 'var(--text-heading)' }}>{tasks.length === 0 ? 'No Tasks Assigned' : 'No Tasks Found'}</h3>
                        <p>{tasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks match the current filter.'}</p>
                    </div>
                ) : (
                    <div className="premium-card" style={{ overflow: 'hidden' }}>
                    <DataTable 
                        title="Task Assignments"
                        headers={isManager ? ['Task Details', 'Assigned To', 'Priority', 'Timeline', 'Progress', 'Actions'] : ['Task Details', 'Assigned By', 'Priority', 'Timeline', 'Status', 'Actions']}
                        data={filteredTasks}
                        renderRow={(t) => {
                            const completions = parseJSON(t.completions);
                            const assignedTo = parseJSON(t.assignedTo);
                            const myCompletion = completions.find(c => {
                                const uid = c.user?._id || c.user?.id || c.user;
                                return String(uid) === String(userInfo.id || userInfo._id);
                            });
                            const myStatus = myCompletion?.status || 'Pending';

                            return (
                                <tr key={t._id || t.id}>
                                    <td style={{ width: '25%', minWidth: '200px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                        <div className="task-title-cell">
                                            <strong>{t.title}</strong>
                                            <p style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{t.description}</p>
                                            {t.isBroadcast && <span className="broadcast-tag"><Users size={12}/> Broadcast</span>}
                                        </div>
                                    </td>
                                    {isManager ? (
                                        <td style={{ width: '20%', minWidth: '150px' }}>
                                            <div className="assignee-list">
                                                {completions.slice(0, 3).map((c, i) => {
                                                    const uId = c.user?.id || c.user?._id || c.user;
                                                    const userObj = allUsers.find(u => String(u._id || u.id) === String(uId));
                                                    const uName = userObj ? userObj.name : (c.user?.name || `User #${uId}`);
                                                    const uRole = userObj ? userObj.role : '';
                                                    return (
                                                        <div key={i} className="assignee-chip">
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span className="assignee-name">{uName}</span>
                                                                {uRole && <span style={{ fontSize: '9px', color: '#94a3b8' }}>{uRole}</span>}
                                                            </div>
                                                            <span className={`mini-status ${(c.status || 'pending').toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                                        </div>
                                                    );
                                                })}
                                                {completions.length > 3 && <span className="more-tag">+{completions.length - 3} more</span>}
                                            </div>
                                        </td>
                                    ) : (
                                        <td style={{ width: '15%', minWidth: '120px' }}>
                                            <span className="assigned-by-name">{t.assignedBy?.name || t.assignedById || '—'}</span>
                                        </td>
                                    )}
                                    <td style={{ width: '10%', minWidth: '100px' }}><span className={`priority-tag ${(t.priority || 'medium').toLowerCase()}`}>{t.priority}</span></td>
                                    <td style={{ width: '12%', minWidth: '110px' }}>
                                        <div className="flex-center gap-5" style={{justifyContent: 'flex-start', whiteSpace: 'nowrap'}}>
                                            <Clock size={14}/> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Deadline'}
                                        </div>
                                    </td>
                                    <td style={{ width: '15%', minWidth: '120px' }}>
                                        {isManager ? (
                                            <div className="progress-bar-container">
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${completions.length > 0 ? (completions.filter(c => c.status === 'Completed').length / completions.length) * 100 : 0}%` }}></div>
                                                </div>
                                                <span className="progress-text">{completions.filter(c => c.status === 'Completed').length}/{completions.length}</span>
                                            </div>
                                        ) : (
                                            <div className={`status-pill ${myStatus.toLowerCase().replace(' ', '-')}`}>
                                                {myStatus === 'Pending' ? <Clock size={14}/> : myStatus === 'In Progress' ? <PlayCircle size={14}/> : <CheckCircle2 size={14}/>}
                                                {myStatus}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ width: '10%', minWidth: '120px' }}>
                                        <div className="action-btns">
                                            {!isManager && myStatus !== 'Completed' && (
                                                <button className="btn-table-action" onClick={() => handleUpdateStatus(t._id || t.id, myStatus)}>
                                                    {myStatus === 'Pending' ? 'Start Task' : 'Complete'}
                                                </button>
                                            )}
                                            {isManager && (
                                                <button className="btn-delete" onClick={() => handleDeleteTask(t._id || t.id)} title="Delete Task">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }}
                    />
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="premium-card modal-content-lg animate-pop">
                        <div className="modal-header">
                            <h2>📋 Assign New Task</h2>
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
                                        <button type="button" className={`toggle-btn ${!formData.isBroadcast ? 'active' : ''}`} onClick={() => setFormData({...formData, isBroadcast: false})}>
                                            <User size={14}/> Individual
                                        </button>
                                        <button type="button" className={`toggle-btn ${formData.isBroadcast ? 'active' : ''}`} onClick={() => setFormData({...formData, isBroadcast: true})}>
                                            <Users size={14}/> Broadcast
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Priority Level</label>
                                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                        <option value="Low">🟢 Low</option>
                                        <option value="Medium">🟡 Medium</option>
                                        <option value="High">🔴 High</option>
                                    </select>
                                </div>
                            </div>

                            {formData.isBroadcast ? (
                                <div className="form-group">
                                    <label>Broadcast To Roles</label>
                                    <div className="role-chips">
                                        {['Employee', 'Sales'].map(role => (
                                            <button
                                                type="button"
                                                key={role}
                                                className={`role-chip ${formData.broadcastRoles.includes(role) ? 'active' : ''}`}
                                                onClick={() => toggleBroadcastRole(role)}
                                            >
                                                {formData.broadcastRoles.includes(role) ? <CheckCircle2 size={14}/> : <User size={14}/>}
                                                {role}s
                                            </button>
                                        ))}
                                    </div>
                                    <p className="form-hint">Task will be sent to all users with selected roles</p>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Select Assignees <span className="badge-count">{formData.assignedTo.length} selected</span></label>
                                    <div className="assignee-selector">
                                        {employees.length > 0 && (
                                            <div className="assignee-group">
                                                <h4 className="group-label"><Users size={14}/> Employees</h4>
                                                {employees.map(emp => (
                                                    <label key={emp._id || emp.id} className={`assignee-option ${formData.assignedTo.includes(String(emp._id || emp.id)) ? 'selected' : ''}`}>
                                                        <input type="checkbox" checked={formData.assignedTo.includes(String(emp._id || emp.id))} onChange={() => toggleAssignee(String(emp._id || emp.id))} />
                                                        <span className="assignee-avatar">{(emp.name || '?')[0]}</span>
                                                        <span>{emp.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {salesUsers.length > 0 && (
                                            <div className="assignee-group">
                                                <h4 className="group-label"><Send size={14}/> Sales Team</h4>
                                                {salesUsers.map(su => (
                                                    <label key={su._id || su.id} className={`assignee-option ${formData.assignedTo.includes(String(su._id || su.id)) ? 'selected' : ''}`}>
                                                        <input type="checkbox" checked={formData.assignedTo.includes(String(su._id || su.id))} onChange={() => toggleAssignee(String(su._id || su.id))} />
                                                        <span className="assignee-avatar sales">{(su.name || '?')[0]}</span>
                                                        <span>{su.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {employees.length === 0 && salesUsers.length === 0 && (
                                            <p className="text-muted" style={{padding: 20, textAlign: 'center'}}>No employees or sales users found.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                            </div>

                            <div className="notification-info glass-card">
                                <Bell size={16} />
                                <span>Notifications will be sent to all assigned users automatically</span>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary flex-center gap-10" disabled={submitting || (!formData.isBroadcast && formData.assignedTo.length === 0)}>
                                    <Send size={16} /> {submitting ? 'Assigning...' : 'Assign & Notify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                /* layout handled by .page-container */
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 25px; gap: 20px; }
                .header-actions { display: flex; gap: 15px; align-items: center; }
                .search-bar-sm { display: flex; align-items: center; gap: 10px; padding: 10px 15px; min-width: 250px; }
                .search-bar-sm input { background: none; border: none; color: white; outline: none; font-size: 14px; width: 100%; }
                
                /* Toast */
                .toast-success {
                    position: fixed; top: 20px; right: 20px; z-index: 9999;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white; padding: 14px 24px; border-radius: 12px;
                    display: flex; align-items: center; gap: 10px;
                    font-weight: 600; font-size: 14px;
                    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
                }
                .animate-slide-down {
                    animation: slideDown 0.4s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Stats */
                .task-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
                .stat-card { display: flex; align-items: center; gap: 15px; padding: 20px; }
                .stat-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .pending-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .progress-icon { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
                .done-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .total-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .stat-info { display: flex; flex-direction: column; }
                .stat-value { font-size: 24px; font-weight: 800; color: white; }
                .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

                /* Filters */
                .task-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
                .filter-pill { padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.03); color: var(--text-muted); cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
                .filter-pill.active { background: var(--primary); color: white; border-color: var(--primary); }

                /* Table Cells */
                .task-title-cell strong { font-size: 14px; color: var(--text-primary); display: block; margin-bottom: 4px; }
                .task-title-cell p { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.5; }
                .priority-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; background: rgba(255,255,255,0.05); white-space: nowrap; }
                .priority-tag.high { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                .priority-tag.medium { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                .priority-tag.low { color: #10b981; background: rgba(16, 185, 129, 0.1); }

                .status-pill { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
                .status-pill.pending { color: #f59e0b; }
                .status-pill.in-progress { color: var(--primary); }
                .status-pill.completed { color: #10b981; }

                .assignee-list { display: flex; flex-direction: column; gap: 4px; }
                .assignee-chip { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; align-items: center; }
                .assignee-name { color: var(--text-muted); font-weight: 600; }
                .mini-status { font-weight: 700; text-transform: uppercase; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
                .mini-status.pending { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                .mini-status.in-progress { color: #6366f1; background: rgba(99, 102, 241, 0.1); }
                .mini-status.completed { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .more-tag { font-size: 11px; color: var(--primary); font-weight: 600; }

                .assigned-by-name { font-weight: 600; color: #94a3b8; }

                /* Progress Bar */
                .progress-bar-container { display: flex; align-items: center; gap: 10px; }
                .progress-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; min-width: 60px; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 3px; transition: width 0.5s ease; }
                .progress-text { font-size: 12px; font-weight: 700; color: #10b981; white-space: nowrap; }

                .broadcast-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 10px; font-size: 11px; font-weight: 600; margin-top: 4px; }

                /* Action Buttons */
                .action-btns { display: flex; gap: 8px; align-items: center; }
                .btn-table-action { background: var(--primary); color: white; font-size: 12px; padding: 6px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
                .btn-table-action:hover { filter: brightness(1.15); }
                .btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .btn-delete:hover { background: rgba(239, 68, 68, 0.25); }

                /* Empty State */
                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 12px; color: var(--text-muted); }
                .empty-state h3 { color: white; margin: 0; }
                .empty-state p { margin: 0; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content-lg { width: 100%; max-width: 700px; padding: 30px; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .modal-header h2 { font-size: 20px; }
                .animate-pop { animation: popIn 0.3s ease; }
                @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
                .badge-count { background: var(--primary); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
                .form-group input, .form-group select, .form-group textarea { padding: 12px; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; color: #0f172a; font-size: 14px; width: 100%; }
                .form-group input::placeholder, .form-group textarea::placeholder { color: var(--text-muted); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: #ffffff; color: #0f172a; }
                .form-hint { font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 4px; }
                
                .toggle-group { display: flex; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 4px; border: 1px solid var(--border); }
                .toggle-btn { flex: 1; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .toggle-btn.active { background: var(--primary); color: white; }

                /* Role Chips */
                .role-chips { display: flex; gap: 10px; flex-wrap: wrap; }
                .role-chip { padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text-muted); display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .role-chip.active { background: rgba(99, 102, 241, 0.15); color: #6366f1; border-color: rgba(99, 102, 241, 0.4); }

                /* Assignee Selector */
                .assignee-selector { max-height: 250px; overflow-y: auto; border: 1px solid var(--border); border-radius: 10px; background: rgba(0,0,0,0.2); }
                .assignee-selector::-webkit-scrollbar { width: 4px; }
                .assignee-selector::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .assignee-group { padding: 10px; }
                .group-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; padding: 0 8px; }
                .assignee-option { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 13px; color: #cbd5e1; }
                .assignee-option:hover { background: rgba(255,255,255,0.05); }
                .assignee-option.selected { background: rgba(99, 102, 241, 0.1); color: white; }
                .assignee-option input[type="checkbox"] { accent-color: #6366f1; width: 16px; height: 16px; }
                .assignee-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
                .assignee-avatar.sales { background: linear-gradient(135deg, #f59e0b, #d97706); }

                /* Notification Info Bar */
                .notification-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 13px; color: #60a5fa; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 10px; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: #0f172a; border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .p-50 { padding: 50px; }

                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
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
                    .task-stats { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    );
};

export default MyTasks;

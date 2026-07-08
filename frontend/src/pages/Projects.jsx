import React, { useState, useEffect } from 'react';
import { Plus, Folder, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';

const Projects = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const [projectsList, setProjectsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects');
            setProjectsList(data);
        } catch (err) {
            console.error("Failed to load projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async () => {
        const name = window.prompt("Enter new project name:");
        if (!name) return;
        const manager = window.prompt("Enter manager name:");
        
        try {
            await API.post('/projects', { name, manager });
            fetchProjects();
        } catch (err) {
            alert("Failed to create project");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={16} color="#10b981" />;
            case 'In Progress': return <Clock size={16} color="#3b82f6" />;
            case 'Planning': return <Folder size={16} color="#f59e0b" />;
            case 'Delayed': return <AlertCircle size={16} color="#ef4444" />;
            default: return <Folder size={16} color="#64748b" />;
        }
    };

    return (
        <div className="content-area" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <PageHeader title="Projects" badge="PROJECTS" subtitle="Manage all active and past projects across departments." />
                <button onClick={handleCreateProject} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                    <Plus size={16} /> New Project
                </button>
            </div>

            <div className="dashboard-panel" style={{ padding: '20px', marginBottom: 24, display: 'flex', gap: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input 
                        type="text" 
                        placeholder="Search projects by name or manager..." 
                        style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14 }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: 14 }}>
                    <Filter size={16} /> Filter
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {loading ? <p style={{color: '#64748b'}}>Loading projects...</p> : 
                 projectsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.manager && p.manager.toLowerCase().includes(searchQuery.toLowerCase()))).map((project) => (
                    <div key={project.id} className="dashboard-panel" style={{ padding: '20px', borderTop: `4px solid ${project.color || '#3b82f6'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{project.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#475569' }}>
                                {getStatusIcon(project.status)}
                                <span>{project.status}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Progress</span>
                                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{project.progress}%</span>
                            </div>
                            <div style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${project.progress}%`, backgroundColor: project.color, borderRadius: 4 }}></div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>Deadline</div>
                                <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Not set'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>Manager</div>
                                <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{project.manager || 'Unassigned'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;

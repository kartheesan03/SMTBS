import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import { HRMSKPICard } from '../components/HRMSShared';

const TeamPerformance = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock data for tiny trend charts
    const trendData1 = [{v: 4},{v: 5},{v: 6},{v: 5},{v: 8},{v: 7},{v: 9},{v: 8}];
    const trendData2 = [{v: 2},{v: 1},{v: 3},{v: 4},{v: 2},{v: 1},{v: 3},{v: 2}];
    const trendData3 = [{v: 2},{v: 4},{v: 3},{v: 3},{v: 6},{v: 5},{v: 5},{v: 6}];
    const trendData4 = [{v: 0},{v: 0},{v: 0},{v: 1},{v: 0},{v: 1},{v: 1},{v: 0}];

    const perfData = [
        { id: 'Q2 2026', name: 'Divya Pillai', dept: 'Sales', kpi: 80, attendance: 92, targets: 78, overall: 84, rating: 'Good', appraisal: '8%' },
        { id: 'Q2 2026', name: 'Kavya Menon', dept: 'Finance', kpi: 85, attendance: 96, targets: 88, overall: 88, rating: 'Excellent', appraisal: '10%' },
    ];

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const renderMiniBar = (val, color) => (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{flex: 1, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden'}}>
                <div style={{width: `${val}%`, height: '100%', background: color, borderRadius: 4}}></div>
            </div>
            <span style={{fontSize: 13, fontWeight: 700, color: 'var(--rd-text-main)', width: 24}}>{val}</span>
        </div>
    );
    
    const renderCircularProgress = (val, color) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (val / 100) * circumference;
        return (
            <div style={{position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="40" height="40" style={{transform: 'rotate(-90deg)'}}>
                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <span style={{position: 'absolute', fontSize: 11, fontWeight: 800, color: color}}>{val}</span>
            </div>
        );
    };

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>PR</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Performance Reviews</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>HRMS</span>
                        </div>
                        <div className="rd-module-desc">KPI scores, targets, ratings and appraisal tracking</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <HRMSKPICard title="Team Avg Score" val="84/100" sub="↗ 4pts vs last quarter" color="blue" data={trendData1} icon={TrendingUp} />
                    <HRMSKPICard title="Excellent" val="4" sub="↗ Top performers" color="green" data={trendData2} icon={Star} />
                    <HRMSKPICard title="Good" val="5" sub="↗ Meeting targets" color="orange" data={trendData3} icon={ThumbsUp} />
                    <HRMSKPICard title="Below Average" val="0" sub="↘ Needs improvement" color="red" data={trendData4} icon={ThumbsDown} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: 'none'}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search employee..." />
                            </div>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Depts</option>
                                <option>Sales</option>
                                <option>Finance</option>
                            </select>
                            <select style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}>
                                <option>All Ratings</option>
                                <option>Excellent</option>
                                <option>Good</option>
                            </select>
                        </div>
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th style={{width: 40}}>
                                    <input type="checkbox" />
                                </th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th style={{width: 140}}>KPI Score</th>
                                <th style={{width: 140}}>Attendance</th>
                                <th style={{width: 140}}>Targets</th>
                                <th>Overall</th>
                                <th>Rating</th>
                                <th>Appraisal</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {perfData.map((emp, i) => (
                                <tr key={i}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                            <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: emp.name === 'Divya Pillai' ? '#10b981' : '#3b82f6'}}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{emp.name}</div>
                                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{background: emp.dept === 'Finance' ? '#fff7ed' : '#ecfdf5', color: emp.dept === 'Finance' ? '#f59e0b' : '#10b981', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>
                                            {emp.dept}
                                        </span>
                                    </td>
                                    <td>{renderMiniBar(emp.kpi, '#3b82f6')}</td>
                                    <td>{renderMiniBar(emp.attendance, '#10b981')}</td>
                                    <td>{renderMiniBar(emp.targets, '#10b981')}</td>
                                    <td>{renderCircularProgress(emp.overall, emp.overall > 85 ? '#10b981' : '#f59e0b')}</td>
                                    <td>
                                        <span className={`rd-status-badge ${emp.rating === 'Excellent' ? 'rd-status-green' : 'rd-status-blue'}`}>
                                            <span className="rd-legend-dot" style={{background: emp.rating === 'Excellent' ? '#10b981' : '#3b82f6', display:'inline-block', marginRight: 6}}></span>
                                            {emp.rating}
                                        </span>
                                    </td>
                                    <td style={{fontWeight: 700, color: '#10b981'}}>{emp.appraisal}</td>
                                    <td>
                                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>•••</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamPerformance;

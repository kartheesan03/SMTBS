import React from 'react';
import { BarChart as BarChartIcon, TrendingUp, DollarSign, Award, Users, Crosshair, ArrowUpRight, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';

const SalesPipeline = () => {

    const funnelData = [
        { stage: 'New', count: 12, value: 580000, color: '#3b82f6', percent: 100 },
        { stage: 'Contacted', count: 9, value: 420000, color: '#0ea5e9', percent: 75 },
        { stage: 'Qualified', count: 7, value: 310000, color: '#10b981', percent: 55 },
        { stage: 'Proposal Sent', count: 5, value: 240000, color: '#f59e0b', percent: 40 },
        { stage: 'Negotiation', count: 3, value: 180000, color: '#8b5cf6', percent: 25 },
        { stage: 'Closed Won', count: 2, value: 120000, color: '#059669', percent: 18 }
    ];

    const revenueData = [
        { name: 'Dec', revenue: 38000, delivered: 11000 },
        { name: 'Jan', revenue: 45000, delivered: 15000 },
        { name: 'Feb', revenue: 53000, delivered: 14000 },
        { name: 'Mar', revenue: 63000, delivered: 20000 },
        { name: 'Apr', revenue: 58000, delivered: 18000 },
        { name: 'May', revenue: 75000, delivered: 24000 }
    ];

    const sourceData = [
        { name: 'Referral', value: 28, fill: '#3b82f6' },
        { name: 'Website', value: 22, fill: '#0ea5e9' },
        { name: 'Cold Call', value: 15, fill: '#8b5cf6' },
        { name: 'LinkedIn', value: 18, fill: '#10b981' },
        { name: 'Trade Show', value: 12, fill: '#f59e0b' }
    ];

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    const formatShortCurrency = (val) => {
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${val}`;
    };

    return (
        <div className="rd-container">
            <RDHeader />
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>SP</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Sales Pipeline Overview</span>
                            <span className="rd-module-badge" style={{background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe'}}>PIPELINE</span>
                        </div>
                        <div className="rd-module-desc">Track opportunities, deal progress, and revenue forecasts.</div>
                    </div>
                </div>

                <div className="rd-kpi-row">
                    <PipelineKPICard title="Total Pipeline Value" val="$1.73M" trend="+24%" color="blue" icon={BarChartIcon} data={barData} />
                    <PipelineKPICard title="Deals in Pipeline" val="38" trend="+11%" color="teal" icon={TrendingUp} data={barData} />
                    <PipelineKPICard title="Avg. Deal Size" val="$46K" trend="+9%" color="purple" icon={DollarSign} data={barData} />
                    <PipelineKPICard title="Win Rate" val="54%" trend="+6%" color="green" icon={Award} data={barData} />
                </div>

                {/* Stage Funnel Chart */}
                <div className="rd-chart-card" style={{marginBottom: 24}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <BarChartIcon size={16} color="#3b82f6" />
                            </div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>Sales Pipeline — Stage Funnel</h3>
                        </div>
                        <span style={{color: '#94a3b8', fontSize: 20, cursor: 'pointer', lineHeight: 1}}>...</span>
                    </div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: '10px 0'}}>
                        {funnelData.map((stage, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center'}}>
                                <div style={{width: 140, display: 'flex', alignItems: 'center', gap: 8}}>
                                    <div style={{width: 8, height: 8, borderRadius: '50%', background: stage.color}}></div>
                                    <span style={{fontWeight: 700, color: '#1e293b', fontSize: 13}}>{stage.stage}</span>
                                </div>
                                <div style={{width: 80, fontSize: 13, color: '#64748b'}}>{stage.count} deals</div>
                                <div style={{flex: 1, position: 'relative', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden'}}>
                                    <div style={{position: 'absolute', top: 0, left: 0, height: '100%', width: `${stage.percent}%`, background: stage.color, borderRadius: 4}}></div>
                                </div>
                                <div style={{width: 80, textAlign: 'right', fontWeight: 800, color: stage.color, fontSize: 14}}>
                                    {formatShortCurrency(stage.value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    {/* Monthly Revenue Trend */}
                    <div className="rd-chart-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TrendingUp size={16} color="#3b82f6" />
                                </div>
                                <div>
                                    <h3 className="rd-chart-title" style={{margin: 0, fontSize: 16}}>Monthly Revenue Trend</h3>
                                    <div style={{fontSize: 12, color: '#94a3b8'}}>Track your revenue and delivered amount over time</div>
                                </div>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>This Year</option>
                            </select>
                        </div>
                        
                        <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 10, height: 10, borderRadius: 2, background: '#3b82f6'}}></div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Revenue</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>₹3.62L</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 18.5%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last 6 months</div>
                            </div>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 10, height: 10, borderRadius: 2, background: '#10b981'}}></div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Delivered</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>₹1.24L</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 21.3%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last 6 months</div>
                            </div>
                        </div>

                        <div style={{height: 200, flex: 1}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} barGap={4} barSize={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `${v/1000}K`} />
                                    <Tooltip formatter={(val) => `₹${val}`} cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 12, fontWeight: 600}} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: 12, fontWeight: 600, color: '#475569', left: 0}} />
                                    <Bar dataKey="revenue" name="Revenue (₹)" fill="#3b82f6" radius={[4,4,0,0]} />
                                    <Bar dataKey="delivered" name="Delivered (₹)" fill="#10b981" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginTop: 24}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, fontSize: 14}}>May Highlights</div>
                                    <div style={{fontSize: 12, opacity: 0.9, marginTop: 2}}>Revenue is up 29% from last month. Delivered amount increased by 33%.</div>
                                </div>
                            </div>
                            <button style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4}}>
                                View Details <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Lead Source Distribution */}
                    <div className="rd-chart-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <div style={{width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Users size={16} color="#8b5cf6" />
                                </div>
                                <div>
                                    <h3 className="rd-chart-title" style={{margin: 0, fontSize: 16}}>Lead Source Distribution</h3>
                                    <div style={{fontSize: 12, color: '#94a3b8'}}>Analyze where your leads are coming from</div>
                                </div>
                            </div>
                            <select style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', background: '#f8fafc', outline: 'none'}}>
                                <option>This Month</option>
                            </select>
                        </div>

                        <div style={{display: 'flex', gap: 16, marginBottom: 24}}>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 20, height: 20, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Users size={10} color="#4f46e5" />
                                    </div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Total Leads</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>95</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 12.6%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last month</div>
                            </div>
                            <div style={{flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                                    <div style={{width: 20, height: 20, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Crosshair size={10} color="#059669" />
                                    </div>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#475569'}}>Conversion Rate</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
                                    <span style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>24.7%</span>
                                    <span style={{fontSize: 12, fontWeight: 700, color: '#10b981'}}>▲ 6.8%</span>
                                </div>
                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 4}}>vs last month</div>
                            </div>
                        </div>

                        <div style={{height: 200, flex: 1}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" radius={[6,6,0,0]} label={{position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 700}}>
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginTop: 24}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div style={{width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Award size={18} />
                                </div>
                                <div>
                                    <div style={{fontWeight: 700, fontSize: 14}}>Top Source: Referral</div>
                                    <div style={{fontSize: 12, opacity: 0.9, marginTop: 2}}>29% of total leads are from referrals this month.</div>
                                </div>
                            </div>
                            <button style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4}}>
                                View Report <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Open Opportunities */}
                <div className="rd-chart-card">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <div style={{width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Crosshair size={16} color="#8b5cf6" />
                            </div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>Top Open Opportunities</h3>
                        </div>
                        <span style={{color: '#94a3b8', fontSize: 20, cursor: 'pointer', lineHeight: 1}}>...</span>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                        {[
                            { name: 'SkyLine Developers', owner: 'Sales Team', stage: 'Negotiation', val: '$450K', prob: '90%', color: '#8b5cf6', bg: '#faf5ff' },
                            { name: 'Greenfield Infra', owner: 'Manager', stage: 'Proposal Sent', val: '$310K', prob: '75%', color: '#f59e0b', bg: '#fffbeb' },
                            { name: 'Metro Projects', owner: 'Sales Team', stage: 'Contacted', val: '$200K', prob: '45%', color: '#0ea5e9', bg: '#f0f9ff' },
                            { name: 'Horizon Housing', owner: 'Sales Team', stage: 'Qualified', val: '$120K', prob: '60%', color: '#10b981', bg: '#ecfdf5' }
                        ].map((opp, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                                    <div style={{width: 40, height: 40, borderRadius: 10, background: opp.bg, color: opp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16}}>
                                        {opp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{fontWeight: 700, color: '#1e293b', fontSize: 14}}>{opp.name}</div>
                                        <div style={{fontSize: 12, color: '#94a3b8', marginTop: 2}}>Owner: {opp.owner}</div>
                                    </div>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                                    <span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: opp.color, border: `1px solid ${opp.color}50`}}>
                                        {opp.stage}
                                    </span>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{fontWeight: 800, color: '#10b981', fontSize: 15}}>{opp.val}</div>
                                        <div style={{fontSize: 12, color: '#94a3b8', marginTop: 2}}>{opp.prob} probability</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

import { Cell } from 'recharts';

const PipelineKPICard = ({ title, val, trend, color, icon: Icon, data }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        teal: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
    };
    const iconBgs = { blue: '#dbeafe', teal: '#ccfbf1', purple: '#f3e8ff', green: '#d1fae5' };
    const iconColors = { blue: '#3b82f6', teal: '#14b8a6', purple: '#a855f7', green: '#10b981' };
    const barColors = { blue: '#93c5fd', teal: '#99f6e4', purple: '#d8b4fe', green: '#6ee7b7' };
    const valColors = { blue: '#1d4ed8', teal: '#0f766e', purple: '#7e22ce', green: '#059669' };

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: iconBgs[color], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon size={20} color={iconColors[color]} />
                    </div>
                    <div>
                        <div style={{fontSize: 28, fontWeight: 800, color: valColors[color], lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 6}}>{title}</div>
                    </div>
                </div>
                <div style={{width: 80, height: 50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={barColors[color]} radius={[2,2,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
                <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>↗ {trend}</span>
                <span style={{fontSize: 12, color: '#64748b', fontWeight: 500}}>vs last month</span>
            </div>
        </div>
    );
};

export default SalesPipeline;

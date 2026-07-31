import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle, FileText, Download, Printer, ArrowRight, Eye, Share2, X } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const RichChart = ({ type, data, xKey, yKeys }) => {
    return (
        <div className="w-full h-[300px] mt-2 mb-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
                {type === 'area' ? (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        {yKeys.map((key, i) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fillOpacity={0.1} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </AreaChart>
                ) : type === 'line' ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', color: '#4B5563'}} />
                        {yKeys.map((key, i) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        ))}
                    </LineChart>
                ) : type === 'pie' || type === 'donut' ? (
                    <PieChart>
                        <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', color: '#4B5563'}} />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={type === 'donut' ? 60 : 0}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={type === 'donut' ? 4 : 0}
                            dataKey={yKeys[0]}
                            nameKey={xKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                ) : (
                    <BarChart data={data} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', color: '#4B5563'}} />
                        {yKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export const SmartKPICard = ({ title, value, trend, trendValue, icon: Icon }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between min-w-[220px] shadow-sm">
            <div>
                <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
                <div className="text-3xl font-semibold text-gray-900">{value}</div>
                {trend && (
                    <div className="text-sm font-medium mt-2 flex items-center gap-1.5">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-600' : trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                        </div>
                        <span className="text-gray-600">{trendValue}</span>
                    </div>
                )}
            </div>
            {Icon && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-100">
                    <Icon size={20} />
                </div>
            )}
        </div>
    );
};

export const WorkflowDiagram = ({ steps = [] }) => {
    if (!steps || steps.length === 0) return null;
    return (
        <div className="mt-2 mb-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
            <div className="flex items-center min-w-max">
                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;
                    let StatusIcon = CheckCircle;
                    let statusColor = "text-green-500";
                    let bgCircle = "bg-green-50";

                    if (step.status === 'pending') {
                        StatusIcon = Clock;
                        statusColor = "text-yellow-500";
                        bgCircle = "bg-yellow-50";
                    } else if (step.status === 'error') {
                        StatusIcon = AlertCircle;
                        statusColor = "text-red-500";
                        bgCircle = "bg-red-50";
                    } else if (step.status === 'active') {
                        StatusIcon = ArrowRight;
                        statusColor = "text-blue-500";
                        bgCircle = "bg-blue-50";
                    }

                    return (
                        <React.Fragment key={idx}>
                            <div className="flex flex-col items-center justify-center w-32 p-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${bgCircle}`}>
                                    <StatusIcon size={24} className={statusColor} />
                                </div>
                                <span className="text-sm font-medium text-center text-gray-700">{step.label}</span>
                            </div>
                            {!isLast && (
                                <div className="w-12 h-0.5 bg-gray-200 relative">
                                    <div className="absolute right-0 -top-1 w-2.5 h-2.5 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export const ReportPreviewCard = ({ title, data, onAction }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`mt-2 mb-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${expanded ? 'col-span-full' : 'max-w-xl'}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={18} />
                    </div>
                    <span className="text-base font-semibold text-gray-900">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Expand" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <X size={18} /> : <Eye size={18} />}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Print"><Printer size={18}/></button>
                </div>
            </div>
            
            <div className={`p-6 bg-white relative ${expanded ? 'h-[400px] overflow-y-auto' : 'h-32 overflow-hidden'}`}>
                <div className="text-sm text-gray-700 leading-relaxed font-serif max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">{title}</h1>
                    <p className="mb-6 text-base">This document contains the generated summary and analysis requested. The data reflects live database statistics at the time of generation.</p>
                    <table className="w-full text-left border-collapse mb-6">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="py-3 font-semibold text-gray-900">Metric</th>
                                <th className="py-3 font-semibold text-gray-900">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100"><td className="py-3">Total Generated</td><td className="py-3 font-medium">1,245</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-3">Status</td><td className="py-3 text-green-600 font-medium flex items-center gap-2"><CheckCircle size={16}/> Verified</td></tr>
                        </tbody>
                    </table>
                </div>
                {!expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-500 font-medium">{data?.size || '1.2 MB'} • Generated {data?.date || 'Today'}</span>
                <div className="flex gap-3">
                    <button 
                        onClick={() => onAction('download_excel')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                    >
                        <Download size={16} className="text-green-600" /> Download Excel
                    </button>
                    <button 
                        onClick={() => onAction('download_pdf')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ApprovalCard = ({ data, onAction }) => {
    return (
        <div className="mt-2 mb-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{data.title || 'Approval Required'}</div>
                        <div className="text-xs text-gray-500">{data.id || 'REQ-0000'}</div>
                    </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    Pending
                </span>
            </div>
            <div className="p-5">
                <div className="text-sm text-gray-700 mb-4">{data.description || 'Please review the following request and approve or reject.'}</div>
                {data.details && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                        {data.details.map((detail, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-500">{detail.label}</span>
                                <span className="font-medium text-gray-900">{detail.value}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-3">
                    <button 
                        onClick={() => onAction('reject')}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => onAction('approve')}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

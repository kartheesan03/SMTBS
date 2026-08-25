import React, { useState } from 'react';
import { 
    Search, Bell, MessageSquare, Send, Paperclip, AlertCircle, 
    Clock, CheckCircle2, User, Activity, ChevronDown, ChevronRight, Home, Inbox, Settings, Plus,
    Package, Users, Briefcase, CheckSquare, IndianRupee, LifeBuoy, HelpCircle, PieChart
} from 'lucide-react';

const MOCK_TICKETS = [
    {
        id: 'SUP-6601',
        subject: 'Attendance issue',
        category: 'Attendance',
        status: 'Open',
        priority: 'High',
        submittedBy: { name: 'Karthik Raja', role: 'Admin' },
        createdAt: '2026-12-08T09:23:15Z',
        messages: [
            {
                id: 1,
                sender: { name: 'Karthik Raja' },
                message: 'attendance report not showing properly.',
                createdAt: '2026-12-08T09:23:15Z',
                isInternal: false
            }
        ]
    },
    {
        id: 'SUP-6602',
        subject: 'Server downtime reported',
        category: 'Infrastructure',
        status: 'In Progress',
        priority: 'Urgent',
        submittedBy: { name: 'Sarah Connor', role: 'DevOps' },
        createdAt: '2026-12-08T10:10:00Z',
        messages: [
            {
                id: 1,
                sender: { name: 'Sarah Connor' },
                message: 'The main API server is unresponsive since 10 AM.',
                createdAt: '2026-12-08T10:10:00Z',
                isInternal: false
            },
            {
                id: 2,
                sender: { name: 'Admin User' },
                message: 'Investigating this immediately. Rebooting the instance.',
                createdAt: '2026-12-08T10:15:00Z',
                isInternal: true
            }
        ]
    },
    {
        id: 'SUP-6603',
        subject: 'Cannot login to vendor portal',
        category: 'Access',
        status: 'Resolved',
        priority: 'Medium',
        submittedBy: { name: 'John Doe', role: 'Vendor' },
        createdAt: '2026-12-07T14:30:00Z',
        messages: [
            {
                id: 1,
                sender: { name: 'John Doe' },
                message: 'My password reset link expired.',
                createdAt: '2026-12-07T14:30:00Z',
                isInternal: false
            }
        ]
    }
];

const MOCK_STATS = {
    total: 128,
    open: 24,
    inProgress: 18,
    resolved: 82,
    critical: 4
};

// Utilities for colors
const statusColors = {
    'Open': { text: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500', border: 'border-amber-500', icon: 'text-amber-500', iconBg: 'bg-amber-50' },
    'In Progress': { text: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500', border: 'border-blue-500', icon: 'text-blue-500', iconBg: 'bg-blue-50' },
    'Resolved': { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500', border: 'border-emerald-500', icon: 'text-emerald-500', iconBg: 'bg-emerald-50' },
    'Closed': { text: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500', border: 'border-emerald-500', icon: 'text-emerald-500', iconBg: 'bg-emerald-50' },
    'Critical': { text: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500', border: 'border-rose-500', icon: 'text-rose-500', iconBg: 'bg-rose-50' },
};

const priorityColors = {
    'Low': { text: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-500' },
    'Medium': { text: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    'High': { text: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
    'Urgent': { text: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500' },
    'Critical': { text: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500' },
};

// Custom Dropdown Pill Component
const CustomDropdown = ({ options, value, onChange, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorMap = type === 'status' ? statusColors : priorityColors;
    const currentStyle = colorMap[value] || colorMap['Open'];

    return (
        <div className="relative inline-block text-left">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all shadow-sm"
            >
                <span className={`w-2 h-2 rounded-full ${currentStyle.dot}`}></span>
                {value}
                <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
                    {options.map(opt => {
                        const optStyle = colorMap[opt] || colorMap['Open'];
                        return (
                            <div 
                                key={opt} 
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className="flex items-center gap-2 px-3 py-2 mx-1 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full ${optStyle.dot}`}></span>
                                {opt}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default function SaaSAdminDashboard() {
    const [selectedTicket, setSelectedTicket] = useState(MOCK_TICKETS[0]);
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [replyText, setReplyText] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(false);

    const updateTicketDetails = (key, value) => {
        const updated = { ...selectedTicket, [key]: value };
        setSelectedTicket(updated);
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        
        const newMessage = {
            id: Date.now(),
            sender: { name: 'Admin User' },
            message: replyText,
            createdAt: new Date().toISOString(),
            isInternal: isInternalNote
        };

        const updated = { ...selectedTicket, messages: [...selectedTicket.messages, newMessage] };
        setSelectedTicket(updated);
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
        setReplyText("");
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col border-r border-slate-800">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                        S
                    </div>
                    <span className="ml-3 text-white font-semibold tracking-tight text-lg">SupportKit</span>
                </div>
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {[
                        { icon: Home, label: 'Dashboard' },
                        { icon: Package, label: 'Material Tracking', collapsible: true },
                        { icon: Users, label: 'HRMS', collapsible: true },
                        { icon: Briefcase, label: 'ERP', collapsible: true },
                        { icon: PieChart, label: 'CRM', collapsible: true },
                        { icon: CheckSquare, label: 'Tasks & Projects', collapsible: true },
                        { icon: IndianRupee, label: 'Financial Operations', collapsible: true },
                        { icon: LifeBuoy, label: 'Support Management', active: true },
                        { icon: Bell, label: 'Notifications', badge: 3 },
                        { divider: true },
                        { icon: HelpCircle, label: 'Help & Support' },
                    ].map((item, i) => {
                        if (item.divider) {
                            return <div key={i} className="my-4 border-t border-slate-800 mx-2"></div>;
                        }
                        
                        return (
                            <a 
                                key={i} 
                                href="#" 
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                    item.active 
                                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)] relative' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                {item.active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                )}
                                <div className="flex items-center gap-3">
                                    <item.icon size={19} className={item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'} />
                                    {item.label}
                                </div>
                                {item.collapsible && (
                                    <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-400 transition-transform group-hover:rotate-90" />
                                )}
                                {item.badge && (
                                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                        {item.badge}
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center w-96 relative">
                        <Search size={16} className="absolute left-3 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search tickets, users, or articles..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>
                        
                        <div className="h-8 w-[1px] bg-slate-200"></div>

                        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-200 pr-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                                AD
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 leading-tight">Admin User</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Admin</span>
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 flex flex-col overflow-hidden gap-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-6 flex-shrink-0">
                        {[
                            { label: 'Total Tickets', val: MOCK_STATS.total, icon: Inbox, colorObj: statusColors['Closed'] },
                            { label: 'Open', val: MOCK_STATS.open, icon: AlertCircle, colorObj: statusColors['Open'] },
                            { label: 'In Progress', val: MOCK_STATS.inProgress, icon: Clock, colorObj: statusColors['In Progress'] },
                            { label: 'Critical', val: MOCK_STATS.critical, icon: AlertCircle, colorObj: statusColors['Critical'] }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.colorObj.iconBg} ${stat.colorObj.icon}`}>
                                    <stat.icon size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-medium text-slate-500">{stat.label}</span>
                                    <span className="text-2xl font-bold text-slate-900 leading-none mt-1">{stat.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Workspace (List + Details) */}
                    <div className="flex-1 flex gap-6 min-h-0">
                        
                        {/* Left: Ticket List */}
                        <div className="w-96 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">Your Queue</h3>
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm"><Plus size={16}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {tickets.map(ticket => {
                                    const isSelected = selectedTicket.id === ticket.id;
                                    const stColor = statusColors[ticket.status] || statusColors['Open'];
                                    const prColor = priorityColors[ticket.priority] || priorityColors['Low'];
                                    
                                    return (
                                        <div 
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                                                    : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[12px] font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>{ticket.id}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">Dec 8</span>
                                            </div>
                                            <h4 className="text-[14px] font-semibold text-slate-900 leading-snug mb-3 line-clamp-1">{ticket.subject}</h4>
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stColor.bg} ${stColor.text}`}>{ticket.status}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${prColor.bg} ${prColor.text}`}>{ticket.priority}</span>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500" title={ticket.submittedBy.name}>
                                                    <User size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right: Ticket Details */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
                            
                            {/* Header */}
                            {selectedTicket && (
                                <div className="flex-shrink-0 flex justify-between items-start p-6 bg-white border-b border-slate-200 relative z-10">
                                    {/* Accent Rail */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColors[selectedTicket.status]?.dot}`}></div>
                                    
                                    <div className="pl-2">
                                        <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-2">
                                            <span className="font-semibold text-slate-700">{selectedTicket.id}</span>
                                            <span>•</span>
                                            <span>{selectedTicket.category}</span>
                                        </div>
                                        <div className="text-[13px] text-slate-600">
                                            Submitted by: <strong className="text-slate-900">{selectedTicket.submittedBy.name}</strong> <span className="text-slate-400">({selectedTicket.submittedBy.role})</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <CustomDropdown 
                                            type="status" 
                                            value={selectedTicket.status} 
                                            options={['Open', 'In Progress', 'Resolved', 'Closed']} 
                                            onChange={(val) => updateTicketDetails('status', val)}
                                        />
                                        <CustomDropdown 
                                            type="priority" 
                                            value={selectedTicket.priority} 
                                            options={['Low', 'Medium', 'High', 'Urgent', 'Critical']} 
                                            onChange={(val) => updateTicketDetails('priority', val)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Chat Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                                {selectedTicket?.messages.map((msg, i) => {
                                    const isAdmin = msg.isInternal || msg.sender.name === 'Admin User';
                                    const isNote = msg.isInternal;
                                    
                                    return (
                                        <div key={i} className={`flex gap-4 max-w-[85%] ${isAdmin ? 'ml-auto flex-row-reverse' : ''}`}>
                                            
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-1 shadow-sm ${
                                                isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {msg.sender.name.charAt(0)}
                                            </div>

                                            {/* Bubble */}
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className={`px-5 py-4 shadow-sm relative ${
                                                    isNote 
                                                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-[16px_4px_16px_16px]'
                                                        : isAdmin 
                                                            ? 'bg-white border border-slate-200 text-slate-800 rounded-[16px_4px_16px_16px]'
                                                            : 'bg-indigo-600 border border-transparent text-white rounded-[4px_16px_16px_16px]'
                                                }`}>
                                                    <div className={`flex items-center gap-3 mb-2 text-[12px] ${isAdmin && !isNote ? 'text-slate-500' : isNote ? 'text-amber-700/70' : 'text-indigo-200'}`}>
                                                        <span className={`font-semibold ${isAdmin && !isNote ? 'text-slate-900' : isNote ? 'text-amber-900' : 'text-white'}`}>{msg.sender.name}</span>
                                                        <span>•</span>
                                                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isNote && <span className="ml-auto px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wide">Internal Note</span>}
                                                    </div>
                                                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Reply Composer */}
                            <div className={`flex-shrink-0 p-5 border-t ${isInternalNote ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-offset-1 ${isInternalNote ? 'border-amber-200 focus-within:ring-amber-500' : 'border-slate-200 focus-within:ring-indigo-500'}`}>
                                    <textarea 
                                        className="w-full bg-transparent border-none outline-none resize-none text-[14px] text-slate-800 placeholder:text-slate-400 min-h-[80px]"
                                        placeholder={isInternalNote ? "Add a note for your team…" : "Type your reply to the user…"}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                    
                                    <div className={`flex items-center justify-between pt-3 mt-2 border-t ${isInternalNote ? 'border-amber-100' : 'border-slate-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <Paperclip size={18} />
                                            </button>
                                            
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-8 h-4.5 rounded-full relative transition-colors ${isInternalNote ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${isInternalNote ? 'translate-x-[14px]' : ''}`}></div>
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isInternalNote} 
                                                    onChange={e => setIsInternalNote(e.target.checked)} 
                                                />
                                                <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-700 select-none">Private internal note</span>
                                            </label>
                                        </div>

                                        <button 
                                            onClick={handleSend}
                                            disabled={!replyText.trim()}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all shadow-sm ${
                                                !replyText.trim() 
                                                    ? 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none'
                                                    : isInternalNote 
                                                        ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-md hover:-translate-y-px' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-px'
                                            }`}
                                        >
                                            <Send size={15} />
                                            {isInternalNote ? 'Save note' : 'Send reply'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

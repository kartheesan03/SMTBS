import React from 'react';
import { Calendar, Briefcase, FileText, Pin, Clock } from 'lucide-react';

const WidgetCard = ({ title, children }) => (
    <div style={{
        background: 'linear-gradient(180deg, #1A2436 0%, #161F32 100%)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
        <h3 style={{ margin: '0 0 16px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
        </h3>
        {children}
    </div>
);

const FeedWidgets = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            
            {/* Company Announcements */}
            <WidgetCard title="Company Announcements">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Pin size={14} color="#60A5FA" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.4', fontWeight: '500' }}>Q3 All-Hands Meeting Scheduled</p>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>2 days ago</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingTop: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Pin size={14} color="#34D399" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.4', fontWeight: '500' }}>New HR Policy Update</p>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>5 days ago</span>
                        </div>
                    </div>
                </div>
            </WidgetCard>

            {/* Upcoming */}
            <WidgetCard title="Upcoming Events">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '14px' }}>🎂</span>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#E2E8F0', fontWeight: '500' }}>Sarah's Birthday</p>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Tomorrow</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Clock size={14} color="#F87171" />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#E2E8F0', fontWeight: '500' }}>Mark on Leave</p>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Oct 12 - Oct 15</span>
                        </div>
                    </div>
                </div>
            </WidgetCard>

            {/* Quick Links */}
            <WidgetCard title="Quick Links">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '0 -8px' }}>
                    <a href="/attendance" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '8px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <Calendar size={16} color="#64748B" /> <span style={{ fontWeight: '500' }}>My Attendance</span>
                    </a>
                    <a href="/leaves" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '8px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <Briefcase size={16} color="#64748B" /> <span style={{ fontWeight: '500' }}>Apply for Leave</span>
                    </a>
                    <a href="/salary" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '8px', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <FileText size={16} color="#64748B" /> <span style={{ fontWeight: '500' }}>Payslips</span>
                    </a>
                </div>
            </WidgetCard>

        </div>
    );
};

export default FeedWidgets;

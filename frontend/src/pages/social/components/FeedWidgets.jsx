import React from 'react';
import { Calendar, Briefcase, FileText, Pin, Clock } from 'lucide-react';

const WidgetCard = ({ title, children }) => (
    <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
        <h3 style={{ margin: '0 0 12px', color: '#F8FAFC', fontSize: '15px', fontWeight: '600' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Pin size={14} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.4' }}>Q3 All-Hands Meeting Scheduled</p>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>2 days ago</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Pin size={14} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.4' }}>New HR Policy Update</p>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>5 days ago</span>
                        </div>
                    </div>
                </div>
            </WidgetCard>

            {/* Upcoming */}
            <WidgetCard title="Upcoming Events">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '14px' }}>🎂</span>
                        </div>
                        <div>
                            <p style={{ margin: '0', fontSize: '13px', color: '#E2E8F0' }}>Sarah's Birthday</p>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Tomorrow</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={16} color="#F59E0B" />
                        </div>
                        <div>
                            <p style={{ margin: '0', fontSize: '13px', color: '#E2E8F0' }}>Mark on Leave</p>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Oct 12 - Oct 15</span>
                        </div>
                    </div>
                </div>
            </WidgetCard>

            {/* Quick Links */}
            <WidgetCard title="Quick Links">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="/attendance" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '6px 0', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#3B82F6'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>
                        <Calendar size={16} /> My Attendance
                    </a>
                    <a href="/leaves" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '6px 0', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#3B82F6'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>
                        <Briefcase size={16} /> Apply for Leave
                    </a>
                    <a href="/salary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', textDecoration: 'none', fontSize: '13px', padding: '6px 0', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#3B82F6'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>
                        <FileText size={16} /> Payslips
                    </a>
                </div>
            </WidgetCard>

        </div>
    );
};

export default FeedWidgets;

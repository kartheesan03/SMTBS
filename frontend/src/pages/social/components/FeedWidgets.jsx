import React from 'react';
import { Calendar, Briefcase, FileText, Pin, Clock, Plus, Info } from 'lucide-react';
import Avatar from './Avatar';

const WidgetCard = ({ title, children }) => (
    <div style={{
        backgroundColor: 'var(--feed-bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--feed-border-card)',
        padding: '16px 20px',
        marginBottom: '16px',
    }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--feed-text-primary)', fontSize: '16px', fontWeight: '600' }}>
            {title}
        </h3>
        {children}
    </div>
);

const FeedWidgets = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            
            {/* Company Announcements */}
            <WidgetCard title="Company News">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--feed-accent-blue)', marginTop: '6px' }}></div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '14px', color: 'var(--feed-text-primary)', lineHeight: '1.4', fontWeight: '600' }}>Q3 All-Hands Meeting Scheduled</p>
                            <span style={{ fontSize: '12px', color: 'var(--feed-text-muted)' }}>2 days ago</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--feed-text-muted)', marginTop: '6px' }}></div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '14px', color: 'var(--feed-text-primary)', lineHeight: '1.4', fontWeight: '600' }}>New HR Policy Update</p>
                            <span style={{ fontSize: '12px', color: 'var(--feed-text-muted)' }}>5 days ago</span>
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

            {/* Add to your feed */}
            <WidgetCard title="Add to your feed">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1E293B', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar user={{ name: 'John Doe', profilePic: null }} size={40} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '14px', fontWeight: '600' }}>Design Team</h4>
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Company Updates</span>
                            <button style={{ 
                                marginTop: '4px',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '4px', 
                                backgroundColor: 'transparent',
                                color: '#E2E8F0',
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px',
                                padding: '4px 12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: 'fit-content',
                                transition: 'all 0.2s'
                            }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderWidth = '2px'; e.currentTarget.style.padding = '3px 11px'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderWidth = '1px'; e.currentTarget.style.padding = '4px 12px'; }}>
                                <Plus size={16} /> Follow
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1E293B', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar user={{ name: 'Engineering', profilePic: null }} size={40} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '14px', fontWeight: '600' }}>Engineering</h4>
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Tech Updates</span>
                            <button style={{ 
                                marginTop: '4px',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '4px', 
                                backgroundColor: 'transparent',
                                color: '#E2E8F0',
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px',
                                padding: '4px 12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: 'fit-content',
                                transition: 'all 0.2s'
                            }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderWidth = '2px'; e.currentTarget.style.padding = '3px 11px'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderWidth = '1px'; e.currentTarget.style.padding = '4px 12px'; }}>
                                <Plus size={16} /> Follow
                            </button>
                        </div>
                    </div>
                </div>
            </WidgetCard>

            {/* Footer Mini-links */}
            <div style={{ padding: '0 16px', margin: '16px 0 32px 0', color: 'var(--feed-text-muted)', fontSize: '12px', textAlign: 'center', lineHeight: '1.8' }}>
                <div style={{ display: 'inline-block' }}>
                    <a href="#" style={{ color: 'var(--feed-text-muted)', textDecoration: 'none', margin: '0 4px' }} onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--feed-accent-blue)'; }} onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}>About</a>
                    <span>·</span>
                    <a href="#" style={{ color: 'var(--feed-text-muted)', textDecoration: 'none', margin: '0 4px' }} onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--feed-accent-blue)'; }} onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}>Accessibility</a>
                    <span>·</span>
                    <a href="#" style={{ color: 'var(--feed-text-muted)', textDecoration: 'none', margin: '0 4px' }} onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--feed-accent-blue)'; }} onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}>Help Center</a>
                </div>
                <div style={{ display: 'inline-block' }}>
                    <a href="#" style={{ color: 'var(--feed-text-muted)', textDecoration: 'none', margin: '0 4px', display: 'inline-flex', alignItems: 'center', gap: '2px', verticalAlign: 'middle' }} onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--feed-accent-blue)'; }} onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}>
                        Privacy & Terms
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </a>
                    <span>·</span>
                    <a href="#" style={{ color: 'var(--feed-text-muted)', textDecoration: 'none', margin: '0 4px' }} onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--feed-accent-blue)'; }} onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}>Ad Choices</a>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--feed-accent-blue)', fontWeight: '600' }}>SMTBMS</span> 
                    <span>Corporation © 2026</span>
                </div>
            </div>

        </div>
    );
};

export default FeedWidgets;

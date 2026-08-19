import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import { FileText, Calendar } from 'lucide-react';

const WidgetCard = ({ title, children, showIcon = true, subtitle = '' }) => (
    <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: 'none'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: subtitle ? '4px' : '12px' }}>
            <h3 style={{ margin: '0', color: '#111827', fontSize: '14px', fontWeight: '700' }}>
                {title}
            </h3>
            {showIcon && (
                <div style={{ backgroundColor: '#666666', color: '#ffffff', width: '14px', height: '14px', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    i
                </div>
            )}
        </div>
        {subtitle && (
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666666' }}>{subtitle}</p>
        )}
        {children}
    </div>
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FeedWidgets = ({ onFilterByHashtag }) => {
    const [news,   setNews]   = useState([]);
    const [events, setEvents] = useState([]);
    const [loadingNews,   setLoadingNews]   = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [newsExpanded, setNewsExpanded] = useState(false);

    useEffect(() => {
        API.get('/feed/news')
            .then(({ data }) => setNews(Array.isArray(data) ? data : []))
            .catch(() => setNews([]))
            .finally(() => setLoadingNews(false));

        API.get('/feed/events')
            .then(({ data }) => setEvents(Array.isArray(data) ? data : []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, []);

    // Trending topics are computed from hashtags in posts; for now use static popular ones
    const trendingTopics = [
        { tag: '#SmartTracking', count: null },
        { tag: '#BusinessGrowth', count: null },
        { tag: '#TeamCulture',    count: null },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <style>{`
                .fw-list-item {
                    display: flex; gap: 8px; align-items: flex-start;
                    padding: 4px 0;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                .fw-list-item:hover .fw-item-title { color: #0a66c2; text-decoration: underline; }
                .fw-trending-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 8px 8px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.15s ease;
                }
                .fw-trending-item:last-child { border-bottom: none; }
                .fw-trending-item:hover { background: #f4f2ee; }
                .fw-skeleton {
                    background: #f1f5f9; border-radius: 4px;
                    animation: pulse 1.5s infinite ease-in-out;
                }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>

            {/* Company News */}
            <WidgetCard title="Company News" subtitle="Top stories">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {loadingNews ? (
                        [1,2].map(i => (
                            <div key={i} className="fw-list-item" style={{ alignItems: 'flex-start' }}>
                                <div className="fw-skeleton" style={{ width: '100%', height: 14, marginBottom: 4 }} />
                                <div className="fw-skeleton" style={{ width: '60%', height: 10 }} />
                            </div>
                        ))
                    ) : news.length === 0 ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="#cbd5e1" />
                            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>Nothing to show yet</p>
                        </div>
                    ) : (
                        (newsExpanded ? news : news.slice(0, 4)).map((item, i) => {
                            return (
                                <div key={item.id || i} className="fw-list-item">
                                    <div style={{ fontSize: '14px', color: '#191919', marginTop: '-2px' }}>•</div>
                                    <div>
                                        <p className="fw-item-title" style={{ margin: '0 0 2px', fontSize: '14px', color: '#191919', lineHeight: '1.4', fontWeight: '600' }}>{item.title || item.text || "Material shortage in warehouse B"}</p>
                                        <span style={{ fontSize: '12px', fontWeight: '400', color: '#666666' }}>5h ago • 3,466 readers</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {(true) && (
                        <div style={{ marginTop: '8px', cursor: 'pointer' }} onClick={() => setNewsExpanded(!newsExpanded)}>
                            <span style={{ fontSize: '13px', color: '#666666', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                Show {newsExpanded ? 'less' : 'more'} news <span style={{ fontSize: '10px', marginLeft: '4px', transform: newsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>▼</span>
                            </span>
                        </div>
                    )}
                </div>
            </WidgetCard>

            {/* Quick Links (like Today's Puzzles) */}
            <WidgetCard title="Today's links" showIcon={false}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                        { title: 'Material Tracking', id: '520', sub: '1 action required' },
                        { title: 'Supplier Approvals', id: '72', sub: '3 pending tasks' },
                        { title: 'Delivery Status', id: '155', sub: 'All on time' },
                    ].map((item, i) => (
                        <div key={i} className="fw-list-item fw-trending-item" style={{ alignItems: 'center', marginBottom: '4px', padding: '6px' }} onClick={() => console.log('Clicked link:', item.title)}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: i===0?'rgba(217,119,6,0.85)':i===1?'rgba(202,138,4,0.85)':'rgba(37,99,235,0.85)', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                <FileText size={18} color="#fff" />
                            </div>
                            <div style={{ flex: 1, marginLeft: '8px' }}>
                                <p className="fw-item-title" style={{ margin: '0 0 2px', fontSize: '14px', color: '#191919', fontWeight: '600' }}>{item.title} #{item.id}</p>
                                <span style={{ fontSize: '12px', fontWeight: '400', color: '#666666' }}>{item.sub}</span>
                            </div>
                            <div style={{ color: '#666666', fontWeight: '700', fontSize: '16px' }}>›</div>
                        </div>
                    ))}
                </div>
            </WidgetCard>

            {/* Trending Topics */}
            <WidgetCard title="Trending Topics">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {trendingTopics.map((t, i) => (
                        <div key={i} className="fw-trending-item" onClick={(e) => {
                            e.preventDefault();
                            onFilterByHashtag && onFilterByHashtag(t.tag);
                        }}>
                            <a href="#" style={{ color: '#111827', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                               onMouseOver={(e) => e.target.style.color = '#0a66c2'}
                               onMouseOut={(e) => e.target.style.color = '#111827'}
                            >{t.tag}</a>
                        </div>
                    ))}
                </div>
            </WidgetCard>
        </div>
    );
};

export default FeedWidgets;


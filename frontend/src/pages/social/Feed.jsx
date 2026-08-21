import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CompanyFeed from './CompanyFeed';
import {
  Home, Megaphone, Radio, Calendar, Image, Bookmark,
  Building2, TrendingUp
} from 'lucide-react';
import './CompanyFeed.css';
import { getTrendingTags, getCompanyStats } from '../../api/posts';

const TABS = [
  { id: 'Home',          label: 'Home',          icon: Home },
  { id: 'Announcements', label: 'Announcements',  icon: Megaphone },
  { id: 'Broadcasts',    label: 'Broadcasts',     icon: Radio },
  { id: 'Events',        label: 'Events',         icon: Calendar },
  { id: 'Media',         label: 'Media',          icon: Image },
  { id: 'Saved',         label: 'Saved',          icon: Bookmark },
];

const COMPANY_LOGO = "https://ui-avatars.com/api/?name=SM&background=0f172a&color=fff&size=200&font-size=0.40&bold=true";

class SafeSection extends React.Component {
  state = { error: null, errorInfo: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(error, errorInfo) {
    console.error('[SafeSection] Component crashed:', error, errorInfo);
  }
  render() {
    if (this.state.error) {
      const isNetwork = this.state.error?.message?.toLowerCase().includes('network') ||
                        this.state.error?.message?.toLowerCase().includes('fetch');
      return (
        <div style={{
          background: 'var(--li-card, #fff)',
          border: '1px solid var(--li-border, #e5e7eb)',
          borderRadius: '8px',
          padding: '40px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            {isNetwork ? 'Unable to load feed' : 'Something went wrong'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '320px', lineHeight: 1.6 }}>
            {isNetwork
              ? 'Unable to load feed. Please check your connection and try again.'
              : 'An unexpected error occurred while loading this section.'}
          </p>
          <button
            onClick={() => this.setState({ error: null, errorInfo: null })}
            style={{
              marginTop: '8px',
              background: '#0a66c2',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 Retry
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'left', maxWidth: '400px', wordBreak: 'break-all' }}>
              <summary style={{ cursor: 'pointer' }}>Error details</summary>
              <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const Feed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('Home');
  const [hashtagFilter, setHashtagFilter] = useState(null);
  const [trending, setTrending]           = useState([]);
  const [companyStats, setCompanyStats]   = useState(null);

  React.useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [trendingRes, statsRes] = await Promise.all([
          getTrendingTags(),
          getCompanyStats()
        ]);
        setTrending(trendingRes || []);
        if (statsRes) setCompanyStats(statsRes);
      } catch (err) {
        console.error('Failed to load sidebar data', err);
      }
    };
    fetchSidebarData();

    const appMain    = document.querySelector('.app-main');
    const appContent = document.querySelector('.app-content');
    const origMain    = appMain    ? appMain.style.overflowX    : '';
    const origContent = appContent ? appContent.style.overflowX : '';
    if (appMain)    appMain.style.overflowX    = 'visible';
    if (appContent) appContent.style.overflowX = 'visible';
    return () => {
      if (appMain)    appMain.style.overflowX    = origMain;
      if (appContent) appContent.style.overflowX = origContent;
    };
  }, []);

  return (
    <div className="lf-root">
      <div className="lf-grid">

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="lf-left">

          {/* Company Profile Card */}
          <div className="lf-card lf-profile-card">
            <div className="lf-profile-cover" />
            <div className="lf-profile-avatar-wrap">
              <div className="lf-profile-avatar">
                <img src={COMPANY_LOGO} alt="SMTBMS" />
              </div>
            </div>
            <div className="lf-profile-body">
              <div className="lf-profile-name">{companyStats?.name ?? '—'}</div>
              <div className="lf-profile-tagline">{companyStats?.tagline ?? ''}</div>
              <div className="lf-profile-divider" />
              <div className="lf-profile-stats">
                <div className="lf-profile-stat">
                  <span className="lf-profile-stat-label">Company members</span>
                  <span className="lf-profile-stat-value">
                    {companyStats ? companyStats.members.toLocaleString() : '—'}
                  </span>
                </div>
                <div className="lf-profile-stat">
                  <span className="lf-profile-stat-label">Industry</span>
                  <span className="lf-profile-stat-value text">{companyStats?.industry ?? '—'}</span>
                </div>
                <div className="lf-profile-stat">
                  <span className="lf-profile-stat-label">Location</span>
                  <span className="lf-profile-stat-value text">{companyStats?.location ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="lf-card lf-nav-card">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`lf-nav-tab${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="lf-nav-tab-icon">
                  <Icon size={17} strokeWidth={activeTab === id ? 2.5 : 2} />
                </span>
                {label}
              </button>
            ))}
          </div>

        </aside>

        {/* ─── MAIN FEED ─── */}
        <main>
          {hashtagFilter && (
            <div className="lf-hashtag-bar">
              <span>Filtered by: {hashtagFilter}</span>
              <span className="lf-hashtag-clear" onClick={() => setHashtagFilter(null)}>✕ Clear</span>
            </div>
          )}
          <SafeSection>
            <CompanyFeed
              activeTab={activeTab}
              currentUserId={user?._id || user?.id}
              hashtagFilter={hashtagFilter}
              onHashtagClick={setHashtagFilter}
            />
          </SafeSection>
        </main>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside className="lf-right">



          {/* Trending Now */}
          <div className="lf-card lf-right-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={18} color="var(--li-text-2)" />
              <span className="lf-right-title" style={{ marginBottom: 0, lineHeight: 1 }}>Trending Now</span>
            </div>
            {trending.length > 0 ? trending.map((t, i) => (
              <div
                className="lf-trending-tag"
                key={i}
                onClick={() => setHashtagFilter(t.tag)}
                style={{ padding: '6px 4px' }}
              >
                <div>
                  <div className="lf-trending-hash">{t.tag}</div>
                  <div className="lf-trending-count">{t.posts}</div>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', padding: '6px 4px' }}>No trending tags yet</div>
            )}
          </div>

          {/* Company Info */}
          <div className="lf-card lf-right-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Building2 size={18} color="var(--li-primary)" />
              <span className="lf-right-title" style={{ marginBottom: 0, lineHeight: 1 }}>About SMTBMS</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--li-text-2)', lineHeight: 1.6 }}>
              Smart Material Tracking &amp; Business Management System — A centralized platform for smarter operations.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {['ERP', 'CRM', 'HRMS', 'Inventory'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 10px', borderRadius: '4px',
                  background: 'var(--li-blue-light)', color: 'var(--li-primary)',
                  fontSize: '12px', fontWeight: 500,
                }}>{tag}</span>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Feed;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CompanyFeed from './CompanyFeed';
import {
  Home, Megaphone, Radio, Calendar, Image, Bookmark,
  Users, Building2, TrendingUp, ChevronRight, UserCheck
} from 'lucide-react';
import './CompanyFeed.css';
import { getSuggestedConnections, getTrendingTags, toggleFollow } from '../../api/posts';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'Home',          label: 'Home',          icon: Home },
  { id: 'Announcements', label: 'Announcements',  icon: Megaphone },
  { id: 'Broadcasts',    label: 'Broadcasts',     icon: Radio },
  { id: 'Events',        label: 'Events',         icon: Calendar },
  { id: 'Media',         label: 'Media',          icon: Image },
  { id: 'Saved',         label: 'Saved',          icon: Bookmark },
];

const COMPANY_LOGO = "https://ui-avatars.com/api/?name=SM&background=0f172a&color=fff&size=200&font-size=0.40&bold=true";
const AVATAR_COLORS = ['#0f4c75', '#1b6ca8', '#163172', '#2f5233', '#7c2d3f'];

class SafeSection extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
          ⚠️ Could not load this section
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
  const [suggested, setSuggested]         = useState([]);
  const [trending, setTrending]           = useState([]);
  const [followedIds, setFollowedIds]     = useState(new Set());
  const [followLoading, setFollowLoading] = useState(new Set());

  React.useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [suggestionsRes, trendingRes] = await Promise.all([
          getSuggestedConnections(),
          getTrendingTags()
        ]);
        setSuggested(suggestionsRes || []);
        setTrending(trendingRes || []);
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

  const handleFollow = async (userId, userName) => {
    if (followLoading.has(userId)) return;
    setFollowLoading(prev => new Set([...prev, userId]));
    const wasFollowing = followedIds.has(userId);

    // Optimistic update
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(userId); else next.add(userId);
      return next;
    });

    try {
      const res = await toggleFollow(userId);
      if (res.following) {
        toast.success(`Now following ${userName}`);
      } else {
        toast(`Unfollowed ${userName}`, { icon: '👋' });
        // Remove from suggestions after unfollow so list refreshes
        setSuggested(prev => prev.filter(p => p.id !== userId));
        setFollowedIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
      }
    } catch {
      // Rollback
      setFollowedIds(prev => {
        const next = new Set(prev);
        if (wasFollowing) next.add(userId); else next.delete(userId);
        return next;
      });
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(prev => { const n = new Set(prev); n.delete(userId); return n; });
    }
  };

  return (
    <div className="lf-root">
      <div className="lf-grid">

        {/* ─── MAIN FEED ─── */}
        <main style={{ marginTop: 0 }}>
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
        <aside className="lf-right" style={{ marginTop: 0 }}>

          {/* People You May Know */}
          <div className="lf-card lf-right-card" style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Users size={18} color="var(--li-text-2)" />
              <span className="lf-right-title" style={{ marginBottom: 0, lineHeight: 1 }}>People you may know</span>
            </div>

            {suggested.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--li-text-3)', fontStyle: 'italic', padding: '6px 4px' }}>
                No suggestions available
              </div>
            ) : suggested.map((p, i) => {
              const initials   = (p.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              const color      = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isFollowing = followedIds.has(p.id);
              const isLoading  = followLoading.has(p.id);
              return (
                <div className="lf-person-row" key={p.id}>
                  <div className="lf-person-avatar" style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                    {p.picture ? (
                      <img src={p.picture} alt={p.name} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="lf-person-meta">
                    <div className="lf-person-name">{p.name}</div>
                    <div className="lf-person-role">{p.role}</div>
                  </div>
                  <button
                    className="lf-person-action"
                    onClick={() => handleFollow(p.id, p.name)}
                    disabled={isLoading}
                    style={{
                      height: '34px',
                      padding: '0 14px',
                      borderRadius: '18px',
                      background: isFollowing ? 'var(--li-blue)' : 'transparent',
                      color: isFollowing ? '#fff' : 'var(--li-text-2)',
                      borderColor: isFollowing ? 'var(--li-blue)' : 'var(--li-text-2)',
                    }}
                  >
                    {isFollowing
                      ? <><UserCheck size={13} style={{ marginRight: '4px' }} /> Following</>
                      : '+ Follow'
                    }
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => navigate('/social/network')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                marginTop: '12px', background: 'none', border: 'none',
                color: 'var(--li-blue)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', padding: 0, fontFamily: 'var(--li-font)'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--li-blue-hover)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--li-blue)'}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

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
              <Building2 size={18} color="#0a66c2" />
              <span className="lf-right-title" style={{ marginBottom: 0, lineHeight: 1 }}>About SMTBMS</span>
            </div>
            <div style={{ fontSize: '13px', color: '#595959', lineHeight: 1.6 }}>
              Smart Material Tracking &amp; Business Management System — A centralized platform for smarter operations.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {['ERP', 'CRM', 'HRMS', 'Inventory'].map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px', borderRadius: '14px',
                  background: '#eff6ff', color: '#0a66c2',
                  fontSize: '12px', fontWeight: 600,
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

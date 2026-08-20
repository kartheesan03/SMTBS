import React, { useState, useEffect, useRef, useContext } from 'react';
import { Image, Video, FileText, MessageSquare, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import PostCard from './components/PostCard';
import './CompanyFeed.css';

const PostSkeleton = () => (
  <div className="cf-card cf-post-skeleton" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ width: '40%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '25%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    </div>
    <div style={{ width: '100%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out', marginTop: '8px' }} />
    <div style={{ width: '80%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
  </div>
);



const AVATAR_COLORS = ['#0a3d62', '#4a5568', '#2f5233', '#7c2d3f'];

function timeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// Normalize raw backend post to UI shape
function normalizePost(raw, idx = 0, currentUserId = null) {
  const authorName = raw.author?.name || raw.authorName || 'Unknown';
  const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const likeCount = Array.isArray(raw.likes) ? raw.likes.length : (raw.likesCount || raw.likeCount || 0);
    const rawImage = raw.imageUrl || (Array.isArray(raw.media) && raw.media.find(m => m.type === 'image')?.url) || null;
    let finalImage = rawImage;
    if (finalImage && finalImage.startsWith('/uploads/')) {
        const backendBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://smtbs-backend.onrender.com';
        finalImage = `${backendBase}${finalImage}`;
    }

    const isSaved = Array.isArray(raw.savedBy) && currentUserId 
      ? raw.savedBy.some(s => s.userId === currentUserId || s.userId === parseInt(currentUserId))
      : (raw.saved || false);

    return {
      id:       raw.id,
      author: {
        id:       raw.author?.id || raw.authorId || 'u?',
        name:     authorName,
        initials: initials,
        role:     raw.author?.role || raw.author?.department || 'Employee',
        color:    AVATAR_COLORS[idx % 4],
        picture:  raw.author?.picture || null,
      },
      time: timeAgo(raw.createdAt),
      createdAt: raw.createdAt,
      text:      raw.text || '',
      image:     finalImage,
      media:     Array.isArray(raw.media) ? raw.media.map(m => {
        const backendBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://smtbs-backend.onrender.com';
        return { ...m, url: m.url?.startsWith('/uploads/') ? `${backendBase}${m.url}` : m.url };
      }) : null,
      likes:     raw.likes || [],
      reactions: { like: likeCount, celebrate: 0, love: 0, insightful: 0 },
      myReaction: null,
      comments: (raw.comments || []).map(c => ({
        id:       c.id,
        author:   c.author || { name: 'Unknown' },
        initials: (c.author?.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
        text:     c.text,
        time:     timeAgo(c.createdAt),
        createdAt: c.createdAt,
      })),
      pinned: raw.pinned || false,
      saved:  isSaved,
      reposts: raw.reposts || [],
      isNew:  false,
      type:   raw.type || 'Standard',
      articleTitle: raw.articleTitle || '',
      articleBody: raw.articleBody || '',
      acknowledgements: raw.acknowledgements || [],
      authorId: raw.authorId || raw.author?.id,
      visibility: raw.visibility || 'Anyone',
    };
}

export default function CompanyFeed({ activeTab, currentUserId, hashtagFilter, onHashtagClick }) {
  const { user } = useContext(AuthContext);
  const currentUser = { 
    id: currentUserId || user?._id || user?.id || 'u1', 
    name: user?.name || user?.username || 'You', 
    initials: (user?.name || user?.username || 'You').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(), 
    role: user?.department || user?.role || 'Employee', 
    color: '#0a3d62' 
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'Saved' ? '/feed/saved' : '/feed';
        const { data } = await API.get(endpoint);
        const rawList = Array.isArray(data) ? data : (data?.posts || []);
        setPosts(rawList.map((p, i) => normalizePost(p, i, currentUser.id)));
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Could not load posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeTab, currentUser.id]);
  
  // Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerImageUrl, setComposerImageUrl] = useState('');
  const [composerFile, setComposerFile] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [composerType, setComposerType] = useState('Standard');
  const [audience, setAudience] = useState('Anyone');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [showTeamsSelector, setShowTeamsSelector] = useState(false);
  const fileInputRef = useRef(null);
  const audienceDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (audienceDropdownRef.current && !audienceDropdownRef.current.contains(event.target)) {
        setIsAudienceDropdownOpen(false);
      }
    }
    if (isAudienceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAudienceDropdownOpen]);

  // Sorting and Follows
  const [sortBy, setSortBy] = useState('Top');
  const [followedAuthors, setFollowedAuthors] = useState(new Set());

  const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          setComposerFile(file);
          const reader = new FileReader();
          reader.onloadend = () => setComposerImageUrl(reader.result);
          reader.readAsDataURL(file);
      }
  };


  // Handlers
  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePin = (postId) => {
    // Pin is local-only (no pin endpoint on backend yet)
    setPosts(prev => prev.map(post => ({
      ...post,
      pinned: post.id === postId ? !post.pinned : false
    })));
  };

  const handleSave = async (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    try {
      // Backend: POST /api/feed/:id/save
      await API.post(`/feed/${postId}/save`);
    } catch (error) {
      console.error('Failed to save', error);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    }
  };

    const handlePost = async () => {
      if (!composerText.trim() && !composerFile) return;
      setIsPosting(true);
      
      try {
        const formData = new FormData();
        formData.append('text', composerText);
        formData.append('visibility', audience);
        formData.append('type', composerType);
        formData.append('targetTeams', JSON.stringify(selectedTeams));
        if (composerFile) {
          formData.append('media', composerFile);
        }

        // Backend: POST /api/feed
        await API.post('/feed', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Refetch the full list so savedBy/likes/acknowledgements are all present
        const { data: refreshed } = await API.get('/feed');
        const rawList = Array.isArray(refreshed) ? refreshed : (refreshed?.posts || []);
        setPosts(rawList.map((p, i) => normalizePost(p, i, currentUser.id)));

        setComposerText('');
        setComposerImageUrl('');
        setComposerFile(null);
        setIsComposerOpen(false);
        setIsPosting(false);
        toast.success('Post created!');
      } catch (error) {
        console.error('Error creating post', error);
        toast.error('Failed: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        setIsPosting(false);
      }
    };

    const handleRepost = async (postToRepost) => {
      setIsPosting(true);
      const toastId = toast.loading('Reposting...');
      try {
        const formData = new FormData();
        formData.append('text', `♻️ Reposted from ${postToRepost.author?.name || 'User'}:\n\n${postToRepost.text || ''}`);
        formData.append('visibility', 'Anyone');
        formData.append('type', 'Standard');
        formData.append('targetTeams', JSON.stringify([]));

        // Note: For a proper robust repost with images, backend would handle copying images.
        // For now, we repost text.

        await API.post('/feed', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const { data: refreshed } = await API.get('/feed');
        const rawList = Array.isArray(refreshed) ? refreshed : (refreshed?.posts || []);
        setPosts(rawList.map((p, i) => normalizePost(p, i, currentUser.id)));
        
        toast.success('Reposted successfully!', { id: toastId });
      } catch (error) {
        console.error('Repost error:', error);
        toast.error('Failed to repost', { id: toastId });
      } finally {
        setIsPosting(false);
      }
    };

  // Client-side tab filtering (no hardcode)
  const myId = currentUser.id;
  
  // Filter by Hashtag if active
  let filteredPosts = [...posts];
  if (hashtagFilter) {
      filteredPosts = filteredPosts.filter(p => p.text.toLowerCase().includes(hashtagFilter.toLowerCase()));
  }

  // Sort based on sortBy state
  const sorted = filteredPosts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === 'Recent') {
        return new Date(b.time === 'Just now' ? Date.now() : Date.parse(b.time)).getTime() - new Date(a.time === 'Just now' ? Date.now() : Date.parse(a.time)).getTime();
    } else {
        // Top = engagement (likes + comments)
        const engA = Object.values(a.reactions).reduce((sum, val) => sum + val, 0) + (a.comments?.length || 0);
        const engB = Object.values(b.reactions).reduce((sum, val) => sum + val, 0) + (b.comments?.length || 0);
        return engB - engA;
    }
  });

  const handleFollow = (authorId) => {
      setFollowedAuthors(prev => {
          const newSet = new Set(prev);
          if (newSet.has(authorId)) newSet.delete(authorId);
          else newSet.add(authorId);
          return newSet;
      });
  };

  let displayPosts = sorted;
  if (activeTab === 'Announcements') {
    displayPosts = sorted.filter(p => p.type === 'Announcement');
  } else if (activeTab === 'Broadcasts') {
    displayPosts = sorted.filter(p => p.type === 'Broadcast');
  } else if (activeTab === 'Events') {
    displayPosts = sorted.filter(p => p.type === 'Event');
  } else if (activeTab === 'Media') {
    displayPosts = sorted.filter(p => p.image || (p.media && p.media.length > 0));
  } else if (activeTab === 'Saved') {
    displayPosts = sorted.filter(p => p.saved);
  }
  // showComposer only on the Home tab
  const showComposer = activeTab === 'Home';
  const showAnalytics = false;

  return (
    <div className="cf-feed-wrapper">

      {/* Composer Trigger */}
      {showComposer && (
      <div className="cf-composer">
        <div className="cf-composer-top">
          <div className="cf-composer-avatar">
              {currentUser.initials}
          </div>
          <div className="cf-composer-input" onClick={() => setIsComposerOpen(true)}>
            What's happening in the company?
          </div>
        </div>
        <div className="cf-composer-actions" style={{ display: 'flex', flexWrap: 'nowrap', gap: '2px', borderTop: '1px solid #eee9e0', paddingTop: '4px', marginTop: '4px' }}>
            <button className="cf-composer-action photo" style={{ flex: 1, justifyContent: 'center', padding: '8px 4px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => {
                setIsComposerOpen(true);
                setTimeout(() => document.getElementById('cf-file-upload-input')?.click(), 100);
            }}>
              <Image size={16} /> Photo
            </button>
            <button className="cf-composer-action document" style={{ flex: 1, justifyContent: 'center', padding: '8px 4px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => {
                setIsComposerOpen(true);
                setTimeout(() => document.getElementById('cf-file-upload-input')?.click(), 100);
            }}>
              <FileText size={16} /> Document
            </button>
            {(currentUser.role === 'Admin' || currentUser.role === 'Super Admin' || currentUser.role === 'HR') && (
                <>
                <button className="cf-composer-action announcement" style={{ flex: 1, justifyContent: 'center', padding: '8px 4px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => {
                    setComposerType('Announcement');
                    setIsComposerOpen(true);
                }}>
                  <MessageSquare size={16} /> Announcement
                </button>
                <button className="cf-composer-action broadcast" style={{ flex: 1, justifyContent: 'center', padding: '8px 4px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => {
                    setComposerType('Broadcast');
                    setIsComposerOpen(true);
                }}>
                  <Video size={16} /> Broadcast
                </button>
                </>
            )}
        </div>
      </div>
      )}


      {/* Analytics placeholder */}
      {showAnalytics && (
        <div className="cf-composer" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--social-text-main)', fontSize: '18px' }}>Your Post Analytics</h3>
          {posts.filter(p => p.author?.id === myId).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--social-text-muted)', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <p style={{ margin: 0, fontSize: '14px' }}>Create posts to start seeing engagement data here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--social-divider)', textAlign: 'left', color: 'var(--social-text-sec)' }}>
                  <th style={{ padding: '12px 8px' }}>Post Snippet</th>
                  <th style={{ padding: '12px 8px' }}>Reactions</th>
                  <th style={{ padding: '12px 8px' }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {posts.filter(p => p.author?.id === myId).map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--social-hover)' }}>
                    <td style={{ padding: '12px 8px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.text}</td>
                    <td style={{ padding: '12px 8px' }}>{Object.values(p.reactions).reduce((a,b)=>a+b,0)}</td>
                    <td style={{ padding: '12px 8px' }}>{p.comments?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="cf-feed">
        {/* Sort By Separator */}
        {showComposer && displayPosts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '0', paddingBottom: '0' }}>
              <div style={{ height: '1px', backgroundColor: 'var(--social-divider)', flex: 1, marginRight: '12px' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--social-text-sec)', fontWeight: '500' }}>Sort by: </span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '13px', color: 'var(--social-text-main)', fontWeight: '600',
                    marginLeft: '4px', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                  <option value="Top">Top</option>
                  <option value="Recent">Recent</option>
              </select>
          </div>
        )}

        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : displayPosts.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid var(--social-border)',
            padding: '60px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '56px', lineHeight: 1 }}>📢</div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--social-text-main)' }}>
              No posts yet
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--social-text-sec)', maxWidth: '320px', lineHeight: 1.6 }}>
              Be the first to share an update, announcement, or broadcast with your team.
            </p>
            <button
              onClick={() => setIsComposerOpen(true)}
              style={{
                marginTop: '8px',
                background: 'var(--social-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create the first post
            </button>
          </div>
        ) : (
          displayPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={() => handleDelete(post.id)}
              onPin={() => handlePin(post.id)}
              onRepost={handleRepost}
              onHashtagClick={onHashtagClick}
            />
          ))
        )}
      </div>

      {/* Composer Modal */}
      {isComposerOpen && (
        <div className="cf-modal-backdrop" onClick={() => !isPosting && setIsComposerOpen(false)}>
          <div className="cf-modal-content" style={{ width: '100%', maxWidth: '744px', minHeight: '400px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="cf-modal-header" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', backgroundColor: currentUser.color, flexShrink: 0 }}>
                        {currentUser.initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center', paddingTop: '4px' }} ref={audienceDropdownRef}>
                        <strong style={{ fontSize: '16px', color: 'var(--social-text-main)', marginBottom: '4px', lineHeight: '1' }}>{currentUser.name}</strong>
                        <button onClick={() => { setIsAudienceDropdownOpen(!isAudienceDropdownOpen); setShowTeamsSelector(false); }} style={{ background: 'transparent', fontSize: '13px', color: 'var(--social-text-sec)', border: '1px solid var(--social-border)', borderRadius: '16px', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content', fontWeight: '600', cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s', lineHeight: '1' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            Post to: {audience === 'Specific teams' ? (selectedTeams.length > 0 ? selectedTeams.join(', ').slice(0, 15) + (selectedTeams.join(', ').length > 15 ? '...' : '') : 'Teams') : audience} ▼
                        </button>
                        {isAudienceDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, width: '220px', overflow: 'hidden' }}>
                                {!showTeamsSelector ? (
                                    <>
                                        {['Anyone', 'Connections only'].map(option => (
                                            <div key={option} onClick={() => { setAudience(option); setIsAudienceDropdownOpen(false); }} style={{ padding: '10px 16px', fontSize: '14px', color: '#191919', cursor: 'pointer', backgroundColor: audience === option ? '#f4f2ee' : 'white', fontWeight: audience === option ? '600' : '400' }} onMouseOver={e => { if (audience !== option) e.target.style.backgroundColor = '#f9fafb' }} onMouseOut={e => { if (audience !== option) e.target.style.backgroundColor = 'white' }}>
                                                {option}
                                            </div>
                                        ))}
                                        <div onClick={() => setShowTeamsSelector(true)} style={{ padding: '10px 16px', fontSize: '14px', color: '#191919', cursor: 'pointer', backgroundColor: audience === 'Specific teams' ? '#f4f2ee' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseOver={e => { if (audience !== 'Specific teams') e.currentTarget.style.backgroundColor = '#f9fafb' }} onMouseOut={e => { if (audience !== 'Specific teams') e.currentTarget.style.backgroundColor = 'white' }}>
                                            <span style={{ fontWeight: audience === 'Specific teams' ? '600' : '400' }}>Specific teams</span>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>›</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowTeamsSelector(false)}>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>‹</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Select Teams</span>
                                        </div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(team => (
                                                <label key={team} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', margin: 0 }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                                    <input type="checkbox" checked={selectedTeams.includes(team)} onChange={(e) => {
                                                        if (e.target.checked) setSelectedTeams([...selectedTeams, team]);
                                                        else setSelectedTeams(selectedTeams.filter(t => t !== team));
                                                    }} style={{ cursor: 'pointer' }} />
                                                    {team}
                                                </label>
                                            ))}
                                        </div>
                                        <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
                                            <button onClick={() => { setAudience('Specific teams'); setIsAudienceDropdownOpen(false); setShowTeamsSelector(false); }} style={{ background: '#0a66c2', color: 'white', border: 'none', borderRadius: '16px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Apply</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <button className="cf-icon-btn" onClick={() => !isPosting && setIsComposerOpen(false)}><X size={24} /></button>
              </div>

              {/* Type Selector Tabs */}
              <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  {['Standard', 'Story', 'Broadcast', ...(currentUser.role === 'Admin' || currentUser.role === 'Super Admin' ? ['Announcement'] : [])].map(type => (
                      <button
                          key={type}
                          onClick={() => setComposerType(type)}
                          style={{
                              padding: '8px 4px',
                              background: 'none',
                              border: 'none',
                              borderBottom: composerType === type ? '2px solid #0a66c2' : '2px solid transparent',
                              color: composerType === type ? '#0a66c2' : '#64748b',
                              fontWeight: composerType === type ? '600' : '500',
                              cursor: 'pointer',
                              fontSize: '14px'
                          }}
                      >
                          {type}
                      </button>
                  ))}
              </div>
            </div>
            
            <div className="cf-modal-body" style={{ flex: 1, padding: '16px 24px', overflowY: 'auto' }}>
              <textarea 
                className="cf-modal-textarea"
                placeholder={
                    composerType === 'Story' ? 'Add a caption to your story...' : 
                    composerType === 'Broadcast' ? 'Write a short broadcast message (max 200 chars)...' : 
                    composerType === 'Announcement' ? 'Write an official announcement...' : 
                    'What do you want to talk about?'
                }
                maxLength={composerType === 'Broadcast' ? 200 : undefined}
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                autoFocus
                disabled={isPosting}
              />
              <input 
                  id="cf-file-upload-input"
                  type="file" 
                  accept="image/*,video/*" 
                  style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0 }} 
                  onChange={handleFileSelect}
                  disabled={isPosting}
              />
              {composerImageUrl && (
                <div style={{ position: 'relative', marginTop: '12px' }}>
                    <div style={{ 
                        width: '100%', height: '300px', borderRadius: '8px', 
                        backgroundImage: `url(${composerImageUrl})`, 
                        backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', 
                        border: '1px solid #e0e0e0', backgroundColor: '#f9f9f9'
                    }} />
                    <button 
                        onClick={() => { setComposerImageUrl(''); setComposerFile(null); }}
                        style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.6)', color: 'white',
                            border: 'none', borderRadius: '50%', padding: '6px',
                            cursor: 'pointer', display: 'flex'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
              )}
            </div>
            <div className="cf-modal-footer" style={{ padding: '12px 24px' }}>
              <div className="cf-modal-tools">
                {composerType !== 'Broadcast' && (
                  <>
                    <button className="cf-icon-btn" onClick={() => document.getElementById('cf-file-upload-input')?.click()}><Image size={24} color="#666" /></button>
                    <button className="cf-icon-btn" onClick={() => document.getElementById('cf-file-upload-input')?.click()}><Video size={24} color="#666" /></button>
                    <button className="cf-icon-btn" onClick={() => { document.getElementById('cf-file-upload-input').accept = ".pdf,.doc,.docx,application/pdf"; document.getElementById('cf-file-upload-input')?.click(); }}><FileText size={24} color="#666" /></button>
                  </>
                )}
              </div>
              <button 
                className={`cf-primary-btn ${(!composerText.trim() && !composerImageUrl) || isPosting || (composerType === 'Story' && !composerImageUrl) ? 'disabled' : ''}`}
                disabled={(!composerText.trim() && !composerImageUrl) || isPosting || (composerType === 'Story' && !composerImageUrl)}
                onClick={handlePost}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px' }}
              >
                {isPosting ? <span className="cf-spinner"></span> : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

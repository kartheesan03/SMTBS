import React, { useState, useEffect } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import FeedProfileCard from './components/FeedProfileCard';
import FeedWidgets from './components/FeedWidgets';
import { getPosts } from '../../api/posts';
import { MessageSquarePlus } from 'lucide-react';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPosts = async (pageNum, append = false) => {
        try {
            setLoading(true);
            const data = await getPosts(pageNum, 10);
            console.log('GET /api/feed response:', data);
            
            if (append) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }
            
            setHasMore(pageNum < data.pages);
            setError(null);
        } catch (err) {
            console.error('Failed to load posts', err);
            setError('Failed to load the feed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, true);
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
        setIsModalOpen(false);
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', paddingBottom: '24px', color: '#F8FAFC', overflowX: 'hidden' }}>
            {/* Top Sticky Sub-Header */}
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                backgroundColor: '#1E293B', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 40,
                marginBottom: '24px'
            }}>
                <div style={{ maxWidth: '1128px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '32px' }}>
                    {['Feed', 'My Posts', 'Saved', 'Analytics'].map((tab, idx) => (
                        <button 
                            key={tab}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                borderBottom: idx === 0 ? '2px solid #3B82F6' : '2px solid transparent',
                                color: idx === 0 ? '#3B82F6' : '#94A3B8',
                                padding: '16px 0',
                                fontSize: '14px',
                                fontWeight: idx === 0 ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={idx !== 0 ? (e) => e.currentTarget.style.color = '#E2E8F0' : undefined}
                            onMouseOut={idx !== 0 ? (e) => e.currentTarget.style.color = '#94A3B8' : undefined}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .feed-container {
                    max-width: 1128px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 225px minmax(0, 540px) 300px;
                    gap: 24px;
                    padding: 0 24px;
                    justify-content: center;
                }
                @media (max-width: 1024px) {
                    .feed-container {
                        grid-template-columns: 225px minmax(0, 540px);
                    }
                    .feed-right-col {
                        display: none;
                    }
                }
                @media (max-width: 768px) {
                    .feed-container {
                        grid-template-columns: minmax(0, 100%);
                        padding: 0 16px;
                    }
                    .feed-left-col {
                        display: none;
                    }
                }
            `}</style>
            
            <div className="feed-container">
                {/* Left Column */}
                <div className="feed-left-col">
                    <FeedProfileCard />
                </div>

                {/* Center Column */}
                <div className="feed-center-col">
                    <CreatePost 
                        onPostCreated={handlePostCreated} 
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                    />

                    {error && (
                        <div style={{ backgroundColor: '#7F1D1D', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    {/* Feed Filter Bar */}
                    {posts.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '100px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', marginRight: '8px' }}></span>
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>Sort by:</span>
                                <button style={{ background: 'none', border: 'none', color: '#F8FAFC', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    Top <span style={{ marginLeft: '4px', fontSize: '10px' }}>▼</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                        ))}
                    </div>

                    {loading && posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div className="loader" style={{ width: '32px', height: '32px', border: '3px solid #334155', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span>Loading your feed...</span>
                        </div>
                    )}

                    {!loading && posts.length === 0 && !error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            color: '#94A3B8', 
                            backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                            borderRadius: '10px', 
                            border: '1px dashed rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <MessageSquarePlus size={48} color="#3B82F6" opacity={0.8} />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#F8FAFC', fontSize: '20px', fontWeight: '600' }}>No posts yet</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', maxWidth: '300px', lineHeight: '1.5', color: '#94A3B8' }}>Your feed is currently empty. Be the first to share an update, idea, or milestone with your network!</p>
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                style={{ 
                                    backgroundColor: '#3B82F6', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '10px 24px', 
                                    borderRadius: '24px', 
                                    fontWeight: '600', 
                                    fontSize: '15px', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }} 
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} 
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                Create the first post
                            </button>
                        </div>
                    )}

                    {hasMore && !loading && posts.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button 
                                onClick={handleLoadMore}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#3B82F6',
                                    border: '1px solid #3B82F6',
                                    borderRadius: '20px',
                                    padding: '8px 24px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.target.style.backgroundColor = '#1E3A8A'; e.target.style.color = '#EFF6FF'; }}
                                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#3B82F6'; }}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="feed-right-col">
                    <FeedWidgets />
                </div>
            </div>
        </div>
    );
};

export default Feed;

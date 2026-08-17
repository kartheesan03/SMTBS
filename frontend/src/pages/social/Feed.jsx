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
        <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', padding: '24px 0', color: '#F8FAFC', overflowX: 'hidden' }}>
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
                        <div style={{ backgroundColor: '#7F1D1D', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            padding: '80px 20px', 
                            color: '#94A3B8', 
                            backgroundColor: '#1E293B', 
                            borderRadius: '12px', 
                            border: '1px solid #334155',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <MessageSquarePlus size={32} color="#3B82F6" />
                            </div>
                            <h3 style={{ margin: '0 0 12px 0', color: '#F8FAFC', fontSize: '20px' }}>No posts yet</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '15px', maxWidth: '300px', lineHeight: '1.5' }}>Welcome to the Company Feed! Share updates, ideas, or announcements with your team.</p>
                            <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563EB'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#3B82F6'}>
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

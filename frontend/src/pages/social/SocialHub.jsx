import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import { Image, Video, FileText, Award, Calendar, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import './SocialHub.css';

const SocialHub = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');

    const [activeTab, setActiveTab] = useState('For You');

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { data } = await API.get('/social/feed');
                const postsWithCategories = (Array.isArray(data) ? data : []).map((post, i) => ({
                    ...post,
                    category: i % 3 === 0 ? 'Achievement' : i % 2 === 0 ? 'Event' : 'Update',
                    authorPresence: i % 2 === 0 ? 'online' : 'away'
                }));
                setPosts(postsWithCategories);
            } catch (error) {
                console.error('Failed to load feed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handlePostSubmit = async () => {
        if (!newPostContent.trim()) return;
        try {
            const { data } = await API.post('/social/posts', { content: newPostContent });
            setPosts([{...data, category: 'Update', authorPresence: 'online'}, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.error('Error creating post', error);
        }
    };

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'For You') return true;
        if (activeTab === 'Following') return true; // Mock: show all for now
        if (activeTab === 'My Department') return post.author?.department === user?.department;
        if (activeTab === 'Company') return true;
        return true;
    });

    return (
        <div className="social-hub-container">
            {/* Center Column: Feed */}
            <div className="social-center-col">
                <div className="post-composer">
                    <div className="composer-top">
                        <div className="composer-avatar-wrapper">
                            <div className="composer-avatar">
                                {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="presence-dot online"></span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="What's happening?" 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                        />
                    </div>
                    <div className="composer-actions">
                        <button className="composer-action-btn"><Image size={16} /> Photo</button>
                        <button className="composer-action-btn"><FileText size={16} /> Document</button>
                        <button className="composer-action-btn"><Award size={16} /> Achievement</button>
                        <button className="composer-action-btn"><Calendar size={16} /> Event</button>
                        <button className="composer-submit-btn" onClick={handlePostSubmit}>Post</button>
                    </div>
                </div>

                <div className="feed-filters">
                    {['For You', 'Following', 'My Department', 'Company'].map(tab => (
                        <button 
                            key={tab}
                            className={`feed-filter-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="feed-stream">
                    {loading ? (
                        <div className="feed-loading">Loading feed...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8C9BB3' }}>
                            <p>No posts to show in this view yet. Be the first to post!</p>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post.id} className={`post-card category-${(post.category || 'update').toLowerCase()}`}>
                                <div className="post-header">
                                    <div className="post-author-wrapper">
                                        <div className="post-author-avatar">
                                            {post.author?.username?.charAt(0).toUpperCase() || post.author?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className={`presence-dot ${post.authorPresence || 'offline'}`}></span>
                                    </div>
                                    <div className="post-author-info">
                                        <h4>{post.author?.username || post.author?.name || 'Unknown User'}</h4>
                                        <span>{post.author?.department || 'Marketing'} • Just now</span>
                                    </div>
                                    <div className="post-meta-right">
                                        <span className="post-category-tag">{post.category || 'Update'}</span>
                                        <MoreHorizontal size={20} className="post-more" />
                                    </div>
                                </div>
                                <div className="post-content">
                                    <p>{post.content}</p>
                                </div>
                                <div className="post-footer">
                                    <div className="post-stats">
                                        <span>{post.likesCount || 0} Likes</span>
                                        <span>{post.commentsCount || 0} Comments</span>
                                    </div>
                                    <div className="post-actions">
                                        <button><ThumbsUp size={16} /> Like</button>
                                        <button><MessageSquare size={16} /> Comment</button>
                                        <button><Share2 size={16} /> Share</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="social-right-col">
                <div className="social-widget">
                    <h4>People You May Know</h4>
                    <div className="suggestion-item">
                        <div className="suggestion-avatar-wrapper">
                            <div className="suggestion-avatar">A</div>
                            <span className="presence-dot online"></span>
                        </div>
                        <div className="suggestion-info">
                            <strong>Alice Smith</strong>
                            <span>Marketing</span>
                        </div>
                        <button className="connect-btn">Connect</button>
                    </div>
                    <div className="suggestion-item">
                        <div className="suggestion-avatar-wrapper">
                            <div className="suggestion-avatar">B</div>
                            <span className="presence-dot away"></span>
                        </div>
                        <div className="suggestion-info">
                            <strong>Bob Jones</strong>
                            <span>Sales</span>
                        </div>
                        <button className="connect-btn">Connect</button>
                    </div>
                </div>

                <div className="social-widget">
                    <h4>Trending</h4>
                    <div className="trending-tags">
                        <span className="trending-tag">#CompanyLife</span>
                        <span className="trending-tag">#Innovation</span>
                        <span className="trending-tag">#TeamWork</span>
                        <span className="trending-tag">#Technology</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialHub;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import { Image, Video, FileText, Award, Calendar, BarChart2, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react';
import './SocialHub.css';

const SocialHub = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { data } = await API.get('/social/feed');
                setPosts(data);
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
            setPosts([data, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.error('Error creating post', error);
        }
    };

    return (
        <div className="social-hub-container">
            {/* Left Column: Profile Card */}
            <div className="social-left-col">
                <div className="social-mini-profile">
                    <div className="profile-cover"></div>
                    <div className="profile-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h3>{user?.username || 'Employee'}</h3>
                        <p>{user?.role || 'Staff'}</p>
                    </div>
                    <div className="profile-stats">
                        <div className="stat-row">
                            <span>Connections</span>
                            <strong>142</strong>
                        </div>
                        <div className="stat-row">
                            <span>Profile Views</span>
                            <strong>38</strong>
                        </div>
                    </div>
                    <div className="profile-links">
                        <div className="profile-link-item"><Bookmark size={16} /> Saved Posts</div>
                    </div>
                </div>
            </div>

            {/* Center Column: Feed */}
            <div className="social-center-col">
                <div className="post-composer">
                    <div className="composer-top">
                        <div className="composer-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <input 
                            type="text" 
                            placeholder="What's happening?" 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                    </div>
                    <div className="composer-actions">
                        <button className="composer-action-btn"><Image size={18} /> Photo</button>
                        <button className="composer-action-btn"><Video size={18} /> Video</button>
                        <button className="composer-action-btn"><FileText size={18} /> Document</button>
                        <button className="composer-action-btn"><Award size={18} /> Achievement</button>
                        <button className="composer-action-btn"><Calendar size={18} /> Event</button>
                        <button className="composer-submit-btn" onClick={handlePostSubmit}>Post</button>
                    </div>
                </div>

                <div className="feed-filters">
                    <button className="feed-filter-btn active">For You</button>
                    <button className="feed-filter-btn">Following</button>
                    <button className="feed-filter-btn">My Department</button>
                    <button className="feed-filter-btn">Company</button>
                </div>

                <div className="feed-stream">
                    {loading ? (
                        <div className="feed-loading">Loading feed...</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <div className="post-author-avatar">
                                        {post.author?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="post-author-info">
                                        <h4>{post.author?.username}</h4>
                                        <span>2 hours ago</span>
                                    </div>
                                    <div className="post-more">
                                        <MoreHorizontal size={20} />
                                    </div>
                                </div>
                                <div className="post-content">
                                    <p>{post.content}</p>
                                </div>
                                <div className="post-stats">
                                    <span>{post.likesCount || 0} Likes</span>
                                    <span>{post.commentsCount || 0} Comments</span>
                                </div>
                                <div className="post-actions">
                                    <button><ThumbsUp size={18} /> Like</button>
                                    <button><MessageSquare size={18} /> Comment</button>
                                    <button><Share2 size={18} /> Share</button>
                                    <button><Bookmark size={18} /> Save</button>
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
                        <div className="suggestion-avatar">A</div>
                        <div className="suggestion-info">
                            <strong>Alice Smith</strong>
                            <span>Marketing</span>
                        </div>
                        <button className="connect-btn">Connect</button>
                    </div>
                    <div className="suggestion-item">
                        <div className="suggestion-avatar">B</div>
                        <div className="suggestion-info">
                            <strong>Bob Jones</strong>
                            <span>Sales</span>
                        </div>
                        <button className="connect-btn">Connect</button>
                    </div>
                </div>

                <div className="social-widget">
                    <h4>Trending</h4>
                    <ul className="trending-list">
                        <li>#CompanyLife</li>
                        <li>#Innovation</li>
                        <li>#TeamWork</li>
                        <li>#Technology</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SocialHub;

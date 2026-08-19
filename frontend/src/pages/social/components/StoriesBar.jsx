import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Plus } from 'lucide-react';
import Avatar from './Avatar';
import API from '../../../api/axios';
import StoryViewer from './StoryViewer';

const StoriesBar = ({ onAddStory }) => {
    const { user } = useContext(AuthContext);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await API.get('/feed/stories');
            // Group stories by author
            const grouped = {};
            res.data.forEach(story => {
                if (!grouped[story.author.id]) {
                    grouped[story.author.id] = {
                        author: story.author,
                        stories: [],
                        hasUnviewed: false
                    };
                }
                grouped[story.author.id].stories.push(story);
                
                // Check if viewed
                const viewed = story.views && story.views.some(v => v.userId === user?.id);
                if (!viewed) {
                    grouped[story.author.id].hasUnviewed = true;
                }
            });

            // Convert to array
            let groupedArray = Object.values(grouped);
            // Sort: Admin first, then hasUnviewed, then date
            groupedArray.sort((a, b) => {
                if (a.author.role === 'Admin' && b.author.role !== 'Admin') return -1;
                if (b.author.role === 'Admin' && a.author.role !== 'Admin') return 1;
                if (a.hasUnviewed && !b.hasUnviewed) return -1;
                if (!a.hasUnviewed && b.hasUnviewed) return 1;
                return 0; // fallback
            });

            setStories(groupedArray);
        } catch (error) {
            console.error('Failed to fetch stories', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWheel = (e) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
            <div 
                ref={scrollRef}
                onWheel={handleWheel}
                style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Add Story Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '72px' }} onClick={onAddStory}>
                    <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', padding: '2px', border: '2px solid transparent' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                            <Avatar user={user} size={56} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: '#0a66c2', borderRadius: '50%', border: '2px solid white', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={14} color="white" />
                        </div>
                    </div>
                    <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500', color: '#191919' }}>Your Story</span>
                </div>

                {/* Other Stories */}
                {!loading && stories.map((group, index) => (
                    <div key={group.author.id} onClick={() => setActiveStoryIndex(index)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '72px' }}>
                        <div style={{ 
                            width: '64px', height: '64px', borderRadius: '50%', padding: '2px',
                            ...(group.hasUnviewed 
                                ? (group.author.role === 'Admin' ? { background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #0a66c2, #f59e0b) border-box', border: '2px solid transparent' } : { background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #d97706, #f43f5e) border-box', border: '2px solid transparent' })
                                : { border: '2px solid #e5e7eb' }
                            )
                        }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                                <Avatar user={group.author} size={56} />
                            </div>
                        </div>
                        <span style={{ fontSize: '12px', marginTop: '4px', color: '#191919', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '72px' }}>
                            {group.author.name.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>
            
            {activeStoryIndex !== null && (
                <StoryViewer 
                    storyGroup={stories[activeStoryIndex]} 
                    onClose={() => setActiveStoryIndex(null)}
                    onNext={() => setActiveStoryIndex(prev => prev < stories.length - 1 ? prev + 1 : null)}
                    onPrev={() => setActiveStoryIndex(prev => prev > 0 ? prev - 1 : null)}
                />
            )}
        </div>
    );
};

export default StoriesBar;

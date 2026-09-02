import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Avatar from './Avatar';

const StoryViewer = ({ storyGroup, onClose, onNext, onPrev }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentStory = storyGroup.stories[currentIndex];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1; // Approx 100 steps of 50ms = 5s per story
            });
        }, 50);

        return () => clearInterval(timer);
    }, [currentIndex, storyGroup]);

    const handleNext = () => {
        if (currentIndex < storyGroup.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            if (onNext) onNext();
            else onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        } else {
            if (onPrev) onPrev();
        }
    };

    if (!currentStory) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000e6', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '800px', backgroundColor: '#191919', display: 'flex', flexDirection: 'column' }}>
                
                {/* Progress Bars */}
                <div style={{ display: 'flex', gap: '4px', padding: '16px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                    {storyGroup.stories.map((s, idx) => (
                        <div key={idx} style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                backgroundColor: '#ffffff', 
                                width: idx === currentIndex ? `${progress}%` : (idx < currentIndex ? '100%' : '0%') 
                            }} />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ padding: '32px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar user={storyGroup.author} size={32} />
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{storyGroup.author.name}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                        <X size={24} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                    </button>
                </div>

                {/* Image/Content */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {currentStory.imageUrl && (
                        <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${currentStory.imageUrl}`} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                    {currentStory.text && !currentStory.imageUrl && (
                        <div style={{ padding: '32px', color: 'white', fontSize: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                            {currentStory.text}
                        </div>
                    )}
                    
                    {/* Caption if image exists */}
                    {currentStory.text && currentStory.imageUrl && (
                        <div style={{ position: 'absolute', bottom: '32px', left: '16px', right: '16px', color: 'white', fontSize: '16px', textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            {currentStory.text}
                        </div>
                    )}
                </div>

                {/* Navigation Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '30%', cursor: 'pointer', zIndex: 5 }} onClick={handlePrev} />
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '70%', cursor: 'pointer', zIndex: 5 }} onClick={handleNext} />
            </div>
        </div>
    );
};

export default StoryViewer;

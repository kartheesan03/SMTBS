import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Image as ImageIcon, Video, Calendar, AlignLeft, FileText, BarChart2 } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

const CreatePostBox = ({ onPostCreated, isModalOpen, setIsModalOpen }) => {
    const { user } = useContext(AuthContext);
    
    // Ensure backwards compatibility with different mock data structures
    const authorName = user?.name || user?.username || 'Employee';
    const firstName = authorName.split(' ')[0];

    return (
        <>
            <div style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', overflow: 'hidden' }}>
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            flex: 1,
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '24px',
                            padding: '0 20px',
                            color: '#64748b',
                            fontSize: '15px',
                            fontWeight: '500',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            height: '48px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    >
                        Start a post, {firstName}?
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '12px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <ImageIcon size={20} color="#3B82F6" /> <span className="hide-mobile">Photo</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '12px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <Video size={20} color="#10B981" /> <span className="hide-mobile">Video</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '12px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <FileText size={20} color="#F59E0B" /> <span className="hide-mobile">Document</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '12px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <AlignLeft size={20} color="#E11D48" /> <span className="hide-mobile">Write article</span>
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                @media (max-width: 600px) {
                    .hide-mobile {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
};

export default CreatePostBox;

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Sparkles, Mic } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() || attachment) {
            onSendMessage(text, attachment);
            setText('');
            setAttachment(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setAttachment(file);
    };

    return (
        <div className="ai-chat-input-container">
            {attachment && (
                <div className="ai-attachment-preview">
                    <span>📎 {attachment.name}</span>
                    <button type="button" onClick={() => setAttachment(null)}>✕</button>
                </div>
            )}
            <form className="ai-chat-form" onSubmit={handleSubmit}>
                <button 
                    type="button" 
                    className="ai-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    title="Attach file"
                >
                    <Paperclip size={18} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.csv"
                />
                
                <div className="ai-input-sparkle">
                    <Sparkles size={18} />
                </div>
                
                <input 
                    type="text" 
                    className="ai-text-input" 
                    placeholder="Ask anything or upload a document..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                />
                
                <button 
                    type="button" 
                    className="ai-mic-btn"
                    disabled={disabled}
                    title="Voice input (coming soon)"
                >
                    <Mic size={18} />
                </button>

                <button 
                    type="submit" 
                    className="ai-send-btn"
                    disabled={disabled || (!text.trim() && !attachment)}
                    title="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
            <div className="ai-footer-note">AI can make mistakes. Verify important information.</div>
        </div>
    );
};

export default ChatInput;

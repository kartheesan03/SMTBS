import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import './ChatBot.css';

const SUGGESTIONS = [
    'How does inventory tracking work?',
    'What is the order workflow?',
    'Tell me about vendor management',
    'How do I get started?',
];

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'bot',
    content: "👋 Hi! I'm the SMTBMS Assistant. I can help you with inventory management, warehouse operations, order workflows, and more. How can I help you today?",
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || isTyping) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: messageText,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setShowSuggestions(false);

        try {
            // Build history excluding welcome message
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, history }),
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: data.reply || "I couldn't process that request. Please try again!",
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSuggestion = (suggestion) => {
        sendMessage(suggestion);
    };

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div className="chatbot-panel">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={20} />
                            </div>
                            <div className="chatbot-header-text">
                                <h4>SMTBMS Assistant</h4>
                                <span>● Online</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.role}`}>
                                {msg.role === 'bot' && (
                                    <div className="msg-avatar">
                                        <Sparkles size={12} />
                                    </div>
                                )}
                                <div className="msg-bubble">
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="msg-avatar">
                                    <Sparkles size={12} />
                                </div>
                                <div className="typing-dots">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestion chips (shown only at start) */}
                    {showSuggestions && (
                        <div className="chatbot-suggestions">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    className="suggestion-chip"
                                    onClick={() => handleSuggestion(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div className="chatbot-input-area">
                        <textarea
                            ref={inputRef}
                            className="chatbot-input"
                            placeholder="Ask me anything about SMTBMS..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className="chatbot-send"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Trigger Button */}
            <button
                className="chatbot-trigger"
                onClick={() => setIsOpen(prev => !prev)}
                title="Chat with SMTBMS Assistant"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && <div className="chatbot-dot" />}
            </button>
        </>
    );
};

export default ChatBot;

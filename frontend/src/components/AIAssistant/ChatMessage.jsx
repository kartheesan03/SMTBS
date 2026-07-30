import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Bot, User, Copy, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'like' | 'dislike'
    
    let parsedChartData = null;

    if (message.chartData) {
        try {
            parsedChartData = typeof message.chartData === 'string' ? JSON.parse(message.chartData) : message.chartData;
        } catch (e) {
            console.error('Failed to parse chart data');
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`ai-message-row ${isUser ? 'user' : 'assistant'}`}>
            <div className="ai-message-avatar">
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="ai-message-content">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                >
                    {message.content}
                </ReactMarkdown>
                
                {parsedChartData && parsedChartData.config && parsedChartData.data && (
                    <div className="ai-chart-container" style={{ height: '250px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={parsedChartData.data}>
                                <XAxis dataKey={parsedChartData.config.xAxisKey} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey={parsedChartData.config.yAxisKey} fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                
                {!isUser && (
                    <div className="ai-message-actions">
                        <button onClick={handleCopy} title="Copy" className="ai-action-btn">
                            {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
                        </button>
                        <button title="Regenerate" className="ai-action-btn">
                            <RefreshCw size={14} />
                        </button>
                        <button 
                            title="Like" 
                            className={`ai-action-btn ${feedback === 'like' ? 'active' : ''}`}
                            onClick={() => setFeedback('like')}
                        >
                            <ThumbsUp size={14} />
                        </button>
                        <button 
                            title="Dislike" 
                            className={`ai-action-btn ${feedback === 'dislike' ? 'active' : ''}`}
                            onClick={() => setFeedback('dislike')}
                        >
                            <ThumbsDown size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;

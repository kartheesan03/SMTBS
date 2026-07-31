import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DataTable from './DataTable';
import { RichChart, SmartKPICard, WorkflowDiagram, ReportPreviewCard, ApprovalCard } from './RichResponseCard';
import { Zap, User, Copy, RefreshCw, ThumbsUp, ThumbsDown, Share2, Download, Bookmark } from 'lucide-react';

const MessageBubble = ({ message, onAction, isLast, isTyping }) => {
    const isAi = message.role === 'ai';
    const [displayedText, setDisplayedText] = useState("");
    const [isStreaming, setIsStreaming] = useState(isAi && isLast && isTyping);

    useEffect(() => {
        if (!isStreaming) {
            setDisplayedText(message.content);
            return;
        }

        let i = 0;
        const speed = 10;
        const interval = setInterval(() => {
            setDisplayedText(message.content.substring(0, i));
            i++;
            if (i > message.content.length) {
                clearInterval(interval);
                setIsStreaming(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [message.content, isStreaming]);

    return (
        <div className={`ai-message-wrapper ${isAi ? 'ai-role' : 'user-role user-wrapper'}`}>
            <div className="ai-message-avatar">
                {isAi ? <Zap size={14} /> : 'U'}
            </div>
            
            <div className="ai-message-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayedText && (
                    <div className="ai-message-bubble" style={{ lineHeight: '1.6', fontSize: '15px' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayedText + (isStreaming ? " ▋" : "")}
                        </ReactMarkdown>
                    </div>
                )}

                {message.metadata?.processingSteps && (
                    <div className="my-2 p-4 bg-[#F9FAFB] border border-[#EAEAEA] rounded-xl max-w-md font-mono text-xs text-[#4B5563] shadow-sm">
                        <div className="font-semibold mb-2 text-[#111827]">
                            {isStreaming ? 'PROCESSING...' : 'COMPLETED'}
                        </div>
                        <div className="flex flex-col gap-1">
                            {message.metadata.processingSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="text-[#9CA3AF]">
                                        {isStreaming && idx === message.metadata.processingSteps.length - 1 ? '•' : '✓'}
                                    </div>
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isStreaming && message.metadata?.kpi && (
                    <div className="flex flex-wrap gap-4 mt-2 mb-2">
                        {message.metadata.kpi.map((kpiData, idx) => (
                            <SmartKPICard key={idx} {...kpiData} />
                        ))}
                    </div>
                )}

                {!isStreaming && message.metadata?.table && (
                    <div className="mt-2 mb-2 border border-[#EAEAEA] rounded-xl bg-white overflow-hidden shadow-sm">
                        <DataTable data={message.metadata.table.data} columns={message.metadata.table.columns} />
                    </div>
                )}

                {!isStreaming && message.metadata?.workflow && (
                    <div className="mt-2 mb-2">
                        <WorkflowDiagram steps={message.metadata.workflow.steps} />
                    </div>
                )}

                {!isStreaming && message.metadata?.chart && (
                    <div className="mt-2 mb-2 border border-[#EAEAEA] rounded-xl bg-white p-4 shadow-sm">
                        <RichChart 
                            type={message.metadata.chart.type || 'bar'}
                            data={message.metadata.chart.data}
                            xKey={message.metadata.chart.xKey}
                            yKeys={message.metadata.chart.yKeys || [message.metadata.chart.yKey]}
                        />
                    </div>
                )}

                {!isStreaming && message.metadata?.reportPreview && (
                    <div className="mt-2 mb-2">
                        <ReportPreviewCard 
                            title={message.metadata.reportPreview.title}
                            data={message.metadata.reportPreview.data}
                            onAction={(action) => onAction(action, message.metadata.reportPreview.type)}
                        />
                    </div>
                )}

                {!isStreaming && message.metadata?.approval && (
                    <div className="mt-2 mb-2">
                        <ApprovalCard 
                            data={message.metadata.approval}
                            onAction={(action) => onAction(action, message.metadata.approval.id)}
                        />
                    </div>
                )}

                {!isStreaming && message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                    <div className="ai-suggestions-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {message.metadata.suggestions.map((suggestion, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAction('send_suggestion', suggestion)}
                                className="suggestion-pill"
                                style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '13px', padding: '6px 12px' }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {isAi && !isStreaming && (
                    <div className="ai-message-footer-actions" style={{ display: 'flex', gap: '4px', marginTop: '4px', color: '#9CA3AF' }}>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Copy" onClick={() => navigator.clipboard.writeText(message.content)}>
                            <Copy size={15} />
                        </button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Regenerate"><RefreshCw size={15} /></button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Helpful"><ThumbsUp size={15} /></button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Not Helpful"><ThumbsDown size={15} /></button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Share"><Share2 size={15} /></button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Download"><Download size={15} /></button>
                        <button className="ai-icon-action hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Bookmark"><Bookmark size={15} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;

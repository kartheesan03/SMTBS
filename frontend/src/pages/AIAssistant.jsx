import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Bot,
  Send,
  Trash2,
  Box,
  ShoppingCart,
  Truck,
  FileText,
  Download,
  Paperclip,
  Sparkles,
  Plus,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit2,
  Square,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import "./AIAssistant.css";
const StreamingMessage = ({ content, onComplete, isStreaming }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [content, currentIndex, isStreaming, onComplete]);
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayedContent}
    </ReactMarkdown>
  );
};
const AIAssistant = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const streamInterruptRef = useRef(false);
  const isSendingRef = useRef(false);
  const sessionIdRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const menuRef = useRef(null);
  const isLoadedRef = useRef(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".aria-history-actions")) {
        setOpenMenuId(null);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const storedSessions = JSON.parse(
      localStorage.getItem("aria_sessions") || "[]"
    );
    setSessions(storedSessions);
    if (storedSessions.length > 0) {
      const lastSession = storedSessions[0];
      setCurrentSessionId(lastSession.id);
      sessionIdRef.current = lastSession.id;
      setMessages(lastSession.messages);
    } else {
      createNewSession();
    }
    isLoadedRef.current = true;
  }, []);
  useEffect(() => {
    if (isLoadedRef.current) {
      localStorage.setItem("aria_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages,
              title:
                s.title === "New Chat"
                  ? messages[0]?.content.substring(0, 30) +
                    (messages[0]?.content.length > 30 ? "..." : "")
                  : s.title,
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );
    }
  }, [messages, currentSessionId]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);
  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };
  const createNewSession = () => {
    const tempId = Date.now().toString();
    setCurrentSessionId(tempId);
    sessionIdRef.current = tempId;
    setMessages([]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };
  const switchSession = (id) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      sessionIdRef.current = id;
      setMessages(session.messages);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };
  const handleSend = async (textOverride = null) => {
    if (isSendingRef.current) return;
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;
    isSendingRef.current = true;
    let activeSessionId = sessionIdRef.current;
    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      sessionIdRef.current = activeSessionId;
      setCurrentSessionId(activeSessionId);
    }

    setSessions((prev) => {
      if (prev.some((s) => s.id === activeSessionId)) {
        return prev;
      }
      const newSession = {
        id: activeSessionId,
        title:
          messageText.substring(0, 30) + (messageText.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: Date.now(),
      };
      return [newSession, ...prev];
    });
    const userMsg = { role: "user", content: messageText, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    streamInterruptRef.current = false;
    try {
      const res = await API.post("/chat", {
        message: messageText,
        history: messages,
      });
      if (streamInterruptRef.current) {
        setIsLoading(false);
        return;
      }
      const aiMsg = {
        role: "assistant",
        content: res.data.reply || "I'm sorry, I couldn't process that.",
        file: res.data.file || null,
        suggestions: res.data.suggestions || null,
        id: Date.now() + 1,
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(true);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to connect to Aria.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting to my servers right now.",
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleStopGeneration = () => {
    streamInterruptRef.current = true;
    setIsLoading(false);
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.isStreaming) return { ...m, isStreaming: false };
        return m;
      })
    );
  };
  const handleRegenerate = async (msgId) => {
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex <= 0) return;
    const userMsg = messages[msgIndex - 1];
    if (userMsg.role !== "user") return;
    const newHistory = messages.slice(0, msgIndex);
    setMessages(newHistory);
    setIsLoading(true);
    streamInterruptRef.current = false;
    try {
      const res = await API.post("/chat", {
        message: userMsg.content,
        history: newHistory.slice(0, -1),
      });
      if (streamInterruptRef.current) {
        setIsLoading(false);
        return;
      }
      const aiMsg = {
        role: "assistant",
        content: res.data.reply || "I'm sorry, I couldn't process that.",
        file: res.data.file || null,
        suggestions: res.data.suggestions || null,
        id: Date.now() + 1,
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(true);
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error("Failed to regenerate response.");
      setIsLoading(false);
    }
  };
  const handleEdit = (msgId) => {
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;
    const userMsg = messages[msgIndex];
    setInput(userMsg.content);
    setMessages(messages.slice(0, msgIndex));
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200
        )}px`;
      }, 0);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  const emptyStatePrompts = [
    {
      icon: <Box size={20} />,
      title: "Inventory",
      desc: "Show me low stock materials",
    },
    {
      icon: <ShoppingCart size={20} />,
      title: "Orders",
      desc: "What are our pending purchase orders?",
    },
    {
      icon: <Truck size={20} />,
      title: "Vendors",
      desc: "List our top rated vendors",
    },
    {
      icon: <FileText size={20} />,
      title: "Reports",
      desc: "Generate a customer report",
    },
  ];
  const handleDeleteSession = (id, e) => {
    e.stopPropagation();

    // Ensure immediate removal from localStorage
    const currentStored = JSON.parse(
      localStorage.getItem("aria_sessions") || "[]"
    );
    const updatedStored = currentStored.filter((s) => s.id !== id);
    localStorage.setItem("aria_sessions", JSON.stringify(updatedStored));

    const updatedSessions = sessions.filter((s) => s.id !== id);
    setSessions(updatedSessions);
    setOpenMenuId(null);
    setConfirmDeleteId(null);

    if (currentSessionId === id) {
      if (updatedSessions.length > 0) {
        switchSession(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };
  const handleRenameSubmit = (id, e) => {
    if (e) {
      e.stopPropagation();
      if (e.type === "keydown" && e.key !== "Enter") return;
    }
    if (renameValue.trim()) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: renameValue.trim() } : s))
      );
    }
    setEditingSessionId(null);
  };
  return (
    <div className="aria-workspace">
      {/* Sidebar History */}
      <div className="aria-sidebar">
        <button
          className={`aria-new-chat-btn ${
            !sessions.some((s) => s.id === currentSessionId) ? "active" : ""
          }`}
          onClick={createNewSession}
        >
          <Plus size={18} />
          New Chat
        </button>
        <div className="aria-history-list" ref={menuRef}>
          <div className="aria-history-label">Recent</div>
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`aria-history-item ${
                s.id === currentSessionId ? "active" : ""
              } ${confirmDeleteId === s.id ? "deleting" : ""}`}
              onClick={() => switchSession(s.id)}
            >
              {editingSessionId === s.id ? (
                <div
                  className="aria-history-rename"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => handleRenameSubmit(s.id, e)}
                    onBlur={() => handleRenameSubmit(s.id)}
                  />
                  <button onClick={(e) => handleRenameSubmit(s.id, e)}>
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <MessageSquare size={16} />
                  <span className="aria-history-title">{s.title}</span>
                  <div className="aria-history-actions">
                    <button
                      className="aria-history-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === s.id ? null : s.id);
                        setConfirmDeleteId(null);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === s.id && (
                      <div
                        className="aria-history-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {confirmDeleteId === s.id ? (
                          <div className="aria-history-confirm">
                            <div className="aria-confirm-msg">
                              Delete this chat?
                            </div>
                            <div className="aria-confirm-btns">
                              <button onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                              </button>
                              <button
                                className="delete"
                                onClick={(e) => handleDeleteSession(s.id, e)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "[DEBUG] Rename clicked for:",
                                  s.id
                                );
                                setEditingSessionId(s.id);
                                setRenameValue(s.title);
                                setOpenMenuId(null);
                              }}
                            >
                              <Edit2 size={14} /> Rename
                            </button>
                            <button
                              className="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "[DEBUG] Delete clicked for:",
                                  s.id
                                );
                                setConfirmDeleteId(s.id);
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="aria-main">
        <div className="aria-header">
          <div className="aria-brand">
            <Sparkles size={20} className="aria-brand-icon" />
            <div>
              <h1>Aria Assistant</h1>
              <span className="aria-status">Active Session</span>
            </div>
          </div>
        </div>
        <div className="aria-chat-area">
          <div className="aria-chat-centered">
            {messages.length === 0 ? (
              <div className="aria-empty-state">
                <div className="aria-logo-large animate-fade-in-scale">
                  <Sparkles size={40} />
                </div>
                <div className="aria-welcome-text animate-fade-in-up delay-100">
                  <h2 className="aria-greeting">Hi, I'm Aria.</h2>
                  <p className="aria-subgreeting">
                    Ask me anything about your inventory, orders, vendors, or
                    teams.
                  </p>
                </div>
                <div className="aria-suggestions-container animate-fade-in-up delay-200">
                  <div className="aria-suggestions-label">Quick actions</div>
                  <div className="aria-suggestions-grid">
                    {emptyStatePrompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className={`aria-suggestion-card animate-fade-in-up delay-${
                          300 + idx * 50
                        }`}
                        onClick={() => handleSend(prompt.desc)}
                        tabIndex="0"
                      >
                        <div className="aria-suggestion-icon-wrapper">
                          {prompt.icon}
                        </div>
                        <div className="aria-suggestion-text">
                          <div className="title">{prompt.title}</div>
                          <div className="desc">{prompt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="aria-messages-list animate-fade-in">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`aria-message-wrapper ${msg.role}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="aria-avatar assistant">
                        <Sparkles size={16} />
                      </div>
                    )}
                    <div className="aria-message-content">
                      {msg.role === "assistant" ? (
                        <>
                          <StreamingMessage
                            content={msg.content}
                            isStreaming={msg.isStreaming}
                            onComplete={() => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id
                                    ? { ...m, isStreaming: false }
                                    : m
                                )
                              );
                              setIsStreaming(false);
                            }}
                          />
                          {msg.file && !msg.isStreaming && (
                            <div className="aria-file-card">
                              <div className="aria-file-icon">
                                <FileText size={24} />
                              </div>
                              <div className="aria-file-info">
                                <span className="aria-file-name">
                                  {msg.file.name}
                                </span>
                                <span className="aria-file-size">
                                  {(msg.file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                              <a
                                href={`http://localhost:5000${msg.file.url}`}
                                download
                                className="aria-file-download"
                              >
                                <Download size={18} />
                              </a>
                            </div>
                          )}
                          {msg.suggestions && !msg.isStreaming && (
                            <div className="aria-smart-suggestions">
                              {msg.suggestions.map((s, i) => (
                                <button
                                  key={i}
                                  className="aria-smart-chip"
                                  onClick={() => handleSend(s.desc)}
                                >
                                  {s.title}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Assistant Message Actions */}
                          {!msg.isStreaming && (
                            <div className="aria-message-actions">
                              <button
                                onClick={() => copyToClipboard(msg.content)}
                                title="Copy"
                              >
                                <Copy size={14} />
                              </button>
                              <button title="Good response">
                                <ThumbsUp size={14} />
                              </button>
                              <button title="Bad response">
                                <ThumbsDown size={14} />
                              </button>
                              <button
                                onClick={() => handleRegenerate(msg.id)}
                                title="Regenerate"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="aria-user-bubble">
                          {msg.content}
                          {/* User Message Edit Action */}
                          <div className="aria-user-actions">
                            <button
                              onClick={() => handleEdit(msg.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="aria-message-wrapper assistant">
                    <div className="aria-avatar assistant">
                      <Sparkles size={16} />
                    </div>
                    <div className="aria-message-content aria-thinking">
                      <div className="dot-typing"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        <div className="aria-input-area">
          <div className="aria-input-centered">
            <div className="aria-input-wrapper">
              <button
                className="aria-attach-btn"
                title="Attach file (Coming soon)"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                ref={textareaRef}
                className="aria-input"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message Aria..."
                rows={1}
              />
              {isLoading || isStreaming ? (
                <button
                  className="aria-send-btn active"
                  onClick={handleStopGeneration}
                  title="Stop generating"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  className={`aria-send-btn ${input.trim() ? "active" : ""}`}
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                >
                  <Send size={18} />
                </button>
              )}
            </div>
            <div className="aria-footer-text">
              Aria can make mistakes. Verify important business data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIAssistant;

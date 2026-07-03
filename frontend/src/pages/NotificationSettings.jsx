import React, { useState } from 'react';
import { Bell, Settings, Send, Mail, MessageCircle, Smartphone, ShoppingCart, ArrowLeftRight, Users, Wallet, Briefcase, Calendar, Headphones, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import './NotificationSettings.css';

const NotificationSettings = () => {
    const [prefs, setPrefs] = useState({
        email: true,
        sms: false,
        push: true,
        lowStock: true,
        materialMovements: true,
        hrEvents: false,
        payroll: true,
        crm: false,
        scheduledReports: true
    });

    const handleToggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="ns-container"
        >
            {/* Header Banner */}
            <div className="ns-header-banner">
                <div className="ns-header-text">
                    <h2>Notification Settings</h2>
                    <p>Manage how and where you receive alerts and updates.</p>
                </div>
                <div className="ns-header-icon-wrapper">
                    <div className="ns-header-circle"></div>
                    <div className="ns-header-circle small"></div>
                    <div className="ns-bell-container">
                        <Bell size={32} color="white" />
                        <div className="ns-gear-badge">
                            <Settings size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="ns-grid">
                {/* Left Column */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="ns-card"
                >
                    <div className="ns-card-header">
                        <div className="ns-icon-box ns-blue-light">
                            <Send size={18} color="#6366f1" />
                        </div>
                        <div>
                            <h3>Delivery Channels</h3>
                            <p>Choose how you want to receive notifications</p>
                        </div>
                    </div>
                    
                    <div className="ns-toggle-list">
                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-orange-light">
                                    <Mail size={16} color="#f59e0b" />
                                </div>
                                <div className="ns-item-text">
                                    <h4>Email Notifications</h4>
                                    <p>Receive alerts and reports via email</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-orange">
                                <input type="checkbox" checked={prefs.email} onChange={() => handleToggle('email')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>
                        
                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-green-light">
                                    <MessageCircle size={16} color="#10b981" />
                                </div>
                                <div className="ns-item-text">
                                    <h4>SMS / WhatsApp</h4>
                                    <p>Urgent alerts via mobile message</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-gray">
                                <input type="checkbox" checked={prefs.sms} onChange={() => handleToggle('sms')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-blue-lighter">
                                    <Smartphone size={16} color="#3b82f6" />
                                </div>
                                <div className="ns-item-text">
                                    <h4>In-App Push</h4>
                                    <p>Real-time alerts inside the dashboard</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-blue">
                                <input type="checkbox" checked={prefs.push} onChange={() => handleToggle('push')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>
                    </div>

                    <button className="ns-btn-save">
                        <Bell size={16} /> Save Preferences
                    </button>
                </motion.div>

                {/* Right Column */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="ns-card"
                >
                    <div className="ns-card-header">
                        <div className="ns-icon-box ns-pink-light">
                            <Zap size={18} color="#ec4899" />
                        </div>
                        <div>
                            <h3>Alert Types</h3>
                            <p>Select the types of alerts you want to receive</p>
                        </div>
                    </div>

                    <div className="ns-toggle-list">
                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-pink-lighter">
                                    <ShoppingCart size={16} color="#ec4899" />
                                </div>
                                <div className="ns-item-text">
                                    <h4 className="ns-text-pink">Low Stock Alerts</h4>
                                    <p>When items fall below reorder level</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-pink">
                                <input type="checkbox" checked={prefs.lowStock} onChange={() => handleToggle('lowStock')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-blue-lighter">
                                    <ArrowLeftRight size={16} color="#3b82f6" />
                                </div>
                                <div className="ns-item-text">
                                    <h4 className="ns-text-blue">Material Movements</h4>
                                    <p>IN / OUT / TRANSFER notifications</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-blue">
                                <input type="checkbox" checked={prefs.materialMovements} onChange={() => handleToggle('materialMovements')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-purple-light">
                                    <Users size={16} color="#8b5cf6" />
                                </div>
                                <div className="ns-item-text">
                                    <h4>HR Events</h4>
                                    <p>Leave, attendance, payroll events</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-gray">
                                <input type="checkbox" checked={prefs.hrEvents} onChange={() => handleToggle('hrEvents')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-green-lighter">
                                    <Wallet size={16} color="#10b981" />
                                </div>
                                <div className="ns-item-text">
                                    <h4 className="ns-text-green">Payroll Processing</h4>
                                    <p>Salary runs and payment confirmations</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-green">
                                <input type="checkbox" checked={prefs.payroll} onChange={() => handleToggle('payroll')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-orange-lighter">
                                    <Briefcase size={16} color="#f97316" />
                                </div>
                                <div className="ns-item-text">
                                    <h4>CRM - Leads & Deals</h4>
                                    <p>New leads, deal stage changes, tasks due</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-gray">
                                <input type="checkbox" checked={prefs.crm} onChange={() => handleToggle('crm')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                        <div className="ns-toggle-item">
                            <div className="ns-item-left">
                                <div className="ns-item-icon ns-indigo-light">
                                    <Calendar size={16} color="#6366f1" />
                                </div>
                                <div className="ns-item-text">
                                    <h4 className="ns-text-indigo">Scheduled Reports</h4>
                                    <p>Weekly / monthly summaries</p>
                                </div>
                            </div>
                            <label className="ns-switch ns-indigo">
                                <input type="checkbox" checked={prefs.scheduledReports} onChange={() => handleToggle('scheduledReports')} />
                                <span className="ns-slider"></span>
                            </label>
                        </div>

                    </div>
                </motion.div>
            </div>

            {/* Footer Help */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="ns-footer"
            >
                <div className="ns-footer-left">
                    <div className="ns-icon-box ns-indigo-light">
                        <Headphones size={20} color="#6366f1" />
                    </div>
                    <div>
                        <h3>Need help with notifications?</h3>
                        <p>Learn how to configure notifications and stay updated efficiently.</p>
                    </div>
                </div>
                <button className="ns-btn-outline">
                    View Documentation <span>↗</span>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default NotificationSettings;

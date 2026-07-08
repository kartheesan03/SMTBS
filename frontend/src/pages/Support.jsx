import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, BookOpen, PlayCircle, FileText, Shield, Search, ChevronDown, ChevronUp, Send, PhoneCall, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import './Support.css';

const Support = () => {
    const [openFaq, setOpenFaq] = useState(0);
    const [priority, setPriority] = useState('Normal');

    const faqs = [
        {
            q: "How do I add a new user to SMTBMS?",
            a: "Go to User Management, click \"Add User\", then fill in their name, email, and role. They'll receive an invite email with setup instructions."
        },
        {
            q: "How often does the system back up data automatically?",
            a: "The system runs automated backups daily at 02:00 AM server time. You can also trigger manual backups at any time from the Backup & Restore panel."
        },
        {
            q: "Can I restore a previous backup if something goes wrong?",
            a: "Yes, you can restore from any retained snapshot in the Backup History list. We recommend taking a fresh manual backup right before doing a restore."
        },
        {
            q: "Who can view the audit logs?",
            a: "Audit logs are only accessible to Super Admins and users with the specific 'View Audit Logs' permission assigned via Roles & Permissions."
        },
        {
            q: "How do I change a user's role or suspend their access?",
            a: "In User Management, click the edit icon next to a user's name to change their role. To suspend them, toggle their status to Inactive."
        },
        {
            q: "What should I do if I notice suspicious login activity?",
            a: "Immediately navigate to Security Settings and force a global session logout, then review the Audit Logs to identify the source of the activity."
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="support-container"
        >
            {/* Header */}
            <div className="support-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <PageHeader title="Help & Support" badge="SUPPORT" subtitle="Find answers, browse guides, or reach the SMTBMS support team directly." />
                <div className="support-header-actions" style={{ marginTop: '0' }}>
                    <button className="btn-live-chat">
                        <MessageSquare size={18} />
                        Live Chat
                    </button>
                </div>
            </div>

            {/* Quick Links */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="support-quick-links"
            >
                <div className="quick-link-card link-blue">
                    <div className="ql-icon-box"><BookOpen size={20} /></div>
                    <h3>Admin Setup Guide</h3>
                    <p>Step-by-step walkthrough for configuring roles, modules, and backups.</p>
                    <a href="#" className="ql-link">Open guide <ExternalLink size={14} /></a>
                </div>
                
                <div className="quick-link-card link-pink">
                    <div className="ql-icon-box"><PlayCircle size={20} /></div>
                    <h3>Video Tutorials</h3>
                    <p>Short screen-recorded walkthroughs of common admin tasks.</p>
                    <a href="#" className="ql-link">Open guide <ExternalLink size={14} /></a>
                </div>

                <div className="quick-link-card link-teal">
                    <div className="ql-icon-box"><FileText size={20} /></div>
                    <h3>Release Notes</h3>
                    <p>What's new and what's changed in the latest SMTBMS update.</p>
                    <a href="#" className="ql-link">Open guide <ExternalLink size={14} /></a>
                </div>

                <div className="quick-link-card link-purple">
                    <div className="ql-icon-box"><Shield size={20} /></div>
                    <h3>Security Best Practices</h3>
                    <p>Recommended settings for access control and data protection.</p>
                    <a href="#" className="ql-link">Open guide <ExternalLink size={14} /></a>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="support-main-grid">
                {/* FAQ Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="support-faq-section"
                >
                    <div className="faq-header">
                        <div className="faq-title-wrapper">
                            <LifeBuoy size={20} className="faq-title-icon" />
                            <h2>Frequently Asked Questions</h2>
                        </div>
                        <div className="faq-search">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search help articles..." />
                        </div>
                    </div>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                                <div className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <h3>{faq.q}</h3>
                                    {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} className="text-muted" />}
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        <p>{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="support-contact-section"
                >
                    <div className="contact-form-card">
                        <div className="card-header">
                            <Send size={20} className="card-title-icon-pink" />
                            <h2>Contact Support</h2>
                        </div>
                        <p className="contact-subtitle">Can't find what you're looking for? Send our team a message.</p>
                        
                        <div className="form-group">
                            <label>SUBJECT</label>
                            <input type="text" placeholder="e.g. Can't restore a backup" className="form-input" />
                        </div>

                        <div className="form-group">
                            <label>PRIORITY</label>
                            <div className="priority-toggle">
                                {['Low', 'Normal', 'Urgent'].map(p => (
                                    <button 
                                        key={p}
                                        className={`priority-btn ${priority === p ? 'active' : ''}`}
                                        onClick={() => setPriority(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>MESSAGE</label>
                            <textarea placeholder="Describe the issue you're facing..." className="form-textarea"></textarea>
                        </div>

                        <button className="btn-submit-ticket">
                            <Send size={18} />
                            Submit Ticket
                        </button>
                    </div>

                    <div className="other-ways-card">
                        <h2>Other Ways to Reach Us</h2>
                        <div className="contact-method">
                            <div className="cm-icon"><PhoneCall size={20} /></div>
                            <div className="cm-text">
                                <h4>+91 1800 120 4567</h4>
                                <p>Mon-Sat, 9 AM-7 PM IST</p>
                            </div>
                        </div>
                        <div className="contact-method-divider"></div>
                        <div className="contact-method">
                            <div className="cm-icon"><Globe size={20} /></div>
                            <div className="cm-text">
                                <h4>help.smtbms.com</h4>
                                <p>Knowledge base</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Support;

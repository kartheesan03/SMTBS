import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, BookOpen, Search, ChevronDown, ChevronUp, Send, 
  Users, UserPlus, TrendingUp, Package, Calculator, BarChart2, 
  CheckCircle2, Clock, Activity, Paperclip, Ticket, Server, HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";
import LiveChatWidget from "../components/LiveChatWidget";
import "./Support.css";

const Support = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  
  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Query");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket Stats
  const [ticketStats, setTicketStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const tickets = res.data;
      let open = 0, inProgress = 0, resolved = 0;
      tickets.forEach(t => {
        if (t.status === 'Open' || t.status === 'Waiting for User') open++;
        else if (t.status === 'In Progress') inProgress++;
        else if (t.status === 'Resolved' || t.status === 'Closed') resolved++;
      });
      setTicketStats({ open, inProgress, resolved });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const faqs = [
    {
      q: "How do I add a new user?",
      a: "Go to User Management, click 'Add User', fill in their details, and they will receive an invite email.",
    },
    {
      q: "How do I reset a password?",
      a: "Navigate to the Security settings or the Login page and click 'Forgot Password' to trigger a reset link.",
    },
    {
      q: "How do I create a sales goal?",
      a: "In the CRM module, go to Goals > Create New Goal, set your target metrics, and assign it to a team or individual.",
    },
    {
      q: "How do I manage employee records?",
      a: "Use the HRMS module to view, edit, or archive employee records. You can update their department, role, and salary details there.",
    },
    {
      q: "How do I create a purchase request?",
      a: "In the ERP Inventory module, select 'Purchase Requests' > 'New PR'. Fill in the material requirements and submit for approval.",
    },
    {
      q: "How do I generate reports?",
      a: "Go to the Reports & Dashboard section, select your desired report type (e.g., Sales, Inventory), apply date filters, and click 'Generate'.",
    },
  ];

  const topics = [
    { id: 'user-management', title: "User Management", icon: Users, desc: "Roles, permissions, and access control." },
    { id: 'employee-management', title: "Employee Management", icon: UserPlus, desc: "Onboarding, profiles, and attendance." },
    { id: 'sales-crm', title: "Sales & CRM", icon: TrendingUp, desc: "Leads, deals, and customer relations." },
    { id: 'inventory-procurement', title: "Inventory & Procurement", icon: Package, desc: "Stock, vendors, and purchase orders." },
    { id: 'payroll-hrms', title: "Payroll & HRMS", icon: Calculator, desc: "Salaries, leaves, and benefits." },
    { id: 'reports-analytics', title: "Reports & Dashboard", icon: BarChart2, desc: "Analytics, exports, and custom views." },
  ];

  const kbArticles = {
    'user-management': [
        { title: "How to add a new user", content: "Go to the Settings > User Management page. Click 'Add User' in the top right. Fill out the user's email, name, and select a Role (Admin, Manager, Employee, etc.). An invitation email will be sent automatically with a temporary password." },
        { title: "Understanding Role-Based Access", content: "SMTBMS uses Role-Based Access Control (RBAC). Admins have full access. Managers can approve requests and view department data. Employees can only view their own data, requests, and attendance." },
        { title: "Disabling an account", content: "If an employee leaves, do not delete their account as it breaks historical records. Instead, click 'Edit' on their user profile and toggle the 'Active' switch to off." }
    ],
    'employee-management': [
        { title: "Employee Onboarding Checklist", content: "When a new employee joins: 1. Create their User Account. 2. Create their HR Profile (Employee Management > Add Employee). 3. Assign their Shift in Attendance settings. 4. Assign them to a Manager." },
        { title: "Updating Employee Departments", content: "Go to Employee Management, select the employee, click Edit, and select the new Department and Designation from the dropdown. This will take effect immediately." }
    ],
    'sales-crm': [
        { title: "Creating and Tracking Leads", content: "Navigate to CRM > Leads. Click 'New Lead'. Enter the contact details and estimated deal value. You can drag and drop leads through the Kanban board to track their progress from 'New' to 'Won' or 'Lost'." },
        { title: "Converting a Quotation to an Invoice", content: "Once a customer approves a Quotation, open the Quotation details page and click 'Generate Invoice'. This will automatically copy the line items and calculate taxes based on your region settings." }
    ],
    'inventory-procurement': [
        { title: "Low Stock Alerts", content: "The system automatically flags materials that drop below their 'Reorder Level'. You can view these in the Dashboard. To restock, click 'Create Purchase Order' directly from the alert." },
        { title: "Receiving a Vendor Shipment", content: "When goods arrive, go to Inventory > Purchase Orders. Open the relevant PO and click 'Mark as Received'. This will automatically increase your warehouse stock levels." }
    ],
    'payroll-hrms': [
        { title: "Running Monthly Payroll", content: "Go to Payroll > Generate Payroll. Select the current month. The system will automatically calculate base salary, deduct unpaid leaves based on attendance records, and add approved bonuses. Review the draft and click 'Finalize'." },
        { title: "Leave Approval Workflow", content: "When an employee submits a leave request, it goes to their assigned Manager. Managers can view pending requests in Leave Management. Once approved, the employee's Leave Balance is updated automatically." }
    ],
    'reports-analytics': [
        { title: "Exporting Data", content: "Almost all tables in SMTBMS have an 'Export' button. You can export data to CSV or Excel for external analysis. Standard reports (Sales Monthly, Inventory Valuation) can be exported as PDF." },
        { title: "Customizing Dashboard Widgets", content: "On the main Dashboard, click 'Customize' to rearrange widgets or add new ones. Note: Widget availability depends on your user role." }
    ]
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Search Logic
  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    topic.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicClick = (topicId) => {
    setSelectedTopic(topicId);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject || !description) {
      return toast.error("Please provide a subject and description.");
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your complaint...");
    
    try {
      const res = await api.post('/tickets', {
        subject,
        category,
        priority,
        description,
        attachment: attachment || null
      });
      
      toast.success(`Complaint submitted successfully! Ticket ID: ${res.data.ticketNumber}`, { id: loadingToast });
      
      // Reset form
      setSubject("");
      setDescription("");
      setAttachment("");
      setCategory("General Query");
      setPriority("Medium");
      
      // Refresh stats
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(error.response?.data?.message || "Failed to submit ticket.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
      className="support-center-wrapper"
    >
      {/* 1. Hero Section */}
      <section className="support-hero">
        <div className="hero-top-row">
           <div className="hero-titles">
             <h1>How can we help you?</h1>
             <p>Find answers, resolve issues, or contact the SMTBMS support team.</p>
           </div>
           <button className="btn-hero-chat" onClick={() => setIsChatOpen(true)}>
             <MessageSquare size={16} />
             Live Chat
           </button>
        </div>
        <div className="hero-search-bar">
           <Search size={20} className="search-icon" />
           <input 
             type="text" 
             placeholder="Search for help, guides, features, or solutions..." 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
           <button className="btn-search" onClick={() => {}}>Search</button>
        </div>
      </section>

      {/* 2. Quick Actions */}
      <section className="quick-actions-bar">
         <button className="action-pill" onClick={() => { document.querySelector('.popular-help-grid').scrollIntoView({behavior:'smooth'}); }}>
            <BookOpen size={16}/> Browse Knowledge Base
         </button>
         <button className="action-pill" onClick={() => navigate('/support/tickets')}>
            <Ticket size={16}/> My Support Tickets
         </button>
         <button className="action-pill" onClick={() => document.getElementById('contact-panel').scrollIntoView({behavior: 'smooth'})}>
            <MessageSquare size={16}/> Contact Support
         </button>
         <button className="action-pill" onClick={() => toast.success("All systems operational.")}>
            <Server size={16}/> System Status
         </button>
      </section>

      {/* 3. Popular Help Section */}
      <section className="popular-help-grid">
         {/* Left: Topics */}
         <div className="topics-column">
            <h2 className="section-title">Popular Topics</h2>
            <div className="topics-list">
               {filteredTopics.length > 0 ? filteredTopics.map((topic, idx) => (
                  <div className="topic-card" key={idx} onClick={() => handleTopicClick(topic.id)}>
                     <div className="topic-icon-wrap">
                        <topic.icon size={20} />
                     </div>
                     <div className="topic-content">
                        <h3>{topic.title}</h3>
                        <p>{topic.desc}</p>
                     </div>
                     <div className="topic-arrow">→</div>
                  </div>
               )) : <p className="text-muted">No topics found matching your search.</p>}
            </div>
         </div>

         {/* Right: FAQ */}
         <div className="faq-column">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-accordion">
               {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                  <div key={index} className={`faq-item ${openFaq === index ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                     <div className="faq-question">
                        <h3>{faq.q}</h3>
                        {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} className="text-muted" />}
                     </div>
                     {openFaq === index && (
                        <div className="faq-answer">
                           <p>{faq.a}</p>
                        </div>
                     )}
                  </div>
               )) : <p className="text-muted">No FAQs found matching your search.</p>}
            </div>
         </div>
      </section>

      {/* KB Modal (Rendered inline if a topic is selected) */}
      {selectedTopic && (
          <div className="kb-modal-overlay" onClick={() => setSelectedTopic(null)}>
              <div className="kb-modal-content" onClick={e => e.stopPropagation()}>
                  <div className="kb-modal-header">
                      <h2>{topics.find(t => t.id === selectedTopic)?.title} Articles</h2>
                      <button className="kb-close-btn" onClick={() => setSelectedTopic(null)}>×</button>
                  </div>
                  <div className="kb-modal-body">
                      {kbArticles[selectedTopic]?.length > 0 ? (
                          kbArticles[selectedTopic].map((article, idx) => (
                              <div key={idx} className="kb-article">
                                  <h4>{article.title}</h4>
                                  <p>{article.content}</p>
                              </div>
                          ))
                      ) : (
                          <p>No articles found for this topic.</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* 4. Support Ticket Area */}
      <section className="ticket-area">
         <div className="ticket-area-header">
            <div>
               <h2 className="section-title">Need personal assistance?</h2>
               <p className="section-subtitle">Track your ongoing issues or create a new request if you can't find the answer above.</p>
            </div>
            <button className="btn-create-ticket" onClick={() => document.getElementById('contact-panel').scrollIntoView({behavior: 'smooth'})}>
              Create Support Ticket
            </button>
         </div>
         
         <div className="ticket-status-cards" style={{cursor: 'pointer'}} onClick={() => navigate('/support/tickets')}>
            <div className="ticket-status-card">
               <div className="ts-header">
                  <span className="ts-label open-label"><Activity size={14}/> Open</span>
                  <span className="ts-count">{ticketStats.open}</span>
               </div>
               <p>Tickets awaiting agent review.</p>
            </div>
            <div className="ticket-status-card">
               <div className="ts-header">
                  <span className="ts-label progress-label"><Clock size={14}/> In Progress</span>
                  <span className="ts-count">{ticketStats.inProgress}</span>
               </div>
               <p>Agents are actively working on these.</p>
            </div>
            <div className="ticket-status-card">
               <div className="ts-header">
                  <span className="ts-label resolved-label"><CheckCircle2 size={14}/> Resolved</span>
                  <span className="ts-count">{ticketStats.resolved}</span>
               </div>
               <p>Completed and closed requests.</p>
            </div>
         </div>
      </section>

      {/* 5. Contact Support Panel */}
      <section id="contact-panel" className="contact-panel-section">
         <h2 className="section-title">Contact Support</h2>
         <p className="section-subtitle">Submit a detailed request and our team will get back to you within 24 hours.</p>
         
         <form className="contact-form" onSubmit={handleSubmitTicket}>
            <div className="form-row">
               <div className="form-group flex-2">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="Briefly describe the issue..." 
                    required 
                    className="cmd-input"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
               </div>
               <div className="form-group flex-1">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="cmd-select">
                     <option>General Query</option>
                     <option>Technical Issue</option>
                     <option>Billing & Subscription</option>
                     <option>Feature Request</option>
                  </select>
               </div>
            </div>
            
            <div className="form-group">
               <label>Priority</label>
               <div className="priority-selector">
                  {["Low", "Medium", "High", "Critical"].map(p => (
                     <button type="button" key={p} className={`btn-priority ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                        {p}
                     </button>
                  ))}
               </div>
            </div>

            <div className="form-group">
               <label>Description</label>
               <textarea 
                  placeholder="Please provide as much detail as possible to help us resolve your issue quickly..." 
                  required 
                  className="cmd-textarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               ></textarea>
            </div>

            <div className="form-group">
               <label>Attachment (URL or Reference - Optional)</label>
               <input 
                  type="text" 
                  placeholder="Link to screenshot or document..." 
                  className="cmd-input"
                  value={attachment}
                  onChange={e => setAttachment(e.target.value)}
               />
               <span className="attachment-hint" style={{display: 'inline-block', marginTop: '8px'}}>Since direct file upload is not configured, please provide a URL.</span>
            </div>

            <div className="form-actions">
               <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
               </button>
            </div>
         </form>
      </section>

      <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </motion.div>
  );
};

export default Support;

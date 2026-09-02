import React, { useState, useEffect, useContext } from "react";
import { Search, Plus, Filter, AlertCircle, Clock, CheckCircle2, Activity, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import NewComplaintModal from "../components/NewComplaintModal";
import TicketDetailView from "../components/TicketDetailView";
import "./Support.css";
const Support = () => {
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (user && ['admin', 'manager', 'hr'].includes((user.role || '').toLowerCase())) {
      navigate('/support/admin', {
        replace: true
      });
    }
  }, [user, navigate]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  useEffect(() => {
    fetchTickets();
  }, []);
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      // Assuming this route returns ONLY the user's tickets if they are a regular user (handled in backend)
      setTickets(res.data);
      let open = 0,
        inProgress = 0,
        resolved = 0;
      res.data.forEach(t => {
        if (t.status === 'Open' || t.status === 'Waiting for User') open++;else if (t.status === 'In Progress') inProgress++;else if (t.status === 'Resolved' || t.status === 'Closed') resolved++;
      });
      setStats({
        total: res.data.length,
        open,
        inProgress,
        resolved
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
    }
  };
  const handleTicketCreated = newTicket => {
    fetchTickets(); // refresh list and stats
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'Open':
        return <span className="sd-badge badge-warning">Open</span>;
      case 'In Progress':
        return <span className="sd-badge badge-info">In Progress</span>;
      case 'Waiting for User':
        return <span className="sd-badge badge-alert">Waiting for User</span>;
      case 'Resolved':
      case 'Closed':
        return <span className="sd-badge badge-success">{status}</span>;
      default:
        return <span className="sd-badge">{status}</span>;
    }
  };
  const getPriorityBadge = priority => {
    switch (priority) {
      case 'High':
      case 'Critical':
        return <span className="sd-badge badge-danger">{priority}</span>;
      case 'Medium':
        return <span className="sd-badge badge-warning">Medium</span>;
      default:
        return <span className="sd-badge badge-info">{priority}</span>;
    }
  };

  // Derived State
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  if (selectedTicketId) {
    return <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="service-desk-wrapper">
                <TicketDetailView ticketId={selectedTicketId} onBack={() => {
        setSelectedTicketId(null);
        fetchTickets(); // Refresh to catch status changes
      }} />
            </motion.div>;
  }
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="service-desk-wrapper">
            <PageHeader
              title="Support Center"
              badge="SUPPORT"
              subtitle="Submit, track, and manage support requests and service desk tickets."
            />

            <div className="sd-stats-row">
                <div className="sd-stat-card">
                    <span className="sc-label"><FileText size={14} /> My Complaints</span>
                    <span className="sc-value">{stats.total}</span>
                </div>
                <div className="sd-stat-card">
                    <span className="sc-label"><Activity size={14} /> Open</span>
                    <span className="sc-value text-warning">{stats.open}</span>
                </div>
                <div className="sd-stat-card">
                    <span className="sc-label"><Clock size={14} /> In Progress</span>
                    <span className="sc-value text-info">{stats.inProgress}</span>
                </div>
                <div className="sd-stat-card">
                    <span className="sc-label"><CheckCircle2 size={14} /> Resolved</span>
                    <span className="sc-value text-success">{stats.resolved}</span>
                </div>
            </div>

            <div className="sd-main-section">
                <div className="sd-toolbar">
                    <div className="sd-search">
                        <Search size={16} className="search-icon" />
                        <input type="text" placeholder="Search complaints by ID or subject..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="sd-filters">
                        <div className="filter-group">
                            <Filter size={14} />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting for User">Waiting for User</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <Filter size={14} />
                            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                                <option value="All">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="sd-table-container">
                    <table className="sd-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Subject</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr>
                                    <td colSpan="7" className="text-center" style={{
                padding: '30px'
              }}>Loading complaints...</td>
                                </tr> : filteredTickets.length === 0 ? <tr>
                                    <td colSpan="7" className="text-center" style={{
                padding: '30px',
                color: 'var(--text-muted)'
              }}>
                                        No complaints found. Click "New Complaint" to report an issue.
                                    </td>
                                </tr> : filteredTickets.map(ticket => <tr key={ticket._id || ticket.id}>
                                        <td className="fw-600">{ticket.ticketNumber}</td>
                                        <td className="text-primary truncate" style={{
                maxWidth: '250px'
              }} title={ticket.subject}>
                                            {ticket.subject}
                                        </td>
                                        <td>{ticket.category}</td>
                                        <td>{getPriorityBadge(ticket.priority)}</td>
                                        <td>{getStatusBadge(ticket.status)}</td>
                                        <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-view-ticket" onClick={() => setSelectedTicketId(ticket._id || ticket.id)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewComplaintModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onTicketCreated={handleTicketCreated} />
        </motion.div>;
};
export default Support;
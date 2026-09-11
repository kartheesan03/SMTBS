import React, {
    useState,
    useEffect,
    useContext,
    useMemo,
    useRef,
} from 'react';

import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import {
    Search,
    MessageSquare,
    Send,
    Paperclip,
    AlertCircle,
    ChevronDown,
    X,
    RefreshCw,
    Plus,
    Lock,
    ArrowRight,
    User,
    FileText,
} from 'lucide-react';

import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import NewComplaintModal from '../components/NewComplaintModal';

import './AdminTickets.css';


/* ============================================================
   PILL DROPDOWN
   ============================================================ */

const PillDropdown = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                ref.current &&
                !ref.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            );
        };
    }, []);

    const dotClass = (val) => {
        const map = {
            open: 'open',
            'in-progress': 'in-progress',
            resolved: 'resolved',
            closed: 'closed',
            'waiting-for-user': 'waiting',
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical',
            urgent: 'critical',
        };

        return (
            map[
            (val || '')
                .toLowerCase()
                .replace(/ /g, '-')
            ] || 'low'
        );
    };

    return (
        <div
            className="at-pill-dropdown"
            ref={ref}
        >
            <button
                type="button"
                className="at-pill-btn"
                onClick={() => setOpen((prev) => !prev)}
            >
                <span
                    className={`at-pill-dot ${dotClass(value)}`}
                />

                <span className="at-pill-value">
                    {value}
                </span>

                <ChevronDown size={10} />
            </button>

            {open && (
                <div className="at-dropdown-menu">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className="at-dropdown-item"
                            onClick={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <span
                                className={`at-pill-dot ${dotClass(
                                    option
                                )}`}
                            />

                            <span>{option}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


/* ============================================================
   BADGE HELPERS
   ============================================================ */

const sBadge = (status) =>
({
    Open: 'open',
    'In Progress': 'in-progress',
    'Waiting for User': 'waiting',
    Resolved: 'resolved',
    Closed: 'closed',
}[status] || 'default');

const pBadge = (priority) =>
({
    Critical: 'critical',
    High: 'high',
    Medium: 'medium',
    Low: 'low',
}[priority] || 'default');

const sHeader = (status) =>
({
    Open: 'status-open',
    'In Progress': 'status-in-progress',
    Resolved: 'status-resolved',
    Closed: 'status-closed',
    'Waiting for User': 'status-waiting',
}[status] || '');


/* ============================================================
   HELPERS
   ============================================================ */

const initials = (name) => {
    if (!name) return 'U';

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

const fmt = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString(
        undefined,
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }
    );
};

const fmtT = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleString(
        undefined,
        {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
    );
};


/* ============================================================
   SKELETON
   ============================================================ */

const Skeleton = () => (
    <div className="at-skeleton-container">
        {[1, 2, 3, 4].map((item) => (
            <div
                key={item}
                className="at-skeleton-row"
            >
                <div className="at-skeleton-top">
                    <div className="at-skeleton-line short" />
                    <div className="at-skeleton-line date" />
                </div>

                <div className="at-skeleton-line wide" />

                <div className="at-skeleton-line medium" />

                <div className="at-skeleton-badges">
                    <div className="at-skeleton-badge" />
                    <div className="at-skeleton-badge" />
                </div>
            </div>
        ))}
    </div>
);


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

const AdminTickets = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    /* --------------------------------------------------------
       STATE
       -------------------------------------------------------- */

    const [tickets, setTickets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [selectedTicket, setSelectedTicket] =
        useState(null);

    const [messages, setMessages] = useState([]);

    const [detailLoading, setDetailLoading] =
        useState(false);

    const [searchQuery, setSearchQuery] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('All');

    const [priorityFilter, setPriorityFilter] =
        useState('All');

    const [categoryFilter, setCategoryFilter] =
        useState('All');

    const [isNewTicketOpen, setIsNewTicketOpen] =
        useState(false);

    const [replyText, setReplyText] =
        useState('');

    const [isNote, setIsNote] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [activeTab, setActiveTab] =
        useState('conversation');

    const [attachedFile, setAttachedFile] =
        useState(null);

    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);


    /* ========================================================
       STATISTICS
       ======================================================== */

    const stats = useMemo(
        () => ({
            total: tickets.length,

            open: tickets.filter(
                (ticket) =>
                    ticket.status === 'Open' ||
                    ticket.status === 'Waiting for User'
            ).length,

            inProgress: tickets.filter(
                (ticket) =>
                    ticket.status === 'In Progress'
            ).length,

            resolved: tickets.filter(
                (ticket) =>
                    ticket.status === 'Resolved' ||
                    ticket.status === 'Closed'
            ).length,

            critical: tickets.filter(
                (ticket) =>
                    ticket.priority === 'Critical'
            ).length,
        }),
        [tickets]
    );


    /* ========================================================
       CATEGORIES
       ======================================================== */

    const categories = useMemo(
        () =>
            [
                ...new Set(
                    tickets
                        .map((ticket) => ticket.category)
                        .filter(Boolean)
                ),
            ],
        [tickets]
    );


    /* ========================================================
       FETCH TICKETS
       ======================================================== */

    const fetchTickets = async () => {
        setLoading(true);
        setLoadError(false);

        try {
            const response = await api.get('/tickets');

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setTickets(data);
        } catch (error) {
            console.error(
                'Failed to load tickets:',
                error
            );

            setLoadError(true);

            toast.error(
                'Unable to load tickets'
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTickets();
    }, []);


    /* ========================================================
       SELECT TICKET
       ======================================================== */

    const selectTicket = async (ticket) => {
        const ticketId =
            ticket?._id || ticket?.id;

        if (!ticketId) return;

        setSelectedTicket(ticket);
        setActiveTab('conversation');
        setDetailLoading(true);
        setMessages([]);

        try {
            const response =
                await api.get(
                    `/tickets/${ticketId}`
                );

            setMessages(
                Array.isArray(
                    response.data?.messages
                )
                    ? response.data.messages
                    : []
            );
        } catch (error) {
            console.error(
                'Failed to load ticket details:',
                error
            );

            toast.error(
                'Unable to load ticket details'
            );
        } finally {
            setDetailLoading(false);
        }
    };


    /* ========================================================
       AUTO SCROLL
       ======================================================== */

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({
                behavior: 'smooth',
            });
        }
    }, [messages]);


    /* ========================================================
       UPDATE STATUS
       ======================================================== */

    const updateStatus = async (newStatus) => {
        if (!selectedTicket) return;

        const ticketId =
            selectedTicket._id ||
            selectedTicket.id;

        const previousTicket = {
            ...selectedTicket,
        };

        const updatedTicket = {
            ...selectedTicket,
            status: newStatus,
        };

        setSelectedTicket(updatedTicket);

        setTickets((currentTickets) =>
            currentTickets.map((ticket) => {
                const id =
                    ticket._id || ticket.id;

                return id === ticketId
                    ? {
                        ...ticket,
                        status: newStatus,
                    }
                    : ticket;
            })
        );

        try {
            await api.put(
                `/tickets/${ticketId}`,
                {
                    status: newStatus,
                }
            );

            toast.success(
                `Status → ${newStatus}`
            );
        } catch (error) {
            console.error(
                'Status update failed:',
                error
            );

            setSelectedTicket(
                previousTicket
            );

            setTickets((currentTickets) =>
                currentTickets.map((ticket) => {
                    const id =
                        ticket._id ||
                        ticket.id;

                    return id === ticketId
                        ? previousTicket
                        : ticket;
                })
            );

            toast.error(
                'Failed to update status'
            );
        }
    };


    /* ========================================================
       UPDATE PRIORITY
       ======================================================== */

    const updatePriority = async (
        newPriority
    ) => {
        if (!selectedTicket) return;

        const ticketId =
            selectedTicket._id ||
            selectedTicket.id;

        const previousTicket = {
            ...selectedTicket,
        };

        const updatedTicket = {
            ...selectedTicket,
            priority: newPriority,
        };

        setSelectedTicket(updatedTicket);

        setTickets((currentTickets) =>
            currentTickets.map((ticket) => {
                const id =
                    ticket._id || ticket.id;

                return id === ticketId
                    ? {
                        ...ticket,
                        priority: newPriority,
                    }
                    : ticket;
            })
        );

        try {
            await api.put(
                `/tickets/${ticketId}`,
                {
                    priority: newPriority,
                }
            );

            toast.success(
                `Priority → ${newPriority}`
            );
        } catch (error) {
            console.error(
                'Priority update failed:',
                error
            );

            setSelectedTicket(
                previousTicket
            );

            setTickets((currentTickets) =>
                currentTickets.map((ticket) => {
                    const id =
                        ticket._id ||
                        ticket.id;

                    return id === ticketId
                        ? previousTicket
                        : ticket;
                })
            );

            toast.error(
                'Failed to update priority'
            );
        }
    };


    /* ========================================================
       ATTACHMENT
       ======================================================== */

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            toast.error(
                'File must be under 5 MB'
            );

            event.target.value = '';
            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {
            setAttachedFile({
                name: file.name,
                dataUrl: reader.result,
            });
        };

        reader.onerror = () => {
            toast.error(
                'Unable to read attachment'
            );
        };

        reader.readAsDataURL(file);

        event.target.value = '';
    };


    /* ========================================================
       SEND MESSAGE
       ======================================================== */

    const handleSend = async (event) => {
        event.preventDefault();

        if (
            !replyText.trim() ||
            !selectedTicket ||
            sending
        ) {
            return;
        }

        const ticketId =
            selectedTicket._id ||
            selectedTicket.id;

        setSending(true);

        try {
            const response =
                await api.post(
                    `/tickets/${ticketId}/messages`,
                    {
                        message:
                            replyText.trim(),

                        isInternal: isNote,

                        attachment:
                            attachedFile?.dataUrl ||
                            null,
                    }
                );

            if (response.data) {
                setMessages(
                    (currentMessages) => [
                        ...currentMessages,
                        response.data,
                    ]
                );
            }

            setReplyText('');
            setAttachedFile(null);

            toast.success(
                isNote
                    ? 'Internal note saved'
                    : 'Reply sent'
            );

            if (
                !isNote &&
                selectedTicket.status === 'Open'
            ) {
                await updateStatus(
                    'In Progress'
                );
            }
        } catch (error) {
            console.error(
                'Message send failed:',
                error
            );

            toast.error(
                'Failed to send message'
            );
        } finally {
            setSending(false);
        }
    };


    /* ========================================================
       FILTER TICKETS
       ======================================================== */

    const filteredTickets = useMemo(() => {
        const query =
            searchQuery
                .trim()
                .toLowerCase();

        return tickets
            .filter((ticket) => {
                const ticketNumber =
                    String(
                        ticket.ticketNumber ||
                        ''
                    ).toLowerCase();

                const subject =
                    String(
                        ticket.subject ||
                        ''
                    ).toLowerCase();

                const submittedBy =
                    String(
                        ticket.submittedBy
                            ?.name ||
                        ''
                    ).toLowerCase();

                const matchesSearch =
                    !query ||
                    ticketNumber.includes(
                        query
                    ) ||
                    subject.includes(query) ||
                    submittedBy.includes(query);

                const matchesStatus =
                    statusFilter === 'All' ||
                    ticket.status ===
                    statusFilter;

                const matchesPriority =
                    priorityFilter === 'All' ||
                    ticket.priority ===
                    priorityFilter;

                const matchesCategory =
                    categoryFilter === 'All' ||
                    ticket.category ===
                    categoryFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority &&
                    matchesCategory
                );
            })
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            );
    }, [
        tickets,
        searchQuery,
        statusFilter,
        priorityFilter,
        categoryFilter,
    ]);


    /* ========================================================
       FILTER HELPERS
       ======================================================== */

    const filtersActive =
        Boolean(searchQuery) ||
        statusFilter !== 'All' ||
        priorityFilter !== 'All' ||
        categoryFilter !== 'All';

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setPriorityFilter('All');
        setCategoryFilter('All');
    };


    const selectedTicketId =
        selectedTicket?._id ||
        selectedTicket?.id;


    /* ========================================================
       RENDER
       ======================================================== */

    return (
        <div className="rd-container page-container at-page-container">

            <div className="rd-content at-page">

                {/* ==================================================
                    HEADER + STATISTICS
                   ================================================== */}

                <section className="at-top-area">

                    <PageHeader
                        title="Support Management"
                        badge="ADMIN"
                        subtitle="Centralized dashboard to manage all user complaints and requests."
                        actions={[
                            {
                                label: 'Create Ticket',
                                icon: Plus,
                                primary: true,
                                onClick: () =>
                                    setIsNewTicketOpen(
                                        true
                                    ),
                            },
                        ]}
                    />

                    <div className="at-stats-row">

                        <div className="at-stat">
                            <strong>
                                {stats.total}
                            </strong>
                            <span>
                                Total
                            </span>
                        </div>

                        <div className="at-stat">
                            <strong>
                                {stats.open}
                            </strong>
                            <span>
                                Open
                            </span>
                        </div>

                        <div className="at-stat">
                            <strong>
                                {stats.inProgress}
                            </strong>
                            <span>
                                In Progress
                            </span>
                        </div>

                        <div className="at-stat">
                            <strong>
                                {stats.resolved}
                            </strong>
                            <span>
                                Resolved
                            </span>
                        </div>

                    </div>

                </section>


                {/* ==================================================
                    MAIN TWO-PANEL WORKSPACE
                   ================================================== */}

                <section className="at-workspace">

                    {/* =================================================
                        LEFT - TICKET LIST
                       ================================================= */}

                    <aside className="at-list-panel">

                        {/* Toolbar */}

                        <div className="at-list-toolbar">

                            <div className="at-toolbar-title-row">

                                <h2 className="at-toolbar-title">
                                    Tickets
                                </h2>

                                <span className="at-toolbar-count">
                                    {loading
                                        ? '…'
                                        : filteredTickets.length}
                                </span>

                            </div>


                            {/* Search */}

                            <div className="at-search-wrap">

                                <span className="at-search-icon">
                                    <Search size={14} />
                                </span>

                                <input
                                    className="at-search-input"
                                    type="text"
                                    placeholder="Search tickets, ID or user..."
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* Filters */}

                            <div className="at-filters-row">

                                <select
                                    className="at-filter-select"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        Status: All
                                    </option>

                                    <option>
                                        Open
                                    </option>

                                    <option>
                                        In Progress
                                    </option>

                                    <option>
                                        Waiting for User
                                    </option>

                                    <option>
                                        Resolved
                                    </option>

                                    <option>
                                        Closed
                                    </option>
                                </select>


                                <select
                                    className="at-filter-select"
                                    value={priorityFilter}
                                    onChange={(event) =>
                                        setPriorityFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        Priority: All
                                    </option>

                                    <option>
                                        Low
                                    </option>

                                    <option>
                                        Medium
                                    </option>

                                    <option>
                                        High
                                    </option>

                                    <option>
                                        Critical
                                    </option>
                                </select>


                                {categories.length >
                                    0 && (
                                        <select
                                            className="at-filter-select"
                                            value={
                                                categoryFilter
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setCategoryFilter(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="All">
                                                Category: All
                                            </option>

                                            {categories.map(
                                                (
                                                    category
                                                ) => (
                                                    <option
                                                        key={
                                                            category
                                                        }
                                                    >
                                                        {
                                                            category
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    )}


                                {filtersActive && (
                                    <button
                                        type="button"
                                        className="at-clear-btn"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        <X size={11} />
                                        Clear
                                    </button>
                                )}

                            </div>

                        </div>


                        {/* Count */}

                        <div className="at-ticket-count">
                            {loading
                                ? 'Loading…'
                                : `${filteredTickets.length} ticket${filteredTickets.length !== 1
                                    ? 's'
                                    : ''
                                }`}
                        </div>


                        {/* Ticket list */}

                        <div className="at-ticket-list">

                            {loading ? (
                                <Skeleton />
                            ) : loadError ? (

                                <div className="at-list-state">

                                    <div className="at-list-state-icon">
                                        <AlertCircle
                                            size={26}
                                        />
                                    </div>

                                    <p className="at-list-state-title">
                                        Could not load tickets
                                    </p>

                                    <p className="at-list-state-sub">
                                        Check your connection
                                        and try again.
                                    </p>

                                    <button
                                        type="button"
                                        className="at-retry-btn"
                                        onClick={
                                            fetchTickets
                                        }
                                    >
                                        <RefreshCw
                                            size={12}
                                        />
                                        Retry
                                    </button>

                                </div>

                            ) : filteredTickets.length ===
                                0 ? (

                                <div className="at-list-state">

                                    <div className="at-list-state-icon">
                                        <Search size={24} />
                                    </div>

                                    <p className="at-list-state-title">
                                        No tickets found
                                    </p>

                                    <p className="at-list-state-sub">
                                        Try adjusting search
                                        or filter criteria.
                                    </p>

                                </div>

                            ) : (

                                filteredTickets.map(
                                    (ticket) => {
                                        const ticketId =
                                            ticket._id ||
                                            ticket.id;

                                        const active =
                                            ticketId ===
                                            selectedTicketId;

                                        return (
                                            <button
                                                type="button"
                                                key={ticketId}
                                                className={`at-ticket-row${active
                                                    ? ' active'
                                                    : ''
                                                    }`}
                                                onClick={() =>
                                                    selectTicket(
                                                        ticket
                                                    )
                                                }
                                            >

                                                <div className="at-ticket-row-top">

                                                    <span className="at-ticket-id">
                                                        {ticket.ticketNumber ||
                                                            `#${String(
                                                                ticketId ||
                                                                ''
                                                            ).slice(
                                                                -6
                                                            )}`}
                                                    </span>

                                                    <span className="at-ticket-date">
                                                        {fmt(
                                                            ticket.createdAt
                                                        )}
                                                    </span>

                                                </div>


                                                <p
                                                    className="at-ticket-subject"
                                                    title={
                                                        ticket.subject
                                                    }
                                                >
                                                    {ticket.subject ||
                                                        'Untitled ticket'}
                                                </p>


                                                <div className="at-ticket-user">
                                                    <User
                                                        size={11}
                                                    />

                                                    {ticket
                                                        .submittedBy
                                                        ?.name ||
                                                        'Unknown User'}
                                                </div>


                                                <div className="at-ticket-badges">

                                                    <span
                                                        className={`at-badge ${sBadge(
                                                            ticket.status
                                                        )}`}
                                                    >
                                                        {
                                                            ticket.status
                                                        }
                                                    </span>

                                                    <span
                                                        className={`at-badge ${pBadge(
                                                            ticket.priority
                                                        )}`}
                                                    >
                                                        {
                                                            ticket.priority
                                                        }
                                                    </span>

                                                </div>

                                            </button>
                                        );
                                    }
                                )
                            )}

                        </div>

                    </aside>


                    {/* =================================================
                        RIGHT - DETAIL PANEL
                       ================================================= */}

                    <main className="at-detail-panel">

                        {!selectedTicket ? (

                            <div className="at-empty-state">

                                <div className="at-empty-icon-wrap">
                                    <MessageSquare
                                        size={30}
                                    />
                                </div>

                                <h3 className="at-empty-title">
                                    Select a ticket
                                </h3>

                                <p className="at-empty-subtitle">
                                    Choose a ticket from
                                    the left panel to
                                    view its details,
                                    conversation, and
                                    available actions.
                                </p>

                                <span className="at-empty-hint">
                                    <ArrowRight
                                        size={12}
                                    />

                                    Select a ticket from
                                    the left panel to get
                                    started
                                </span>

                            </div>

                        ) : (

                            <>

                                {/* ======================================
                                    DETAIL HEADER
                                   ====================================== */}

                                <div
                                    className={`at-detail-header ${sHeader(
                                        selectedTicket.status
                                    )}`}
                                >

                                    <div className="at-detail-header-top">

                                        <div className="at-detail-header-left">

                                            <h2 className="at-detail-subject">
                                                {
                                                    selectedTicket.subject
                                                }
                                            </h2>

                                            <div className="at-detail-meta-row">

                                                <strong>
                                                    {
                                                        selectedTicket.ticketNumber
                                                    }
                                                </strong>

                                                {selectedTicket.category && (
                                                    <>
                                                        <span className="at-meta-sep">
                                                            ·
                                                        </span>

                                                        {
                                                            selectedTicket.category
                                                        }
                                                    </>
                                                )}

                                                <span className="at-meta-sep">
                                                    ·
                                                </span>

                                                {fmtT(
                                                    selectedTicket.createdAt
                                                )}

                                            </div>


                                            <div className="at-detail-submitter">

                                                <div className="at-submitter-avatar">
                                                    {initials(
                                                        selectedTicket
                                                            .submittedBy
                                                            ?.name
                                                    )}
                                                </div>

                                                <div className="at-submitter-info">

                                                    <span className="at-submitter-name">
                                                        {selectedTicket
                                                            .submittedBy
                                                            ?.name ||
                                                            'Unknown'}
                                                    </span>

                                                    <span className="at-submitter-sep">
                                                        ·
                                                    </span>

                                                    <span className="at-submitter-role">
                                                        {selectedTicket
                                                            .submittedBy
                                                            ?.role ||
                                                            'User'}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="at-detail-actions">

                                            <PillDropdown
                                                value={
                                                    selectedTicket.status
                                                }
                                                options={[
                                                    'Open',
                                                    'In Progress',
                                                    'Waiting for User',
                                                    'Resolved',
                                                    'Closed',
                                                ]}
                                                onChange={
                                                    updateStatus
                                                }
                                            />

                                            <PillDropdown
                                                value={
                                                    selectedTicket.priority
                                                }
                                                options={[
                                                    'Low',
                                                    'Medium',
                                                    'High',
                                                    'Critical',
                                                ]}
                                                onChange={
                                                    updatePriority
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* ======================================
                                    TABS
                                   ====================================== */}

                                <div className="at-tabs">

                                    {[
                                        'conversation',
                                        'details',
                                        'attachments',
                                        'history',
                                    ].map(
                                        (tab) => (
                                            <button
                                                type="button"
                                                key={tab}
                                                className={`at-tab${activeTab ===
                                                    tab
                                                    ? ' active'
                                                    : ''
                                                    }`}
                                                onClick={() =>
                                                    setActiveTab(
                                                        tab
                                                    )
                                                }
                                            >
                                                {tab
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase() +
                                                    tab.slice(
                                                        1
                                                    )}
                                            </button>
                                        )
                                    )}

                                </div>


                                {/* ======================================
                                    CONVERSATION
                                   ====================================== */}

                                {activeTab ===
                                    'conversation' && (
                                        <div className="at-conversation-area">

                                            <div className="at-conversation">

                                                {detailLoading ? (

                                                    <div className="at-conv-loading">
                                                        <div className="at-spinner" />
                                                        Loading
                                                        conversation…
                                                    </div>

                                                ) : (

                                                    <>

                                                        {/* Original issue */}

                                                        <div className="at-message from-user">

                                                            <div className="at-msg-avatar user-avatar">
                                                                {initials(
                                                                    selectedTicket
                                                                        .submittedBy
                                                                        ?.name
                                                                )}
                                                            </div>

                                                            <div className="at-msg-bubble user-bubble">

                                                                <div className="at-msg-header">

                                                                    <div className="at-msg-sender">

                                                                        <span className="at-msg-name">
                                                                            {selectedTicket
                                                                                .submittedBy
                                                                                ?.name ||
                                                                                'User'}
                                                                        </span>

                                                                        <span className="at-msg-role">
                                                                            {selectedTicket
                                                                                .submittedBy
                                                                                ?.role ||
                                                                                'User'}
                                                                        </span>

                                                                    </div>

                                                                    <span className="at-msg-time">
                                                                        {fmtT(
                                                                            selectedTicket.createdAt
                                                                        )}
                                                                    </span>

                                                                </div>

                                                                <div className="at-msg-body">
                                                                    {selectedTicket.description ||
                                                                        'No description provided.'}
                                                                </div>

                                                                {selectedTicket.attachment && (
                                                                    <div className="at-msg-attachment">

                                                                        <Paperclip
                                                                            size={
                                                                                12
                                                                            }
                                                                        />

                                                                        <a
                                                                            href={
                                                                                selectedTicket.attachment
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                        >
                                                                            View Attachment
                                                                        </a>

                                                                    </div>
                                                                )}

                                                            </div>

                                                        </div>


                                                        {/* Replies */}

                                                        {messages.map(
                                                            (
                                                                message,
                                                                index
                                                            ) => {

                                                                const isAdmin =
                                                                    [
                                                                        'Admin',
                                                                        'Manager',
                                                                        'HR',
                                                                        'admin',
                                                                        'manager',
                                                                        'hr',
                                                                    ].includes(
                                                                        message
                                                                            .sender
                                                                            ?.role
                                                                    );

                                                                const messageClass =
                                                                    message.isInternal
                                                                        ? 'internal'
                                                                        : isAdmin
                                                                            ? 'from-admin'
                                                                            : 'from-user';

                                                                const bubbleClass =
                                                                    message.isInternal
                                                                        ? 'note-bubble'
                                                                        : isAdmin
                                                                            ? 'admin-bubble'
                                                                            : 'user-bubble';

                                                                const avatarClass =
                                                                    message.isInternal
                                                                        ? 'note-avatar'
                                                                        : isAdmin
                                                                            ? 'admin-avatar'
                                                                            : 'user-avatar';

                                                                const roleClass =
                                                                    message.isInternal
                                                                        ? 'note-role'
                                                                        : isAdmin
                                                                            ? 'admin-role'
                                                                            : '';

                                                                return (
                                                                    <div
                                                                        key={
                                                                            message._id ||
                                                                            message.id ||
                                                                            index
                                                                        }
                                                                        className={`at-message ${messageClass}`}
                                                                    >

                                                                        <div
                                                                            className={`at-msg-avatar ${avatarClass}`}
                                                                        >
                                                                            {initials(
                                                                                message
                                                                                    .sender
                                                                                    ?.name
                                                                            )}
                                                                        </div>

                                                                        <div
                                                                            className={`at-msg-bubble ${bubbleClass}`}
                                                                        >

                                                                            {message.isInternal && (
                                                                                <div className="at-internal-label">
                                                                                    <Lock
                                                                                        size={
                                                                                            8
                                                                                        }
                                                                                    />
                                                                                    Internal
                                                                                    Note
                                                                                </div>
                                                                            )}

                                                                            <div className="at-msg-header">

                                                                                <div className="at-msg-sender">

                                                                                    <span className="at-msg-name">
                                                                                        {message
                                                                                            .sender
                                                                                            ?.name ||
                                                                                            'Unknown'}
                                                                                    </span>

                                                                                    <span
                                                                                        className={`at-msg-role ${roleClass}`}
                                                                                    >
                                                                                        {message.isInternal
                                                                                            ? 'Internal'
                                                                                            : message
                                                                                                .sender
                                                                                                ?.role ||
                                                                                            'User'}
                                                                                    </span>

                                                                                </div>

                                                                                <span className="at-msg-time">
                                                                                    {fmtT(
                                                                                        message.createdAt
                                                                                    )}
                                                                                </span>

                                                                            </div>

                                                                            <div className="at-msg-body">
                                                                                {
                                                                                    message.message
                                                                                }
                                                                            </div>

                                                                            {message.attachment && (
                                                                                <div className="at-msg-attachment">

                                                                                    <Paperclip
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                    />

                                                                                    <a
                                                                                        href={
                                                                                            message.attachment
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                    >
                                                                                        View Attachment
                                                                                    </a>

                                                                                </div>
                                                                            )}

                                                                        </div>

                                                                    </div>
                                                                );
                                                            }
                                                        )}

                                                        <div
                                                            ref={
                                                                bottomRef
                                                            }
                                                        />

                                                    </>
                                                )}

                                            </div>


                                            {/* Composer */}

                                            <form
                                                className="at-composer"
                                                onSubmit={
                                                    handleSend
                                                }
                                            >

                                                <div className="at-composer-tabs">

                                                    <button
                                                        type="button"
                                                        className={`at-composer-tab${!isNote
                                                            ? ' active'
                                                            : ''
                                                            }`}
                                                        onClick={() =>
                                                            setIsNote(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        Reply to User
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`at-composer-tab${isNote
                                                            ? ' note-active'
                                                            : ''
                                                            }`}
                                                        onClick={() =>
                                                            setIsNote(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <Lock
                                                            size={
                                                                10
                                                            }
                                                        />

                                                        Internal Note
                                                    </button>

                                                </div>


                                                <div
                                                    className={`at-composer-body${isNote
                                                        ? ' is-note'
                                                        : ''
                                                        }`}
                                                >

                                                    {isNote && (
                                                        <div className="at-note-hint">
                                                            <Lock
                                                                size={
                                                                    10
                                                                }
                                                            />
                                                            Only admins
                                                            can see this
                                                            note
                                                        </div>
                                                    )}


                                                    <textarea
                                                        className="at-composer-field"
                                                        placeholder={
                                                            isNote
                                                                ? 'Add a private note for your team…'
                                                                : 'Write your message here…'
                                                        }
                                                        value={
                                                            replyText
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setReplyText(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />


                                                    <div className="at-composer-actions">

                                                        <div className="at-composer-left">

                                                            <input
                                                                ref={
                                                                    fileInputRef
                                                                }
                                                                type="file"
                                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                                hidden
                                                                onChange={
                                                                    handleFileChange
                                                                }
                                                            />


                                                            <button
                                                                type="button"
                                                                className={`at-icon-btn${attachedFile
                                                                    ? ' has-attachment'
                                                                    : ''
                                                                    }`}
                                                                title="Attach file"
                                                                onClick={() =>
                                                                    fileInputRef.current?.click()
                                                                }
                                                            >
                                                                <Paperclip
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </button>


                                                            {attachedFile && (
                                                                <div className="at-file-chip">

                                                                    <FileText
                                                                        size={
                                                                            10
                                                                        }
                                                                    />

                                                                    <span
                                                                        className="at-file-chip-name"
                                                                        title={
                                                                            attachedFile.name
                                                                        }
                                                                    >
                                                                        {
                                                                            attachedFile.name
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        className="at-file-chip-remove"
                                                                        title="Remove attachment"
                                                                        onClick={() =>
                                                                            setAttachedFile(
                                                                                null
                                                                            )
                                                                        }
                                                                    >
                                                                        <X
                                                                            size={
                                                                                9
                                                                            }
                                                                        />
                                                                    </button>

                                                                </div>
                                                            )}

                                                        </div>


                                                        <button
                                                            type="submit"
                                                            className={`at-send-btn${isNote
                                                                ? ' note-btn'
                                                                : ''
                                                                }`}
                                                            disabled={
                                                                !replyText.trim() ||
                                                                sending
                                                            }
                                                        >
                                                            {sending ? (
                                                                <>
                                                                    <RefreshCw
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="at-spin-icon"
                                                                    />
                                                                    Sending…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send
                                                                        size={
                                                                            12
                                                                        }
                                                                    />

                                                                    {isNote
                                                                        ? 'Save Note'
                                                                        : 'Send Reply'}
                                                                </>
                                                            )}
                                                        </button>

                                                    </div>

                                                </div>

                                            </form>

                                        </div>
                                    )}


                                {/* ======================================
                                    DETAILS
                                   ====================================== */}

                                {activeTab ===
                                    'details' && (
                                        <div className="at-details-tab">

                                            <p className="at-info-section-title">
                                                Ticket Information
                                            </p>

                                            <div className="at-info-grid">

                                                {[
                                                    {
                                                        label: 'Ticket ID',
                                                        value:
                                                            selectedTicket.ticketNumber ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Category',
                                                        value:
                                                            selectedTicket.category ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Submitted By',
                                                        value:
                                                            selectedTicket
                                                                .submittedBy
                                                                ?.name ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Role',
                                                        value:
                                                            selectedTicket
                                                                .submittedBy
                                                                ?.role ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Department',
                                                        value:
                                                            selectedTicket
                                                                .submittedBy
                                                                ?.department ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Assigned To',
                                                        value:
                                                            selectedTicket
                                                                .assignedTo
                                                                ?.name ||
                                                            'Unassigned',
                                                    },
                                                    {
                                                        label: 'Status',
                                                        value:
                                                            selectedTicket.status ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Priority',
                                                        value:
                                                            selectedTicket.priority ||
                                                            '—',
                                                    },
                                                    {
                                                        label: 'Created',
                                                        value:
                                                            fmtT(
                                                                selectedTicket.createdAt
                                                            ),
                                                    },
                                                    {
                                                        label: 'Last Updated',
                                                        value:
                                                            fmtT(
                                                                selectedTicket.updatedAt
                                                            ),
                                                    },
                                                ].map(
                                                    ({
                                                        label,
                                                        value,
                                                    }) => (
                                                        <div
                                                            key={
                                                                label
                                                            }
                                                            className="at-info-item"
                                                        >

                                                            <span className="at-info-label">
                                                                {
                                                                    label
                                                                }
                                                            </span>

                                                            <span className="at-info-value">
                                                                {
                                                                    value
                                                                }
                                                            </span>

                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </div>
                                    )}


                                {/* ======================================
                                    ATTACHMENTS
                                   ====================================== */}

                                {activeTab ===
                                    'attachments' && (
                                        <div className="at-attachments-tab">

                                            <p className="at-info-section-title">
                                                Attachments
                                            </p>

                                            {selectedTicket.attachment ? (

                                                <div className="at-attachment-row">

                                                    <div className="at-attachment-icon">
                                                        <FileText
                                                            size={
                                                                20
                                                            }
                                                        />
                                                    </div>

                                                    <div className="at-attachment-info">

                                                        <div className="at-attachment-name">
                                                            Ticket Attachment
                                                        </div>

                                                        <a
                                                            className="at-attachment-link"
                                                            href={
                                                                selectedTicket.attachment
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            View file
                                                        </a>

                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="at-list-state">

                                                    <div className="at-list-state-icon">
                                                        <Paperclip
                                                            size={
                                                                26
                                                            }
                                                        />
                                                    </div>

                                                    <p className="at-list-state-title">
                                                        No attachments
                                                    </p>

                                                    <p className="at-list-state-sub">
                                                        No files have
                                                        been attached
                                                        to this ticket.
                                                    </p>

                                                </div>
                                            )}

                                        </div>
                                    )}


                                {/* ======================================
                                    HISTORY
                                   ====================================== */}

                                {activeTab ===
                                    'history' && (
                                        <div className="at-history-tab">

                                            <p className="at-info-section-title">
                                                Activity Timeline
                                            </p>


                                            <div className="at-history-event">

                                                <div className="at-history-dot" />

                                                <div className="at-history-body">

                                                    <div className="at-history-label">
                                                        Ticket created by{' '}
                                                        {selectedTicket
                                                            .submittedBy
                                                            ?.name ||
                                                            'Unknown'}
                                                    </div>

                                                    <div className="at-history-time">
                                                        {fmtT(
                                                            selectedTicket.createdAt
                                                        )}
                                                    </div>

                                                </div>

                                            </div>


                                            {messages.length >
                                                0 &&
                                                messages.map(
                                                    (
                                                        message,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={
                                                                message._id ||
                                                                message.id ||
                                                                index
                                                            }
                                                            className="at-history-event"
                                                        >

                                                            <div
                                                                className={`at-history-dot ${message.isInternal
                                                                    ? 'internal'
                                                                    : 'reply'
                                                                    }`}
                                                            />

                                                            <div className="at-history-body">

                                                                <div className="at-history-label">
                                                                    {message.isInternal
                                                                        ? `Internal note added by ${message.sender?.name ||
                                                                        'Admin'
                                                                        }`
                                                                        : `Reply from ${message.sender?.name ||
                                                                        'Unknown'
                                                                        }`}
                                                                </div>

                                                                <div className="at-history-time">
                                                                    {fmtT(
                                                                        message.createdAt
                                                                    )}
                                                                </div>

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                        </div>
                                    )}

                            </>

                        )}

                    </main>

                </section>

            </div>


            {/* ======================================================
                CREATE TICKET MODAL
               ====================================================== */}

            <NewComplaintModal
                isOpen={
                    isNewTicketOpen
                }
                onClose={() =>
                    setIsNewTicketOpen(
                        false
                    )
                }
                onTicketCreated={
                    fetchTickets
                }
            />

        </div>
    );
};


export default AdminTickets;
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, User, FileText, X } from 'lucide-react';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';

import '../components/AdminDashboard/AdminDashboardRedesign.css';

const TaskCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const { data } = await API.get('/tasks');
            setTasks(data);
        } catch (err) {
            console.error("Failed to load tasks", err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const getEventsForDay = (day) => {
        const events = tasks.filter(t => {
            if (!t.dueDate) return false;
            const tDate = new Date(t.dueDate);
            return tDate.getDate() === day && tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
        });
        
        return events.map(t => {
            let color = '#4f46e5'; let bg = '#e0e7ff'; // Medium
            if (t.priority === 'High') { color = '#ef4444'; bg = '#fee2e2'; }
            if (t.priority === 'Low') { color = '#10b981'; bg = '#d1fae5'; }
            
            return {
                title: t.title,
                time: new Date(t.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                color,
                bg
            };
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        priority: 'Medium'
    });

    const handleNewEventClick = () => {
        setIsModalOpen(true);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskForm.title) return;
        
        // Combine date and time into a single Date object for dueDate
        const dueDate = new Date(`${newTaskForm.date}T${newTaskForm.time}`);
        
        try {
            await API.post('/tasks', { 
                title: newTaskForm.title, 
                dueDate, 
                priority: newTaskForm.priority, 
                isBroadcast: true 
            });
            setIsModalOpen(false);
            setNewTaskForm({ title: '', date: new Date().toISOString().split('T')[0], time: '12:00', priority: 'Medium' });
            fetchTasks();
        } catch(err) {
            alert("Failed to create task: " + (err.response?.data?.message || err.message));
        }
    };

    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} className="calendar-day empty"></div>);
    
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayEvents = getEventsForDay(day);
        
        return (
            <div key={`day-${day}`} className={`calendar-day ${isToday(day) ? 'today' : ''}`}>
                <div className="day-number">{day}</div>
                <div className="events-container">
                    {dayEvents.map((ev, idx) => (
                        <div key={idx} className="event-badge" style={{ backgroundColor: ev.bg, color: ev.color }}>
                            {ev.time} - {ev.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    const totalSlots = [...blanks, ...daysInMonthArray];

    return (
        <div className="content-area" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <PageHeader title="Task Calendar" badge="TASKS" subtitle="Schedule and manage your upcoming events and tasks." />
                        <button onClick={handleNewEventClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                            <Plus size={16} /> New Event
                        </button>
                    </div>

                    <div className="dashboard-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={prevMonth} style={{ padding: 8, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronLeft size={20} color="#475569" />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                                    Today
                                </button>
                                <button onClick={nextMonth} style={{ padding: 8, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight size={20} color="#475569" />
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {dayNames.map(day => (
                                <div key={day} className="calendar-header-day">{day}</div>
                            ))}
                            {totalSlots}
                        </div>
                    </div>

                    <style>{`
                        .calendar-grid {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                            border-top: 1px solid #e2e8f0;
                            border-left: 1px solid #e2e8f0;
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        .calendar-header-day {
                            padding: 12px;
                            text-align: center;
                            font-weight: 600;
                            color: #64748b;
                            font-size: 13px;
                            border-right: 1px solid #e2e8f0;
                            border-bottom: 1px solid #e2e8f0;
                            background: #f8fafc;
                        }
                        .calendar-day {
                            min-height: 120px;
                            padding: 8px;
                            border-right: 1px solid #e2e8f0;
                            border-bottom: 1px solid #e2e8f0;
                            background: white;
                            transition: background-color 0.2s;
                        }
                        .calendar-day:hover:not(.empty) {
                            background-color: #f8fafc;
                        }
                        .calendar-day.empty {
                            background-color: #f8fafc;
                        }
                        .day-number {
                            font-weight: 600;
                            color: #475569;
                            font-size: 14px;
                            margin-bottom: 8px;
                            width: 28px;
                            height: 28px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                        }
                        .calendar-day.today .day-number {
                            background-color: #3b82f6;
                            color: white;
                        }
                        .events-container {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                        }
                        .event-badge {
                            font-size: 11px;
                            padding: 4px 6px;
                            border-radius: 4px;
                            font-weight: 600;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            cursor: pointer;
                        }
                        .event-badge:hover {
                            opacity: 0.9;
                        }
                    `}</style>

            {/* Modal Overlay for New Event */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Create New Event</h3>
                            <X size={20} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Event Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newTaskForm.title}
                                    onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    placeholder="Enter event title"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={newTaskForm.date}
                                        onChange={(e) => setNewTaskForm({...newTaskForm, date: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={newTaskForm.time}
                                        onChange={(e) => setNewTaskForm({...newTaskForm, time: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Priority (Controls Color)</label>
                                <select 
                                    value={newTaskForm.priority}
                                    onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}
                                >
                                    <option value="High">High (Red)</option>
                                    <option value="Medium">Medium (Blue)</option>
                                    <option value="Low">Low (Green)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCalendar;

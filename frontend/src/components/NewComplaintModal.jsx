import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NewComplaintModal = ({ isOpen, onClose, onTicketCreated }) => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Login & Access');
    const [priority, setPriority] = useState('Medium');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) {
            return toast.error('Subject and description are required.');
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Submitting your complaint...');

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
            setSubject('');
            setCategory('Login & Access');
            setPriority('Medium');
            setDescription('');
            setAttachment('');

            onTicketCreated(res.data);
            onClose();
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error(error.response?.data?.message || 'Failed to submit ticket.', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="support-modal-overlay" onClick={onClose}>
            <div className="support-modal-content" onClick={e => e.stopPropagation()}>
                <div className="support-modal-header">
                    <h2>Create New Complaint</h2>
                    <button className="btn-close-modal" onClick={onClose}><X size={20} /></button>
                </div>
                
                <form className="support-modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject</label>
                        <input 
                            type="text" 
                            placeholder="Briefly describe the issue..." 
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Login & Access">Login & Access</option>
                                <option value="HRMS">HRMS</option>
                                <option value="Attendance">Attendance</option>
                                <option value="Payroll">Payroll</option>
                                <option value="CRM">CRM</option>
                                <option value="ERP">ERP</option>
                                <option value="Material Tracking">Material Tracking</option>
                                <option value="Sales">Sales</option>
                                <option value="Reports">Reports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            placeholder="Please provide as much detail as possible to help us resolve your issue quickly..." 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Attachment URL (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="Link to screenshot or document..." 
                            value={attachment}
                            onChange={e => setAttachment(e.target.value)}
                        />
                    </div>

                    <div className="support-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit-complaint" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewComplaintModal;

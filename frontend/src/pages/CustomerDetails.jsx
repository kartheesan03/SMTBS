import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Building2, Globe, FileText, Briefcase, Tag, Calendar, Activity, Edit, Users } from 'lucide-react';
import { DetailViewContainer, ProfileHeader, Tabs, KeyValueCard, Timeline, DataTable } from '../components/ui';
import { motion } from 'framer-motion';

const CustomerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const { data: customerData } = await API.get(`/customers/${id}`);
                setCustomer(customerData);
                
                // Fetch associated orders for this customer to demonstrate synchronization
                try {
                    const { data: ordersData } = await API.get(`/orders/customer/${id}`);
                    setOrders(ordersData || []);
                } catch (e) {
                    // Ignore if order API fails or doesn't exist yet
                }
            } catch (err) {
                toast.error('Failed to load customer details');
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerData();
    }, [id, navigate]);

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Loading...</div>;
    if (!customer) return null;

    const badges = [
        { label: customer.status || 'Active', type: (customer.status || '').toLowerCase() === 'active' ? 'success' : 'warning' },
        { label: customer.customerType || 'Individual', type: 'info' }
    ];

    const actions = [
        { label: 'Edit Profile', icon: Edit, primary: true, onClick: () => navigate(`/customers/${customer._id || customer.id}/edit`) }
    ];

    const overviewContent = (
        <div className="ui-grid-2">
            <KeyValueCard 
                title="Contact Information" 
                items={[
                    { label: 'Email Address', value: customer.email },
                    { label: 'Phone Number', value: customer.phone || 'N/A' },
                    { label: 'Website', value: customer.website || 'N/A' },
                    { label: 'Address', value: customer.address || 'N/A' }
                ]} 
            />
            
            <KeyValueCard 
                title="Account Details" 
                items={[
                    { label: 'Primary Contact', value: customer.name },
                    { label: 'Company Name', value: customer.company || 'N/A' },
                    { label: 'Industry', value: customer.industry || 'N/A' },
                    { label: 'Account Created', value: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A' }
                ]} 
            />
        </div>
    );

    const orderColumns = [
        { key: 'orderNumber', label: 'Order #', sortable: true },
        { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total Amount', render: (val) => `₹${val.toLocaleString()}` }
    ];

    const ordersContent = (
        <DataTable 
            title="Order History"
            subtitle="Recent purchases and active orders for this customer"
            columns={orderColumns}
            data={orders}
            searchPlaceholder="Search orders..."
            variant="flat"
        />
    );

    

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Users, content: overviewContent },
        { id: 'orders', label: 'Orders', icon: Briefcase, content: ordersContent },
        { id: 'history', label: 'Activity', icon: Activity, content: <Timeline items={timeline.map((t, i) => ({ id: t.id || i, time: t.date ? new Date(t.date).toLocaleDateString() : t.time, title: t.action || 'Event', description: t.description || 'System action', color: '#3b82f6' }))} /> }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '24px' }}
        >
            <DetailViewContainer>
                <ProfileHeader 
                    title={customer.company || customer.name}
                    subtitle={`Customer ID: ${customer._id || customer.id}`}
                    avatarText={(customer.company || customer.name).substring(0, 2).toUpperCase()}
                    badges={badges}
                    actions={actions}
                />
                <Tabs tabs={tabs} />
            </DetailViewContainer>
        </motion.div>
    );
};

export default CustomerDetails;

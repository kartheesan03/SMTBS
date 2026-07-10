import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Building2, Globe, FileText, CheckCircle, Package, Edit, ShoppingCart } from 'lucide-react';
import { DetailViewContainer, ProfileHeader, Tabs, KeyValueCard, Timeline, DataTable } from '../components/ui';
import { motion } from 'framer-motion';

const VendorDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const { data: vendorData } = await API.get(`/vendors/${id}`);
                const actualVendor = vendorData.vendor || vendorData;
                setVendor(actualVendor);
                
                const { data: materialsData } = await API.get('/materials');
                const vId = String(actualVendor.id || actualVendor._id);
                const vMaterials = materialsData.filter(m => String(m.vendorId) === vId || String(m.vendor?.id || m.vendor?._id || m.vendor) === vId);
                setMaterials(vMaterials);
            } catch (err) {
                toast.error('Failed to load vendor details');
                navigate('/vendors');
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id, navigate]);

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Loading...</div>;
    if (!vendor) return null;

    const badges = [
        { label: vendor.status || 'Active Partner', type: (vendor.status || '').toLowerCase() === 'active' ? 'success' : 'warning' },
        { label: vendor.category || 'Vendor', type: 'info' }
    ];

    const actions = [
        { label: 'Raise PO', icon: ShoppingCart, primary: true, onClick: () => navigate(`/orders/create/purchase?vendorId=${vendor._id || vendor.id}`) },
        { label: 'Edit Profile', icon: Edit, primary: false, onClick: () => navigate(`/vendors/${vendor._id || vendor.id}/edit`) }
    ];

    const overviewContent = (
        <div className="ui-grid-2">
            <KeyValueCard 
                title="Contact Information" 
                items={[
                    { label: 'Email Address', value: vendor.email },
                    { label: 'Phone Number', value: vendor.phone || 'N/A' },
                    { label: 'Website', value: vendor.website || 'N/A' },
                    { label: 'Primary Contact', value: vendor.contactPerson || 'N/A' }
                ]} 
            />
            
            <KeyValueCard 
                title="Business Details" 
                items={[
                    { label: 'Company Name', value: vendor.name },
                    { label: 'GST Number', value: vendor.gstNumber || 'N/A' },
                    { label: 'Category', value: vendor.category || 'Uncategorized' },
                    { label: 'Address', value: vendor.address || 'N/A' }
                ]} 
            />
        </div>
    );

    const materialsColumns = [
        { key: 'sku', label: 'Item Code', sortable: true },
        { key: 'name', label: 'Material Name', sortable: true },
        { 
            key: 'quantity', 
            label: 'Current Stock', 
            sortable: true,
            render: (val, row) => `${val} ${row.unit || 'pcs'}`
        },
        { 
            key: 'price', 
            label: 'Unit Price', 
            sortable: true,
            render: (val) => `₹${val}`
        }
    ];

    const materialsContent = (
        <DataTable 
            title="Supplied Materials"
            subtitle={`Materials currently sourced from ${vendor.name}`}
            columns={materialsColumns}
            data={materials}
            actions={[{ label: 'View Material', icon: Package, onClick: (row) => navigate(`/materials/${row._id || row.id}`) }]}
            searchPlaceholder="Search materials..."
        />
    );

    

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2, content: overviewContent },
        { id: 'materials', label: 'Materials', icon: Package, content: materialsContent },
        { id: 'history', label: 'History', icon: FileText, content: <Timeline items={timeline.map((t, i) => ({ id: t.id || i, time: t.date ? new Date(t.date).toLocaleDateString() : t.time, title: t.action || 'Event', description: t.description || 'System action', color: '#3b82f6' }))} /> }
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
                    title={vendor.name || 'Unnamed Vendor'}
                    subtitle={`Vendor ID: ${vendor._id || vendor.id}`}
                    avatarText={(vendor.name || 'V').substring(0, 2).toUpperCase()}
                    badges={badges}
                    actions={actions}
                />
                <Tabs tabs={tabs} />
            </DetailViewContainer>
        </motion.div>
    );
};

export default VendorDetails;

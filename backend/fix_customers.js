const fs = require('fs');

const targetPath = 'C:/Users/Admin/Documents/project/frontend/src/pages/Customers.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// I need to find the corrupted section and replace it back to the original.
// The corrupted section starts at `errors.industry = 'Industry is required.';\n    const handleSubmit`
// But let's just use string replacement.

const fixStr = `        if (!formData.industry || formData.industry.trim().length === 0) errors.industry = 'Industry is required.';
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setActionLoading(true);
        try {
            if (editingId) {
                await API.put(\`/customers/\${editingId}\`, formData);
                toast.success("Customer profile updated and synchronized successfully.");
            } else {
                await API.post('/customers', formData);
                toast.success("Customer created successfully.");
            }
            handleCloseModal();
            fetchCustomers();
            if (editingId && selectedCustomer && editingId === selectedCustomer._id) {
                const updatedRes = await API.get(\`/customers/\${editingId}\`);
                setSelectedCustomer(updatedRes.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing request');
        } finally {
            setActionLoading(false);
        }
    };
            name: customer.name || '',`;

const restoredStr = `        if (!formData.industry || formData.industry.trim().length === 0) errors.industry = 'Industry is required.';
        if (!formData.address || formData.address.trim().length === 0) errors.address = 'Primary address is required.';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setActionLoading(true);
        try {
            if (editingId) {
                await API.put(\`/customers/\${editingId}\`, formData);
                toast.success("Customer profile updated and synchronized successfully.");
            } else {
                await API.post('/customers', formData);
                toast.success("Customer created successfully.");
            }
            handleCloseModal();
            fetchCustomers();
            if (editingId && selectedCustomer && editingId === selectedCustomer._id) {
                const updatedRes = await API.get(\`/customers/\${editingId}\`);
                setSelectedCustomer(updatedRes.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer._id || customer.id);
        setFormData({
            name: customer.name || '',`;

content = content.replace(fixStr, restoredStr);
fs.writeFileSync(targetPath, content);
console.log("Customers.jsx fixed");

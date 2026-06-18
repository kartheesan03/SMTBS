const API_URL = 'http://localhost:5000/api';

(async () => {
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const empRes = await fetch(`${API_URL}/employees`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const employees = await empRes.json();
        
        const adminEmp = employees.find(e => e.contact === 'admin@smtbms.com');
        console.log('Found Admin Emp:', adminEmp.id || adminEmp._id, adminEmp.firstName, adminEmp.contact);

        const updateRes = await fetch(`${API_URL}/employees/${adminEmp.id || adminEmp._id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                firstName: 'System',
                lastName: 'Admin Updated',
                department: 'Admin',
                designation: 'Admin Staff',
                contact: 'admin@smtbms.com',
                phone: '1111111111'
            })
        });
        
        if (!updateRes.ok) {
            const err = await updateRes.text();
            console.error('Update failed:', err);
        } else {
            const updated = await updateRes.json();
            console.log('Update success:', updated.firstName, updated.lastName, updated.phone);
        }
    } catch (e) {
        console.error('Error:', e);
    }
})();

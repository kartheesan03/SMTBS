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
        
        for (const emp of employees) {
            let updates = {};
            if (emp.contact === 'admin@smtbms.com') {
                updates = { firstName: 'Karthik', lastName: 'Rajan', employeeId: 'EMP002' };
            } else if (emp.contact === 'hr@smtbms.com') {
                updates = { firstName: 'Priya', lastName: 'Sharma', employeeId: 'EMP003' };
            } else if (emp.contact === 'sales@smtbms.com') {
                updates = { firstName: 'Arun', lastName: 'Kumar', employeeId: 'EMP004' };
            } else if (emp.contact === 'employee@smtbms.com') {
                updates = { firstName: 'Suresh', lastName: 'Babu', employeeId: 'EMP005' };
            } else {
                continue;
            }

            console.log(`Updating ${emp.contact}...`);
            const updateRes = await fetch(`${API_URL}/employees/${emp.id || emp._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(updates)
            });
            
            if (!updateRes.ok) {
                console.error(`Failed to update ${emp.contact}:`, await updateRes.text());
            } else {
                console.log(`Success for ${emp.contact}`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
})();

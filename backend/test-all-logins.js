// Test all API endpoints to verify the system is working end-to-end
(async () => {
    // 1. Login as admin
    console.log('=== Testing Login & Employee API ===\n');
    
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Admin Login:', loginRes.ok ? '✅' : '❌', 'role=' + loginData.role);
    const token = loginData.token;

    // 2. Get employees
    const empRes = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const employees = await empRes.json();
    console.log('\nEmployees fetched:', employees.length);
    employees.forEach(e => {
        const userId = e.userId;
        console.log('  ' + e.employeeId + ' ' + e.firstName + ' ' + (e.lastName || '') + 
            ' dept=' + e.department + ' contact=' + e.contact + 
            ' userId=' + (userId ? (userId.id || userId) : 'null'));
    });

    // 3. Test all 5 logins
    console.log('\n=== All Logins ===');
    const accounts = [
        { email: 'admin@smtbms.com', password: 'admin123' },
        { email: 'hr@smtbms.com', password: 'hr123' },
        { email: 'manager@smtbms.com', password: 'manager123' },
        { email: 'employee@smtbms.com', password: 'employee123' },
        { email: 'sales@smtbms.com', password: 'sales123' },
    ];
    for (const acct of accounts) {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(acct)
        });
        const data = await res.json();
        console.log(`  ${res.ok ? '✅' : '❌'} ${acct.email.padEnd(25)} role=${(data.role || 'FAIL').padEnd(12)} name=${data.name || data.message}`);
    }

    // 4. Verify admin user details
    console.log('\n=== Admin User Verification ===');
    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123' })
    });
    const admin = await adminRes.json();
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Token:', admin.token ? 'Present' : 'Missing');
})();

const axios = require('axios');

async function checkPort() {
    for (let i = 0; i < 30; i++) {
        try {
            await axios.get('http://localhost:5000');
        } catch (err) {
            if (err.code === 'ECONNREFUSED') {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
        }
        return true;
    }
    return false;
}

async function testLogins() {
    console.log("Waiting for server...");
    await checkPort();
    const roles = ['HR', 'Manager', 'Employee', 'Sales'];
    for (const role of roles) {
        try {
            console.log(`\nTesting role: ${role}`);
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'admin@smtbms.com',
                password: 'admin123',
                role: role
            });
            console.log(`SUCCESS: Logged in as ${role}!`);
        } catch (err) {
            console.log(`FAILED: ${err.response?.data?.message || err.message}`);
        }
    }
    try {
        console.log(`\nTesting role: Admin (Expected to succeed)`);
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@smtbms.com',
            password: 'admin123',
            role: 'Admin'
        });
        console.log(`SUCCESS: Logged in as Admin!`);
    } catch (err) {
        console.log(`FAILED: ${err.response?.data?.message || err.message}`);
    }
}
testLogins();

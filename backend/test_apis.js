const axios = require('axios');

async function testApis() {
    try {
        console.log("Testing Login...");
        const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'admin@smtbms.com',
            password: 'admin123',
            requestedRole: 'Admin'
        });
        
        console.log("Login Success! Token received.");
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        const apis = [
            '/api/notifications',
            '/api/tasks',
            '/api/dashboard/stats',
            '/api/dashboard/insights',
            '/api/system/navigation'
        ];

        for (const api of apis) {
            console.log(`\nTesting GET ${api}...`);
            try {
                const res = await axios.get(`http://127.0.0.1:5000${api}`, { headers });
                console.log(`Success! Status: ${res.status}`);
            } catch (e) {
                console.error(`Failed! Status: ${e.response?.status} - ${e.message}`);
            }
        }
    } catch (err) {
        console.error("Auth Test Failed:");
        console.error(err.message);
    }
}
testApis();

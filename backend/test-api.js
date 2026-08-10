const axios = require('axios');

async function test() {
    try {
        console.log('Logging in...');
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@smtbms.com',
            password: 'admin123'
        });
        const token = res.data.token;
        console.log('Token received.');

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log('Fetching /api/system/navigation...');
        console.time('Navigation');
        try {
            const nav = await axios.get('http://localhost:5000/api/system/navigation', config);
            console.log('Navigation success, items:', nav.data.length);
        } catch(e) {
            console.error('Navigation error:', e.message);
        }
        console.timeEnd('Navigation');

        console.log('Fetching /api/dashboard/stats...');
        console.time('Dashboard');
        try {
            const dash = await axios.get('http://localhost:5000/api/dashboard/stats', config);
            console.log('Dashboard success');
        } catch(e) {
            console.error('Dashboard error:', e.message);
        }
        console.timeEnd('Dashboard');
        
    } catch(err) {
        console.error('Login error:', err.message);
    }
}
test();

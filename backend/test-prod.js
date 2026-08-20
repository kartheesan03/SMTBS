const axios = require('axios');

async function testProd() {
    try {
        const loginRes = await axios.post('https://smtbs-backend.onrender.com/api/auth/login', {
            email: 'admin@smtbms.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in!');

        const followRes = await axios.get('https://smtbs-backend.onrender.com/api/feed/following', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Following:', followRes.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}
testProd();

const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function testIntegrations() {
    try {
        console.log('Testing GET /api/integrations');
        // Let's first log in to get a token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // GET Integrations
        const { data } = await axios.get('http://localhost:5000/api/integrations', config);
        console.log('Fetched:', data);
        
        // POST connect github
        console.log('Connecting github...');
        const connectRes = await axios.post('http://localhost:5000/api/integrations/github/connect', {}, config);
        console.log('Connect res:', connectRes.data);
        
        // POST webhook
        console.log('Saving webhook...');
        const hookRes = await axios.post('http://localhost:5000/api/integrations/system/webhook', { webhookUrl: 'http://test.com/hook' }, config);
        console.log('Webhook res:', hookRes.data);
        
    } catch (err) {
        console.error(err.message, err.response ? err.response.data : '');
    }
}

testIntegrations();

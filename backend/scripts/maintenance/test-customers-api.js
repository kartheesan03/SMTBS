const http = require('http');

const body = JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123' });
const options = {
    hostname: 'localhost', port: 5000, path: '/api/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        if (!parsed.token) { console.error('Login failed:', data); process.exit(1); }
        const token = parsed.token;

        // Now fetch customers
        const req2 = http.request({
            hostname: 'localhost', port: 5000, path: '/api/customers',
            method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
        }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                const custs = JSON.parse(data2);
                console.log(`=== Customers from API: ${Array.isArray(custs) ? custs.length : 'N/A (not array)'} ===`);
                if (Array.isArray(custs)) custs.forEach(c => console.log(c.id, c.customerCode, c.name));
                else console.log(data2.substring(0, 500));
            });
        });
        req2.on('error', e => console.error('API error:', e));
        req2.end();
    });
});
req.on('error', e => console.error('Login error:', e));
req.write(body);
req.end();

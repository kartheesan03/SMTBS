const http = require('http');

const data = JSON.stringify({ email: 'admin@smtbms.com', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    if (!token) {
        console.error('No token:', json);
        return;
    }
    
    // Now get stats
    const opt2 = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/erp/stats',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    http.request(opt2, (res2) => {
        let b2 = '';
        res2.on('data', d => b2 += d);
        res2.on('end', () => console.log('STATS RES:', res2.statusCode, b2));
    }).end();
  });
});

req.write(data);
req.end();

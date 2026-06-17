const http = require('http'); 
http.get('http://localhost:5000/api/orders', (res) => { 
  let data = ''; 
  res.on('data', chunk => data += chunk); 
  res.on('end', () => console.log(JSON.stringify(JSON.parse(data), null, 2))); 
});

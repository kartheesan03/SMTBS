const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const User = require('./src/models/User');

User.sequelizeModel.findOne({where: {role: 'Admin'}}).then(u => { 
    const token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET); 
    http.get('http://localhost:5000/api/orders', { headers: { Authorization: 'Bearer ' + token } }, res => { 
        let data = ''; 
        res.on('data', chunk => data += chunk); 
        res.on('end', () => { 
            const orders = JSON.parse(data); 
            const o = orders.find(x => x.id === 51 || x._id === 51); 
            console.log(JSON.stringify(o.items, null, 2)); 
        }); 
    }); 
});

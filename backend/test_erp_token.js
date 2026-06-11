const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smtbms');
    const user = await User.findOne({ email: 'admin@smtbms.com' });
    if (!user) return console.log('No admin user');
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    
    const http = require('http');
    const opt = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/erp/stats',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    http.request(opt, (res) => {
        let b = '';
        res.on('data', d => b += d);
        res.on('end', () => {
            console.log(res.statusCode, b);
            process.exit(0);
        });
    }).end();
}
test();

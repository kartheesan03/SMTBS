require('dotenv').config();
const http = require('http');

const data = JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' });

const reqLogin = http.request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const token = JSON.parse(body).token;
        if (!token) return console.log('Login failed', body);
        
        const updateData = JSON.stringify({
            employeeId: 'EMP002', firstName: 'Karthik', lastName: 'Rajan', department: 'Employee', designation: 'Admin', joinDate: '2026-01-18', contact: 'karthik.rajan@smtbms.com', phone: '', address: ''
        });

        const reqUpdate = http.request('http://localhost:5000/api/employees/29', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': updateData.length }
        }, resUpdate => {
            let resBody = '';
            resUpdate.on('data', d => resBody += d);
            resUpdate.on('end', () => console.log('Update Response:', resUpdate.statusCode, resBody));
        });
        reqUpdate.write(updateData);
        reqUpdate.end();
    });
});
reqLogin.write(data);
reqLogin.end();

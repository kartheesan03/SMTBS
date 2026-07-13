require('dotenv').config();
const { updateEmployee } = require('./src/controllers/employeeController');

(async () => {
    try {
        const req = {
            params: { id: '29' },
            body: {
                employeeId: 'EMP002',
                firstName: 'Karthik',
                lastName: 'Rajan',
                department: 'Employee',
                designation: 'Admin',
                contact: 'karthik.rajan@smtbms.com',
                phone: '',
                address: '',
                joinDate: '2026-01-18'
            },
            user: { _id: 1 },
            ip: '127.0.0.1'
        };

        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                console.log('Response:', this.statusCode, data);
            }
        };

        await updateEmployee(req, res);

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        process.exit(0);
    }
})();

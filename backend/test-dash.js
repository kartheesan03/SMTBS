const axios = require('axios');
async function run() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {email:'admin@smtbms.com',password:'admin123'});
        console.time('Dashboard');
        const dash = await axios.get('http://localhost:5000/api/dashboard/stats', {headers:{Authorization: 'Bearer ' + res.data.token}});
        console.timeEnd('Dashboard');
        console.log('Success, keys:', Object.keys(dash.data));
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();

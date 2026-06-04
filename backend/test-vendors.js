const { getVendors } = require('./src/controllers/vendorcontroller');
const sequelize = require('./src/config/sequelize');

async function test() {
    await sequelize.authenticate();
    const req = { user: { role: 'Admin' } };
    const res = {
        json: (data) => console.log(JSON.stringify(data, null, 2)),
        status: (code) => ({ json: (data) => console.log(code, data) })
    };
    await getVendors(req, res);
}
test();

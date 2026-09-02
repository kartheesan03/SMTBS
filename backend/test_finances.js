require('dotenv').config({path:'.env'});
const { getOrderFinances } = require('./src/controllers/ordercontroller');

const req = {
  user: { role: 'Admin', id: 1 },
  query: { year: 2026, details: 'true' }
};

const res = {
  json: (data) => console.log("Success:", Object.keys(data), "sales:", data.salesOrders?.length, "purchases:", data.purchaseOrders?.length),
  status: (code) => ({
    json: (err) => console.log("Error:", code, err)
  })
};

getOrderFinances(req, res);

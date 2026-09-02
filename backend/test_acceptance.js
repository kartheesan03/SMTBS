require('dotenv').config({path:'.env'});
const Customer = require('./src/models/Customer').sequelizeModel;
const Vendor = require('./src/models/Vendor').sequelizeModel;

Promise.all([Customer.findOne(), Vendor.findOne()]).then(([customer, vendor]) => {
  const { createOrder, getOrderFinances, updateOrder } = require('./src/controllers/ordercontroller');
  const reqSO = {
    user: { role: 'Admin', id: 1 },
    body: {
      orderType: 'sales',
      totalAmount: 10000,
      orderDate: '2026-09-01T00:00:00.000Z',
      expectedDeliveryDate: '2026-09-10T00:00:00.000Z',
      status: 'Pending',
      customerId: customer.id,
      items: [{ name: 'Test SO Item', qty: 10, unit: 'pcs', price: 1000 }]
    }
  };
  const reqPO = {
    user: { role: 'Admin', id: 1 },
    body: {
      orderType: 'purchase',
      totalAmount: 20000,
      orderDate: '2026-09-02T00:00:00.000Z',
      expectedDeliveryDate: '2026-09-15T00:00:00.000Z',
      status: 'Approved',
      vendorId: vendor.id,
      items: [{ name: 'Test PO Item', qty: 20, unit: 'kg', price: 1000 }]
    }
  };
  
  const resSO = { json: (so) => {
    console.log("Created SO:", so.id);
    const resPO = { json: (po) => {
      console.log("Created PO:", po.id);
      
      const reqGet = {
        user: { role: 'Admin', id: 1 },
        query: { year: 2026, month: 9 }
      };
      
      const resGet = { json: (data) => {
        console.log("September Data:", "sales:", data.salesOrders?.length, "purchases:", data.purchaseOrders?.length);
        console.log("Found our SO?", data.salesOrders?.some(o => o.id === so.id));
        console.log("Found our PO?", data.purchaseOrders?.some(o => o.id === po.id));
        
        // Update Test
        const reqUpdate = {
          user: { role: 'Admin', id: 1 },
          params: { id: so.id },
          body: {
            totalAmount: 15000,
            orderDate: '2026-10-01T00:00:00.000Z' // move to Oct
          }
        };
        const resUpdate = { json: (updatedSO) => {
          console.log("Updated SO amount to 15000 and date to Oct");
          const reqGetOct = { user: { role: 'Admin', id: 1 }, query: { year: 2026, month: 10 } };
          const resGetOct = { json: (octData) => {
             console.log("October Data sales count:", octData.salesOrders?.length);
             console.log("Our SO in Oct? Amount:", octData.salesOrders?.find(o => o.id === so.id)?.totalAmount);
          }};
          getOrderFinances(reqGetOct, resGetOct);
        }};
        updateOrder(reqUpdate, resUpdate);
      }};
      getOrderFinances(reqGet, resGet);
    }, status: (code) => ({ json: (err) => console.log(code, err) }) };
    createOrder(reqPO, resPO);
  }, status: (code) => ({ json: (err) => console.log(code, err) }) };
  
  createOrder(reqSO, resSO);
});

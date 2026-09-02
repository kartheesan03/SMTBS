require('dotenv').config({path:'.env'});
const sequelize = require('./src/config/sequelize');
const { sequelizeModel: Order } = require('./src/models/Order');
const { sequelizeModel: Customer } = require('./src/models/Customer');
const { sequelizeModel: Vendor } = require('./src/models/Vendor');
const { sequelizeModel: Material } = require('./src/models/Material');

const poData = [
  { poId: 'PO-2026-001', vendor: 'Sri Lakshmi Steel Traders', item: 'MS Plate 6mm', amount: 1100, raised: '2026-01-05', delivery: '2026-01-12', status: 'Delivered' },
  { poId: 'PO-2026-002', vendor: 'ABC Metals Pvt Ltd', item: 'MS Plate 10mm', amount: 1300, raised: '2026-02-10', delivery: '2026-02-18', status: 'Delivered' },
  { poId: 'PO-2026-003', vendor: 'Kumar Steel Corporation', item: 'HR Coil 2mm', amount: 1200, raised: '2026-03-08', delivery: '2026-03-16', status: 'Delivered' },
  { poId: 'PO-2026-004', vendor: 'Southern Industrial Supplies', item: 'GI Sheet 1mm', amount: 1500, raised: '2026-04-05', delivery: '2026-04-15', status: 'Delivered' },
  { poId: 'PO-2026-005', vendor: 'Bharat Alloy & Metals', item: 'MS Angle 50×50', amount: 1800, raised: '2026-05-12', delivery: '2026-05-22', status: 'Delivered' },
  { poId: 'PO-2026-006', vendor: 'Chennai Iron & Steel', item: 'MS Flat Bar 50×10', amount: 1600, raised: '2026-06-08', delivery: '2026-06-18', status: 'Approved' },
  { poId: 'PO-2026-007', vendor: 'Prime Metal Industries', item: 'MS Square Bar 20mm', amount: 2000, raised: '2026-07-10', delivery: '2026-07-20', status: 'Shipped' },
  { poId: 'PO-2026-008', vendor: 'Sri Lakshmi Steel Traders', item: 'Steel Column 100×50', amount: 5700, raised: '2026-08-05', delivery: '2026-08-20', status: 'Shipped' },
  { poId: 'PO-2026-009', vendor: 'ABC Metals Pvt Ltd', item: 'Steel Beam ISMB 200', amount: 2100, raised: '2026-09-10', delivery: '2026-09-20', status: 'Approved' },
  { poId: 'PO-2026-010', vendor: 'Kumar Steel Corporation', item: 'Industrial Nut M12', amount: 2300, raised: '2026-10-08', delivery: '2026-10-18', status: 'Pending' },
  { poId: 'PO-2026-011', vendor: 'Southern Industrial Supplies', item: 'SS Sheet 304 2mm', amount: 2400, raised: '2026-11-05', delivery: '2026-11-15', status: 'Pending' },
  { poId: 'PO-2026-012', vendor: 'Bharat Alloy & Metals', item: 'Alloy Steel Rod 25mm', amount: 2700, raised: '2026-12-10', delivery: '2026-12-20', status: 'Pending' }
];

const soData = [
  { soId: 'SO-2026-001', customer: 'Kovai Steel & Engineering Pvt Ltd', item: 'MS Plate 6mm', amount: 12000, raised: '2026-01-05', delivery: '2026-01-15', status: 'Delivered' },
  { soId: 'SO-2026-002', customer: 'Sri Lakshmi Fabricators', item: 'MS Plate 10mm', amount: 15000, raised: '2026-02-08', delivery: '2026-02-18', status: 'Delivered' },
  { soId: 'SO-2026-003', customer: 'Southern Infrastructure Works', item: 'HR Coil 2mm', amount: 14000, raised: '2026-03-05', delivery: '2026-03-16', status: 'Delivered' },
  { soId: 'SO-2026-004', customer: 'Karthik Steel Traders', item: 'GI Sheet 1mm', amount: 18000, raised: '2026-04-10', delivery: '2026-04-20', status: 'Delivered' },
  { soId: 'SO-2026-005', customer: 'Metro Metal Solutions Pvt Ltd', item: 'MS Angle 50×50', amount: 21000, raised: '2026-05-05', delivery: '2026-05-18', status: 'Delivered' },
  { soId: 'SO-2026-006', customer: 'Kaveri Engineering Works', item: 'MS Flat Bar 50×10', amount: 20000, raised: '2026-06-08', delivery: '2026-06-20', status: 'Approved' },
  { soId: 'SO-2026-007', customer: 'Southern Fabricators', item: 'MS Square Bar 20mm', amount: 24000, raised: '2026-07-05', delivery: '2026-07-18', status: 'Shipped' },
  { soId: 'SO-2026-008', customer: 'Kovai Steel & Engineering Pvt Ltd', item: 'Steel Column 100×50', amount: 75000, raised: '2026-08-05', delivery: '2026-08-25', status: 'Shipped' },
  { soId: 'SO-2026-009', customer: 'Sri Lakshmi Fabricators', item: 'Steel Beam ISMB 200', amount: 25000, raised: '2026-09-08', delivery: '2026-09-20', status: 'Approved' },
  { soId: 'SO-2026-010', customer: 'Southern Infrastructure Works', item: 'Industrial Nut M12', amount: 27000, raised: '2026-10-05', delivery: '2026-10-18', status: 'Pending' },
  { soId: 'SO-2026-011', customer: 'Karthik Steel Traders', item: 'SS Sheet 304 2mm', amount: 29000, raised: '2026-11-08', delivery: '2026-11-20', status: 'Pending' },
  { soId: 'SO-2026-012', customer: 'Metro Metal Solutions Pvt Ltd', item: 'Alloy Steel Rod 25mm', amount: 31000, raised: '2026-12-05', delivery: '2026-12-18', status: 'Pending' }
];

async function seed() {
  await sequelize.authenticate();
  
  // Clear old orders and users
  await Order.destroy({ where: {} });
  await Customer.destroy({ where: {} });
  await Vendor.destroy({ where: {} });
  console.log("Cleared existing orders, customers, and vendors");

  for (const p of poData) {
    let vendor = await Vendor.findOne({ where: { name: p.vendor } });
    if (!vendor) {
      const email = p.vendor.toLowerCase().replace(/[^a-z0-9]/g, '') + '@example.com';
      vendor = await Vendor.create({ name: p.vendor, email, phone: '000000', status: 'Active' });
    }
    
    let material = await Material.findOne({ where: { name: p.item } });
    if (!material) {
      material = await Material.create({ name: p.item, sku: p.item.substring(0, 5), type: 'Raw', unit: 'pcs', currentStock: 10, reorderLevel: 5, price: p.amount });
    }
    
    const o = await Order.create({
      orderNumber: p.poId,
      orderType: 'purchase',
      vendorId: vendor.id,
      totalAmount: p.amount,
      orderDate: new Date(p.raised),
      expectedDeliveryDate: new Date(p.delivery),
      status: p.status,
      items: [{
        materialId: material.id,
        quantity: 1,
        unitPrice: p.amount,
        totalPrice: p.amount
      }]
    });
  }

  for (const s of soData) {
    let customer = await Customer.findOne({ where: { name: s.customer } });
    if (!customer) {
      const email = s.customer.toLowerCase().replace(/[^a-z0-9]/g, '') + '@example.com';
      customer = await Customer.create({ name: s.customer, email, phone: '0000', status: 'Active' });
    }
    
    let material = await Material.findOne({ where: { name: s.item } });
    if (!material) {
      material = await Material.create({ name: s.item, sku: s.item.substring(0, 5) + 'c', type: 'Finished', unit: 'pcs', currentStock: 10, reorderLevel: 5, price: s.amount });
    }
    
    const o = await Order.create({
      orderNumber: s.soId,
      orderType: 'sales',
      customerId: customer.id,
      totalAmount: s.amount,
      orderDate: new Date(s.raised),
      expectedDeliveryDate: new Date(s.delivery),
      status: s.status,
      items: [{
        materialId: material.id,
        quantity: 1,
        unitPrice: s.amount,
        totalPrice: s.amount
      }]
    });
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

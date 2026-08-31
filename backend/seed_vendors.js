const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const sequelize = require('./src/config/sequelize');
require('./src/models/associations');
const Vendor = require('./src/models/Vendor');

const vendorData = [
  {
    vendorCode: 'VEN-001',
    name: 'Sri Lakshmi Steel Traders',
    category: 'Steel & Metals',
    contactPerson: 'Ravi Shankar',
    email: 'ravi@srilakshmisteel.in',
    phone: '9865432100',
    gstNumber: '33AAAAA0000A1Z5',
    status: 'Active',
    rating: 4.8,
    outstanding: 124500
  },
  {
    vendorCode: 'VEN-002',
    name: 'ABC Metals Pvt Ltd',
    category: 'Steel & Metals',
    contactPerson: 'Arjun Kumar',
    email: 'arjun@abcmetals.in',
    phone: '9876543210',
    gstNumber: '33BBBBB1111B2Z6',
    status: 'Active',
    rating: 4.5,
    outstanding: 86200
  },
  {
    vendorCode: 'VEN-003',
    name: 'Kumar Steel Corporation',
    category: 'Structural Steel',
    contactPerson: 'Suresh Kumar',
    email: 'sales@kumarsteel.in',
    phone: '9843215678',
    gstNumber: '33CCCCC2222C3Z7',
    status: 'Active',
    rating: 4.2,
    outstanding: 215800
  },
  {
    vendorCode: 'VEN-004',
    name: 'Southern Industrial Supplies',
    category: 'Industrial Materials',
    contactPerson: 'Priya Menon',
    email: 'priya@southernindustrial.in',
    phone: '9798765432',
    gstNumber: '33DDDDD3333D4Z8',
    status: 'Active',
    rating: 4.6,
    outstanding: 54750
  },
  {
    vendorCode: 'VEN-005',
    name: 'Bharat Alloy & Metals',
    category: 'Alloy & Stainless Steel',
    contactPerson: 'Manoj Patel',
    email: 'manoj@bharatalloy.in',
    phone: '9812345678',
    gstNumber: '33EEEEE4444E5Z9',
    status: 'Active',
    rating: 4.7,
    outstanding: 98300
  },
  {
    vendorCode: 'VEN-006',
    name: 'Chennai Iron & Steel',
    category: 'Steel Products',
    contactPerson: 'Karthik Raj',
    email: 'karthik@chennaiiron.in',
    phone: '9952012345',
    gstNumber: '33FFFFF5555F6Z1',
    status: 'Active',
    rating: 4.1,
    outstanding: 176400
  },
  {
    vendorCode: 'VEN-007',
    name: 'Prime Metal Industries',
    category: 'Sheet & Coil',
    contactPerson: 'Naveen Kumar',
    email: 'naveen@primemetal.in',
    phone: '9887654321',
    gstNumber: '33GGGGG6666G7Z2',
    status: 'Active',
    rating: 4.4,
    outstanding: 63900
  },
  {
    vendorCode: 'VEN-008',
    name: 'Tamil Nadu Steel Mart',
    category: 'General Steel',
    contactPerson: 'Vignesh R',
    email: 'vicky@tnstealmart.in',
    phone: '9789012345',
    gstNumber: '33HHHHH7777H8Z3',
    status: 'Inactive',
    rating: 3.8,
    outstanding: 32100
  }
];

const { Op } = require('sequelize');

async function seedVendors() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');
    
    for (const vData of vendorData) {
      const existingVendor = await sequelize.models.Vendor.findOne({
        where: {
          [Op.or]: [
            { vendorCode: vData.vendorCode },
            { gstNumber: vData.gstNumber },
            { name: vData.name }
          ]
        }
      });
      
      if (existingVendor) {
        console.log(`Updating existing vendor: ${vData.name} (${vData.vendorCode})`);
        await existingVendor.update(vData);
      } else {
        console.log(`Creating new vendor: ${vData.name} (${vData.vendorCode})`);
        await sequelize.models.Vendor.create(vData);
      }
    }
    
    console.log('Vendor seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
}

seedVendors();

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
    phone: '+91 98654 32100',
    address: 'Plot No. 42, SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu – 641021',
    gstNumber: '33AABCS1234A1Z5',
    website: null,
    status: 'Active',
    rating: 4.8,
    outstanding: 124500,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641021'
  },
  {
    vendorCode: 'VEN-002',
    name: 'ABC Metals Pvt Ltd',
    category: 'Steel & Metals',
    contactPerson: 'Arjun Kumar',
    email: 'arjun@abcmetals.in',
    phone: '+91 98765 43210',
    address: 'Survey No. 78, Anna Nagar Industrial Area, Chennai, Tamil Nadu – 600040',
    gstNumber: '33AABCM4567B2Z6',
    website: null,
    status: 'Active',
    rating: 4.5,
    outstanding: 86200,
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600040'
  },
  {
    vendorCode: 'VEN-003',
    name: 'Kumar Steel Corporation',
    category: 'Structural Steel',
    contactPerson: 'Suresh Kumar',
    email: 'sales@kumarsteel.in',
    phone: '+91 98432 15678',
    address: 'No. 12, Mettur Road, Industrial Nagar, Salem, Tamil Nadu – 636002',
    gstNumber: '33AABCK7890C3Z7',
    website: null,
    status: 'Active',
    rating: 4.2,
    outstanding: 215800,
    city: 'Salem',
    state: 'Tamil Nadu',
    pinCode: '636002'
  },
  {
    vendorCode: 'VEN-004',
    name: 'Southern Industrial Supplies',
    category: 'Industrial Materials',
    contactPerson: 'Priya Menon',
    email: 'priya@southernindustrial.in',
    phone: '+91 97987 65432',
    address: 'Block C, Ambattur Industrial Estate, Ambattur, Chennai, Tamil Nadu – 600058',
    gstNumber: '33AABCS2345D4Z8',
    website: null,
    status: 'Active',
    rating: 4.6,
    outstanding: 54750,
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600058'
  },
  {
    vendorCode: 'VEN-005',
    name: 'Bharat Alloy & Metals',
    category: 'Alloy & Stainless Steel',
    contactPerson: 'Manoj Patel',
    email: 'manoj@bharatalloy.in',
    phone: '+91 98123 45678',
    address: '45/B, GIDC Estate, Vatva, Ahmedabad, Gujarat – 382445',
    gstNumber: '24AABCB3456E5Z9',
    website: null,
    status: 'Active',
    rating: 4.7,
    outstanding: 98300,
    city: 'Ahmedabad',
    state: 'Gujarat',
    pinCode: '382445'
  },
  {
    vendorCode: 'VEN-006',
    name: 'Chennai Iron & Steel',
    category: 'Steel Products',
    contactPerson: 'Karthik Raj',
    email: 'karthik@chennaiiron.in',
    phone: '+91 99520 12345',
    address: 'Old No. 5, New No. 11, Madhavaram High Road, Perambur, Chennai, Tamil Nadu – 600011',
    gstNumber: '33AABCC4567F6Z1',
    website: null,
    status: 'Active',
    rating: 4.1,
    outstanding: 176400,
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600011'
  },
  {
    vendorCode: 'VEN-007',
    name: 'Prime Metal Industries',
    category: 'Sheet & Coil',
    contactPerson: 'Naveen Kumar',
    email: 'naveen@primemetal.in',
    phone: '+91 98876 54321',
    address: 'Unit 7, Kapaleeswarar Nagar, Nungambakkam, Chennai, Tamil Nadu – 600034',
    gstNumber: '33AABCP5678G7Z2',
    website: null,
    status: 'Active',
    rating: 4.4,
    outstanding: 63900,
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600034'
  },
  {
    vendorCode: 'VEN-008',
    name: 'Tamil Nadu Steel Mart',
    category: 'General Steel',
    contactPerson: 'Vignesh R',
    email: 'vicky@tnsteelmart.in',
    phone: '+91 97890 12345',
    address: 'Door No. 3, Trichy Road, Singanallur, Coimbatore, Tamil Nadu – 641005',
    gstNumber: '33AABCT6789H8Z3',
    website: null,
    status: 'Inactive',
    rating: 3.8,
    outstanding: 32100,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641005'
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
            { name: vData.name },
            { email: vData.email }
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

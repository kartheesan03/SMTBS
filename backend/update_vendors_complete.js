/**
 * update_vendors_complete.js
 * 
 * Updates all existing vendors with complete, vendor-specific information.
 * Uses UPDATE by ID (preserves existing records, no duplicates).
 * Also inserts Tamil Nadu Steel Mart if not already present.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const completeVendorData = [
  {
    id: 16,
    name: 'Sri Lakshmi Steel Traders',
    category: 'Steel & Metals',
    contactPerson: 'Ravi Shankar',
    email: 'ravi@srilakshmisteel.in',
    phone: '+91 98654 32100',
    address: 'Plot No. 42, SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu – 641021',
    gstNumber: '33AABCS1234A1Z5',
    website: '',
    status: 'Active',
    outstanding: 124500,
    rating: 4.8,
    vendorCode: 'VEN-001',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641021'
  },
  {
    id: 17,
    name: 'ABC Metals Pvt Ltd',
    category: 'Steel & Metals',
    contactPerson: 'Arjun Kumar',
    email: 'arjun@abcmetals.in',
    phone: '+91 98765 43210',
    address: 'Survey No. 78, Anna Nagar Industrial Area, Chennai, Tamil Nadu – 600040',
    gstNumber: '33AABCM4567B2Z6',
    website: '',
    status: 'Active',
    outstanding: 86200,
    rating: 4.5,
    vendorCode: 'VEN-002',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600040'
  },
  {
    id: 18,
    name: 'Kumar Steel Corporation',
    category: 'Structural Steel',
    contactPerson: 'Suresh Kumar',
    email: 'sales@kumarsteel.in',
    phone: '+91 98432 15678',
    address: 'No. 12, Mettur Road, Industrial Nagar, Salem, Tamil Nadu – 636002',
    gstNumber: '33AABCK7890C3Z7',
    website: '',
    status: 'Active',
    outstanding: 215800,
    rating: 4.2,
    vendorCode: 'VEN-003',
    city: 'Salem',
    state: 'Tamil Nadu',
    pinCode: '636002'
  },
  {
    id: 19,
    name: 'Southern Industrial Supplies',
    category: 'Industrial Materials',
    contactPerson: 'Priya Menon',
    email: 'priya@southernindustrial.in',
    phone: '+91 97987 65432',
    address: 'Block C, Ambattur Industrial Estate, Ambattur, Chennai, Tamil Nadu – 600058',
    gstNumber: '33AABCS2345D4Z8',
    website: '',
    status: 'Active',
    outstanding: 54750,
    rating: 4.6,
    vendorCode: 'VEN-004',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600058'
  },
  {
    id: 20,
    name: 'Bharat Alloy & Metals',
    category: 'Alloy & Stainless Steel',
    contactPerson: 'Manoj Patel',
    email: 'manoj@bharatalloy.in',
    phone: '+91 98123 45678',
    address: '45/B, GIDC Estate, Vatva, Ahmedabad, Gujarat – 382445',
    gstNumber: '24AABCB3456E5Z9',
    website: '',
    status: 'Active',
    outstanding: 98300,
    rating: 4.7,
    vendorCode: 'VEN-005',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pinCode: '382445'
  },
  {
    id: 21,
    name: 'Chennai Iron & Steel',
    category: 'Steel Products',
    contactPerson: 'Karthik Raj',
    email: 'karthik@chennaiiron.in',
    phone: '+91 99520 12345',
    address: 'Old No. 5, New No. 11, Madhavaram High Road, Perambur, Chennai, Tamil Nadu – 600011',
    gstNumber: '33AABCC4567F6Z1',
    website: '',
    status: 'Active',
    outstanding: 176400,
    rating: 4.1,
    vendorCode: 'VEN-006',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600011'
  },
  {
    id: 22,
    name: 'Prime Metal Industries',
    category: 'Sheet & Coil',
    contactPerson: 'Naveen Kumar',
    email: 'naveen@primemetal.in',
    phone: '+91 98876 54321',
    address: 'Unit 7, Kapaleeswarar Nagar, Nungambakkam, Chennai, Tamil Nadu – 600034',
    gstNumber: '33AABCP5678G7Z2',
    website: '',
    status: 'Active',
    outstanding: 63900,
    rating: 4.4,
    vendorCode: 'VEN-007',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600034'
  }
];

// Tamil Nadu Steel Mart – check if it exists; insert if missing
const tamilNaduSteelMart = {
  name: 'Tamil Nadu Steel Mart',
  category: 'General Steel',
  contactPerson: 'Vignesh R',
  email: 'vicky@tnsteelmart.in',
  phone: '+91 97890 12345',
  address: 'Door No. 3, Trichy Road, Singanallur, Coimbatore, Tamil Nadu – 641005',
  gstNumber: '33AABCT6789H8Z3',
  website: '',
  status: 'Inactive',
  outstanding: 32100,
  rating: 3.8,
  vendorCode: 'VEN-008',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  pinCode: '641005',
  materialsSupplied: '[]'
};

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'smtbms'
    });

    console.log('✅ Database connection established.');

    // ── Update existing vendors by ID ────────────────────────────────────────
    for (const v of completeVendorData) {
      const [result] = await conn.execute(
        `UPDATE vendor SET
          name = ?,
          category = ?,
          contactPerson = ?,
          email = ?,
          phone = ?,
          address = ?,
          gstNumber = ?,
          website = ?,
          status = ?,
          outstanding = ?,
          rating = ?,
          vendorCode = ?,
          city = ?,
          state = ?,
          pinCode = ?,
          updatedAt = NOW()
         WHERE id = ?`,
        [
          v.name,
          v.category,
          v.contactPerson,
          v.email,
          v.phone,
          v.address,
          v.gstNumber,
          v.website || null,
          v.status,
          v.outstanding,
          v.rating,
          v.vendorCode,
          v.city,
          v.state,
          v.pinCode,
          v.id
        ]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Updated: ${v.name} (ID: ${v.id})`);
      } else {
        console.warn(`⚠️  No row updated for ID ${v.id} – vendor may not exist.`);
      }
    }

    // ── Insert Tamil Nadu Steel Mart if not already present ──────────────────
    const [existingRows] = await conn.execute(
      `SELECT id FROM vendor WHERE name = ? OR email = ? OR vendorCode = ? LIMIT 1`,
      [tamilNaduSteelMart.name, tamilNaduSteelMart.email, tamilNaduSteelMart.vendorCode]
    );

    if (existingRows.length > 0) {
      // It exists – update it instead
      const existingId = existingRows[0].id;
      await conn.execute(
        `UPDATE vendor SET
          name = ?, category = ?, contactPerson = ?, email = ?, phone = ?,
          address = ?, gstNumber = ?, website = ?, status = ?, outstanding = ?,
          rating = ?, vendorCode = ?, city = ?, state = ?, pinCode = ?,
          materialsSupplied = ?, updatedAt = NOW()
         WHERE id = ?`,
        [
          tamilNaduSteelMart.name, tamilNaduSteelMart.category,
          tamilNaduSteelMart.contactPerson, tamilNaduSteelMart.email,
          tamilNaduSteelMart.phone, tamilNaduSteelMart.address,
          tamilNaduSteelMart.gstNumber, tamilNaduSteelMart.website || null,
          tamilNaduSteelMart.status, tamilNaduSteelMart.outstanding,
          tamilNaduSteelMart.rating, tamilNaduSteelMart.vendorCode,
          tamilNaduSteelMart.city, tamilNaduSteelMart.state,
          tamilNaduSteelMart.pinCode, tamilNaduSteelMart.materialsSupplied,
          existingId
        ]
      );
      console.log(`✅ Updated existing Tamil Nadu Steel Mart (ID: ${existingId})`);
    } else {
      // Insert new
      await conn.execute(
        `INSERT INTO vendor
          (name, category, contactPerson, email, phone, address, gstNumber, website,
           status, outstanding, rating, vendorCode, city, state, pinCode,
           materialsSupplied, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tamilNaduSteelMart.name, tamilNaduSteelMart.category,
          tamilNaduSteelMart.contactPerson, tamilNaduSteelMart.email,
          tamilNaduSteelMart.phone, tamilNaduSteelMart.address,
          tamilNaduSteelMart.gstNumber, tamilNaduSteelMart.website || null,
          tamilNaduSteelMart.status, tamilNaduSteelMart.outstanding,
          tamilNaduSteelMart.rating, tamilNaduSteelMart.vendorCode,
          tamilNaduSteelMart.city, tamilNaduSteelMart.state,
          tamilNaduSteelMart.pinCode, tamilNaduSteelMart.materialsSupplied
        ]
      );
      console.log(`✅ Inserted new vendor: Tamil Nadu Steel Mart`);
    }

    // ── Verify ───────────────────────────────────────────────────────────────
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('📋 Final vendor records:');
    const [finalRows] = await conn.execute(
      `SELECT id, name, category, contactPerson, email, phone, gstNumber, status, outstanding, rating, vendorCode
       FROM vendor ORDER BY id`
    );
    finalRows.forEach(r => {
      console.log(`  [${r.id}] ${r.name} | ${r.category} | ${r.contactPerson} | ${r.email} | ${r.phone} | GST: ${r.gstNumber} | ${r.status} | ₹${r.outstanding} | ⭐${r.rating}`);
    });
    console.log('──────────────────────────────────────────────────────────');
    console.log(`\n✅ Done. ${finalRows.length} vendors in database.`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
    process.exit(0);
  }
}

main();

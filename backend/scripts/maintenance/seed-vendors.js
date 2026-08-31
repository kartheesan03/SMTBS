/**
 * SMTBMS Vendor Master Data Seed Script
 * 
 * - Inserts 8 vendors + related materials
 * - Duplicate-safe: checks vendorCode, gstNumber, AND name before inserting
 * - Upserts on match (no duplicates ever created)
 * - Does NOT delete any existing data
 * - Also seeds materials for each vendor and links via VendorMaterial
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = require('../../src/config/sequelize');
const setupAssociations = require('../../src/models/associations');
const Vendor = require('../../src/models/Vendor');
const Material = require('../../src/models/Material');
const VendorMaterial = require('../../src/models/VendorMaterial');

const VENDORS = [
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
        outstanding: 124500,
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600001',
        address: '12, Industrial Estate, Ambattur, Chennai',
        materials: [
            { name: 'MS Plate 6mm',   sku: 'MS-PL-006',    category: 'Steel Plates',   quantity: 450, unit: 'KG',  price: 62,   lowStockThreshold: 50,  warehouse: 'WH-A', shelf: 'Rack-1' },
            { name: 'MS Plate 10mm',  sku: 'MS-PL-010',    category: 'Steel Plates',   quantity: 280, unit: 'KG',  price: 64,   lowStockThreshold: 50,  warehouse: 'WH-A', shelf: 'Rack-2' },
            { name: 'HR Coil 2mm',    sku: 'HR-COIL-002',  category: 'Coils',          quantity: 120, unit: 'KG',  price: 67,   lowStockThreshold: 30,  warehouse: 'WH-B', shelf: 'Rack-1' },
            { name: 'GI Sheet 1mm',   sku: 'GI-SHT-001',   category: 'GI Sheets',      quantity: 350, unit: 'PCS', price: 1850, lowStockThreshold: 40,  warehouse: 'WH-B', shelf: 'Rack-2' },
            { name: 'MS Angle 50x50', sku: 'MS-ANG-050',   category: 'Angles',         quantity: 180, unit: 'PCS', price: 1250, lowStockThreshold: 20,  warehouse: 'WH-A', shelf: 'Rack-3' },
        ]
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
        outstanding: 86200,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641001',
        address: '45, SIDCO Industrial Area, Coimbatore',
        materials: [
            { name: 'MS Flat Bar 50x10',  sku: 'MS-FB-5010', category: 'Flat Bars',   quantity: 200, unit: 'PCS', price: 480,  lowStockThreshold: 20, warehouse: 'WH-A', shelf: 'Rack-4' },
            { name: 'MS Square Bar 20mm', sku: 'MS-SB-020',  category: 'Square Bars', quantity: 150, unit: 'PCS', price: 320,  lowStockThreshold: 15, warehouse: 'WH-A', shelf: 'Rack-5' },
        ]
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
        outstanding: 215800,
        city: 'Madurai',
        state: 'Tamil Nadu',
        pinCode: '625001',
        address: '78, Industrial Zone, Madurai',
        materials: [
            { name: 'Steel Column 100x50',  sku: 'ST-COL-10050', category: 'Structural', quantity: 80,  unit: 'PCS', price: 3200, lowStockThreshold: 10, warehouse: 'WH-C', shelf: 'Rack-1' },
            { name: 'Steel Beam ISMB 200',  sku: 'ST-BM-ISMB200',category: 'Structural', quantity: 60,  unit: 'PCS', price: 5800, lowStockThreshold: 8,  warehouse: 'WH-C', shelf: 'Rack-2' },
        ]
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
        outstanding: 54750,
        city: 'Trichy',
        state: 'Tamil Nadu',
        pinCode: '620001',
        address: '33, Industrial Estate, Trichy',
        materials: [
            { name: 'Industrial Bolt M12',   sku: 'IND-BLT-M12', category: 'Fasteners',  quantity: 5000, unit: 'PCS', price: 12,  lowStockThreshold: 500, warehouse: 'WH-D', shelf: 'Rack-1' },
            { name: 'Industrial Nut M12',    sku: 'IND-NUT-M12', category: 'Fasteners',  quantity: 5000, unit: 'PCS', price: 8,   lowStockThreshold: 500, warehouse: 'WH-D', shelf: 'Rack-2' },
            { name: 'Safety Gloves (Heavy)', sku: 'SAF-GLV-HVY', category: 'Safety',     quantity: 200,  unit: 'PCS', price: 120, lowStockThreshold: 20,  warehouse: 'WH-D', shelf: 'Rack-3' },
        ]
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
        outstanding: 98300,
        city: 'Salem',
        state: 'Tamil Nadu',
        pinCode: '636001',
        address: '21, Steel Complex, Salem',
        materials: [
            { name: 'SS Sheet 304 2mm',   sku: 'SS-SHT-304-2', category: 'Stainless Steel', quantity: 90,  unit: 'KG',  price: 285, lowStockThreshold: 20, warehouse: 'WH-E', shelf: 'Rack-1' },
            { name: 'Alloy Steel Rod 25mm',sku: 'AL-ROD-025',   category: 'Alloy Steel',    quantity: 140, unit: 'PCS', price: 890, lowStockThreshold: 15, warehouse: 'WH-E', shelf: 'Rack-2' },
        ]
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
        outstanding: 176400,
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600010',
        address: '67, Perambur Industrial Area, Chennai',
        materials: [
            { name: 'CI Pipe 2 inch',    sku: 'CI-PIP-002', category: 'Pipes',      quantity: 120, unit: 'PCS', price: 620,  lowStockThreshold: 15, warehouse: 'WH-A', shelf: 'Rack-6' },
            { name: 'Iron Casting Block', sku: 'IR-CST-BLK', category: 'Castings',  quantity: 45,  unit: 'PCS', price: 3800, lowStockThreshold: 5,  warehouse: 'WH-C', shelf: 'Rack-3' },
        ]
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
        outstanding: 63900,
        city: 'Erode',
        state: 'Tamil Nadu',
        pinCode: '638001',
        address: '9, SIPCOT Industrial Park, Erode',
        materials: [
            { name: 'CR Sheet 0.8mm',   sku: 'CR-SHT-008', category: 'CR Sheets',   quantity: 320, unit: 'KG',  price: 72,  lowStockThreshold: 50, warehouse: 'WH-B', shelf: 'Rack-3' },
            { name: 'HR Coil 3mm',      sku: 'HR-COIL-003',category: 'Coils',       quantity: 200, unit: 'KG',  price: 65,  lowStockThreshold: 40, warehouse: 'WH-B', shelf: 'Rack-4' },
        ]
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
        outstanding: 32100,
        city: 'Vellore',
        state: 'Tamil Nadu',
        pinCode: '632001',
        address: '15, Market Road, Vellore',
        materials: [
            { name: 'TMT Bar 8mm',   sku: 'TMT-BAR-008', category: 'TMT Bars', quantity: 1200, unit: 'KG', price: 58, lowStockThreshold: 100, warehouse: 'WH-A', shelf: 'Rack-7' },
        ]
    }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function upsertVendor(vendorData) {
    // Check for duplicate by vendorCode OR gstNumber OR name (any match = skip/update)
    const existing = await Vendor.sequelizeModel.findOne({
        where: {
            [require('sequelize').Op.or]: [
                { vendorCode: vendorData.vendorCode },
                { gstNumber: vendorData.gstNumber },
                { name: vendorData.name }
            ]
        }
    });

    if (existing) {
        console.log(`  ⟳  FOUND existing vendor "${vendorData.name}" (ID: ${existing.id}) — updating...`);
        await existing.update({
            vendorCode: vendorData.vendorCode,
            name: vendorData.name,
            category: vendorData.category,
            contactPerson: vendorData.contactPerson,
            email: vendorData.email,
            phone: vendorData.phone,
            gstNumber: vendorData.gstNumber,
            status: vendorData.status,
            rating: vendorData.rating,
            outstanding: vendorData.outstanding,
            city: vendorData.city,
            state: vendorData.state,
            pinCode: vendorData.pinCode,
            address: vendorData.address
        });
        return { vendor: existing, isNew: false };
    }

    console.log(`  ✚  Creating new vendor: "${vendorData.name}" [${vendorData.vendorCode}]`);
    const created = await Vendor.sequelizeModel.create({
        vendorCode: vendorData.vendorCode,
        name: vendorData.name,
        category: vendorData.category,
        contactPerson: vendorData.contactPerson,
        email: vendorData.email,
        phone: vendorData.phone,
        gstNumber: vendorData.gstNumber,
        status: vendorData.status,
        rating: vendorData.rating,
        outstanding: vendorData.outstanding,
        city: vendorData.city,
        state: vendorData.state,
        pinCode: vendorData.pinCode,
        address: vendorData.address,
        materialsSupplied: '[]'
    });
    return { vendor: created, isNew: true };
}

async function upsertMaterial(matData, vendorId) {
    // Check for existing by SKU or name
    const existing = await Material.sequelizeModel.findOne({
        where: {
            [require('sequelize').Op.or]: [
                ...(matData.sku ? [{ sku: matData.sku }] : []),
                { name: matData.name }
            ]
        }
    });

    let material;
    if (existing) {
        console.log(`      ~ Material "${matData.name}" already exists (ID: ${existing.id}) — linking`);
        material = existing;
    } else {
        console.log(`      + Creating material: "${matData.name}" [${matData.sku}]`);
        material = await Material.sequelizeModel.create({
            name: matData.name,
            sku: matData.sku || null,
            category: matData.category,
            quantity: matData.quantity,
            unit: matData.unit,
            price: matData.price,
            lowStockThreshold: matData.lowStockThreshold || 10,
            warehouse: matData.warehouse || 'WH-A',
            shelf: matData.shelf || null,
            vendorId: vendorId,
            isActive: true,
            status: matData.quantity <= (matData.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock',
            stockStatus: matData.quantity <= (matData.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'
        });
    }

    // Link via VendorMaterial junction (upsert)
    const existingLink = await VendorMaterial.sequelizeModel.findOne({
        where: { vendorId: vendorId, materialId: material.id }
    });

    if (!existingLink) {
        await VendorMaterial.sequelizeModel.create({
            vendorId: vendorId,
            materialId: material.id,
            supplierPrice: matData.price,
            leadTime: 7,
            minOrderQty: 1,
            isPreferred: true,
            status: 'Active'
        });
        console.log(`      ✔  Linked material "${matData.name}" to vendor ID ${vendorId}`);
    } else {
        console.log(`      ✔  Material "${matData.name}" already linked to this vendor`);
    }

    return material;
}

async function main() {
    try {
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║    SMTBMS Vendor Master Data Seed — Starting     ║');
        console.log('╚══════════════════════════════════════════════════╝\n');

        await sequelize.authenticate();
        console.log('✔  Database connected.\n');

        setupAssociations();

        // Sync new models without dropping existing tables
        await VendorMaterial.sequelizeModel.sync({ alter: false, force: false });

        let created = 0;
        let updated = 0;
        let materialsCreated = 0;

        for (const vendorData of VENDORS) {
            console.log(`\n▶  Processing: ${vendorData.vendorCode} — ${vendorData.name}`);
            
            const { vendor, isNew } = await upsertVendor(vendorData);
            if (isNew) created++;
            else updated++;

            // Seed materials and link
            if (vendorData.materials && vendorData.materials.length > 0) {
                console.log(`   Materials (${vendorData.materials.length}):`);
                for (const matData of vendorData.materials) {
                    await upsertMaterial(matData, vendor.id);
                    materialsCreated++;
                }
            }

            await sleep(50); // Small delay to avoid SQLite locking
        }

        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║              SEED COMPLETE                        ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log(`║  Vendors Created: ${String(created).padEnd(30)}║`);
        console.log(`║  Vendors Updated: ${String(updated).padEnd(30)}║`);
        console.log(`║  Materials Seeded: ${String(materialsCreated).padEnd(29)}║`);
        console.log('╚══════════════════════════════════════════════════╝\n');

        // Verify by listing all vendors
        const allVendors = await Vendor.sequelizeModel.findAll({ order: [['vendorCode', 'ASC']] });
        console.log('📋  Current Vendor Directory:\n');
        console.log('  Code      Name                            Category             Rating  Outstanding');
        console.log('  ─────────────────────────────────────────────────────────────────────────────────');
        for (const v of allVendors) {
            const code = (v.vendorCode || '—').padEnd(9);
            const name = (v.name || '').substring(0, 30).padEnd(32);
            const cat  = (v.category || '').substring(0, 20).padEnd(21);
            const rat  = String(v.rating || 0).padEnd(8);
            const out  = '₹' + (v.outstanding || 0).toLocaleString('en-IN');
            console.log(`  ${code} ${name} ${cat} ${rat} ${out}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('\n✘  SEED FAILED:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

main();

require('dotenv').config();
const connectDB = require('./src/config/db');
const Vendor = require('./src/models/Vendor');
const Material = require('./src/models/Material');

const data = [
  { vendorName: 'Sri Lakshmi Steel Traders', name: 'MS Steel Rod 12mm', sku: 'STL-ROD-12', category: 'Steel & Metals', currentStock: 500, minStockLevel: 100, unit: 'kg', unitPrice: 65 },
  { vendorName: 'Sri Lakshmi Steel Traders', name: 'MS Steel Rod 16mm', sku: 'STL-ROD-16', category: 'Steel & Metals', currentStock: 400, minStockLevel: 80, unit: 'kg', unitPrice: 68 },
  { vendorName: 'Sri Lakshmi Steel Traders', name: 'MS Angle 40x40mm', sku: 'STL-ANG-40', category: 'Steel & Metals', currentStock: 250, minStockLevel: 50, unit: 'kg', unitPrice: 62 },
  { vendorName: 'Sri Lakshmi Steel Traders', name: 'MS Flat Bar 25mm', sku: 'STL-FLT-25', category: 'Steel & Metals', currentStock: 180, minStockLevel: 40, unit: 'kg', unitPrice: 60 },
  
  { vendorName: 'Kumaran Electricals', name: 'Copper Wire 2.5mm', sku: 'ELEC-WIRE-25', category: 'Electrical', currentStock: 200, minStockLevel: 50, unit: 'm', unitPrice: 45 },
  { vendorName: 'Kumaran Electricals', name: 'Copper Wire 4mm', sku: 'ELEC-WIRE-4', category: 'Electrical', currentStock: 150, minStockLevel: 40, unit: 'm', unitPrice: 68 },
  { vendorName: 'Kumaran Electricals', name: 'MCB 32A Single Pole', sku: 'ELEC-MCB-32', category: 'Electrical', currentStock: 60, minStockLevel: 15, unit: 'pcs', unitPrice: 180 },
  { vendorName: 'Kumaran Electricals', name: 'LED Panel Light 18W', sku: 'ELEC-LED-18', category: 'Electrical', currentStock: 100, minStockLevel: 20, unit: 'pcs', unitPrice: 320 },
  
  { vendorName: 'Thirumurugan Pipes & Fittings', name: 'PVC Pipe 4 inch', sku: 'PLMB-PVC-4', category: 'Plumbing', currentStock: 150, minStockLevel: 30, unit: 'pcs', unitPrice: 220 },
  { vendorName: 'Thirumurugan Pipes & Fittings', name: 'PVC Pipe 2 inch', sku: 'PLMB-PVC-2', category: 'Plumbing', currentStock: 200, minStockLevel: 40, unit: 'pcs', unitPrice: 110 },
  { vendorName: 'Thirumurugan Pipes & Fittings', name: 'PVC Elbow Joint 4 inch', sku: 'PLMB-ELB-4', category: 'Plumbing', currentStock: 90, minStockLevel: 20, unit: 'pcs', unitPrice: 45 },
  { vendorName: 'Thirumurugan Pipes & Fittings', name: 'Ball Valve 1 inch', sku: 'PLMB-VLV-1', category: 'Plumbing', currentStock: 70, minStockLevel: 15, unit: 'pcs', unitPrice: 165 },
  
  { vendorName: 'Madurai Cement Depot', name: 'OPC Cement 53 Grade', sku: 'CONS-CEM-53', category: 'Construction', currentStock: 100, minStockLevel: 20, unit: 'bags', unitPrice: 380 },
  { vendorName: 'Madurai Cement Depot', name: 'PPC Cement', sku: 'CONS-CEM-PPC', category: 'Construction', currentStock: 120, minStockLevel: 25, unit: 'bags', unitPrice: 360 },
  { vendorName: 'Madurai Cement Depot', name: 'River Sand', sku: 'CONS-SAND-01', category: 'Construction', currentStock: 50, minStockLevel: 10, unit: 'tons', unitPrice: 2200 },
  { vendorName: 'Madurai Cement Depot', name: 'Blue Metal Jelly 20mm', sku: 'CONS-JELLY-20', category: 'Construction', currentStock: 40, minStockLevel: 8, unit: 'tons', unitPrice: 1800 },
  
  { vendorName: 'Coimbatore Sheet Metal Works', name: 'GI Sheet 1.2mm', sku: 'SHT-GI-12', category: 'Sheet Metal', currentStock: 80, minStockLevel: 15, unit: 'sheets', unitPrice: 950 },
  { vendorName: 'Coimbatore Sheet Metal Works', name: 'GI Sheet 0.8mm', sku: 'SHT-GI-08', category: 'Sheet Metal', currentStock: 100, minStockLevel: 20, unit: 'sheets', unitPrice: 720 },
  { vendorName: 'Coimbatore Sheet Metal Works', name: 'MS Sheet 2mm', sku: 'SHT-MS-2', category: 'Sheet Metal', currentStock: 60, minStockLevel: 12, unit: 'sheets', unitPrice: 1100 },
  { vendorName: 'Coimbatore Sheet Metal Works', name: 'Aluminum Sheet 1mm', sku: 'SHT-AL-1', category: 'Sheet Metal', currentStock: 45, minStockLevel: 10, unit: 'sheets', unitPrice: 1350 },
  
  { vendorName: 'Erode Welding Supplies', name: 'Welding Electrode 3.15mm', sku: 'WELD-ELEC-315', category: 'Consumables', currentStock: 300, minStockLevel: 50, unit: 'pcs', unitPrice: 12 },
  { vendorName: 'Erode Welding Supplies', name: 'Welding Electrode 4mm', sku: 'WELD-ELEC-4', category: 'Consumables', currentStock: 250, minStockLevel: 50, unit: 'pcs', unitPrice: 15 },
  { vendorName: 'Erode Welding Supplies', name: 'CO2 Welding Wire', sku: 'WELD-WIRE-CO2', category: 'Consumables', currentStock: 40, minStockLevel: 8, unit: 'rolls', unitPrice: 850 },
  { vendorName: 'Erode Welding Supplies', name: 'Welding Gas Cylinder', sku: 'WELD-GAS-01', category: 'Consumables', currentStock: 15, minStockLevel: 3, unit: 'pcs', unitPrice: 1200 },
  
  { vendorName: 'YSR Steel', name: 'Stainless Steel Sheet 2mm', sku: 'STL-SS-2', category: 'Steel', currentStock: 60, minStockLevel: 10, unit: 'sheets', unitPrice: 1450 },
  { vendorName: 'YSR Steel', name: 'Stainless Steel Rod 10mm', sku: 'STL-SS-ROD-10', category: 'Steel', currentStock: 100, minStockLevel: 20, unit: 'kg', unitPrice: 210 },
  { vendorName: 'YSR Steel', name: 'SS Pipe 1 inch', sku: 'STL-SS-PIPE-1', category: 'Steel', currentStock: 50, minStockLevel: 10, unit: 'pcs', unitPrice: 480 },
];

async function seed() {
    await connectDB();
    
    let added = 0;
    let skipped = 0;
    let vendorNotFound = 0;
    
    // Fetch all vendors to map names to IDs
    const vendors = await Vendor.find({});
    
    for (const item of data) {
        // Find matching vendor
        const vendor = vendors.find(v => v.name.trim().toLowerCase() === item.vendorName.toLowerCase());
        
        if (!vendor) {
            console.log(`[SKIP] Vendor not found: ${item.vendorName}`);
            vendorNotFound++;
            continue;
        }
        
        // Check if SKU exists
        const existing = await Material.findOne({ sku: item.sku });
        if (existing) {
            skipped++;
            continue;
        }
        
        // Insert material
        await Material.create({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.currentStock,
            lowStockThreshold: item.minStockLevel,
            unit: item.unit,
            price: item.unitPrice,
            vendorId: vendor._id || vendor.id,
            warehouse: 'Main Warehouse',
            status: item.currentStock > item.minStockLevel ? 'In Stock' : 'Low Stock'
        });
        
        added++;
    }
    
    console.log(`\n--- SEEDING COMPLETE ---`);
    console.log(`Added: ${added}`);
    console.log(`Skipped (Duplicate SKU): ${skipped}`);
    console.log(`Skipped (Vendor Not Found): ${vendorNotFound}`);
    
    const totalCount = await Material.countDocuments();
    console.log(`\nTotal Materials in DB: ${totalCount}`);
    
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});

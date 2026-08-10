require('dotenv').config();
const connectDB = require('./src/config/db');
const Material = require('./src/models/Material');

const updates = [
  // Sri Lakshmi Steel Traders
  { sku: 'STL-ROD-12', warehouse: 'Warehouse 1', shelf: 'Shelf A1' },
  { sku: 'STL-ROD-16', warehouse: 'Warehouse 1', shelf: 'Shelf A2' },
  { sku: 'STL-ANG-40', warehouse: 'Warehouse 1', shelf: 'Shelf A3' },
  { sku: 'STL-FLT-25', warehouse: 'Warehouse 1', shelf: 'Shelf A4' },
  
  // Kumaran Electricals
  { sku: 'ELEC-WIRE-25', warehouse: 'Warehouse 2', shelf: 'Shelf B1' },
  { sku: 'ELEC-WIRE-4', warehouse: 'Warehouse 2', shelf: 'Shelf B2' },
  { sku: 'ELEC-MCB-32', warehouse: 'Warehouse 2', shelf: 'Shelf B3' },
  { sku: 'ELEC-LED-18', warehouse: 'Warehouse 2', shelf: 'Shelf B4' },
  
  // Thirumurugan Pipes & Fittings
  { sku: 'PLMB-PVC-4', warehouse: 'Warehouse 3', shelf: 'Shelf C1' },
  { sku: 'PLMB-PVC-2', warehouse: 'Warehouse 3', shelf: 'Shelf C2' },
  { sku: 'PLMB-ELB-4', warehouse: 'Warehouse 3', shelf: 'Shelf C3' },
  { sku: 'PLMB-VLV-1', warehouse: 'Warehouse 3', shelf: 'Shelf C4' },
  
  // Madurai Cement Depot
  { sku: 'CONS-CEM-53', warehouse: 'Warehouse 4', shelf: 'Shelf D1' },
  { sku: 'CONS-CEM-PPC', warehouse: 'Warehouse 4', shelf: 'Shelf D2' },
  { sku: 'CONS-SAND-01', warehouse: 'Warehouse 4', shelf: 'Yard Area' },
  { sku: 'CONS-JELLY-20', warehouse: 'Warehouse 4', shelf: 'Yard Area' },
  
  // Coimbatore Sheet Metal Works
  { sku: 'SHT-GI-12', warehouse: 'Warehouse 1', shelf: 'Shelf A5' },
  { sku: 'SHT-GI-08', warehouse: 'Warehouse 1', shelf: 'Shelf A6' },
  { sku: 'SHT-MS-2', warehouse: 'Warehouse 1', shelf: 'Shelf A7' },
  { sku: 'SHT-AL-1', warehouse: 'Warehouse 1', shelf: 'Shelf A8' },
  
  // Erode Welding Supplies
  { sku: 'WELD-ELEC-315', warehouse: 'Warehouse 2', shelf: 'Shelf B5' },
  { sku: 'WELD-ELEC-4', warehouse: 'Warehouse 2', shelf: 'Shelf B6' },
  { sku: 'WELD-WIRE-CO2', warehouse: 'Warehouse 2', shelf: 'Shelf B7' },
  { sku: 'WELD-GAS-01', warehouse: 'Warehouse 2', shelf: 'Shelf B8' },
  
  // YSR Steel
  { sku: 'STL-SS-2', warehouse: 'Warehouse 3', shelf: 'Shelf C5' },
  { sku: 'STL-SS-ROD-10', warehouse: 'Warehouse 3', shelf: 'Shelf C6' },
  { sku: 'STL-SS-PIPE-1', warehouse: 'Warehouse 3', shelf: 'Shelf C7' },
];

async function updateLocations() {
    await connectDB();
    
    let updatedCount = 0;
    
    for (const update of updates) {
        const material = await Material.findOne({ sku: update.sku });
        if (material) {
            material.warehouse = update.warehouse;
            material.shelf = update.shelf;
            await material.save();
            updatedCount++;
        } else {
            console.log(`[SKIP] Material not found for SKU: ${update.sku}`);
        }
    }
    
    console.log(`\n--- UPDATE COMPLETE ---`);
    console.log(`Updated Records: ${updatedCount}`);
    
    // Fetch all materials to display their new locations
    console.log(`\n--- CURRENT MATERIAL LOCATIONS ---`);
    const allMaterials = await Material.find({});
    allMaterials.forEach(m => {
        if (m.sku) {
            console.log(`${m.name} (${m.sku}) -> ${m.warehouse}, ${m.shelf}`);
        }
    });
    
    process.exit(0);
}

updateLocations().catch(err => {
    console.error(err);
    process.exit(1);
});

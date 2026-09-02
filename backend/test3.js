require('dotenv').config(); 
const Material = require('./src/models/Material');
const Order = require('./src/models/Order');

async function test() {
    const orders = await Order.find({ id: 51 });
    const materialIds = new Set();
    orders.forEach(ord => {
        if (Array.isArray(ord.items)) {
            ord.items.forEach(item => {
                if (item.materialId) materialIds.add(String(item.materialId));
                if (item.material) materialIds.add(String(item.material));
            });
        }
    });
    console.log("Material IDs:", Array.from(materialIds));
    const materials = await Material.find({ _id: { $in: Array.from(materialIds) } }).select('name price quantity sku');
    console.log("Found Materials:", materials);
}
test();

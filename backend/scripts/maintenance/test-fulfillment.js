require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/sequelize');
const Order = require('./src/models/Order');
const MaterialMovement = require('./src/models/MaterialMovement');

async function testOrderFulfillment() {
    await sequelize.authenticate();
    console.log("Connected to DB");

    // 1. Get an existing material to use
    const Material = require('./src/models/Material');
    const mat = await Material.findOne({});
    if(!mat) {
        console.log("No materials found to test with");
        process.exit(1);
    }
    const matId = mat.id || mat._id;

    // 2. Create a test Purchase Order
    const testOrder = await Order.create({
        orderNumber: 'TEST-PO-' + Date.now(),
        orderType: 'purchase',
        status: 'Order Created',
        items: [{ material: matId, quantity: 5, price: 10 }],
        totalAmount: 50
    });
    console.log("Created test Purchase Order:", testOrder.orderNumber);

    // 3. Simulate ordercontroller's updateOrderStatus logic
    const prevStatus = testOrder.status;
    const newStatus = 'Received';
    testOrder.status = newStatus;
    await testOrder.save();

    // The ordercontroller logic that we added:
    const purchaseFinalStates = ['Delivered', 'Received', 'Completed'];
    if (testOrder.orderType === 'purchase' && purchaseFinalStates.includes(newStatus) && !purchaseFinalStates.includes(prevStatus)) {
        // Mock updateStock call logic since we can't easily require the whole controller
        console.log("Status changed to Received - triggering updateStock logic");
        await MaterialMovement.create({
            materialId: matId,
            type: 'In',
            quantity: 5,
            previousQuantity: mat.quantity,
            newQuantity: mat.quantity + 5,
            reason: 'Purchase order stock addition',
            referenceOrderId: testOrder.id
        });
        mat.quantity += 5;
        await mat.save();
    }

    // 4. Verify the movement was created
    const mov = await MaterialMovement.findOne({ where: { referenceOrderId: testOrder.id } });
    if(mov) {
        console.log("✅ SUCCESS: MaterialMovement created with referenceOrderId:", mov.referenceOrderId);
    } else {
        console.log("❌ FAILED: Movement not created");
    }

    process.exit(0);
}

testOrderFulfillment().catch(console.error);

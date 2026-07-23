const mongoose = require("mongoose");
const Order = require("./src/models/Order");
require("dotenv").config();

async function checkOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const order = await Order.findOne({ orderNumber: 'ORD-881289' });
        if (order) {
            console.log("Order found:", order.orderNumber);
            console.log("Delivery fields:");
            console.log("deliveryDate:", order.deliveryDate);
            console.log("expectedDeliveryDate:", order.expectedDeliveryDate);
            console.log("deliveryETA:", order.deliveryETA);
            console.log("dueDate:", order.dueDate);
            console.log("expectedDelivery:", order.expectedDelivery);
        } else {
            console.log("Order not found");
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

checkOrder();

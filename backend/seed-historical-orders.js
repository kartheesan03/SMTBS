const Order = require('./src/models/Order');

async function seed() {
    console.log('Starting historical seeding...');
    
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
        const dateStr = `${currentYear}-${String(i + 1).padStart(2, '0')}-15T10:00:00.000Z`;
        const date = new Date(dateStr);
        
        const cyRev = Math.floor(Math.random() * 2000000) + 1000000;
        const cyExp = Math.floor(cyRev * (Math.random() * 0.3 + 0.4));
        
        const lyRev = Math.floor(cyRev * (Math.random() * 0.4 + 0.6));
        const lyExp = Math.floor(lyRev * (Math.random() * 0.3 + 0.4));

        await Order.create({
            orderNumber: `SO-CY-${i}-${Date.now()}`,
            orderType: 'sales',
            status: 'Completed',
            orderDate: date,
            totalAmount: cyRev
        });
        
        await Order.create({
            orderNumber: `PO-CY-${i}-${Date.now()}`,
            orderType: 'purchase',
            status: 'Completed',
            orderDate: date,
            totalAmount: cyExp
        });

        const lyDate = new Date(date);
        lyDate.setFullYear(currentYear - 1);
        await Order.create({
            orderNumber: `SO-LY-${i}-${Date.now()}`,
            orderType: 'sales',
            status: 'Completed',
            orderDate: lyDate,
            totalAmount: lyRev
        });

        await Order.create({
            orderNumber: `PO-LY-${i}-${Date.now()}`,
            orderType: 'purchase',
            status: 'Completed',
            orderDate: lyDate,
            totalAmount: lyExp
        });
    }

    console.log('Successfully seeded historical financial data!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
});

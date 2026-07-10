const sequelize = require('./src/config/sequelize'); 
(async () => { 
    try { 
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN sourcedLocation VARCHAR(255);'); 
        console.log('Added sourcedLocation'); 
    } catch(e) { console.error(e.message); } 
    try { 
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN deliveryNotes TEXT;'); 
        console.log('Added deliveryNotes'); 
    } catch(e) { console.error(e.message); } 
    try { 
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN holdReason TEXT;'); 
        console.log('Added holdReason'); 
    } catch(e) { console.error(e.message); } 
    try { 
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN employeeId INTEGER;'); 
        console.log('Added employeeId'); 
    } catch(e) { console.error(e.message); } 
    process.exit(0); 
})();

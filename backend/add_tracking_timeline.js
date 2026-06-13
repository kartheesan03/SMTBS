const sequelize = require('./src/config/sequelize');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        
        const queryInterface = sequelize.getQueryInterface();
        
        console.log('Adding trackingTimeline column to Orders...');
        try {
            await queryInterface.addColumn('Order', 'trackingTimeline', {
                type: DataTypes.JSON,
                allowNull: true
            });
            console.log('Successfully added trackingTimeline');
        } catch (e) {
            console.log('Error adding trackingTimeline (might already exist):', e.message);
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await sequelize.close();
    }
}

migrate();

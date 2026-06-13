const sequelize = require('./src/config/sequelize');

async function manuallyAddColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        const qi = sequelize.getQueryInterface();
        
        try {
            await qi.addColumn('Order', 'notes', {
                type: sequelize.Sequelize.DataTypes.TEXT,
                allowNull: true
            });
            console.log('Added notes column');
        } catch(e) { console.log('notes column might already exist:', e.message); }

        try {
            await qi.addColumn('Order', 'grandTotal', {
                type: sequelize.Sequelize.DataTypes.DOUBLE,
                defaultValue: 0
            });
            console.log('Added grandTotal column');
        } catch(e) { console.log('grandTotal column might already exist:', e.message); }

        console.log('Database manual alter completed successfully!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

manuallyAddColumns();

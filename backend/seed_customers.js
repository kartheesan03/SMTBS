require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const sequelize = require('./src/config/sequelize');
const { DataTypes } = require('sequelize');

const Customer = sequelize.define('Customer', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:         { type: DataTypes.STRING,  allowNull: false },
    email:        { type: DataTypes.STRING,  allowNull: true, unique: true },
    phone:        { type: DataTypes.STRING,  allowNull: true },
    company:      { type: DataTypes.STRING,  allowNull: true },
    customerType: { type: DataTypes.ENUM('Individual', 'Company'), defaultValue: 'Individual' },
    address:      { type: DataTypes.TEXT,    allowNull: true },
    industry:     { type: DataTypes.STRING,  allowNull: true },
    website:      { type: DataTypes.STRING,  allowNull: true },
    notes:        { type: DataTypes.TEXT,    allowNull: true },
    status:       { type: DataTypes.STRING,  defaultValue: 'Active' },
    gstNumber:    { type: DataTypes.STRING,  allowNull: true },
}, { tableName: 'customer', timestamps: true });

// email → website mapping
const updates = [
    { email: 'rajan@kovaist.ee',          website: 'http://www.kovaist.ee' },
    { email: 'suresh@srilakshmifab.in',   website: 'http://www.srilakshmifab.in' },
    { email: 'arun@southerninfra.in',     website: 'http://www.southerninfra.in' },
    { email: 'karthik@karthiksteel.in',   website: 'http://www.karthiksteel.in' },
    { email: 'vignesh@metrometal.in',     website: 'http://www.metrometal.in' },
    { email: 'prakash@kaverieng.com',     website: 'http://www.kaverieng.com' },
    { email: 'ravi@southernfab.in',       website: 'http://www.southernfab.in' },
    { email: 'manoj@vmrinfra.in',         website: 'http://www.vmrinfra.in' },
    { email: 'dinesh@metrostructural.in', website: 'http://www.metrostructural.in' },
    { email: 'balaji@vinayagaind.in',     website: 'http://www.srivinayagaind.in' },
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected.\n');

        let updated = 0, notFound = 0;
        for (const u of updates) {
            const row = await Customer.findOne({ where: { email: u.email } });
            if (!row) {
                console.log(`  ⚠️  Not found: ${u.email}`);
                notFound++;
                continue;
            }
            row.website = u.website;
            await row.save();
            console.log(`  ✏️  Updated: ${row.name.padEnd(18)} → ${u.website}`);
            updated++;
        }

        console.log(`\n✅ Done — ${updated} updated, ${notFound} not found.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();


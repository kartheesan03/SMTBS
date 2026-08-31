const sequelize = require('../../src/config/sequelize');
const Customer = require('../../src/models/Customer');

// CORRECTED: name = contact person, company = company name
const customersToAdd = [
    {
        customerCode: 'CUS-001',
        name: 'Rajan Kumar',
        company: 'Kovai Builders Pvt Ltd',
        customerType: 'Business',
        email: 'rajan@kovaibuilders.in',
        phone: '9843210001',
        industry: 'Construction',
        gstNumber: '33KOVAI1234A1Z5',
        status: 'Active',
        address: 'Race Course Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641018'
    },
    {
        customerCode: 'CUS-002',
        name: 'Ganesh Kumar',
        company: 'Sri Ganesh Engineering Works',
        customerType: 'Business',
        email: 'ganesh@sriganesheng.in',
        phone: '9876541200',
        industry: 'Engineering',
        gstNumber: '33SGEW1234B2Z6',
        status: 'Active'
    },
    {
        customerCode: 'CUS-003',
        name: 'Prakash Menon',
        company: 'Tamil Nadu Infrastructure Ltd',
        customerType: 'Business',
        email: 'prakash@tninfra.in',
        phone: '9865432100',
        industry: 'Infrastructure',
        gstNumber: '33TNIN1234C3Z7',
        status: 'Active'
    },
    {
        customerCode: 'CUS-004',
        name: 'Arun Raj',
        company: 'Southern Fabricators',
        customerType: 'Business',
        email: 'arun@southernfab.in',
        phone: '9798765432',
        industry: 'Fabrication',
        gstNumber: '33SOFA1234D4Z8',
        status: 'Active'
    },
    {
        customerCode: 'CUS-005',
        name: 'Suresh Babu',
        company: 'Coimbatore Industrial Projects',
        customerType: 'Business',
        email: 'suresh@ciprojects.in',
        phone: '9812345678',
        industry: 'Industrial',
        gstNumber: '33CIPR1234E5Z9',
        status: 'Active'
    },
    {
        customerCode: 'CUS-006',
        name: 'Karthik Raj',
        company: 'Chennai Construction Materials',
        customerType: 'Business',
        email: 'karthik@ccmaterials.in',
        phone: '9952012345',
        industry: 'Construction',
        gstNumber: '33CCMA1234F6Z1',
        status: 'Active'
    },
    {
        customerCode: 'CUS-007',
        name: 'Naveen Kumar',
        company: 'Prime Structural Works',
        customerType: 'Business',
        email: 'naveen@primestructural.in',
        phone: '9887654321',
        industry: 'Structural Engineering',
        gstNumber: '33PRSW1234G7Z2',
        status: 'Active'
    },
    {
        customerCode: 'CUS-008',
        name: 'Vignesh R',
        company: 'Salem Steel Fabrication',
        customerType: 'Business',
        email: 'vicky@salemfab.in',
        phone: '9789012345',
        industry: 'Fabrication',
        gstNumber: '33SASF1234H8Z3',
        status: 'Inactive'
    }
];

async function seedCustomers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Ensure all needed columns exist
        const addCols = ['customerCode', 'city', 'state', 'pinCode', 'company', 'industry', 'customerType', 'gstNumber', 'address'];
        for (const col of addCols) {
            try {
                await sequelize.query(`ALTER TABLE Customer ADD COLUMN ${col} VARCHAR(255);`);
            } catch (e) { /* column already exists – ignore */ }
        }

        let added = 0, updated = 0;

        for (const cus of customersToAdd) {
            // Match by customerCode first, then gstNumber
            const existingCus = await Customer.sequelizeModel.findOne({
                where: {
                    [sequelize.Sequelize.Op.or]: [
                        { customerCode: cus.customerCode },
                        { gstNumber: cus.gstNumber }
                    ]
                }
            });

            const fields = {
                customerCode: cus.customerCode,
                name: cus.name,          // Contact person name
                company: cus.company,    // Company name
                email: cus.email,
                phone: cus.phone,
                industry: cus.industry,
                customerType: cus.customerType,
                status: cus.status,
                gstNumber: cus.gstNumber,
                address: cus.address || null,
                city: cus.city || null,
                state: cus.state || null,
                pinCode: cus.pinCode || null
            };

            if (existingCus) {
                await existingCus.update(fields);
                updated++;
                console.log(`Updated: ${cus.company} (Contact: ${cus.name})`);
            } else {
                await Customer.sequelizeModel.create(fields);
                added++;
                console.log(`Added: ${cus.company} (Contact: ${cus.name})`);
            }
        }

        console.log(`\nDone. Added: ${added}, Updated: ${updated}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedCustomers();

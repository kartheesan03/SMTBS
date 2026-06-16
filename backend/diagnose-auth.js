/**
 * COMPREHENSIVE AUTH DIAGNOSTIC
 * Tests: DB connection, User table, password hashing, matchPassword, JWT, login API
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

const defaultUsers = [
    { email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
    { email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
    { email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
    { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
    { email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' }
];

async function diagnose() {
    console.log('========== AUTH DIAGNOSTIC START ==========\n');

    // 1. DB Connection
    try {
        await sequelize.authenticate();
        console.log('[OK] Database connection successful');
    } catch (e) {
        console.log('[FAIL] Database connection failed:', e.message);
        process.exit(1);
    }

    // 2. User table check
    try {
        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='User';");
        console.log(`[OK] User table exists: ${tables.length > 0}`);
    } catch (e) {
        console.log('[FAIL] Cannot query User table:', e.message);
    }

    // 3. JWT_SECRET check
    console.log(`[INFO] JWT_SECRET set: ${!!process.env.JWT_SECRET} (value: "${process.env.JWT_SECRET}")`);

    // 4. Check each user
    for (const u of defaultUsers) {
        console.log(`\n--- Checking ${u.email} ---`);

        // 4a. Check via Sequelize directly
        const rawUser = await User.sequelizeModel.findOne({ where: { email: u.email } });
        if (!rawUser) {
            console.log(`  [FAIL] User NOT FOUND in DB`);
            continue;
        }
        console.log(`  [OK] User found. ID: ${rawUser.id}, Role: ${rawUser.role}`);
        console.log(`  [INFO] Password hash in DB: ${rawUser.password ? rawUser.password.substring(0, 20) + '...' : 'NULL'}`);
        console.log(`  [INFO] Password starts with $2: ${rawUser.password ? rawUser.password.startsWith('$2') : false}`);

        // 4b. Test bcrypt.compare directly
        const directMatch = await bcrypt.compare(u.password, rawUser.password);
        console.log(`  [TEST] Direct bcrypt.compare('${u.password}', hash): ${directMatch}`);

        // 4c. Test matchPassword via prototype
        if (typeof rawUser.matchPassword === 'function') {
            const protoMatch = await rawUser.matchPassword(u.password);
            console.log(`  [TEST] rawUser.matchPassword('${u.password}'): ${protoMatch}`);
        } else {
            console.log(`  [WARN] matchPassword NOT a function on raw Sequelize instance`);
        }

        // 4d. Test via mongoose-bridge (how authController calls it)
        const bridgedUser = await User.findOne({ email: u.email });
        if (bridgedUser) {
            console.log(`  [OK] Bridged findOne found user. _id: ${bridgedUser._id}`);
            if (typeof bridgedUser.matchPassword === 'function') {
                try {
                    const bridgedMatch = await bridgedUser.matchPassword(u.password);
                    console.log(`  [TEST] bridgedUser.matchPassword('${u.password}'): ${bridgedMatch}`);
                } catch (e) {
                    console.log(`  [FAIL] bridgedUser.matchPassword threw: ${e.message}`);
                }
            } else {
                console.log(`  [FAIL] matchPassword NOT a function on bridged instance`);
            }
        } else {
            console.log(`  [FAIL] Bridged findOne returned null`);
        }

        // 4e. Test JWT generation
        try {
            const token = jwt.sign({ id: rawUser.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            console.log(`  [OK] JWT generated: ${token.substring(0, 30)}...`);
        } catch (e) {
            console.log(`  [FAIL] JWT generation failed: ${e.message}`);
        }
    }

    // 5. Test actual HTTP login endpoint
    console.log('\n--- Testing HTTP login endpoint ---');
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@smtbms.com', password: 'admin123' })
        });
        const data = await res.json();
        console.log(`  [HTTP] Status: ${res.status}`);
        console.log(`  [HTTP] Response: ${JSON.stringify(data).substring(0, 200)}`);
    } catch (e) {
        console.log(`  [HTTP] Login request failed: ${e.message}`);
    }

    console.log('\n========== AUTH DIAGNOSTIC END ==========');
    process.exit(0);
}

diagnose();

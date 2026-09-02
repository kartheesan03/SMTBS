const mysql = require('mysql2/promise');

const passwordsToTry = [
    '',
    'root',
    'admin',
    'password',
    '1234',
    '12345',
    '123456',
    'mysql',
    'toor',
    'root123'
];

async function guessPassword() {
    console.log("Trying common MySQL passwords for 'root'@'localhost'...");
    
    for (const pwd of passwordsToTry) {
        try {
            const conn = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: pwd,
                connectTimeout: 2000
            });
            console.log(`\nSUCCESS! Found the password: "${pwd}"`);
            await conn.end();
            return pwd;
        } catch (err) {
            process.stdout.write('.');
        }
    }
    console.log("\nFailed to guess the password. It is none of the common defaults.");
    return null;
}

guessPassword();

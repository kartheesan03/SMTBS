const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
console.log(`Connecting to database at ${dbPath}...`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    // Check if phone column exists
    db.all("PRAGMA table_info(User)", (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        
        const hasPhone = rows.some(row => row.name === 'phone');
        const hasGoogleId = rows.some(row => row.name === 'googleId');

        if (!hasPhone) {
            db.run(`ALTER TABLE User ADD COLUMN phone VARCHAR(255);`, (err) => {
                if (err) console.error("Error adding phone:", err.message);
                else console.log("Added 'phone' column to User table.");
            });
        } else {
            console.log("'phone' column already exists in User table.");
        }

        if (!hasGoogleId) {
            db.run(`ALTER TABLE User ADD COLUMN googleId VARCHAR(255);`, (err) => {
                if (err) console.error("Error adding googleId:", err.message);
                else console.log("Added 'googleId' column to User table.");
            });
        } else {
            console.log("'googleId' column already exists in User table.");
        }

        // We need to allow nulls for password since Google logins might not have one. 
        // SQLite doesn't support ALTER COLUMN to drop NOT NULL directly, 
        // so we'll rely on Sequelize's runtime behavior or a recreate if needed.
        // For now, adding the columns is sufficient.
    });
});

setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
        process.exit(0);
    });
}, 1000);

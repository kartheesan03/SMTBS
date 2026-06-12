const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.run("ALTER TABLE Customers ADD COLUMN customerType VARCHAR(255) DEFAULT 'Individual'", (err) => {
        if (err) {
            console.error('Error altering table Customers:', err.message);
        } else {
            console.log('Successfully added customerType to Customers');
        }
    });
    
    // Also check if we named the table Customer or Customers
    db.run("ALTER TABLE Customer ADD COLUMN customerType VARCHAR(255) DEFAULT 'Individual'", (err) => {
        if (err) {
            console.error('Error altering table Customer:', err.message);
        } else {
            console.log('Successfully added customerType to Customer');
        }
    });
});

db.close();

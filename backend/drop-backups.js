const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    rows.forEach(row => {
        db.run(`DROP TABLE IF EXISTS ${row.name}`, err => {
            if (err) console.error(err);
            else console.log(`Dropped ${row.name}`);
        });
    });
});

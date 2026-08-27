const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');
db.all('SELECT * FROM Employee', (err, rows) => {
    console.log("Employees: ", rows ? rows.length : err);
});

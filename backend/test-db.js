const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT SUM(totalAmount) as total FROM `Order` WHERE orderType="sales"', (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
});

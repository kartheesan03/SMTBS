const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.sqlite');
db.get('SELECT * FROM Users WHERE email="admin@smtbms.com"', (err, row) => console.log(row));

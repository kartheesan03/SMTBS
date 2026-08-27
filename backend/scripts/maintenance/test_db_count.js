const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');
db.all('SELECT * FROM User', (err, rows) => {
    console.log("Users: ", rows ? rows.length : err);
    if(rows && rows.length > 0) {
        console.log(rows.map(r => r.email));
    }
});

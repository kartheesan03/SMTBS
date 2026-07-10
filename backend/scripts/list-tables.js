const s = require('sqlite3').verbose();
const d = new s.Database('database.sqlite');
d.all("SELECT name FROM sqlite_master WHERE type='table'", [], function(e, r) {
    if (e) console.error(e);
    else console.log('Tables:', JSON.stringify(r));
    d.close();
});

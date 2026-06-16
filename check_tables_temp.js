const db = require('./backend/src/config/sequelize');
db.query("SELECT name FROM sqlite_master WHERE type='table';").then(res => {
    console.log(res[0]);
    process.exit(0);
}).catch(console.error);

const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'database.sqlite' });
sequelize.query("PRAGMA table_info('AuditLog')", { type: QueryTypes.SELECT }).then(cols => {
    console.log("Cols length:", cols.length);
    const colDefs = cols.map(c => {
        let t = (c.type||'').toUpperCase();
        let m = 'TEXT';
        if(t.includes('INT')) m = 'INT';
        if(t.includes('DATETIME')) m = 'DATETIME';
        let def = '  `' + c.name + '` ' + m;
        if(c.notnull) def += ' NOT NULL';
        return def;
    });
    console.log(colDefs.join(',\n'));
});

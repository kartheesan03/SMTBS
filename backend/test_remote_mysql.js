const mysql2 = require('mysql2/promise');
async function f() {
  try {
    const conn = await mysql2.createConnection('mysql://root:rJkGclOsTglOoUzWiKfrJwKGCbirekgb@thomas.proxy.rlwy.net:15333/railway');
    console.log('OK Remote connected');
    await conn.end();
  } catch(e) {
    console.log('FAIL', e.message);
  }
}
f();

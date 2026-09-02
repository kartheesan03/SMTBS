// Package verification — run from backend directory
['sqlite3','pg','pg-hstore'].forEach(p => {
  try { require(p); console.log('FAIL: ' + p + ' is still installed!'); }
  catch(e) { console.log('OK: ' + p + ' removed.'); }
});
['mysql2','sequelize'].forEach(p => {
  try { require(p); console.log('OK: ' + p + ' is available.'); }
  catch(e) { console.log('FAIL: ' + p + ' missing! ' + e.message); }
});
console.log('Verification complete.');

require('dotenv').config();
const seq = require('../src/config/sequelize');

(async () => {
  try {
    await seq.authenticate();
    const qi = seq.getQueryInterface();
    const jp = await qi.describeTable('JobPosting');
    console.log('JobPosting columns:', Object.keys(jp).join(', '));
    const cand = await qi.describeTable('Candidate');
    console.log('Candidate columns:', Object.keys(cand).join(', '));
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
})();

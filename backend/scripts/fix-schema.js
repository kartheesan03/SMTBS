require('dotenv').config();
const seq = require('../src/config/sequelize');
const { DataTypes } = require('sequelize');

(async () => {
  try {
    await seq.authenticate();
    const qi = seq.getQueryInterface();

    const jp = await qi.describeTable('JobPosting');

    if (!jp.slug) {
      await qi.addColumn('JobPosting', 'slug', { type: DataTypes.STRING(255), allowNull: true });
      console.log('[Fix] Injected slug to JobPosting');
    } else { console.log('[Fix] slug already exists'); }

    if (!jp.skills) {
      await qi.addColumn('JobPosting', 'skills', { type: DataTypes.TEXT, allowNull: true });
      console.log('[Fix] Injected skills to JobPosting');
    } else { console.log('[Fix] skills already exists'); }

    if (!jp.minExperience) {
      await qi.addColumn('JobPosting', 'minExperience', { type: DataTypes.STRING(255), allowNull: true });
      console.log('[Fix] Injected minExperience to JobPosting');
    } else { console.log('[Fix] minExperience already exists'); }

    const cand = await qi.describeTable('Candidate');

    if (!cand.resume) {
      await qi.addColumn('Candidate', 'resume', { type: DataTypes.STRING(255), allowNull: true });
      console.log('[Fix] Injected resume to Candidate');
    } else { console.log('[Fix] resume already exists'); }

    if (!cand.coverLetter) {
      await qi.addColumn('Candidate', 'coverLetter', { type: DataTypes.TEXT, allowNull: true });
      console.log('[Fix] Injected coverLetter to Candidate');
    } else { console.log('[Fix] coverLetter already exists'); }

    if (!cand.experience) {
      await qi.addColumn('Candidate', 'experience', { type: DataTypes.STRING(255), allowNull: true });
      console.log('[Fix] Injected experience to Candidate');
    } else { console.log('[Fix] experience already exists'); }

    if (!cand.skills) {
      await qi.addColumn('Candidate', 'skills', { type: DataTypes.TEXT, allowNull: true });
      console.log('[Fix] Injected skills to Candidate');
    } else { console.log('[Fix] skills already exists'); }

    console.log('\nAll done! Running test insert...');
    // Test that JobPosting.create now works
    const { JobPosting } = require('../src/models/Recruitment');
    const job = await JobPosting.create({
      title: 'Schema Test', department: 'Test', type: 'Full-time',
      status: 'Open', description: 'Test', openings: 1
    });
    console.log('SUCCESS: test job created with id', job.id, 'slug:', job.slug);
    await job.destroy();
    console.log('Test record cleaned up.');

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    process.exit(0);
  }
})();

require('dotenv').config();
const seq = require('../src/config/sequelize');
const { JobPosting } = require('../src/models/Recruitment');

(async () => {
  try {
    await seq.authenticate();
    console.log('DB connected. Testing createJob...');

    const job = await JobPosting.create({
      title: 'Test Job',
      department: 'HR',
      location: 'Chennai',
      type: 'Full-time',
      status: 'Open',
      description: 'Test description',
      requirements: 'Test requirements',
      skills: 'Node.js, React',
      minExperience: '2 Years',
      salaryMin: 50000,
      salaryMax: 80000,
      deadline: null,
      openings: 2,
      createdBy: null,
    });

    console.log('SUCCESS! Job created:', job.toJSON());
    await job.destroy();
    console.log('Test record cleaned up.');
  } catch (e) {
    console.error('FAILED:', e.message);
    if (e.errors) console.error('Details:', JSON.stringify(e.errors, null, 2));
  } finally {
    process.exit(0);
  }
})();

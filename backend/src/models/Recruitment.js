const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const JobPosting = sequelize.define('JobPosting', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:        { type: DataTypes.STRING,  allowNull: false },
    slug:         { type: DataTypes.STRING,  unique: true, allowNull: true },
    department:   { type: DataTypes.STRING,  allowNull: true },
    location:     { type: DataTypes.STRING,  allowNull: true },
    type:         { type: DataTypes.ENUM('Full-time','Part-time','Contract','Internship'), defaultValue: 'Full-time' },
    status:       { type: DataTypes.ENUM('Open','On Hold','Closed','Filled'), defaultValue: 'Open' },
    description:  { type: DataTypes.TEXT,    allowNull: true },
    requirements: { type: DataTypes.TEXT,    allowNull: true },
    salaryMin:    { type: DataTypes.INTEGER, allowNull: true },
    salaryMax:    { type: DataTypes.INTEGER, allowNull: true },
    deadline:     { type: DataTypes.DATEONLY, allowNull: true },
    openings:     { type: DataTypes.INTEGER, defaultValue: 1 },
    createdBy:    { type: DataTypes.INTEGER, allowNull: true },
    skills:       { type: DataTypes.TEXT,    allowNull: true },
    minExperience:{ type: DataTypes.STRING,  allowNull: true },
}, {
    hooks: {
        beforeSave: (job, options) => {
            if (job.title && (!job.slug || job.changed('title'))) {
                const baseSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                const randomId = Math.random().toString(36).substring(2, 8);
                job.slug = `${baseSlug}-${randomId}`;
            }
        }
    }
});
const Candidate = sequelize.define('Candidate', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jobId:       { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING,  allowNull: false },
    email:       { type: DataTypes.STRING,  allowNull: true },
    phone:       { type: DataTypes.STRING,  allowNull: true },
    resume:      { type: DataTypes.STRING,  allowNull: true },
    coverLetter: { type: DataTypes.TEXT,    allowNull: true },
    experience:  { type: DataTypes.STRING,  allowNull: true },
    skills:      { type: DataTypes.TEXT,    allowNull: true },
    stage:       { type: DataTypes.ENUM('Applied','Screening','Interview','Offer','Hired','Rejected'), defaultValue: 'Applied' },
    source:      { type: DataTypes.STRING,  allowNull: true },
    notes:       { type: DataTypes.TEXT,    allowNull: true },
    rating:      { type: DataTypes.INTEGER, defaultValue: 0 },
    appliedAt:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
});
JobPosting.hasMany(Candidate, { foreignKey: 'jobId', as: 'candidates' });
Candidate.belongsTo(JobPosting, { foreignKey: 'jobId', as: 'job' });
// syncTables removed to prevent race conditions with db.js
module.exports = { JobPosting, Candidate };

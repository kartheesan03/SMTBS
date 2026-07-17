const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const JobPosting = sequelize.define('JobPosting', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:        { type: DataTypes.STRING,  allowNull: false },
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
});

const Candidate = sequelize.define('Candidate', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jobId:       { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING,  allowNull: false },
    email:       { type: DataTypes.STRING,  allowNull: true },
    phone:       { type: DataTypes.STRING,  allowNull: true },
    stage:       { type: DataTypes.ENUM('Applied','Screening','Interview','Offer','Hired','Rejected'), defaultValue: 'Applied' },
    source:      { type: DataTypes.STRING,  allowNull: true },   // e.g. LinkedIn, Referral
    notes:       { type: DataTypes.TEXT,    allowNull: true },
    rating:      { type: DataTypes.INTEGER, defaultValue: 0 },   // 1-5
    appliedAt:   { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
});

JobPosting.hasMany(Candidate, { foreignKey: 'jobId', as: 'candidates' });
Candidate.belongsTo(JobPosting, { foreignKey: 'jobId', as: 'job' });

const syncTables = async () => {
    await JobPosting.sync({ alter: true });
    await Candidate.sync({ alter: true });
};
syncTables().catch(console.error);

module.exports = { JobPosting, Candidate };

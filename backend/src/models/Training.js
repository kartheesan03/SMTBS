const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const TrainingCourseSequelize = sequelize.define('TrainingCourse', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:       { type: DataTypes.STRING,  allowNull: false },
    description: { type: DataTypes.TEXT,    allowNull: true },
    category:    { type: DataTypes.ENUM('technical','leadership','compliance','soft-skills','health','other'), defaultValue: 'other' },
    instructor:  { type: DataTypes.STRING,  allowNull: true },
    duration:    { type: DataTypes.STRING,  allowNull: true },       // e.g. "8 hrs"
    capacity:    { type: DataTypes.INTEGER, defaultValue: 30 },
    status:      { type: DataTypes.ENUM('Not Started','In Progress','Completed','Archived'), defaultValue: 'Not Started' },
    badge:       { type: DataTypes.STRING,  allowNull: true },       // e.g. "Mandatory", "New", "Popular"
    rating:      { type: DataTypes.FLOAT,   defaultValue: 0 },
    color:       { type: DataTypes.STRING,  defaultValue: '#3b82f6' },
    dueDate:     { type: DataTypes.DATEONLY, allowNull: true },
    createdBy:   { type: DataTypes.INTEGER, allowNull: true },
});

const TrainingEnrollment = sequelize.define('TrainingEnrollment', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    userId:   { type: DataTypes.INTEGER, allowNull: false },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },  // 0-100
    status:   { type: DataTypes.ENUM('Not Started','In Progress','Completed'), defaultValue: 'Not Started' },
    completedAt: { type: DataTypes.DATE, allowNull: true },
});

TrainingCourseSequelize.hasMany(TrainingEnrollment, { foreignKey: 'courseId', as: 'enrollments' });
TrainingEnrollment.belongsTo(TrainingCourseSequelize, { foreignKey: 'courseId', as: 'course' });

const TrainingCourse = makeBridgedModel('TrainingCourse', TrainingCourseSequelize);
const TrainingEnrollmentModel = makeBridgedModel('TrainingEnrollment', TrainingEnrollment);

module.exports = { TrainingCourse, TrainingEnrollment: TrainingEnrollmentModel, TrainingCourseSequelize, TrainingEnrollmentSequelize: TrainingEnrollment };

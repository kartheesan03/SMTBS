const { TrainingCourseSequelize, TrainingEnrollmentSequelize } = require('../models/Training');
const User = require('../models/User');

// ── Sync tables ───────────────────────────────────────────────────────────────
const syncTables = async () => {
    await TrainingCourseSequelize.sync({ alter: true });
    await TrainingEnrollmentSequelize.sync({ alter: true });
};
syncTables().catch(console.error);

// GET /api/training/courses
exports.getCourses = async (req, res) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category && category !== 'all') where.category = category;

        const courses = await TrainingCourseSequelize.findAll({
            where,
            include: [{ model: TrainingEnrollmentSequelize, as: 'enrollments', attributes: ['id', 'userId', 'progress', 'status'] }],
            order: [['createdAt', 'DESC']],
        });

        const userId = req.user?.id;
        const result = courses.map(c => {
            const plain = c.toJSON();
            const myEnrollment = plain.enrollments?.find(e => e.userId === userId) || null;
            return {
                ...plain,
                enrolled: plain.enrollments?.length || 0,
                myProgress: myEnrollment?.progress || 0,
                myStatus: myEnrollment?.status || 'Not Started',
                enrollments: undefined,
            };
        });

        res.json(result);
    } catch (err) {
        console.error('getCourses error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/training/stats
exports.getStats = async (req, res) => {
    try {
        const totalCourses = await TrainingCourseSequelize.count();
        const totalEnrollments = await TrainingEnrollmentSequelize.count();

        const completedEnrollments = await TrainingEnrollmentSequelize.count({ where: { status: 'Completed' } });
        const avgCompletion = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        const certifications = await TrainingEnrollmentSequelize.count({ where: { status: 'Completed' } });

        // Unique enrolled users
        const enrolledRows = await TrainingEnrollmentSequelize.findAll({ attributes: ['userId'] });
        const uniqueUsers = new Set(enrolledRows.map(r => r.userId)).size;

        res.json({ totalCourses, enrolledEmployees: uniqueUsers, avgCompletion, certifications });
    } catch (err) {
        console.error('getStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/training/my-progress
exports.getMyProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const enrollments = await TrainingEnrollmentSequelize.findAll({ where: { userId } });
        const total      = enrollments.length;
        const completed  = enrollments.filter(e => e.status === 'Completed').length;
        const inProgress = enrollments.filter(e => e.status === 'In Progress').length;

        // Hours: sum all enrolled course durations
        const courses = await TrainingCourseSequelize.findAll({ where: { id: enrollments.map(e => e.courseId) }, attributes: ['id', 'duration'] });
        let totalHours = 0;
        courses.forEach(c => {
            const match = (c.duration || '').match(/(\d+(\.\d+)?)/);
            if (match) totalHours += parseFloat(match[1]);
        });
        const learnedHours = Math.round(totalHours * (completed / Math.max(total, 1)));

        res.json({
            coursesCompleted: completed,
            totalCourses: total,
            hoursLearned: learnedHours,
            totalHours: Math.round(totalHours),
            certifications: completed,
            totalCertifications: total,
        });
    } catch (err) {
        console.error('getMyProgress error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/training/courses — create a course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, instructor, duration, capacity, status, badge, rating, color, dueDate } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });
        const course = await TrainingCourseSequelize.create({
            title, description, category, instructor, duration,
            capacity: capacity || 30, status: status || 'Not Started',
            badge, rating: rating || 0, color: color || '#3b82f6',
            dueDate, createdBy: req.user?.id
        });
        res.status(201).json(course);
    } catch (err) {
        console.error('createCourse error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/training/courses/:id — update
exports.updateCourse = async (req, res) => {
    try {
        const course = await TrainingCourseSequelize.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        await course.update(req.body);
        res.json(course);
    } catch (err) {
        console.error('updateCourse error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/training/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const course = await TrainingCourseSequelize.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        await course.destroy();
        res.json({ message: 'Course deleted' });
    } catch (err) {
        console.error('deleteCourse error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/training/courses/:id/enroll — enroll current user
exports.enrollCourse = async (req, res) => {
    try {
        const userId = req.user?.id;
        const courseId = parseInt(req.params.id);
        const [enrollment, created] = await TrainingEnrollmentSequelize.findOrCreate({
            where: { courseId, userId },
            defaults: { progress: 0, status: 'In Progress' }
        });
        if (!created) {
            return res.status(400).json({ message: 'Already enrolled' });
        }
        res.status(201).json(enrollment);
    } catch (err) {
        console.error('enrollCourse error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/training/courses/:id/progress — update progress
exports.updateProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const courseId = parseInt(req.params.id);
        const { progress } = req.body;
        const enrollment = await TrainingEnrollmentSequelize.findOne({ where: { courseId, userId } });
        if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
        const newProgress = Math.min(100, Math.max(0, parseInt(progress) || 0));
        const newStatus = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Not Started';
        await enrollment.update({ progress: newProgress, status: newStatus, completedAt: newProgress === 100 ? new Date() : null });
        res.json(enrollment);
    } catch (err) {
        console.error('updateProgress error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

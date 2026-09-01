const { JobPosting, Candidate } = require('../models/Recruitment');
exports.getJobs = async (req, res) => {
    try {
        const jobs = await JobPosting.findAll({
            include: [{ model: Candidate, as: 'candidates', attributes: ['id', 'stage'] }],
            order: [['createdAt', 'DESC']]
        });
        const result = jobs.map(j => {
            const plain = j.toJSON();
            return {
                ...plain,
                totalCandidates: plain.candidates?.length || 0,
                hired: plain.candidates?.filter(c => c.stage === 'Hired').length || 0,
                candidates: undefined
            };
        });
        res.json(result);
    } catch (err) {
        console.error('getJobs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createJob = async (req, res) => {
    try {
        const { title, department, location, type, status, description, requirements, salaryMin, salaryMax, deadline, openings, skills, minExperience } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });
        const job = await JobPosting.create({ title, department, location, type, status, description, requirements, salaryMin, salaryMax, deadline: deadline || null, openings: openings || 1, createdBy: req.user?.id, skills, minExperience });
        res.status(201).json(job);
    } catch (err) {
        console.error('createJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateJob = async (req, res) => {
    try {
        const job = await JobPosting.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await job.update(req.body);
        res.json(job);
    } catch (err) {
        console.error('updateJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteJob = async (req, res) => {
    try {
        const job = await JobPosting.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await job.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('deleteJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCandidates = async (req, res) => {
    try {
        const where = {};
        if (req.query.jobId) where.jobId = req.query.jobId;
        const candidates = await Candidate.findAll({
            where,
            include: [{ model: JobPosting, as: 'job', attributes: ['id', 'title', 'department'] }],
            order: [['appliedAt', 'DESC']]
        });
        res.json(candidates);
    } catch (err) {
        console.error('getCandidates error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addCandidate = async (req, res) => {
    try {
        const { jobId, name, email, phone, stage, source, notes, rating } = req.body;
        if (!jobId || !name) return res.status(400).json({ message: 'jobId and name are required' });
        const c = await Candidate.create({ jobId, name, email, phone, stage: stage || 'Applied', source, notes, rating: rating || 0 });
        res.status(201).json(c);
    } catch (err) {
        console.error('addCandidate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateCandidate = async (req, res) => {
    try {
        const c = await Candidate.findByPk(req.params.id);
        if (!c) return res.status(404).json({ message: 'Candidate not found' });
        await c.update(req.body);
        res.json(c);
    } catch (err) {
        console.error('updateCandidate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteCandidate = async (req, res) => {
    try {
        const c = await Candidate.findByPk(req.params.id);
        if (!c) return res.status(404).json({ message: 'Candidate not found' });
        await c.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('deleteCandidate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStats = async (req, res) => {
    try {
        const openJobs     = await JobPosting.count({ where: { status: 'Open' } });
        const totalApplied = await Candidate.count();
        const interviews   = await Candidate.count({ where: { stage: 'Interview' } });
        const hired        = await Candidate.count({ where: { stage: 'Hired' } });
        res.json({ openJobs, totalApplied, interviews, hired });
    } catch (err) {
        console.error('getStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicJob = async (req, res) => {
    try {
        const job = await JobPosting.findOne({
            where: { slug: req.params.slug, status: 'Open' }
        });
        if (!job) return res.status(404).json({ message: 'Job not found or no longer available' });
        res.json(job);
    } catch (err) {
        console.error('getPublicJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.applyForJob = async (req, res) => {
    try {
        const { slug } = req.params;
        const job = await JobPosting.findOne({ where: { slug, status: 'Open' } });
        if (!job) return res.status(404).json({ message: 'Job not found or no longer available' });

        const { firstName, lastName, email, phone, coverLetter, experience, skills } = req.body;
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'First Name, Last Name, and Email are required' });
        }

        const name = `${firstName} ${lastName}`.trim();
        const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;

        const candidate = await Candidate.create({
            jobId: job.id,
            name,
            email,
            phone,
            resume: resumePath,
            coverLetter,
            experience,
            skills,
            stage: 'Applied',
            source: 'Public Form',
        });

        res.status(201).json({ message: 'Application submitted successfully', candidateId: candidate.id });
    } catch (err) {
        console.error('applyForJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

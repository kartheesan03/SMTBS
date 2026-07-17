const { JobPosting, Candidate } = require('../models/Recruitment');

// ── Job Postings ──────────────────────────────────────────────────────────────

// GET /api/recruitment/jobs
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

// POST /api/recruitment/jobs
exports.createJob = async (req, res) => {
    try {
        const { title, department, location, type, status, description, requirements, salaryMin, salaryMax, deadline, openings } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });
        const job = await JobPosting.create({ title, department, location, type, status, description, requirements, salaryMin, salaryMax, deadline, openings: openings || 1, createdBy: req.user?.id });
        res.status(201).json(job);
    } catch (err) {
        console.error('createJob error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/recruitment/jobs/:id
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

// DELETE /api/recruitment/jobs/:id
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

// ── Candidates ────────────────────────────────────────────────────────────────

// GET /api/recruitment/candidates?jobId=
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

// POST /api/recruitment/candidates
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

// PUT /api/recruitment/candidates/:id
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

// DELETE /api/recruitment/candidates/:id
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

// GET /api/recruitment/stats
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

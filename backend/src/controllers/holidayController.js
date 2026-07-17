const Holiday = require('../models/Holiday');
const { Op } = require('sequelize');

// GET /api/holidays?year=2026
exports.getHolidays = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const holidays = await Holiday.findAll({
            where: {
                date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] }
            },
            order: [['date', 'ASC']]
        });
        res.json(holidays);
    } catch (err) {
        console.error('getHolidays error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/holidays
exports.createHoliday = async (req, res) => {
    try {
        const { name, date, type, description, color, isRecurring } = req.body;
        if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });
        const holiday = await Holiday.create({ name, date, type, description, color: color || '#6366f1', isRecurring: isRecurring || false, createdBy: req.user?.id });
        res.status(201).json(holiday);
    } catch (err) {
        console.error('createHoliday error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/holidays/:id
exports.updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByPk(req.params.id);
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
        await holiday.update(req.body);
        res.json(holiday);
    } catch (err) {
        console.error('updateHoliday error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/holidays/:id
exports.deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByPk(req.params.id);
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
        await holiday.destroy();
        res.json({ message: 'Holiday deleted' });
    } catch (err) {
        console.error('deleteHoliday error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

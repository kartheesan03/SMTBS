const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectcontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, projectController.getAllProjects);
router.post('/', protect, projectController.createProject);
router.put('/:id', protect, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

module.exports = router;

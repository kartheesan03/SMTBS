const Project = require('../models/Project');

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, status, progress, deadline, manager, priority, color } = req.body;
        
        const project = await Project.create({
            name,
            status: status || 'Planning',
            progress: progress || 0,
            deadline: deadline || null,
            manager: manager || 'Unassigned',
            priority: priority || 'Medium',
            color: color || '#3b82f6'
        });
        
        res.status(201).json(project);
    } catch (err) {
        console.error("Error creating project:", err);
        res.status(500).json({ error: "Failed to create project" });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        await project.update(req.body);
        res.status(200).json(project);
    } catch (err) {
        console.error("Error updating project:", err);
        res.status(500).json({ error: "Failed to update project" });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ error: "Project not found" });

        await project.destroy();
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        console.error("Error deleting project:", err);
        res.status(500).json({ error: "Failed to delete project" });
    }
};

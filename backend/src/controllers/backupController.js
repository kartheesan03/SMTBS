const Backup = require('../models/Backup');
const BackupSchedule = require('../models/BackupSchedule');
const RestoreLog = require('../models/RestoreLog');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const Order = require('../models/Order');
const Material = require('../models/Material');

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../../backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

exports.createBackup = async (req, res) => {
    try {
        const { backupName, backupType } = req.body;
        const role = req.user?.role?.toLowerCase() || 'employee';
        const userId = req.user?.id;
        const department = req.user?.department;

        let finalType = backupType || 'Full';
        let dataToBackup = {};

        if (role === 'admin' || role === 'super admin') {
            // Admin can backup everything
            if (finalType === 'Full' || finalType === 'Database') {
                dataToBackup.employees = await Employee.find({});
                dataToBackup.attendance = await Attendance.find({});
                dataToBackup.leaves = await Leave.find({});
                dataToBackup.salaries = await Salary.find({});
                dataToBackup.orders = await Order.find({});
                dataToBackup.materials = await Material.find({});
            }
        } else if (role === 'hr') {
            finalType = 'HR';
            dataToBackup.employees = await Employee.find({});
            dataToBackup.attendance = await Attendance.find({});
            dataToBackup.leaves = await Leave.find({});
            dataToBackup.salaries = await Salary.find({});
        } else if (role === 'manager') {
            finalType = 'Manager';
            // Manager backs up only their department
            dataToBackup.employees = await Employee.find({ department });
            
            // To filter attendance by department, we might need employee IDs
            const empIds = dataToBackup.employees.map(e => e._id);
            dataToBackup.attendance = await Attendance.find({ employee: { $in: empIds } });
        } else {
            return res.status(403).json({ message: 'Unauthorized to create backups' });
        }

        const fileName = `${backupName || `Backup_${Date.now()}`}.json`;
        const filePath = path.join(BACKUP_DIR, fileName);
        const fileContent = JSON.stringify(dataToBackup, null, 2);
        
        fs.writeFileSync(filePath, fileContent);
        
        const stats = fs.statSync(filePath);
        const fileSizeInMegabytes = stats.size / (1024 * 1024);
        const fileSizeStr = fileSizeInMegabytes > 1024 
            ? `${(fileSizeInMegabytes / 1024).toFixed(2)}GB` 
            : `${fileSizeInMegabytes.toFixed(2)}MB`;

        const newBackup = await Backup.create({
            backupName: backupName || fileName,
            backupType: finalType,
            filePath: filePath,
            fileSize: fileSizeStr,
            createdBy: userId,
            status: 'Success'
        });

        res.status(201).json({ message: 'Backup created successfully', backup: newBackup });

    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ message: 'Failed to create backup', error: error.message });
    }
};

exports.listBackups = async (req, res) => {
    try {
        const role = req.user?.role?.toLowerCase() || 'employee';
        let query = {};
        
        if (role !== 'admin' && role !== 'super admin') {
            if (role === 'hr') query.backupType = 'HR';
            else if (role === 'manager') query.backupType = 'Manager';
            else return res.status(403).json({ message: 'Unauthorized' });
        }

        const backups = await Backup.find(query)
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });
            
        res.status(200).json(backups);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch backups', error: error.message });
    }
};

exports.downloadBackup = async (req, res) => {
    try {
        const backup = await Backup.findById(req.params.id);
        if (!backup) return res.status(404).json({ message: 'Backup not found' });
        
        const role = req.user?.role?.toLowerCase();
        if (role !== 'admin' && role !== 'super admin') {
            if (role === 'hr' && backup.backupType !== 'HR') return res.status(403).json({ message: 'Unauthorized' });
            if (role === 'manager' && backup.backupType !== 'Manager') return res.status(403).json({ message: 'Unauthorized' });
        }

        if (fs.existsSync(backup.filePath)) {
            res.download(backup.filePath);
        } else {
            res.status(404).json({ message: 'Backup file missing on server' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to download backup', error: error.message });
    }
};

exports.restoreBackup = async (req, res) => {
    try {
        const role = req.user?.role?.toLowerCase();
        if (role !== 'admin' && role !== 'super admin') {
            return res.status(403).json({ message: 'Only Admin can restore backups' });
        }

        const backup = await Backup.findById(req.params.id);
        if (!backup) return res.status(404).json({ message: 'Backup not found' });

        if (!fs.existsSync(backup.filePath)) {
            return res.status(404).json({ message: 'Backup file missing on server' });
        }

        const fileContent = fs.readFileSync(backup.filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Simple restore logic: remove all current and insert from backup
        // WARNING: This is a destructive operation.
        if (data.employees) { await Employee.deleteMany({}); await Employee.insertMany(data.employees); }
        if (data.attendance) { await Attendance.deleteMany({}); await Attendance.insertMany(data.attendance); }
        if (data.leaves) { await Leave.deleteMany({}); await Leave.insertMany(data.leaves); }
        if (data.salaries) { await Salary.deleteMany({}); await Salary.insertMany(data.salaries); }
        if (data.orders) { await Order.deleteMany({}); await Order.insertMany(data.orders); }
        if (data.materials) { await Material.deleteMany({}); await Material.insertMany(data.materials); }

        await RestoreLog.create({
            backupId: backup._id,
            restoredBy: req.user.id,
            status: 'Success',
            remarks: 'Restored from local backup file'
        });

        res.status(200).json({ message: 'Backup restored successfully' });
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).json({ message: 'Failed to restore backup', error: error.message });
    }
};

exports.deleteBackup = async (req, res) => {
    try {
        const role = req.user?.role?.toLowerCase();
        if (role !== 'admin' && role !== 'super admin') {
            return res.status(403).json({ message: 'Only Admin can delete backups' });
        }

        const backup = await Backup.findById(req.params.id);
        if (!backup) return res.status(404).json({ message: 'Backup not found' });

        if (fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }

        await Backup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Backup deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete backup', error: error.message });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        const role = req.user?.role?.toLowerCase();
        let query = {};
        if (role !== 'admin' && role !== 'super admin') {
            if (role === 'hr') query.backupType = 'HR';
            else if (role === 'manager') query.backupType = 'Manager';
            else return res.status(403).json({ message: 'Unauthorized' });
        }

        const count = await Backup.countDocuments(query);
        const latest = await Backup.findOne(query).sort({ createdAt: -1 });

        // Calculate size in MB
        const allBackups = await Backup.find(query);
        let totalMB = 0;
        allBackups.forEach(b => {
            if (b.fileSize) {
                if (b.fileSize.includes('GB')) {
                    totalMB += parseFloat(b.fileSize) * 1024;
                } else if (b.fileSize.includes('MB')) {
                    totalMB += parseFloat(b.fileSize);
                }
            }
        });

        res.status(200).json({
            totalBackups: count,
            lastBackup: latest ? latest.createdAt : null,
            storageUsed: totalMB > 1024 ? `${(totalMB / 1024).toFixed(2)} GB` : `${totalMB.toFixed(2)} MB`,
            health: '100%'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
    }
};

exports.scheduleBackup = async (req, res) => {
    try {
        const role = req.user?.role?.toLowerCase();
        if (role !== 'admin' && role !== 'super admin') {
            return res.status(403).json({ message: 'Only Admin can configure backup schedule' });
        }

        let schedule = await BackupSchedule.findOne();
        if (!schedule) {
            schedule = new BackupSchedule(req.body);
        } else {
            Object.assign(schedule, req.body);
        }
        await schedule.save();

        res.status(200).json({ message: 'Backup schedule updated', schedule });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update backup schedule', error: error.message });
    }
};

exports.getSchedule = async (req, res) => {
    try {
        const schedule = await BackupSchedule.findOne();
        res.status(200).json(schedule || {
            enabled: true, frequency: 'Daily', time: '23:00', keepLast: '30 Backups',
            storage: { local: true, gdrive: false, onedrive: false, s3: false }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch backup schedule', error: error.message });
    }
};

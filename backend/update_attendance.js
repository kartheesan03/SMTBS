const fs = require('fs');
const sequelize = require('./src/config/sequelize');

async function syncDb() {
  try {
      await sequelize.query('DROP TABLE IF EXISTS Attendances');
      await sequelize.query('DROP TABLE IF EXISTS Attendance');
      await sequelize.sync();
      console.log('DB sync complete');
  } catch (err) {
      console.error(err);
  }
}

syncDb();

const file = 'C:/Users/Admin/Documents/project/backend/src/controllers/attendanceController.js';
let content = fs.readFileSync(file, 'utf8');

const checkInReplacement = `const checkIn = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = req.user._id || req.user.id;
        const role = req.user.role || 'Employee';
        const { location } = req.body;

        let employee = await Employee.findOne({ userId: userId });
        if (!employee) {
            employee = await Employee.create({
                userId: userId,
                employeeId: 'EMP' + Date.now().toString().slice(-6),
                firstName: req.user.name.split(' ')[0] || 'Employee',
                lastName: req.user.name.split(' ').slice(1).join(' ') || 'User',
                department: 'General',
                designation: role
            });
        }
        const empId = employee._id || employee.id;

        let attendance = await Attendance.findOne({ userId: userId, date: today });
        if (attendance && attendance.checkInTime) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const checkInTime = new Date().toISOString();
        const checkInDate = new Date(checkInTime);
        const lateThreshold = new Date();
        lateThreshold.setHours(9, 30, 0, 0); 
        const calculatedStatus = checkInDate > lateThreshold ? 'Late' : 'Present';

        if (attendance) {
            attendance.checkInTime = checkInTime;
            attendance.location = location || null;
            if (!attendance.status || attendance.status === '-' || attendance.status === 'Absent') {
                attendance.status = calculatedStatus;
            }
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                userId: userId, employeeId: empId, role: role, date: today,
                checkInTime: checkInTime, status: calculatedStatus, location: location || null,
                shift: (new Date(checkInTime).getHours() >= 6 && new Date(checkInTime).getHours() < 18) ? 'Day' : 'Night'
            });
        }

        res.status(201).json(attendance);
    } catch (error) {
        console.error('checkIn error:', error);
        res.status(500).json({ message: error.message });
    }
};`;

const checkOutReplacement = `const checkOut = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = req.user._id || req.user.id;

        let attendance = await Attendance.findOne({ userId: userId, date: today });
        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({ message: 'Must check in before checking out' });
        }
        if (attendance.checkOutTime) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOutTime = new Date().toISOString();
        const inTime = new Date(attendance.checkInTime);
        const outTime = new Date(attendance.checkOutTime);
        attendance.totalHours = parseFloat(((outTime - inTime) / (1000 * 60 * 60)).toFixed(2));
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error('checkOut error:', error);
        res.status(500).json({ message: error.message });
    }
};`;

const appendStr = `
const getUserAttendance = async (req, res) => {
    try {
        const history = await Attendance.find({ userId: req.params.id }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editAttendance = async (req, res) => {
    try {
        const { recordId, status, checkInTime, checkOutTime, totalHours } = req.body;
        let attendance = await Attendance.findOne({ _id: recordId }) || await Attendance.findOne({ id: recordId });
        if(!attendance) return res.status(404).json({ message: 'Not found' });
        
        if(status) attendance.status = status;
        if(checkInTime) attendance.checkInTime = checkInTime;
        if(checkOutTime) attendance.checkOutTime = checkOutTime;
        if(totalHours !== undefined) attendance.totalHours = totalHours;
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
`;

content = content.replace(/const checkIn = async \([\s\S]*?\n\};\n/m, checkInReplacement + '\n');
content = content.replace(/const checkOut = async \([\s\S]*?\n\};\n/m, checkOutReplacement + '\n');
content = content.replace(/module\.exports = \{/, appendStr + '\nmodule.exports = {\n    getUserAttendance,\n    editAttendance,');

fs.writeFileSync(file, content);
console.log('Controller update complete');

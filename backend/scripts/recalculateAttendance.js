const { Sequelize } = require('sequelize');
const sequelize = require('../src/config/sequelize');
const Attendance = require('../src/models/Attendance');

const parseDateTime = (timeStr, baseDateStr) => {
    if (!timeStr) return null;
    if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(':') && timeStr.length > 10)) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) return d;
    }
    const datePart = baseDateStr ? baseDateStr.split('T')[0] : new Date().toISOString().split('T')[0];
    const combined = `${datePart} ${timeStr}`;
    const d = new Date(combined);
    if (!isNaN(d.getTime())) return d;
    
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
        let [_, hours, minutes, ampm] = match;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        const d = new Date(datePart);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }
    
    const fallback = new Date(timeStr);
    return isNaN(fallback.getTime()) ? null : fallback;
};

const recalculate = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Fetching all Attendance records...');
        
        const records = await Attendance.find();
        let updatedCount = 0;

        for (const record of records) {
            if (!record.checkIn) continue;

            const checkInDate = parseDateTime(record.checkIn, record.date);
            if (!checkInDate) continue;

            const lateThreshold = new Date(checkInDate);
            lateThreshold.setHours(9, 0, 59, 999);

            const expectedStatus = checkInDate > lateThreshold ? 'Late' : 'Present';

            // Only update if current status is different and was meant to be a present/late status
            // e.g. avoid changing Leave or Absent unless it was recorded as Late/Present incorrectly.
            if (['Late', 'Present'].includes(record.status) && record.status !== expectedStatus) {
                console.log(`Updating record ${record.id}: checkIn ${record.checkIn} | old ${record.status} -> new ${expectedStatus}`);
                record.status = expectedStatus;
                await record.save();
                updatedCount++;
            }
        }

        console.log(`Finished recalculating. Updated ${updatedCount} records.`);
    } catch (err) {
        console.error('Error in recalculate script:', err);
    } finally {
        process.exit(0);
    }
};

recalculate();

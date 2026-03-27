import cron from 'node-cron';
import Attendance from '../models/Attendance.js';

// Schedule job to run at 23:55 (11:55 PM) every day
// This will find all people who forgot to clock out today (or previous days)
// and clock them out at 23:59:59 to close the session automatically.
cron.schedule('55 23 * * *', async () => {
    console.log('[CRON] Running Auto-Clock-Out Job at 23:55...');
    try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        // Find attendance records that have NO clockOutTime, but DO have a clockInTime
        // This includes today's open sessions, and any hanging sessions from the past
        const hangingSessions = await Attendance.find({
            clockInTime: { $exists: true },
            clockOutTime: { $exists: false }
        });

        // Also check with null
        const nullSessions = await Attendance.find({
            clockInTime: { $exists: true, $ne: null },
            clockOutTime: null
        });

        const allHanging = [...hangingSessions, ...nullSessions];
        
        // Remove duplicates if any
        const uniqueHanging = Array.from(new Set(allHanging.map(a => a._id.toString())))
            .map(id => allHanging.find(a => a._id.toString() === id));

        if (uniqueHanging.length === 0) {
            console.log('[CRON] No hanging sessions found.');
            return;
        }

        console.log(`[CRON] Found ${uniqueHanging.length} people who forgot to clock out. Clocking them out now.`);

        for (const record of uniqueHanging) {
            // We clock them out at 23:59 of the day they clocked in (record.date)
            // Just to be safe, we grab the date of the record.
            const clockOutDate = new Date(record.date);
            clockOutDate.setHours(23, 59, 59, 999);

            record.clockOutTime = clockOutDate;

            // Recalculate total hours
            const diffMs = clockOutDate - record.clockInTime;
            const diffHrs = diffMs > 0 ? (diffMs / (1000 * 60 * 60)) : 0;
            
            record.totalHours = diffHrs.toFixed(2);
            await record.save();
            console.log(`[CRON] Auto-clocked out user: ${record.user}`);
        }

        console.log('[CRON] Auto-Clock-Out Job completed.');
    } catch (error) {
        console.error('[CRON] Error during Auto-Clock-Out Job:', error);
    }
});

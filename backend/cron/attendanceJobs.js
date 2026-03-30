import cron from 'node-cron';
import Attendance from '../models/Attendance.js';

// Schedule job to run once a day at 4:00 AM as a fail-safe
// Most sessions will be closed lazily by user interactions (see utils/attendanceHelper.js)
// This cleans up any forgotten sessions for people who don't visit the site for days.
cron.schedule('0 4 * * *', async () => {
    console.log('[CRON] Running Auto-Clock-Out Job (16-hour check)...');
    try {
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - 16 * 60 * 60 * 1000); // 16 hours ago

        // Find attendance records that have NO clockOutTime, but DO have a clockInTime
        // AND the clockInTime is older than the 16-hour cutoff
        const hangingSessions = await Attendance.find({
            clockInTime: { $exists: true, $lte: cutoffTime },
            clockOutTime: { $exists: false }
        });

        // Also check with null
        const nullSessions = await Attendance.find({
            clockInTime: { $exists: true, $ne: null, $lte: cutoffTime },
            clockOutTime: null
        });

        const allHanging = [...hangingSessions, ...nullSessions];
        
        // Remove duplicates if any
        const uniqueHanging = Array.from(new Set(allHanging.map(a => a._id.toString())))
            .map(id => allHanging.find(a => a._id.toString() === id));

        if (uniqueHanging.length === 0) {
            console.log('[CRON] No hanging sessions exceeding 16 hours found.');
            return;
        }

        console.log(`[CRON] Found ${uniqueHanging.length} people who forgot to clock out > 16 hours. Clocking them out now.`);

        for (const record of uniqueHanging) {
            const clockOutDate = new Date(record.clockInTime.getTime() + 16 * 60 * 60 * 1000);
            record.clockOutTime = clockOutDate;

            let breakMs = 0;
            if (record.breaks && record.breaks.length > 0) {
                record.breaks.forEach(b => {
                    if (b.startTime && b.endTime) {
                        breakMs += (new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
                    }
                });
            }
            const diffMs = clockOutDate.getTime() - record.clockInTime.getTime() - breakMs;
            const diffHrs = Math.max(0, diffMs / (1000 * 60 * 60));

            record.totalHours = diffHrs.toFixed(2);
            record.autoClockOut = true;
            await record.save();
            console.log(`[CRON] Auto-clocked out user: ${record.user} at ${clockOutDate.toISOString()}`);
        }

        console.log('[CRON] Auto-Clock-Out Job (16-hour check) completed.');
    } catch (error) {
        console.error('[CRON] Error during Auto-Clock-Out Job:', error);
    }
});

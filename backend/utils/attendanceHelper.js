import Attendance from '../models/Attendance.js';

export const autoCloseStaleSessions = async (userId = null) => {
    try {
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - 16 * 60 * 60 * 1000); // 16 hours ago

        const query = {
            clockInTime: { $exists: true, $lte: cutoffTime },
            $or: [
                { clockOutTime: { $exists: false } },
                { clockOutTime: null }
            ]
        };

        if (userId) {
            query.user = userId;
        }

        const staleSessions = await Attendance.find(query);

        if (staleSessions.length === 0) return;

        for (const record of staleSessions) {
            const clockOutDate = new Date(record.clockInTime.getTime() + 16 * 60 * 60 * 1000);
            record.clockOutTime = clockOutDate;
            record.totalHours = "16.00";
            await record.save();
            console.log(`[LAZY SYNC] Auto-closed stale session for user: ${record.user} at ${clockOutDate.toISOString()}`);
        }
    } catch (error) {
        console.error('[LAZY SYNC] Error closing stale sessions:', error);
    }
};

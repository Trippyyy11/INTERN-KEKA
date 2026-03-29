import cron from 'node-cron';
import Notification from '../models/Notification.js';

// Schedule: Every day at 2:00 AM — Delete notifications older than 30 days
cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running Notification Cleanup Job...');
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Notification.deleteMany({
            createdAt: { $lt: thirtyDaysAgo }
        });

        console.log(`[CRON] Notification Cleanup: Deleted ${result.deletedCount} notifications older than 30 days.`);
    } catch (error) {
        console.error('[CRON] Error during Notification Cleanup:', error);
    }
});

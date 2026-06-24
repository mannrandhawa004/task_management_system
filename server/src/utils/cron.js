import cron from 'node-cron';
import { executeQuery } from './dbQuery.js';
import AttendanceService from '../services/attendance.service.js';

export function setupCronJobs() {
  // Run every day at 22:00 (10 PM)
  cron.schedule('0 22 * * *', async () => {
    console.log('Running daily 10 PM auto-checkout cron job...');
    try {
      // Find all users who are currently checked in (status = working or on_break) today, but have no check_out time
      const query = `
        SELECT id, user_id, status 
        FROM attendance 
        WHERE date = CURRENT_DATE() 
          AND check_out IS NULL 
          AND status IN ('working', 'on_break')
      `;
      const activeRecords = await executeQuery(query);

      for (const record of activeRecords) {
        try {
          if (record.status === 'on_break') {
             // End break first before checkout
             await AttendanceService.endBreak(record.user_id);
          }
          await AttendanceService.checkOut(record.user_id);
          console.log(`Auto-checked out user ${record.user_id}`);
        } catch (e) {
          console.error(`Failed to auto-checkout user ${record.user_id}:`, e.message);
        }
      }
      console.log('Auto-checkout cron job completed.');
    } catch (err) {
      console.error('Error running auto-checkout cron job:', err);
    }
  });
}

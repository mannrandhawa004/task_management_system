import UserModel from "../models/user.model.js";
import NotificationService from "./notification.service.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import { executeQuery } from "../utils/dbQuery.js";

class BirthdayService {
  async checkAndNotifyBirthdays() {
    console.log("Checking for employee birthdays today...");
    try {
      // 1. Fetch all users celebrating their birthday today (using super_admin role to get all active employees)
      const birthdays = await UserModel.getTodayBirthdays({
        requestingUser: { role: "super_admin" },
      });

      if (!birthdays || birthdays.length === 0) {
        console.log("No employee birthdays found today.");
        return [];
      }

      console.log(`Found ${birthdays.length} employee(s) celebrating a birthday today!`);
      const notifiedUsers = [];

      for (const employee of birthdays) {
        try {
          // 2. Check notification history to prevent duplicate notifications for this user this year
          const checkQuery = `
            SELECT id FROM notifications 
            WHERE type = ? 
              AND entity_type = 'user' 
              AND entity_id = ? 
              AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
            LIMIT 1;
          `;
          const existing = await executeQuery(checkQuery, [
            NOTIFICATION_TYPES.BIRTHDAY_REMINDER,
            employee.id,
          ]);

          if (existing && existing.length > 0) {
            console.log(`Birthday reminder for ${employee.name} (ID: ${employee.id}) already sent this year. Skipping.`);
            continue;
          }

          // 3. Collect recipient IDs: HRs, Admins, Reporting Manager, and Team Lead
          const hrAdminQuery = `
            SELECT u.id FROM users u 
            JOIN roles r ON r.id = u.role_id 
            WHERE u.status = 'active' 
              AND LOWER(r.name) IN ('admin', 'super admin', 'hr', 'human resources');
          `;
          const hrAdminRows = await executeQuery(hrAdminQuery, []);
          const recipientIds = new Set(hrAdminRows.map((row) => row.id));

          // Add Reporting Manager
          if (employee.reporting_manager_id) {
            recipientIds.add(employee.reporting_manager_id);
          }

          // Add Team Lead if assigned to a team
          if (employee.team_id) {
            const teamQuery = `SELECT lead_id FROM teams WHERE id = ? AND lead_id IS NOT NULL`;
            const teamRows = await executeQuery(teamQuery, [employee.team_id]);
            if (teamRows && teamRows.length > 0 && teamRows[0].lead_id) {
              recipientIds.add(teamRows[0].lead_id);
            }
          }

          // Remove the birthday employee themselves from receiving the reminder
          recipientIds.delete(employee.id);

          const recipientsArray = Array.from(recipientIds).filter(Boolean);

          if (recipientsArray.length === 0) {
            console.log(`No recipients found to notify for ${employee.name}'s birthday.`);
            continue;
          }

          // 4. Send real-time notification
          const title = `🎂 Birthday Reminder: ${employee.name}`;
          const message = `Today is ${employee.name}'s (${employee.employee_id || "N/A"}) birthday! They are in the ${employee.department_name || "General"} department (${employee.team_name || "No Team"}) as ${employee.role || "Employee"}. Send them your best wishes!`;

          await NotificationService.send({
            userIds: recipientsArray,
            title,
            message,
            type: NOTIFICATION_TYPES.BIRTHDAY_REMINDER,
            entity_type: "user",
            entity_id: employee.id,
            includeAdmins: false, // Already included in recipientsArray
          });

          console.log(`Sent birthday reminder for ${employee.name} to ${recipientsArray.length} recipient(s).`);
          notifiedUsers.push(employee);
        } catch (err) {
          console.error(`Error processing birthday notification for employee ${employee.id}:`, err.message);
        }
      }

      return notifiedUsers;
    } catch (error) {
      console.error("Error in checkAndNotifyBirthdays:", error.message);
      return [];
    }
  }
}

export default new BirthdayService();

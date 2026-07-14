import mysql from "mysql2/promise";

const platformPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "saas_platform_db",
  waitForConnections: true,
  connectionLimit: 5,
});

async function main() {
  try {
    // Check if already registered
    const [existing] = await platformPool.execute(
      "SELECT id FROM tenants WHERE slug = ? OR db_name = ?",
      ["main", "task_management_system"]
    );

    if (existing.length > 0) {
      console.log("Already registered as tenant! id:", existing[0].id);
      await platformPool.end();
      return;
    }

    // Insert original DB as tenant with slug "main"
    const [result] = await platformPool.execute(
      `INSERT INTO tenants (company_name, slug, contact_name, contact_email, db_name, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      ["My Workspace (Original)", "main", "Super Admin", "admin@taskflow.com", "task_management_system"]
    );

    console.log("Registered original DB as tenant, id:", result.insertId);

    // Attach to Professional plan (id=2) for 10 years free
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 10);

    await platformPool.execute(
      `INSERT INTO tenant_subscriptions (tenant_id, plan_id, billing_cycle, start_date, end_date, amount_paid, status)
       VALUES (?, 2, 'yearly', ?, ?, 0, 'active')`,
      [result.insertId, startDate, endDate]
    );

    console.log("Subscription record created.");
    console.log("Done! 'main' slug now points to task_management_system DB.");
    await platformPool.end();
  } catch (e) {
    console.error("Error:", e.message);
    await platformPool.end().catch(() => {});
    process.exit(1);
  }
}

main();

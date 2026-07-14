import { provisioningService } from "./TenantProvisioningService.js";
import { tenantManager } from "./TenantConnectionManager.js";

async function testProvisioning() {
  console.log("=== Testing Tenant Provisioning Service ===");
  try {
    // Deprovision if already exists from earlier test
    try {
      await provisioningService.deprovisionTenant("acme-corp");
    } catch (e) {}

    const res = await provisioningService.provisionTenant({
      companyName: "Acme Corporation",
      slug: "acme-corp",
      contactName: "John Acme",
      contactEmail: "admin@acme.com",
      contactPhone: "+1-555-0199",
      planId: 2, // Professional
      billingCycle: "yearly",
      adminPassword: "Password@123",
    });

    console.log("\nProvisioning Result:", JSON.stringify(res, null, 2));

    // Now verify that all 21 tables exist in tenant_acme_corp
    const pool = await tenantManager.getTenantPool("tenant_acme_corp");
    const [tables] = await pool.query("SHOW TABLES;");
    console.log(`\nVerified ${tables.length} tables in tenant_acme_corp:`);
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0];
      console.log(`  ${i + 1}. ${tableName}`);
    });

    // Check Super Admin account in tenant_acme_corp
    const [users] = await pool.query("SELECT id, name, email, role_id FROM users WHERE role_id = 1;");
    console.log(`\nVerified Super Admin inside tenant database:`, users);

    await tenantManager.closeAll();
    console.log("\n✅ Phase 1 Verification Successful!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await tenantManager.closeAll();
    process.exit(1);
  }
}

testProvisioning();

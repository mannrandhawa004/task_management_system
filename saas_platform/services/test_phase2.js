import { provisioningService } from "./TenantProvisioningService.js";
import { tenantManager } from "./TenantConnectionManager.js";
import { tenantContext } from "../context/tenantContext.js";
import AuthService from "../../server/src/services/auth.service.js";
import { executeQuery } from "../../server/src/utils/dbQuery.js";
import SaasController from "../controllers/saas.controller.js";

async function testPhase2() {
  console.log("=== Testing Phase 2: Multi-Tenant Routing & Authentication Refactor ===");
  try {
    // 1. Deprovision globex-inc if exists from previous run
    try {
      await provisioningService.deprovisionTenant("globex-inc");
    } catch (e) {}

    // 2. Provision Globex Inc via automated provisioning
    console.log("\n[1] Provisioning Globex Inc (`globex-inc`)...");
    const provisionRes = await provisioningService.provisionTenant({
      companyName: "Globex Corporation",
      slug: "globex-inc",
      contactName: "Hank Scorpio",
      contactEmail: "admin@globex.com",
      contactPhone: "+1-555-0200",
      planId: 3, // Enterprise
      billingCycle: "yearly",
      adminPassword: "Password@123",
    });

    console.log("Provisioned Globex:", provisionRes.tenant.companyName, `(${provisionRes.tenant.dbName})`);

    // 3. Test Multi-Tenant Login (`AuthService.login` passing `tenantSlug`)
    console.log("\n[2] Testing Multi-Tenant Login (`AuthService.login` with `tenantSlug: globex-inc`)...");
    const loginRes = await AuthService.login({
      email: "admin@globex.com",
      password: "Password@123",
      tenantSlug: "globex-inc",
      device: "TestRunner/v1",
      ip: "127.0.0.1",
    });

    console.log("Login Success! Logged in User:", loginRes.user.name, `(${loginRes.user.email})`);
    console.log("Returned Tenant Slug on User object:", loginRes.user.tenantSlug);

    if (loginRes.user.tenantSlug !== "globex-inc") {
      throw new Error("Expected loginRes.user.tenantSlug to be 'globex-inc'");
    }

    // 4. Test `executeQuery` context isolation inside `tenantContext.run`
    console.log("\n[3] Testing `executeQuery` context isolation via `tenantContext.run`...");
    const globexPool = await tenantManager.getTenantPool("tenant_globex_inc");

    await new Promise((resolve, reject) => {
      tenantContext.run(
        { tenantPool: globexPool, tenantDbName: "tenant_globex_inc", tenantSlug: "globex-inc" },
        async () => {
          try {
            // Notice: we call executeQuery(...) WITHOUT passing customPool!
            // It should transparently pick up `globexPool` from `tenantContext`.
            const users = await executeQuery("SELECT id, name, email FROM users WHERE role_id = 1;");
            console.log("Transparent Query inside `tenantContext`: Found Super Admin ->", users[0]);
            if (users[0].email !== "admin@globex.com") {
              throw new Error("Expected query to return admin@globex.com from tenant_globex_inc!");
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    console.log("\n✅ Phase 2 Verification Successful! All queries and auth route cleanly by tenant context.");
    await tenantManager.closeAll();
  } catch (error) {
    console.error("\n❌ Phase 2 Test Failed:", error);
    await tenantManager.closeAll();
    process.exit(1);
  }
}

testPhase2();

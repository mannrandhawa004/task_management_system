process.env.PORT = "5002";
import http from "http";
import "../../server/app.js"; // Boots express app and connects DB on port 5002
import { tenantManager } from "./TenantConnectionManager.js";
import { provisioningService } from "./TenantProvisioningService.js";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testEndpoints() {
  console.log("=== Testing Public SaaS Endpoints (`/v1/saas/*`) on Port 5002 ===");
  try {
    // Wait for server connection
    await sleep(2000);

    // Deprovision stark-industries if exists from previous run
    try {
      await provisioningService.deprovisionTenant("stark-industries");
    } catch (e) {}

    // 1. Test GET /v1/saas/plans
    console.log("\n[1] Testing GET /v1/saas/plans...");
    const plansRes = await makeRequest("GET", "/v1/saas/plans");
    console.log("Status:", plansRes.status);
    console.log("Plans found:", plansRes.body.data?.length);

    if (plansRes.status !== 200 || !plansRes.body.data) {
      throw new Error("Failed to fetch subscription plans");
    }

    // 2. Test GET /v1/saas/tenants/lookup/acme-corp
    console.log("\n[2] Testing GET /v1/saas/tenants/lookup/acme-corp...");
    const lookupRes = await makeRequest("GET", "/v1/saas/tenants/lookup/acme-corp");
    console.log("Status:", lookupRes.status);
    console.log("Workspace Lookup Result:", lookupRes.body.data?.company_name, `(${lookupRes.body.data?.slug})`);

    if (lookupRes.status !== 200 || lookupRes.body.data?.slug !== "acme-corp") {
      throw new Error("Failed workspace lookup for acme-corp");
    }

    // 3. Test POST /v1/saas/checkout (Provisioning a new workspace via HTTP POST)
    console.log("\n[3] Testing POST /v1/saas/checkout (`stark-industries`)...");
    const checkoutRes = await makeRequest("POST", "/v1/saas/checkout", {
      companyName: "Stark Industries",
      slug: "stark-industries",
      contactName: "Tony Stark",
      contactEmail: "tony@stark.com",
      contactPhone: "+1-555-0999",
      planId: 3,
      billingCycle: "yearly",
      adminPassword: "Password@123",
      paymentMethod: "mock_card",
      cardNumber: "4242424242424242",
    });

    console.log("Status:", checkoutRes.status);
    console.log("Checkout Provision Result:", checkoutRes.body.message);

    if (checkoutRes.status !== 201 || !checkoutRes.body.data?.tenant) {
      throw new Error("Failed automated checkout and database provisioning via HTTP API");
    }

    // 4. Verify lookup for newly provisioned stark-industries
    console.log("\n[4] Verifying lookup for newly provisioned `stark-industries`...");
    const verifyRes = await makeRequest("GET", "/v1/saas/tenants/lookup/stark-industries");
    console.log("Status:", verifyRes.status, "| Company:", verifyRes.body.data?.company_name);

    if (verifyRes.status !== 200) {
      throw new Error("Could not lookup stark-industries after checkout");
    }

    console.log("\n✅ All Public SaaS API & Checkout Endpoints verified successfully via Express HTTP requests!");
    await tenantManager.closeAll();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ SaaS Endpoint Test Failed:", error);
    await tenantManager.closeAll();
    process.exit(1);
  }
}

testEndpoints();

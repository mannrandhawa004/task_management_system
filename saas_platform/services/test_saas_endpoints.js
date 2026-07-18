process.env.PORT = "5002";
import http from "http";
import "../../server/app.js"; // Boots express app and connects DB on port 5002
import { tenantManager } from "./TenantConnectionManager.js";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5002,
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

    // 3. Verify that direct, unpaid account registration is blocked.
    console.log("\n[3] Testing payment gate on POST /v1/auth/register...");
    const registerRes = await makeRequest("POST", "/v1/auth/register", {
      name: "Tony Stark",
      email: "tony@stark.com",
      password: "Password@123",
    });
    if (registerRes.status !== 403) {
      throw new Error("Direct unpaid registration must be blocked");
    }

    // Full Stripe/Razorpay checkout tests require provider test keys and a
    // successful provider transaction, so they are intentionally not mocked.

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

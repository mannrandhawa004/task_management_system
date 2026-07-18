import assert from "node:assert/strict";
import crypto from "node:crypto";
import { after, describe, it } from "node:test";

import { tenantManager } from "./TenantConnectionManager.js";
import {
  normalizeWorkspaceSlug,
  validateCheckoutPayload,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from "./PaymentService.js";

after(async () => {
  await tenantManager.closeAll();
});

describe("payment checkout utilities", () => {
  it("normalizes workspace slugs without allowing SQL identifiers", () => {
    assert.equal(normalizeWorkspaceSlug("  Acme !! Team  "), "acme-team");
  });

  it("accepts a complete supported checkout payload", () => {
    const payload = validateCheckoutPayload({
      companyName: "Acme Corporation",
      slug: "Acme-Team",
      contactName: "Jordan Lee",
      contactEmail: "JORDAN@EXAMPLE.COM",
      adminPassword: "a-secure-password",
      planId: 2,
      billingCycle: "yearly",
      gateway: "stripe",
    });

    assert.equal(payload.slug, "acme-team");
    assert.equal(payload.contactEmail, "jordan@example.com");
    assert.equal(payload.planId, 2);
  });

  it("rejects unsupported payment gateways", () => {
    assert.throws(
      () => validateCheckoutPayload({
        companyName: "Acme Corporation",
        slug: "acme-team",
        contactName: "Jordan Lee",
        contactEmail: "jordan@example.com",
        adminPassword: "a-secure-password",
        planId: 2,
        billingCycle: "monthly",
        gateway: "mock-card",
      }),
      /Stripe or Razorpay/,
    );
  });

  it("verifies Razorpay signatures with a timing-safe comparison", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const secret = "test_secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    assert.equal(
      verifyRazorpaySignature({ orderId, paymentId, signature, secret }),
      true,
    );
    assert.equal(
      verifyRazorpaySignature({ orderId, paymentId, signature: `${signature}0`, secret }),
      false,
    );
  });

  it("verifies webhook signatures against the untouched raw body", () => {
    const rawBody = Buffer.from('{"event":"payment.captured"}');
    const secret = "webhook_secret";
    const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    assert.equal(verifyWebhookSignature({ rawBody, signature, secret }), true);
    assert.equal(
      verifyWebhookSignature({ rawBody: Buffer.from('{}'), signature, secret }),
      false,
    );
  });
});

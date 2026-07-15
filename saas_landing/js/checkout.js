// =============================================
// STATE
// =============================================
var currentPlan = { id: 2, name: "Professional Suite" };
var isAnnual = true;
var provisionedData = null;

const API_BASE = "http://localhost:8000/v1";

const PRICES = {
  monthly:  { 1: 29,  2: 79,  3: 199 },
  annual:   { 1: 24,  2: 64,  3: 159 },
};

const ANNUAL_NOTES = {
  1: "Billed $288/year — save $60",
  2: "Billed $768/year — save $180",
  3: "Billed $1,908/year — save $480",
};

// =============================================
// BILLING TOGGLE
// =============================================
function toggleBilling() {
  isAnnual = !isAnnual;
  const toggle = document.getElementById("billingToggle");
  const labelM = document.getElementById("label-monthly");
  const labelA = document.getElementById("label-annual");

  toggle.classList.toggle("on", isAnnual);
  labelM.classList.toggle("active", !isAnnual);
  labelA.classList.toggle("active", isAnnual);

  [1, 2, 3].forEach((id) => {
    const el = document.getElementById(`price-${id === 1 ? "starter" : id === 2 ? "pro" : "enterprise"}`);
    const note = document.getElementById(`note-${id === 1 ? "starter" : id === 2 ? "pro" : "enterprise"}`);
    const price = isAnnual ? PRICES.annual[id] : PRICES.monthly[id];
    if (el) el.textContent = price;
    if (note) note.textContent = isAnnual ? ANNUAL_NOTES[id] : "Billed monthly, cancel anytime";
  });

  updateStep1Summary();
}

// =============================================
// MODAL MANAGEMENT
// =============================================
function openLoginModal() {
  document.getElementById("loginModal").classList.add("open");
  document.getElementById("loginError").style.display = "none";
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("open");
}

function openCheckoutModal(planId, planName) {
  currentPlan = { id: planId, name: planName };
  updateStep1Summary();
  goStep(1);
  document.getElementById("checkoutModal").classList.add("open");
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").classList.remove("open");
  document.getElementById("checkoutError").style.display = "none";
}

// Close modals on overlay click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeLoginModal();
    closeCheckoutModal();
  }
});

// =============================================
// STEP SUMMARY
// =============================================
function updateStep1Summary() {
  const name = document.getElementById("selPlanName");
  const billing = document.getElementById("selPlanBilling");
  const price = document.getElementById("selPlanPrice");
  if (!name) return;

  name.textContent = currentPlan.name;
  billing.textContent = isAnnual ? "Annual Billing · 2 Months Free" : "Monthly Flexible Billing";
  const p = isAnnual ? PRICES.annual[currentPlan.id] : PRICES.monthly[currentPlan.id];
  price.textContent = `$${p}/mo`;
}

// =============================================
// WIZARD STEPS
// =============================================
function goStep(step) {
  [1, 2, 3, "Success"].forEach((s) => {
    const el = document.getElementById(`ws${s}`);
    if (el) el.style.display = "none";
  });

  const target = document.getElementById(`ws${step}`);
  if (target) target.style.display = "block";

  if (step !== "Success") {
    for (let i = 1; i <= 3; i++) {
      const wStep = document.getElementById(`wstep-${i}`);
      if (!wStep) continue;
      wStep.className = "wstep";
      const numEl = wStep.querySelector(".wstep-num");
      if (i < step) {
        wStep.classList.add("done");
        if (numEl) numEl.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.7rem"></i>';
      } else if (i === step) {
        wStep.classList.add("active");
        if (numEl) numEl.textContent = i;
      } else {
        if (numEl) numEl.textContent = i;
      }
    }
    document.getElementById("wizardHeader").style.display = "flex";
  } else {
    document.getElementById("wizardHeader").style.display = "none";
  }
}

// =============================================
// AUTO SLUG
// =============================================
function autoSlug() {
  const name = document.getElementById("co").value;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  document.getElementById("slug").value = slug;
}

// =============================================
// STEP 2 VALIDATION
// =============================================
function validateStep2() {
  const co = document.getElementById("co").value.trim();
  const slug = document.getElementById("slug").value.trim();
  const email = document.getElementById("aEmail").value.trim();
  const pass = document.getElementById("aPass").value;

  if (!co || !slug || !email || !pass) {
    alert("Please fill in all workspace details.");
    return;
  }
  if (pass.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    alert("Workspace slug must contain only lowercase letters, numbers, and hyphens.");
    return;
  }
  goStep(3);
}

// =============================================
// EXECUTE PROVISIONING
// =============================================
async function executeProvision() {
  const btn = document.getElementById("provBtn");
  const err = document.getElementById("checkoutError");
  err.style.display = "none";

  const co = document.getElementById("co").value.trim();
  const slug = document.getElementById("slug").value.trim();
  const aName = document.getElementById("aName").value.trim();
  const aEmail = document.getElementById("aEmail").value.trim();
  const aPass = document.getElementById("aPass").value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Provisioning 21-Table Tenant DB...';

  try {
    const res = await fetch(`${API_BASE}/saas/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: co,
        slug,
        contactName: aName,
        contactEmail: aEmail,
        planId: currentPlan.id,
        billingCycle: isAnnual ? "yearly" : "monthly",
        adminPassword: aPass,
        paymentMethod: "mock_card",
        cardNumber: "4242424242424242",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to provision workspace.");
    }

    provisionedData = data.data;

    document.getElementById("succCo").textContent = provisionedData.tenant.companyName;
    document.getElementById("succSlug").textContent = provisionedData.tenant.slug;
    document.getElementById("succDb").textContent = provisionedData.tenant.dbName;
    document.getElementById("succEmail").textContent = provisionedData.superAdmin.email;

    goStep("Success");
  } catch (e) {
    err.textContent = e.message;
    err.style.display = "block";
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-server"></i> Pay & Provision Database';
  }
}

// =============================================
// LAUNCH WORKSPACE
// =============================================
async function launchWorkspace() {
  if (!provisionedData) return;
  const slug = provisionedData.tenant.slug;
  const email = provisionedData.superAdmin.email;
  const pass = document.getElementById("aPass").value;

  localStorage.setItem("active_tenant_slug", slug);
  localStorage.setItem("active_tenant_db", provisionedData.tenant.dbName);
  localStorage.setItem("active_tenant_company", provisionedData.tenant.companyName);

  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pass, tenantSlug: slug }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.success) {
      window.location.href = `http://localhost:3000/?workspace=${slug}`;
    } else {
      alert(`Workspace is live! Visit: http://localhost:3000/?workspace=${slug}\nEmail: ${email}`);
    }
  } catch (e) {
    alert(`Workspace is live! Visit: http://localhost:3000/?workspace=${slug}`);
  }
}

// =============================================
// WORKSPACE LOGIN
// =============================================
async function handleWorkspaceLogin(event) {
  event.preventDefault();
  const btn = document.getElementById("loginBtn");
  const err = document.getElementById("loginError");
  err.style.display = "none";

  const slug = document.getElementById("loginSlug").value.trim().toLowerCase();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying Workspace...';

  try {
    const lookupRes = await fetch(`${API_BASE}/saas/tenants/lookup/${slug}`);
    const lookupData = await lookupRes.json();
    if (!lookupRes.ok || !lookupData.success) throw new Error(lookupData.message || `Workspace '${slug}' not found.`);

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pass, tenantSlug: slug }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) throw new Error(loginData.message || "Invalid credentials for this workspace.");

    localStorage.setItem("active_tenant_slug", slug);
    localStorage.setItem("active_tenant_company", lookupData.data.company_name || slug);

    window.location.href = `http://localhost:3000/?workspace=${slug}`;
  } catch (e) {
    err.textContent = e.message;
    err.style.display = "block";
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Connect & Enter Workspace';
  }
}

// =============================================
// FAQ
// =============================================
function toggleFaq(el) {
  el.classList.toggle("open");
}

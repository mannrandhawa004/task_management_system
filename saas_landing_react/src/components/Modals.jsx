import React, { useState } from 'react';

const PRICES = {
  monthly: { 1: 29, 2: 79, 3: 199 },
  annual:  { 1: 24, 2: 64, 3: 159 },
};

export function LoginModal({ isOpen, onClose }) {
  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/v1/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-slug': tenantSlug 
        },
        body: JSON.stringify({ 
          tenantSlug: tenantSlug,
          subdomain: tenantSlug, 
          tenant_slug: tenantSlug,
          email, 
          password 
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || data.detail || 'Authentication failed. Verify tenant slug and credentials.');
      }

      // 1. Save user session & token for cross-app synchronization
      const token = data.data?.accessToken || data.access_token;
      if (token) {
        localStorage.setItem('taskflow_token', token);
      }
      if (data.data?.user || data.user) {
        localStorage.setItem('taskflow_user', JSON.stringify(data.data?.user || data.user));
      }

      // 2. Save active tenant identifier so Next.js app on port 3000 connects to their specific database pool
      localStorage.setItem('active_tenant_slug', tenantSlug);
      document.cookie = `active_tenant_slug=${tenantSlug}; path=/; max-age=604800`;

      // 3. Redirect to the Next.js app dashboard (`http://localhost:3000/dashboard`) with workspace query param
      const targetUrl = `http://localhost:3000/dashboard?workspace=${encodeURIComponent(tenantSlug)}`;
      window.location.href = targetUrl;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your Tenant Slug and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-scaleUp text-left my-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-lg"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-lg shadow-orange-glow flex-shrink-0">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Sign In to Workspace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connect to your isolated MySQL tenant pool.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-xl mb-4 leading-relaxed font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* FIELD 1: Tenant Slug / Subdomain */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Tenant Slug / Workspace ID
            </label>
            <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border overflow-hidden focus-within:border-brand-500 transition-colors">
              <span className="pl-3.5 py-3 text-slate-400 text-xs font-mono select-none">app.taskflow.io/</span>
              <input 
                type="text" 
                required
                placeholder="acme-corp"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full pl-1 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Target database: <code className="text-brand-500">tenant_{tenantSlug || 'yourcompany'}</code></p>
          </div>

          {/* FIELD 2: Work Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Work Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="admin@acme-corp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* FIELD 3: Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-brand-500 hover:underline font-semibold">Forgot?</a>
            </div>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-orange-glow disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i> Authenticating Tenant...
              </>
            ) : (
              <>
                <span>Connect to Tenant Database</span> <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export function CheckoutModal({ isOpen, onClose, initialPlan }) {
  const [step, setStep] = useState(1);
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan?.id || 2);
  
  // Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const planNames = { 1: "Starter Workspace", 2: "Professional Suite", 3: "Enterprise Cloud" };
  const currentPlanName = planNames[selectedPlanId] || "Professional Suite";

  const handleSlugChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setTenantSlug(val);
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        tenant_name: tenantName || `${tenantSlug}-workspace`,
        subdomain: tenantSlug,
        admin_email: adminEmail,
        admin_password: adminPassword,
        admin_name: adminName,
        plan_id: selectedPlanId,
        billing_cycle: isAnnual ? "yearly" : "monthly"
      };

      const res = await fetch('http://localhost:8000/v1/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || data.detail || 'Provisioning failed. Subdomain or email might already exist.');
      }
      setStep('Success');
    } catch (err) {
      setError(err.message || 'Error communicating with provisioning server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    localStorage.setItem('active_tenant_slug', tenantSlug);
    document.cookie = `active_tenant_slug=${tenantSlug}; path=/; max-age=604800`;
    window.location.href = `http://localhost:3000/dashboard?workspace=${encodeURIComponent(tenantSlug)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8 animate-scaleUp text-left">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-lg z-10"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header Steps Tracker */}
        {step !== 'Success' && (
          <div className="mb-8 border-b border-light-border dark:border-dark-border pb-6">
            <div className="flex items-center justify-between max-w-sm mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? 'bg-brand-500 text-white shadow-orange-glow' :
                    step > s ? 'bg-accent-green text-white' : 'border-2 border-slate-300 dark:border-dark-border text-slate-400'
                  }`}>
                    {step > s ? <i className="fa-solid fa-check text-[10px]"></i> : s}
                  </div>
                  <span className={`text-xs font-semibold ${step === s ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {s === 1 ? 'Plan' : s === 2 ? 'Tenant' : 'Admin'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3.5 rounded-xl mb-6 font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
            {error}
          </div>
        )}

        {/* STEP 1: CHOOSE PLAN & BILLING */}
        {step === 1 && (
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2">Step 1: Configure Your Subscription</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Select your preferred billing cycle and workspace tier.</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-slate-100 dark:bg-dark-bg p-2 rounded-2xl mb-6">
              <span className={`text-xs font-bold ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
              <button 
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 rounded-full bg-brand-500 relative transition-all focus:outline-none cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isAnnual ? 'left-[26px]' : 'left-1'}`}></div>
              </button>
              <span className={`text-xs font-bold ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                Annual <span className="text-accent-green font-extrabold">(Save 20%)</span>
              </span>
            </div>

            {/* Plan selector pills */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3].map((id) => {
                const isSelected = selectedPlanId === id;
                const p = isAnnual ? PRICES.annual[id] : PRICES.monthly[id];
                return (
                  <button 
                    key={id}
                    type="button"
                    onClick={() => setSelectedPlanId(id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected ? 'border-brand-500 bg-brand-500/5 shadow-orange-glow' : 'border-light-border dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">{planNames[id]}</div>
                    <div className="font-display font-extrabold text-lg text-brand-500">${p}<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-orange-glow flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Tenant Setup</span> <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TENANT DETAILS */}
        {step === 2 && (
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2">Step 2: Tenant Organization Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">We will provision a dedicated 21-table MySQL database pool for your workspace.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Organization / Company Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Acme Corporation"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Workspace Subdomain (URL)</label>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border overflow-hidden px-3 py-1 focus-within:border-brand-500">
                  <input 
                    type="text"
                    required
                    placeholder="acmecorp"
                    value={tenantSlug}
                    onChange={handleSlugChange}
                    className="flex-1 bg-transparent py-2 text-slate-900 dark:text-white text-sm focus:outline-none font-mono"
                  />
                  <span className="text-xs font-mono text-slate-400 bg-slate-200 dark:bg-dark-card px-2.5 py-1 rounded-lg">.taskflow.io</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Database identifier: <code className="text-brand-500">tenant_{tenantSlug || 'yourcompany'}</code></p>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-dark-hover cursor-pointer"
              >
                Back
              </button>
              <button 
                type="button"
                disabled={!tenantSlug}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-orange-glow disabled:opacity-50 cursor-pointer"
              >
                <span>Next: Admin Account</span> <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADMIN SETUP */}
        {step === 3 && (
          <form onSubmit={handleProvision}>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-2">Step 3: Super Admin Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Create the master credentials for managing users, roles, and attendance policies.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Arthur Pendelton"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Admin Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="arthur@acme-corp.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Master Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-dark-hover cursor-pointer"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-orange-glow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i> Provisioning Schema...
                  </>
                ) : (
                  <>
                    <span>Deploy {currentPlanName}</span> <i className="fa-solid fa-bolt"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS PROVISIONED */}
        {step === 'Success' && (
          <div className="text-center py-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 text-accent-green flex items-center justify-center text-3xl mx-auto mb-6">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
              Workspace Successfully Deployed!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
              Your isolated MySQL database pool (`tenant_{tenantSlug}`) and Super Admin account have been provisioned.
            </p>

            <div className="bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl p-4 text-left max-w-md mx-auto mb-8 font-mono text-xs space-y-2">
              <div><span className="text-slate-400">Subdomain:</span> <code className="text-brand-500">{tenantSlug}.taskflow.io</code></div>
              <div><span className="text-slate-400">Admin Account:</span> <code className="text-slate-800 dark:text-white">{adminEmail}</code></div>
              <div><span className="text-slate-400">Plan:</span> <code className="text-accent-green">{currentPlanName}</code></div>
            </div>

            <button 
              onClick={handleGoToDashboard}
              className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-orange-glow cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <span>Go to Workspace Dashboard (`http://localhost:3000/dashboard`)</span> <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

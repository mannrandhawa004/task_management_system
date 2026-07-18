import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DASHBOARD_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
const PLAN_NAMES = { 1: 'Starter Workspace', 2: 'Professional Suite', 3: 'Enterprise Cloud' };
const PRICES = { monthly: { 1: 29, 2: 79, 3: 199 }, annual: { 1: 24, 2: 64, 3: 159 } };

function LogoMark() {
  return (
    <span className="auth-logo-mark" aria-hidden="true">
      <img src="/assets/taskflow-logo-modern.png" alt="" />
    </span>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>;
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 3l14 14M8.6 5.2A8.7 8.7 0 0 1 10 5c4.6 0 7 5 7 5a12 12 0 0 1-2.2 2.8M11.7 11.7A2.4 2.4 0 0 1 8.3 8.3M6 6A12.2 12.2 0 0 0 3 10s2.4 5 7 5c.8 0 1.6-.2 2.2-.4" /></svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10s2.4-5 7-5 7 5 7 5-2.4 5-7 5-7-5-7-5Z" /><circle cx="10" cy="10" r="2.4" /></svg>
  );
}

function ThemeIcon({ isDark }) {
  return isDark ? (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3" /><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4m-8.6 8.6-1.4 1.4" /></svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.5 12.7A7 7 0 0 1 7.3 3.5 7 7 0 1 0 16.5 12.7Z" /></svg>
  );
}

function SocialIcon({ provider }) {
  if (provider === 'google') return <span className="google-g" aria-hidden="true">G</span>;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.9.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 6.6 8.8c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.8c0 3.8-2.3 4.6-4.6 4.9.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function AuthLayout({ mode, currentStep = 1, children, isDark, onToggleTheme, onNavigate }) {
  const signupSteps = [
    ['Create account', 'Your secure admin credentials'],
    ['Set up workspace', 'Name and tenant URL'],
    ['Choose your plan', 'Review and launch'],
  ];

  return (
    <div className="auth-page">
      <button className="auth-brand-home" type="button" onClick={() => onNavigate('/')} aria-label="Back to TaskFlow home">
        <LogoMark />
      </button>
      <button className="auth-theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
        <ThemeIcon isDark={isDark} /><span>{isDark ? 'Light' : 'Dark'} theme</span>
      </button>
      <main className="auth-shell">
        <section className={`auth-visual auth-visual-${mode}`} aria-label={mode === 'signup' ? 'Account setup progress' : 'TaskFlow workspace benefits'}>
          <div className="auth-grid" aria-hidden="true" />
          <span className="auth-orb auth-orb-one" aria-hidden="true" />
          <span className="auth-orb auth-orb-two" aria-hidden="true" />
          <div className="auth-visual-copy">
            <span className="auth-visual-kicker"><i /> {mode === 'signup' ? 'A clearer way to work' : 'Secure workspace access'}</span>
            <h1>{mode === 'signup' ? <>Get started<br />with TaskFlow.</> : <>Welcome back<br />to your flow.</>}</h1>
            <p>{mode === 'signup' ? 'Create a focused workspace for projects, people, and progress in just a few thoughtful steps.' : 'Pick up exactly where your team left off—securely connected to your dedicated workspace.'}</p>

            {mode === 'signup' ? (
              <div className="auth-steps">
                {signupSteps.map(([title, text], index) => {
                  const number = index + 1;
                  const status = currentStep > number ? 'complete' : currentStep === number ? 'active' : '';
                  return (
                    <article className={`auth-step ${status}`} key={title}>
                      <span>{status === 'complete' ? '✓' : number}</span>
                      <b>{title}</b>
                      <small>{text}</small>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="auth-login-proof">
                <article><strong>99.9%</strong><span>workspace uptime</span></article>
                <article><strong>2FA</strong><span>ready security</span></article>
                <article><strong>1 place</strong><span>for every update</span></article>
              </div>
            )}

            <div className="auth-quote">
              <span className="auth-quote-avatar">MK</span>
              <p>“TaskFlow replaced scattered status meetings with one calm source of truth.”<small>Maya Kapoor · Operations Lead</small></p>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrap">{children}</div>
        </section>
      </main>
      <p className="auth-page-note">Protected by tenant isolation and secure session controls.</p>
    </div>
  );
}

function AuthHeader({ eyebrow, title, text }) {
  return (
    <header className="auth-form-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}

function Alert({ error, notice }) {
  if (!error && !notice) return null;
  return <div className={`auth-alert ${error ? 'error' : 'notice'}`} role="status">{error || notice}</div>;
}

function SocialButtons({ onUnavailable }) {
  return (
    <div className="auth-social-row">
      <button type="button" onClick={() => onUnavailable('Google')}><SocialIcon provider="google" /> Continue with Google</button>
      <button type="button" onClick={() => onUnavailable('GitHub')}><SocialIcon provider="github" /> Continue with GitHub</button>
    </div>
  );
}

function PasswordField({ label = 'Password', value, onChange, placeholder = 'Enter your password', autoComplete = 'current-password' }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-password-wrap">
        <input type={showPassword ? 'text' : 'password'} required minLength={8} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
        <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon hidden={!showPassword} /></button>
      </span>
    </label>
  );
}

export function LoginPage({ isDark, onToggleTheme, onNavigate }) {
  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const showProviderNotice = (provider) => {
    setError('');
    setNotice(`${provider} sign-in is ready for an OAuth connection, but is not configured in this local environment.`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({ tenantSlug, subdomain: tenantSlug, tenant_slug: tenantSlug, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || data.detail || 'Authentication failed. Verify your workspace and credentials.');

      const token = data.data?.accessToken || data.access_token;
      const user = data.data?.user || data.user;
      if (token) localStorage.setItem('taskflow_token', token);
      if (user) localStorage.setItem('taskflow_user', JSON.stringify(user));
      localStorage.setItem('active_tenant_slug', tenantSlug);
      document.cookie = `active_tenant_slug=${tenantSlug}; path=/; max-age=604800`;
      window.location.href = `${DASHBOARD_URL}/dashboard?workspace=${encodeURIComponent(tenantSlug)}`;
    } catch (requestError) {
      setError(requestError.message || 'Login failed. Please verify your workspace and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login" isDark={isDark} onToggleTheme={onToggleTheme} onNavigate={onNavigate}>
      <AuthHeader eyebrow="Welcome back" title="Sign in to TaskFlow" text="Enter your workspace and account details to continue." />
      <SocialButtons onUnavailable={showProviderNotice} />
      <div className="auth-divider"><span>or continue with email</span></div>
      <Alert error={error} notice={notice} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Workspace ID</span>
          <span className="auth-slug-wrap"><i>app.taskflow.io/</i><input type="text" required value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="acme-team" autoComplete="organization" /></span>
        </label>
        <label className="auth-field">
          <span>Work email</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" />
        </label>
        <div className="auth-password-label"><span>Password</span><button type="button" onClick={() => { setError(''); setNotice('Password recovery can be connected to your email service here.'); }}>Forgot password?</button></div>
        <PasswordField label="" value={password} onChange={(event) => setPassword(event.target.value)} />
        <label className="auth-remember"><input type="checkbox" /> <span>Keep me signed in on this device</span></label>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? <><i className="auth-spinner" /> Connecting securely...</> : <>Sign in to workspace <ArrowIcon /></>}</button>
      </form>

      <p className="auth-switch">New to TaskFlow? <button type="button" onClick={() => onNavigate('/signup')}>Create an account</button></p>
      <button className="auth-back" type="button" onClick={() => onNavigate('/')}><span>←</span> Back to the TaskFlow overview</button>
    </AuthLayout>
  );
}

export function SignupPage({ isDark, onToggleTheme, onNavigate }) {
  const queryPlan = Number(new URLSearchParams(window.location.search).get('plan'));
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState([1, 2, 3].includes(queryPlan) ? queryPlan : 2);
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const currentPlanName = PLAN_NAMES[selectedPlanId];
  const clearMessages = () => { setError(''); setNotice(''); };
  const showProviderNotice = (provider) => {
    setError('');
    setNotice(`${provider} sign-up is ready for an OAuth connection, but is not configured in this local environment.`);
  };

  const submitAccount = (event) => {
    event.preventDefault();
    clearMessages();
    setStep(2);
  };

  const submitWorkspace = (event) => {
    event.preventDefault();
    clearMessages();
    setStep(3);
  };

  const handleProvision = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${API_URL}/v1/auth/register-tenant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_name: tenantName || `${tenantSlug}-workspace`,
          subdomain: tenantSlug,
          admin_email: adminEmail,
          admin_password: adminPassword,
          admin_name: `${firstName} ${lastName}`.trim(),
          plan_id: selectedPlanId,
          billing_cycle: isAnnual ? 'yearly' : 'monthly',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || data.detail || 'Workspace provisioning failed. The URL or email may already exist.');
      setStep(4);
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the provisioning service.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    localStorage.setItem('active_tenant_slug', tenantSlug);
    document.cookie = `active_tenant_slug=${tenantSlug}; path=/; max-age=604800`;
    window.location.href = `${DASHBOARD_URL}/dashboard?workspace=${encodeURIComponent(tenantSlug)}`;
  };

  return (
    <AuthLayout mode="signup" currentStep={Math.min(step, 3)} isDark={isDark} onToggleTheme={onToggleTheme} onNavigate={onNavigate}>
      {step === 1 && (
        <>
          <AuthHeader eyebrow="Step 1 of 3" title="Create your account" text="Start with the secure admin account for your new workspace." />
          <SocialButtons onUnavailable={showProviderNotice} />
          <div className="auth-divider"><span>or use your work email</span></div>
          <Alert error={error} notice={notice} />
          <form className="auth-form" onSubmit={submitAccount}>
            <div className="auth-field-row">
              <label className="auth-field"><span>First name</span><input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Jordan" autoComplete="given-name" /></label>
              <label className="auth-field"><span>Last name</span><input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Francisco" autoComplete="family-name" /></label>
            </div>
            <label className="auth-field"><span>Work email</span><input type="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="jordan@company.com" autoComplete="email" /></label>
            <PasswordField value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            <label className="auth-consent"><input type="checkbox" required /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
            <button className="auth-submit" type="submit">Continue to workspace <ArrowIcon /></button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <AuthHeader eyebrow="Step 2 of 3" title="Set up your workspace" text="Give your team a clear name and a secure tenant address." />
          <Alert error={error} notice={notice} />
          <form className="auth-form" onSubmit={submitWorkspace}>
            <label className="auth-field"><span>Organization name</span><input required value={tenantName} onChange={(event) => setTenantName(event.target.value)} placeholder="Acme Corporation" autoComplete="organization" /></label>
            <label className="auth-field">
              <span>Workspace URL</span>
              <span className="auth-domain-wrap"><input required value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} placeholder="acmecorp" /><i>.taskflow.io</i></span>
              <small>Your isolated database will use <b>tenant_{tenantSlug || 'yourcompany'}</b>.</small>
            </label>
            <div className="auth-security-note"><span>✓</span><p><b>Tenant isolation included</b>Your workspace data stays separated in its own database pool.</p></div>
            <div className="auth-form-actions"><button type="button" className="auth-secondary" onClick={() => { clearMessages(); setStep(1); }}>Back</button><button className="auth-submit compact" type="submit">Choose a plan <ArrowIcon /></button></div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <AuthHeader eyebrow="Step 3 of 3" title="Choose your plan" text="Start with the right capacity. You can change plans as your team grows." />
          <Alert error={error} notice={notice} />
          <form className="auth-form" onSubmit={handleProvision}>
            <div className="auth-billing"><span className={!isAnnual ? 'active' : ''}>Monthly</span><button type="button" className={isAnnual ? 'annual' : ''} onClick={() => setIsAnnual((value) => !value)} aria-label="Toggle annual billing"><i /></button><span className={isAnnual ? 'active' : ''}>Annual <b>Save 20%</b></span></div>
            <div className="auth-plan-list">
              {[1, 2, 3].map((id) => (
                <button className={selectedPlanId === id ? 'selected' : ''} type="button" key={id} onClick={() => setSelectedPlanId(id)}>
                  <span><i>{selectedPlanId === id ? '✓' : ''}</i><span><b>{PLAN_NAMES[id]}</b><small>{id === 1 ? 'For focused teams' : id === 2 ? 'For growing operations' : 'For larger organizations'}</small></span></span>
                  <strong>${isAnnual ? PRICES.annual[id] : PRICES.monthly[id]}<small>/mo</small></strong>
                </button>
              ))}
            </div>
            <div className="auth-form-actions"><button type="button" className="auth-secondary" onClick={() => { clearMessages(); setStep(2); }}>Back</button><button className="auth-submit compact" type="submit" disabled={loading}>{loading ? <><i className="auth-spinner" /> Provisioning...</> : <>Launch workspace <ArrowIcon /></>}</button></div>
          </form>
        </>
      )}

      {step === 4 && (
        <div className="auth-success">
          <span className="auth-success-icon">✓</span>
          <span className="auth-form-eyebrow">Workspace ready</span>
          <h2>Your team has a new home.</h2>
          <p>The <b>{currentPlanName}</b> workspace and its isolated tenant database have been provisioned successfully.</p>
          <div className="auth-success-details"><span><small>Workspace</small><b>{tenantSlug}.taskflow.io</b></span><span><small>Administrator</small><b>{adminEmail}</b></span></div>
          <button className="auth-submit" type="button" onClick={handleGoToDashboard}>Open TaskFlow dashboard <ArrowIcon /></button>
        </div>
      )}

      {step !== 4 && <p className="auth-switch">Already have an account? <button type="button" onClick={() => onNavigate('/login')}>Sign in</button></p>}
      <button className="auth-back" type="button" onClick={() => onNavigate('/')}><span>←</span> Back to the TaskFlow overview</button>
    </AuthLayout>
  );
}

import { useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DASHBOARD_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
const PLAN_NAMES = { 1: 'Starter Workspace', 2: 'Professional Suite', 3: 'Enterprise Cloud' };
const PRICES = { monthly: { 1: 29, 2: 79, 3: 199 }, yearly: { 1: 290, 2: 790, 3: 1990 } };

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }
  const existing = document.querySelector('script[data-taskflow-razorpay]');
  if (existing) {
    existing.addEventListener('load', resolve, { once: true });
    existing.addEventListener('error', () => reject(new Error('Razorpay Checkout could not be loaded.')), { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.dataset.taskflowRazorpay = 'true';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'));
  document.head.appendChild(script);
});

function LogoMark() {
  return (
    <span className="auth-logo-mark" aria-hidden="true">
      <img src="/assets/taskflow-logo.png" alt="" />
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
    ['Pay securely', 'Choose a plan and gateway'],
  ];

  return (
    <div className="auth-page">
      <button className="auth-brand-home" type="button" onClick={() => onNavigate('/')} aria-label="Back to TaskFlow home">
        <LogoMark /><span>TaskFlow</span>
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
  const stripeVerificationStarted = useRef(false);
  const checkoutRecoveryStarted = useRef(false);
  const query = new URLSearchParams(window.location.search);
  const queryPlan = Number(query.get('plan'));
  const queryBilling = query.get('billing') === 'monthly' ? 'monthly' : 'yearly';
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState([1, 2, 3].includes(queryPlan) ? queryPlan : 2);
  const [isAnnual, setIsAnnual] = useState(queryBilling === 'yearly');
  const [gateway, setGateway] = useState('stripe');
  const [provisionedWorkspace, setProvisionedWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const currentPlanName = provisionedWorkspace?.subscription?.planName || PLAN_NAMES[selectedPlanId];
  const clearMessages = () => { setError(''); setNotice(''); };
  const showProviderNotice = (provider) => {
    setError('');
    setNotice(`${provider} sign-up is ready for an OAuth connection, but is not configured in this local environment.`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentState = params.get('payment');
    const checkoutId = params.get('checkout_id');
    const sessionId = params.get('session_id');

    if (paymentState === 'cancelled') {
      setStep(1);
      if (!checkoutId) {
        setError('Checkout was cancelled, but its reference is missing. Wait a moment before trying again.');
        window.history.replaceState({}, '', '/signup');
        return;
      }
      setLoading(true);
      sessionStorage.removeItem('taskflow_pending_checkout');
      fetch(`${API_URL}/v1/saas/checkout/${encodeURIComponent(checkoutId)}/cancel`, { method: 'POST' })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.message || 'Checkout cancellation could not be confirmed.');
          setNotice('Checkout was cancelled. Your workspace was not created; review your details and try again.');
        })
        .catch((cancelError) => setError(cancelError.message || 'Checkout cancellation could not be confirmed.'))
        .finally(() => setLoading(false));
      window.history.replaceState({}, '', '/signup');
      return;
    }
    if (paymentState !== 'success' || !checkoutId || !sessionId) {
      const pendingCheckoutId = sessionStorage.getItem('taskflow_pending_checkout');
      if (!pendingCheckoutId || checkoutRecoveryStarted.current) return;
      checkoutRecoveryStarted.current = true;
      fetch(`${API_URL}/v1/saas/checkout/${encodeURIComponent(pendingCheckoutId)}/status`)
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.message || 'Checkout status is unavailable.');
          if (data.data?.status === 'provisioned') {
            setProvisionedWorkspace(data.data);
            setStep(4);
            sessionStorage.removeItem('taskflow_pending_checkout');
          }
        })
        .catch(() => {});
      return;
    }
    if (stripeVerificationStarted.current) return;
    stripeVerificationStarted.current = true;

    const verifyStripeReturn = async () => {
      setStep(3);
      setLoading(true);
      setNotice('Payment received. Verifying it securely and creating your workspace...');
      try {
        const response = await fetch(`${API_URL}/v1/saas/checkout/stripe/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId, sessionId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Stripe payment verification failed.');
        setProvisionedWorkspace(data.data);
        sessionStorage.removeItem('taskflow_pending_checkout');
        setNotice('');
        setStep(4);
        window.history.replaceState({}, '', '/signup?payment=complete');
      } catch (requestError) {
        setNotice('');
        setError(requestError.message || 'We could not verify this Stripe payment yet.');
      } finally {
        setLoading(false);
      }
    };

    verifyStripeReturn();
  }, []);

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

  const checkoutPayload = () => ({
    companyName: tenantName || `${tenantSlug}-workspace`,
    slug: tenantSlug,
    contactName: `${firstName} ${lastName}`.trim(),
    contactEmail: adminEmail,
    adminPassword,
    planId: selectedPlanId,
    billingCycle: isAnnual ? 'yearly' : 'monthly',
    gateway,
  });

  const completeRazorpayPayment = async (checkout, payment) => {
    const response = await fetch(`${API_URL}/v1/saas/checkout/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkoutId: checkout.checkoutId,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Razorpay payment verification failed.');
    setProvisionedWorkspace(data.data);
    sessionStorage.removeItem('taskflow_pending_checkout');
    setStep(4);
  };

  const cancelPendingCheckout = async (checkoutId) => {
    if (!checkoutId) return;
    const response = await fetch(`${API_URL}/v1/saas/checkout/${encodeURIComponent(checkoutId)}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Checkout cancellation could not be confirmed.');
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${API_URL}/v1/saas/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Secure checkout could not be created.');
      const checkout = data.data;
      sessionStorage.setItem('taskflow_pending_checkout', checkout.checkoutId);

      if (gateway === 'stripe') {
        if (!checkout.redirectUrl) throw new Error('Stripe did not return a checkout URL.');
        window.location.assign(checkout.redirectUrl);
        return;
      }

      await loadRazorpayScript();
      let razorpayPaymentSubmitted = false;
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.businessName,
        description: checkout.description,
        order_id: checkout.orderId,
        prefill: checkout.prefill,
        theme: { color: isDark ? '#f59b59' : '#116b4f' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (razorpayPaymentSubmitted) return;
            cancelPendingCheckout(checkout.checkoutId)
              .then(() => {
                sessionStorage.removeItem('taskflow_pending_checkout');
                setNotice('Razorpay checkout was closed. Your workspace has not been created.');
              })
              .catch((cancelError) => setError(cancelError.message));
          },
        },
        handler: async (payment) => {
          razorpayPaymentSubmitted = true;
          try {
            setNotice('Payment received. Verifying it securely and creating your workspace...');
            await completeRazorpayPayment(checkout, payment);
            setNotice('');
          } catch (verificationError) {
            setNotice('');
            setError(verificationError.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
      });
      razorpay.on('payment.failed', (paymentError) => {
        setLoading(false);
        setError(paymentError.error?.description || 'Razorpay could not complete the payment.');
      });
      razorpay.open();
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the checkout service.');
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    const workspaceSlug = provisionedWorkspace?.tenant?.slug || tenantSlug;
    localStorage.setItem('active_tenant_slug', workspaceSlug);
    document.cookie = `active_tenant_slug=${workspaceSlug}; path=/; max-age=604800`;
    window.location.href = `${DASHBOARD_URL}?workspace=${encodeURIComponent(workspaceSlug)}`;
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
              <span className="auth-domain-wrap"><input required minLength={3} value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="acme-corp" /><i>.taskflow.io</i></span>
              <small>Your isolated database will use <b>tenant_{tenantSlug || 'yourcompany'}</b>.</small>
            </label>
            <div className="auth-security-note"><span>✓</span><p><b>Tenant isolation included</b>Your workspace data stays separated in its own database pool.</p></div>
            <div className="auth-form-actions"><button type="button" className="auth-secondary" onClick={() => { clearMessages(); setStep(1); }}>Back</button><button className="auth-submit compact" type="submit">Choose a plan <ArrowIcon /></button></div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <AuthHeader eyebrow="Step 3 of 3" title="Choose plan and payment" text="Your account is created only after the selected gateway confirms payment." />
          <Alert error={error} notice={notice} />
          <form className="auth-form" onSubmit={handleCheckout}>
            <div className="auth-billing"><span className={!isAnnual ? 'active' : ''}>Monthly</span><button type="button" className={isAnnual ? 'annual' : ''} onClick={() => setIsAnnual((value) => !value)} aria-label="Toggle annual billing"><i /></button><span className={isAnnual ? 'active' : ''}>Annual <b>Save 20%</b></span></div>
            <div className="auth-plan-list">
              {[1, 2, 3].map((id) => (
                <button className={selectedPlanId === id ? 'selected' : ''} type="button" key={id} onClick={() => setSelectedPlanId(id)}>
                  <span><i>{selectedPlanId === id ? '✓' : ''}</i><span><b>{PLAN_NAMES[id]}</b><small>{id === 1 ? 'For focused teams' : id === 2 ? 'For growing operations' : 'For larger organizations'}</small></span></span>
                  <strong>${isAnnual ? PRICES.yearly[id] : PRICES.monthly[id]}<small>/{isAnnual ? 'year' : 'month'}</small></strong>
                </button>
              ))}
            </div>
            <fieldset className="auth-gateway-picker">
              <legend>Pay securely with</legend>
              <button className={gateway === 'stripe' ? 'selected' : ''} type="button" onClick={() => setGateway('stripe')}>
                <span className="auth-gateway-logo stripe">S</span><span><b>Stripe</b><small>Cards and international payments</small></span><i>{gateway === 'stripe' ? 'Selected' : ''}</i>
              </button>
              <button className={gateway === 'razorpay' ? 'selected' : ''} type="button" onClick={() => setGateway('razorpay')}>
                <span className="auth-gateway-logo razorpay">R</span><span><b>Razorpay</b><small>UPI, cards, netbanking and wallets</small></span><i>{gateway === 'razorpay' ? 'Selected' : ''}</i>
              </button>
            </fieldset>
            <div className="auth-payment-note"><span>✓</span><p><b>Payment-gated provisioning</b>Your admin account and isolated database are created only after server-side verification.</p></div>
            <div className="auth-form-actions"><button type="button" className="auth-secondary" onClick={() => { clearMessages(); setStep(2); }}>Back</button><button className="auth-submit compact" type="submit" disabled={loading}>{loading ? <><i className="auth-spinner" /> Securing checkout...</> : <>Continue with {gateway === 'stripe' ? 'Stripe' : 'Razorpay'} <ArrowIcon /></>}</button></div>
          </form>
        </>
      )}

      {step === 4 && (
        <div className="auth-success">
          <span className="auth-success-icon">✓</span>
          <span className="auth-form-eyebrow">Payment confirmed</span>
          <h2>Your workspace is ready.</h2>
          <p>Your <b>{currentPlanName}</b> payment was verified and the isolated workspace was provisioned successfully.</p>
          <div className="auth-success-details"><span><small>Workspace</small><b>{provisionedWorkspace?.tenant?.slug || tenantSlug}.taskflow.io</b></span><span><small>Administrator</small><b>{provisionedWorkspace?.tenant?.contactEmail || adminEmail}</b></span></div>
          <button className="auth-submit" type="button" onClick={handleGoToDashboard}>Sign in to TaskFlow <ArrowIcon /></button>
        </div>
      )}

      {step !== 4 && <p className="auth-switch">Already have an account? <button type="button" onClick={() => onNavigate('/login')}>Sign in</button></p>}
      <button className="auth-back" type="button" onClick={() => onNavigate('/')}><span>←</span> Back to the TaskFlow overview</button>
    </AuthLayout>
  );
}

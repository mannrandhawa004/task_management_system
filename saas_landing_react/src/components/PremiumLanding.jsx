import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const iconPaths = {
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  check: ['m5 12 4 4L19 6'],
  chevron: ['m9 18 6-6-6-6'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z'],
  sun: ['M12 3v1', 'M12 20v1', 'M3 12h1', 'M20 12h1', 'm5.64 5.64-.7.7', 'm17.06-10.7-.7.7', 'm5.64 6.72-.7-.7', 'm17.06 10.7-.7-.7', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  layers: ['m12 2 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'],
  board: ['M4 5h16v14H4z', 'M9 5v14', 'M15 5v9'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  chart: ['M4 19V9', 'M10 19V5', 'M16 19v-7', 'M22 19H2'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  bolt: ['m13 2-9 12h8l-1 8 9-12h-8l1-8Z'],
  sparkle: ['m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z', 'm19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z'],
  quote: ['M9 11H5a2 2 0 0 0-2 2v4h6v-6Zm12 0h-4a2 2 0 0 0-2 2v4h6v-6Z'],
  play: ['m8 5 11 7-11 7V5Z'],
};

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {(iconPaths[name] || iconPaths.sparkle).map((path, index) => <path key={index} d={path} />)}
    </svg>
  );
}

const storySteps = [
  {
    number: '01',
    kicker: 'Plan without the noise',
    title: 'Turn complex work into a clear, shared plan.',
    text: 'Shape projects, owners, priorities, and deadlines in one flexible board. Everyone sees what matters now and what comes next.',
    light: '/assets/light_task_board.png',
    dark: '/assets/dark_task_board.png',
    stat: '34 active tasks',
  },
  {
    number: '02',
    kicker: 'See the whole picture',
    title: 'Make faster decisions with live progress signals.',
    text: 'Spot momentum, stalled work, and approaching risk from a dashboard that turns activity into an immediate point of view.',
    light: '/assets/light_dashboard.png',
    dark: '/assets/dark_dashboard.png',
    stat: '56% completed',
  },
  {
    number: '03',
    kicker: 'Keep people in sync',
    title: 'Connect delivery, attendance, and time off.',
    text: 'Give teams a simple rhythm for check-ins, leave requests, and workload planning—without stitching together more tools.',
    light: '/assets/light_attendence.png',
    dark: '/assets/dark_attendence.png',
    stat: 'One team view',
  },
];

const featureCards = [
  { icon: 'bolt', eyebrow: 'Automations', title: 'Let routine work run itself', text: 'Trigger assignments, reminders, and status updates so your team can stay focused on decisions that need a human.' },
  { icon: 'users', eyebrow: 'Team clarity', title: 'Give every person a clear next step', text: 'Personal views, workload signals, and ownership rules keep priorities visible without another status meeting.' },
  { icon: 'shield', eyebrow: 'Enterprise control', title: 'Scale confidently, not cautiously', text: 'Role-based access, isolated workspaces, and complete activity history protect the details while work keeps moving.' },
];

const faqs = [
  ['When is my workspace created?', 'Your workspace and Super Admin account are created only after Stripe or Razorpay confirms a successful payment. Failed or cancelled checkouts never provision an account.'],
  ['Will TaskFlow work for non-technical teams?', 'Absolutely. Teams use the same simple building blocks—projects, tasks, owners, and timelines—while each department can choose the view that fits its work.'],
  ['Can we migrate from our current tool?', 'Yes. CSV import is available on every plan, and guided migration support is included for Professional and Enterprise workspaces.'],
  ['How is workspace data protected?', 'TaskFlow uses role-based access, workspace-level isolation, audit history, and optional two-factor authentication. Enterprise plans add custom security controls and support.'],
];

function ProductFrame({ className = '', label = 'Live workspace', children }) {
  return (
    <div className={`product-frame ${className}`}>
      <div className="browser-bar">
        <span className="window-dots"><i /><i /><i /></span>
        <span className="browser-address"><Icon name="shield" size={13} /> app.taskflow.io / workspace</span>
        <span className="live-pill"><i /> {label}</span>
      </div>
      {children}
    </div>
  );
}

export default function PremiumLanding({ isDark, toggleTheme, onOpenLogin, onOpenCheckout }) {
  const root = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.from('.hero-reveal', {
        opacity: 0,
        y: 26,
        duration: reduceMotion ? 0.01 : 0.85,
        stagger: reduceMotion ? 0 : 0.1,
        ease: 'power3.out',
      });

      if (!reduceMotion) {
        gsap.from('.hero-line > span', { yPercent: 115, rotate: 2, duration: 1, stagger: 0.12, ease: 'power4.out' });
        gsap.from('.hero-product', { opacity: 0, y: 46, rotateX: 4, scale: 0.96, duration: 1.25, delay: 0.3, ease: 'power3.out' });
        gsap.to('.hero-product', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.9 } });
        gsap.to('.hero-laptop-frame', { y: -9, duration: 3.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.hero-cube', { rotationX: '+=360', rotationY: '+=360', duration: 16, repeat: -1, ease: 'none' });
        gsap.to('.hero-orbit-dot', { rotation: 360, transformOrigin: '50% 50%', duration: 10, repeat: -1, ease: 'none' });

        gsap.utils.toArray('.reveal').forEach((element) => {
          gsap.from(element, {
            opacity: 0,
            y: 34,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          });
        });

        gsap.utils.toArray('.stagger-group').forEach((group) => {
          gsap.from(group.children, {
            opacity: 0,
            y: 28,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: group, start: 'top 86%', once: true },
          });
        });
      }

      const media = gsap.matchMedia();
      media.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const cursor = root.current?.querySelector('.cursor-follower');
        if (!cursor) return undefined;

        const moveX = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3.out' });
        const moveY = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3.out' });
        const interactiveElements = root.current.querySelectorAll('a, button, .feature-card, .price-card, .story-copy');
        const showCursor = ({ clientX, clientY }) => {
          moveX(clientX);
          moveY(clientY);
          gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
        };
        const hideCursor = () => gsap.to(cursor, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' });
        const activateCursor = () => cursor.classList.add('is-active');
        const deactivateCursor = () => cursor.classList.remove('is-active');
        const pressCursor = () => cursor.classList.add('is-pressed');
        const releaseCursor = () => cursor.classList.remove('is-pressed');

        gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        window.addEventListener('pointermove', showCursor);
        document.documentElement.addEventListener('mouseleave', hideCursor);
        window.addEventListener('pointerdown', pressCursor);
        window.addEventListener('pointerup', releaseCursor);
        interactiveElements.forEach((element) => {
          element.addEventListener('pointerenter', activateCursor);
          element.addEventListener('pointerleave', deactivateCursor);
        });

        return () => {
          window.removeEventListener('pointermove', showCursor);
          document.documentElement.removeEventListener('mouseleave', hideCursor);
          window.removeEventListener('pointerdown', pressCursor);
          window.removeEventListener('pointerup', releaseCursor);
          interactiveElements.forEach((element) => {
            element.removeEventListener('pointerenter', activateCursor);
            element.removeEventListener('pointerleave', deactivateCursor);
          });
        };
      });

      media.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const panels = gsap.utils.toArray('.story-panel');
        const copies = gsap.utils.toArray('.story-copy');
        const details = copies.map((copy) => copy.querySelector('div > span'));
        const progress = document.querySelector('.story-progress i');
        gsap.set(panels, { autoAlpha: 1, willChange: 'clip-path' });
        gsap.set(panels.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
        panels.forEach((panel, index) => gsap.set(panel, { zIndex: index + 2 }));
        if (progress) gsap.set(progress, { scaleY: 0, transformOrigin: 'top center' });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.story-pin',
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 3.15, 2500)}`,
            pin: true,
            pinSpacing: true,
            scrub: 1.25,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline.to({}, { duration: 0.75 });
        storySteps.slice(1).forEach((_, index) => {
          const from = index;
          const to = index + 1;
          const label = `step-${to}`;
          timeline
            .addLabel(label)
            .to(panels[to], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.88, ease: 'power2.inOut' }, label)
            .to(copies[from], { opacity: 0.28, duration: 0.42, ease: 'power1.inOut' }, `${label}+=0.12`)
            .to(copies[to], { opacity: 1, duration: 0.48, ease: 'power1.inOut' }, `${label}+=0.16`)
            .to(details[from], { maxHeight: 0, marginTop: 0, opacity: 0, duration: 0.4, ease: 'power1.inOut' }, `${label}+=0.12`)
            .to(details[to], { maxHeight: 100, marginTop: 8, opacity: 1, duration: 0.48, ease: 'power1.out' }, `${label}+=0.16`)
            .to({}, { duration: 0.9 });
        });
        if (progress) timeline.to(progress, { scaleY: 1, duration: timeline.duration(), ease: 'none' }, 0);
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh, { once: true });
      return () => {
        media.revert();
        window.removeEventListener('load', refresh);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div ref={root} className="premium-site">
      <div className="cursor-follower" aria-hidden="true"><span /></div>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-nav">
        <div className="nav-inner">
          <a href="#top" className="brand" aria-label="TaskFlow home" onClick={closeMenu}>
            <span className="brand-mark"><img src="/assets/taskflow-logo.png" alt="" /></span>
            <span>TaskFlow</span>
          </a>
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            <a href="#workflow" onClick={closeMenu}>Product</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#pricing" onClick={closeMenu}>Pricing</a>
            <a href="#customers" onClick={closeMenu}>Customers</a>
            <button className="mobile-login" onClick={() => { closeMenu(); onOpenLogin(); }}>Sign in</button>
          </nav>
          <div className="nav-actions">
            <button className="theme-button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <Icon name={isDark ? 'sun' : 'moon'} size={18} />
            </button>
            <button className="text-button nav-signin" onClick={onOpenLogin}>Sign in</button>
            <button className="button button-small" onClick={() => onOpenCheckout(2, 'Professional Suite')}>Choose a plan <Icon name="arrow" size={16} /></button>
            <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero-section" id="top">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-glow hero-glow-three" />
          <div className="section-shell hero-layout">
            <div className="hero-copy">
              <div className="eyebrow hero-reveal"><span className="eyebrow-dot" /> The calmer way to move work forward</div>
              <h1 className="hero-heading">
                <span className="hero-line"><span>Projects, people,</span></span>
                <span className="hero-line"><span>progress—<em className="hero-word-accent">in one flow.</em></span></span>
              </h1>
              <p className="hero-reveal">TaskFlow gives growing teams one beautifully clear place to plan work, balance people, and see progress without chasing updates.</p>
              <div className="hero-actions hero-reveal">
                <button className="button button-large" onClick={() => onOpenCheckout(2, 'Professional Suite')}>Start your workspace <Icon name="arrow" /></button>
                <a className="button-secondary button-large" href="#workflow"><span className="play-icon"><Icon name="play" size={15} /></span> See how it works</a>
              </div>
              <div className="hero-proof hero-reveal">
                <span><Icon name="check" size={15} /> Secure checkout</span>
                <span><Icon name="check" size={15} /> Stripe or Razorpay</span>
                <span><Icon name="check" size={15} /> Setup after payment</span>
              </div>
            </div>

            <div className="hero-product-wrap">
              <div className="hero-product">
                <div className="product-aura" />
                <div className="hero-orbit" aria-hidden="true"><span className="hero-orbit-dot"><i /></span></div>
                <div className="hero-laptop-frame">
                  <img
                    className="hero-laptop-image"
                    src="/assets/taskflow-laptop-hero.png"
                    alt="TaskFlow dashboard displayed on a laptop in a modern workspace"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div className="float-card float-card-left">
                  <span className="float-icon green"><Icon name="check" size={18} /></span>
                  <span><b>Sprint on track</b><small>19 tasks completed</small></span>
                </div>
                <div className="float-card float-card-right">
                  <span className="avatars"><i>MK</i><i>RA</i><i>+8</i></span>
                  <span><b>Team is moving</b><small>12 updates today</small></span>
                </div>
                <div className="hero-cube" aria-hidden="true">
                  <span className="cube-face cube-front" /><span className="cube-face cube-back" />
                  <span className="cube-face cube-right" /><span className="cube-face cube-left" />
                  <span className="cube-face cube-top" /><span className="cube-face cube-bottom" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Customer highlights">
          <div className="section-shell trust-inner reveal">
            <p>Built for modern teams at every stage</p>
            <div className="wordmarks"><span>Northstar</span><span>APEX</span><span>Horizon°</span><span>Brightline</span><span>MONO</span></div>
          </div>
        </section>

        <section className="story-section" id="workflow">
          <div className="story-pin">
            <div className="section-shell story-shell">
              <div className="story-intro">
                <span className="section-kicker">One connected workspace</span>
                <h2>Follow the work.<br />Not the busywork.</h2>
                <div className="story-copy-list">
                  <span className="story-progress" aria-hidden="true"><i /></span>
                  {storySteps.map((step) => (
                    <article className="story-copy" key={step.number}>
                      <span className="story-number">{step.number}</span>
                      <div><p>{step.kicker}</p><h3>{step.title}</h3><span>{step.text}</span></div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="story-stage" aria-live="polite">
                {storySteps.map((step) => (
                  <ProductFrame key={step.number} className="story-panel" label={step.stat}>
                    <img className="product-image light-product" src={step.light} alt={`${step.kicker} in TaskFlow`} />
                    <img className="product-image dark-product" src={step.dark} alt={`${step.kicker} in TaskFlow dark mode`} />
                  </ProductFrame>
                ))}
                <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-shell">
            <div className="section-heading reveal">
              <span className="section-kicker">Powerful by design</span>
              <h2>Less work about work.</h2>
              <p>Thoughtful details remove friction from everyday operations, while serious controls are ready when your organization needs them.</p>
            </div>
            <div className="feature-grid stagger-group">
              {featureCards.map((feature, index) => (
                <article className={`feature-card feature-tone-${index + 1}`} key={feature.title}>
                  <div className="feature-icon"><Icon name={feature.icon} size={24} /></div>
                  <span className="feature-eyebrow">{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <a href="#pricing">Learn more <Icon name="arrow" size={16} /></a>
                </article>
              ))}
            </div>
            <div className="insight-card reveal">
              <div className="insight-copy">
                <span className="section-kicker">A clearer signal</span>
                <h2>Know where attention is needed before work slips.</h2>
                <p>TaskFlow brings deadlines, workload, attendance, and project health together—so leaders can support teams early, not explain delays later.</p>
                <ul>
                  <li><Icon name="check" size={16} /> Live workload and progress indicators</li>
                  <li><Icon name="check" size={16} /> Flexible views for every working style</li>
                  <li><Icon name="check" size={16} /> Reports that are ready when you are</li>
                </ul>
              </div>
              <div className="insight-visual">
                <div className="metric-card metric-primary"><span>Team velocity</span><strong>+38%</strong><small>vs. last cycle</small><div className="mini-chart"><i /><i /><i /><i /><i /><i /></div></div>
                <div className="metric-card metric-float"><span>On-time delivery</span><strong>92%</strong><div className="progress-ring"><b>92</b></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="customers-section" id="customers">
          <div className="section-shell">
            <div className="customer-grid">
              <div className="quote-card reveal">
                <Icon name="quote" size={34} />
                <blockquote>“TaskFlow made the state of the business visible without making the team feel watched. We plan faster, meet less, and catch risk earlier.”</blockquote>
                <div className="quote-person"><span>AJ</span><p><b>Ana Joseph</b><small>COO, Northstar Labs</small></p></div>
              </div>
              <div className="results-panel reveal">
                <span className="section-kicker">Customer impact</span>
                <h2>Clarity that compounds.</h2>
                <div className="result-row"><strong>38%</strong><span>faster project delivery</span></div>
                <div className="result-row"><strong>6.2h</strong><span>saved per manager, weekly</span></div>
                <div className="result-row"><strong>92%</strong><span>team adoption in month one</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="section-shell">
            <div className="section-heading reveal">
              <span className="section-kicker">Simple pricing</span>
              <h2>Start small. Scale smoothly.</h2>
              <p>Everything you need to get your team moving, with transparent upgrades when your organization grows.</p>
              <div className="billing-toggle" role="group" aria-label="Billing period">
                <button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button>
                <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annual <span>Save 20%</span></button>
              </div>
            </div>
            <div className="pricing-grid stagger-group">
              <article className="price-card">
                <span className="plan-label">Starter</span><h3>For small teams finding their rhythm.</h3>
                <div className="price"><strong>${annual ? 24 : 29}</strong><span>{annual ? 'per month, billed annually' : 'per month'}</span></div>
                <ul><li><Icon name="check" size={16} /> Up to 5 people</li><li><Icon name="check" size={16} /> Projects and task boards</li><li><Icon name="check" size={16} /> Core reports</li></ul>
                <button className="button-secondary" onClick={() => onOpenCheckout(1, 'Starter Workspace', annual ? 'yearly' : 'monthly')}>Choose Starter</button>
              </article>
              <article className="price-card price-featured">
                <div className="popular-label">Most popular</div>
                <span className="plan-label">Professional</span><h3>For growing teams ready to move faster.</h3>
                <div className="price"><strong>${annual ? 66 : 79}</strong><span>{annual ? 'per month, billed annually' : 'per month'}</span></div>
                <ul><li><Icon name="check" size={16} /> Up to 50 people</li><li><Icon name="check" size={16} /> Automations and workload</li><li><Icon name="check" size={16} /> Attendance and leave</li><li><Icon name="check" size={16} /> Advanced roles and reports</li></ul>
                <button className="button" onClick={() => onOpenCheckout(2, 'Professional Suite', annual ? 'yearly' : 'monthly')}>Choose Professional <Icon name="arrow" size={17} /></button>
              </article>
              <article className="price-card">
                <span className="plan-label">Enterprise</span><h3>For organizations that need more control.</h3>
                <div className="price"><strong>${annual ? 166 : 199}</strong><span>{annual ? 'per month, billed annually' : 'per month'}</span></div>
                <ul><li><Icon name="check" size={16} /> Unlimited people</li><li><Icon name="check" size={16} /> SSO and custom policies</li><li><Icon name="check" size={16} /> Migration and priority support</li></ul>
                <button className="button-secondary" onClick={() => onOpenCheckout(3, 'Enterprise Cloud', annual ? 'yearly' : 'monthly')}>Choose Enterprise</button>
              </article>
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="section-shell faq-grid">
            <div className="faq-heading reveal"><span className="section-kicker">Questions, answered</span><h2>Everything you need to start with confidence.</h2><p>Still deciding? Our team can walk you through your workflow and recommend the simplest setup.</p><button className="text-link" onClick={onOpenLogin}>Talk to our team <Icon name="arrow" size={16} /></button></div>
            <div className="faq-list reveal">
              {faqs.map(([question, answer], index) => (
                <article className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}>
                  <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{question}</span><span className="faq-plus">{openFaq === index ? '−' : '+'}</span></button>
                  <div className="faq-answer"><p>{answer}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="section-shell cta-card reveal">
            <div className="cta-orb" /><span className="section-kicker">Ready when you are</span>
            <h2>Give your team a clearer way forward.</h2>
            <p>Start in minutes. Bring your projects. Invite your team. Feel the difference by Friday.</p>
            <button className="button button-large" onClick={() => onOpenCheckout(2, 'Professional Suite')}>Choose your workspace plan <Icon name="arrow" /></button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-shell footer-main">
          <div className="footer-brand"><a href="#top" className="brand"><span className="brand-mark"><img src="/assets/taskflow-logo.png" alt="" /></span><span>TaskFlow</span></a><p>Projects, people, and progress in one calm workspace.</p></div>
          <div className="footer-links"><div><b>Product</b><a href="#workflow">Overview</a><a href="#features">Features</a><a href="#pricing">Pricing</a></div><div><b>Company</b><a href="#customers">Customers</a><a href="#faq">About</a><a href="#faq">Contact</a></div><div><b>Resources</b><a href="#faq">Help center</a><a href="#faq">Security</a><a href="#faq">Status</a></div></div>
        </div>
        <div className="section-shell footer-bottom"><span>© 2026 TaskFlow. All rights reserved.</span><span><a href="#faq">Privacy</a><a href="#faq">Terms</a></span></div>
      </footer>
    </div>
  );
}

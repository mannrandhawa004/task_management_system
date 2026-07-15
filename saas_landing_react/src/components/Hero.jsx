import React from 'react';

export default function Hero({ onOpenCheckout }) {
  return (
    <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center" id="hero">
      
      {/* Decorative Background Circles */}
      <div className="absolute top-20 left-1/4 w-40 h-40 bg-accent-yellow/30 rounded-full blur-2xl -z-10 pointer-events-none"></div>
      <div className="absolute top-40 right-1/4 w-52 h-52 bg-brand-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Main Headline */}
      <h1 className="gsap-hero font-display font-extrabold text-5xl sm:text-6xl md:text-7xl text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto mb-6 leading-[1.12]">
        Manage Your Task.
      </h1>

      {/* Subheadline */}
      <p className="gsap-hero text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        TaskFlow boards, lists, and cards enable you to organize and prioritize your projects in a fun, flexible, and rewarding way. Let's get started 😉
      </p>

      {/* Action Buttons */}
      <div className="gsap-hero flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <button 
          onClick={() => onOpenCheckout(2, 'Professional Suite')} 
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-orange-glow hover:-translate-y-0.5"
        >
          Get Started
        </button>
        <a 
          href="#showcase" 
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-800 dark:text-white font-semibold text-base border border-light-border dark:border-dark-border transition-all shadow-soft dark:shadow-soft-dark flex items-center justify-center gap-2 no-underline"
        >
          <i className="fa-solid fa-play text-brand-500 text-sm"></i> Discover In Video
        </a>
      </div>

      {/* ==================== REAL DASHBOARD SCREENSHOT HERO ==================== */}
      <div className="gsap-hero-showcase relative max-w-5xl mx-auto mb-16">
        
        {/* Glow blobs behind the screenshot */}
        <div className="absolute -top-12 -left-12 w-32 h-32 md:w-48 md:h-48 rounded-full bg-accent-yellow/80 z-0 blur-2xl animate-pulse-soft pointer-events-none"></div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 md:w-36 md:h-36 rounded-full bg-brand-500/60 z-0 blur-2xl animate-pulse-soft pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent-green/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Browser chrome wrapper */}
        <div className="relative z-10 rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-2xl dark:shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
          
          {/* Fake browser top bar */}
          <div className="bg-slate-100 dark:bg-dark-card flex items-center gap-2 px-4 py-3 border-b border-light-border dark:border-dark-border">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <div className="flex-1 mx-4 bg-white dark:bg-dark-bg rounded-full px-4 py-1 text-xs font-mono text-slate-400 text-center truncate border border-light-border dark:border-dark-border">
              app.taskflow.io/acme-corp/dashboard
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent-green font-bold">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span> LIVE
            </div>
          </div>

          {/* Theme-adaptive dashboard screenshot */}
          <img 
            src="/assets/light_dashboard.png" 
            alt="TaskFlow Dashboard Light Mode" 
            className="block dark:hidden w-full h-auto object-cover object-top max-h-[580px]"
          />
          <img 
            src="/assets/dark_dashboard.png" 
            alt="TaskFlow Dashboard Dark Mode" 
            className="hidden dark:block w-full h-auto object-cover object-top max-h-[580px]"
          />
        </div>

        {/* ===== FLOATING REFERENCE SATELLITE CARDS ===== */}
        
        {/* Left Top: Sprint board badge */}
        <div className="hidden sm:flex absolute -top-5 -left-8 lg:-left-20 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-slow">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 text-accent-green flex items-center justify-center text-lg">
            <i className="fa-solid fa-square-check"></i>
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-800 dark:text-white">Sprint Board</div>
            <div className="text-[11px] text-slate-400">34 tasks &middot; 19 done</div>
          </div>
        </div>

        {/* Left Bottom: Workspace pool badge */}
        <div className="hidden md:flex absolute -bottom-5 -left-4 lg:-left-14 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-medium">
          <div className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
            AC
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>acme-corp.db</span>
              <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </div>
            <div className="text-[10px] text-slate-400">Isolated MySQL Pool &middot; Admin</div>
          </div>
        </div>

        {/* Right Top: Profile completion */}
        <div className="hidden sm:flex absolute -top-4 -right-4 lg:-right-16 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-fast">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-bold flex items-center justify-center text-xs shadow flex-shrink-0">
            AU
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-800 dark:text-white">Admin User</div>
            <div className="text-[10px] text-accent-green font-bold">78% Completion Rate</div>
          </div>
        </div>

        {/* Right Middle: Stats badge */}
        <div className="hidden lg:flex absolute top-1/3 -right-14 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-floating dark:shadow-floating-dark flex-col items-center text-center animate-float-slow">
          <div className="w-10 h-10 rounded-2xl bg-green-500/15 text-accent-green flex items-center justify-center text-base mb-2">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="font-bold text-xs text-slate-800 dark:text-white">13 Projects</div>
          <div className="text-[11px] text-accent-green font-semibold mt-0.5">10 Active</div>
        </div>

      </div>

      {/* 3 Sub-hero pill highlights */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-check-circle text-accent-green"></i> No credit card required
        </span>
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-check-circle text-accent-green"></i> 14-day free enterprise trial
        </span>
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-check-circle text-accent-green"></i> Instant MySQL schema setup
        </span>
      </div>

    </section>
  );
}

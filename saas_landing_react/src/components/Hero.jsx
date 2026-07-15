import React, { useState } from 'react';

export default function Hero({ onOpenCheckout }) {
  const [heroLiveMode, setHeroLiveMode] = useState(false);
  const [heroPulseCount, setHeroPulseCount] = useState(24);

  const triggerHeroPulse = () => {
    setHeroLiveMode(true);
    setHeroPulseCount(prev => prev + 1);
    setTimeout(() => setHeroLiveMode(false), 1500);
  };

  return (
    <section className="relative pt-16 pb-28 px-6 max-w-7xl mx-auto text-center overflow-hidden" id="hero">
      
      {/* Ambient Multi-Color Radial Blurs */}
      <div className="absolute top-24 left-1/4 w-72 h-72 bg-brand-500/15 rounded-full blur-[130px] -z-10 pointer-events-none animate-pulse-soft"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      {/* Top Interactive Telemetry Pill */}
      <div className="gsap-hero inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#151924] text-slate-700 dark:text-slate-300 font-mono text-xs font-bold mb-6 border border-light-border dark:border-dark-border shadow-sm hover:scale-105 transition-transform cursor-pointer" onClick={triggerHeroPulse}>
        <span className={`w-2.5 h-2.5 rounded-full ${heroLiveMode ? 'bg-brand-500 animate-ping' : 'bg-accent-green animate-pulse'}`}></span>
        <span>⚡ v2.4 Multi-Tenant Engine Live (`{heroPulseCount} queries/sec`)</span>
        <span className="text-[10px] bg-brand-500/15 text-brand-500 px-2 py-0.5 rounded font-extrabold ml-1">Click to Pulse</span>
      </div>

      {/* Main Headline */}
      <h1 className="gsap-hero font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto mb-6 leading-[1.1]">
        Organize Your Work <span className="bg-gradient-to-r from-brand-500 via-amber-500 to-green-500 bg-clip-text text-transparent">Beautifully.</span>
      </h1>

      {/* Subheadline */}
      <p className="gsap-hero text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        TaskFlow boards, Kanban lists, and attendance ledgers enable your teams to scale faster on isolated MySQL pools (`tenant_yourcompany`). Let's get started 😉
      </p>

      {/* Action Buttons */}
      <div className="gsap-hero flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <button 
          onClick={() => onOpenCheckout(2, 'Professional Suite')} 
          className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-orange-glow hover:-translate-y-1 scale-100 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <span>Deploy Workspace Free</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <a 
          href="#showcase" 
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-800 dark:text-white font-semibold text-base border border-light-border dark:border-dark-border transition-all shadow-soft dark:shadow-soft-dark flex items-center justify-center gap-2.5 no-underline hover:-translate-y-1 cursor-pointer"
        >
          <i className="fa-solid fa-play text-brand-500 text-sm"></i> Inspect Live Features
        </a>
      </div>

      {/* ==================== REAL DASHBOARD SCREENSHOT HERO ==================== */}
      <div className="gsap-hero-showcase relative max-w-5xl mx-auto mb-16">
        
        {/* Glow blobs behind the screenshot */}
        <div className="absolute -top-12 -left-12 w-36 h-36 md:w-56 md:h-56 rounded-full bg-accent-yellow/80 z-0 blur-3xl animate-pulse-soft pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-brand-500/70 z-0 blur-3xl animate-pulse-soft pointer-events-none"></div>

        {/* Browser chrome wrapper */}
        <div className={`relative z-10 rounded-[32px] overflow-hidden border-2 transition-all duration-500 shadow-2xl dark:shadow-[0_30px_90px_rgba(0,0,0,0.95)] bg-slate-50 dark:bg-[#11151f] ${heroLiveMode ? 'border-brand-500 scale-[1.006] shadow-orange-glow' : 'border-light-border dark:border-dark-border'}`}>
          
          {/* Fake browser top bar */}
          <div className="bg-slate-100 dark:bg-[#11151f] flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-400"></span>
              <span className="ml-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">app.taskflow.io/acme-corp/dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={triggerHeroPulse}
                className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-[#181d29] border border-light-border dark:border-dark-border text-xs font-mono text-slate-600 dark:text-slate-300 shadow-sm hover:border-brand-500 cursor-pointer transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${heroLiveMode ? 'bg-brand-500 animate-ping' : 'bg-accent-green animate-pulse'}`}></span>
                <span>{heroLiveMode ? 'Broadcasting WS Delta...' : 'Socket.IO Active'}</span>
              </button>
            </div>
          </div>

          {/* Theme-adaptive dashboard screenshot */}
          <div className="relative overflow-hidden">
            <img 
              src="/assets/light_dashboard.png" 
              alt="TaskFlow Dashboard Light Mode" 
              className="block dark:hidden w-full h-auto object-cover object-top max-h-[600px]"
            />
            <img 
              src="/assets/dark_dashboard.png" 
              alt="TaskFlow Dashboard Dark Mode" 
              className="hidden dark:block w-full h-auto object-cover object-top max-h-[600px]"
            />

            {/* Bottom Hero Overlay Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-left flex flex-wrap items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-lg shadow">
                  <i className="fa-solid fa-gauge-high"></i>
                </div>
                <div>
                  <div className="text-xs font-bold font-display">Executive Analytics Engine</div>
                  <div className="text-[11px] font-mono text-slate-300">Live MySQL Pool: `SELECT * FROM tenant_acmecorp.sprints`</div>
                </div>
              </div>
              <span className="text-xs font-bold text-accent-green bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                100% Real-Time Chart Rendering
              </span>
            </div>
          </div>
        </div>

        {/* ===== FLOATING REFERENCE SATELLITE CARDS ===== */}
        
        {/* Left Top: Sprint board badge */}
        <div className={`hidden sm:flex absolute -top-6 -left-6 lg:-left-16 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-slow transition-transform duration-300 ${heroLiveMode ? 'scale-110 ring-2 ring-accent-green' : ''}`}>
          <div className="w-11 h-11 rounded-2xl bg-green-500/15 text-accent-green flex items-center justify-center text-lg">
            <i className="fa-solid fa-square-check"></i>
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Sprint Board</span>
              <span className="text-[9px] bg-accent-green text-white font-mono px-1.5 py-0.2 rounded">SYNCED</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">34 tickets &middot; 19 completed</div>
          </div>
        </div>

        {/* Left Bottom: Workspace pool badge */}
        <div className={`hidden md:flex absolute -bottom-6 -left-4 lg:-left-12 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-medium transition-transform duration-300 ${heroLiveMode ? 'scale-110 ring-2 ring-brand-500' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md flex-shrink-0">
            AC
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>acme-corp.db</span>
              <i className="fa-solid fa-lock text-[10px] text-brand-500"></i>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Isolated MySQL Pool &middot; 21 Tables</div>
          </div>
        </div>

        {/* Right Top: Profile completion */}
        <div className={`hidden sm:flex absolute -top-5 -right-5 lg:-right-14 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-floating dark:shadow-floating-dark items-center gap-3 animate-float-fast transition-transform duration-300 ${heroLiveMode ? 'scale-110 ring-2 ring-amber-400' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-extrabold flex items-center justify-center text-xs shadow flex-shrink-0">
            AU
          </div>
          <div className="text-left">
            <div className="font-bold text-xs text-slate-900 dark:text-white">Admin Telemetry</div>
            <div className="text-[10px] text-accent-green font-bold">Latency: 2.1ms (Live)</div>
          </div>
        </div>

        {/* Right Middle: Stats badge */}
        <div className="hidden lg:flex absolute top-1/3 -right-14 z-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-floating dark:shadow-floating-dark flex-col items-center text-center animate-float-slow">
          <div className="w-11 h-11 rounded-2xl bg-green-500/15 text-accent-green flex items-center justify-center text-lg mb-2">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">13 Projects</div>
          <div className="text-[11px] text-accent-green font-semibold mt-0.5">+38% Velocity</div>
        </div>

      </div>

      {/* 3 Sub-hero pill highlights */}
      <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-accent-green text-sm"></i> No credit card required
        </span>
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-accent-green text-sm"></i> 14-day free enterprise trial
        </span>
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-accent-green text-sm"></i> Instant MySQL schema provisioning
        </span>
      </div>

    </section>
  );
}

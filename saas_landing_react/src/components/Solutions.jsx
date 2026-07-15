import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function Solutions() {
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  // Ensure image/card transitions cleanly on industry tab selection
  useEffect(() => {
    const heroCard = document.querySelector('#solutions .gsap-scroll-grid');
    if (heroCard) {
      gsap.fromTo(heroCard,
        { opacity: 0.6, scale: 0.99 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [selectedIndustry]);

  const industries = [
    {
      title: "Remote Dev & Engineering",
      subtitle: "Sprint Velocity & GitHub Sync",
      desc: "Synchronize distributed engineering squads across multiple time zones. Connect Jira or GitHub issues directly to TaskFlow Kanban cards and automate code review notifications via real-time WebSockets.",
      stats: "+38% Sprint Velocity",
      badgeColor: "brand",
      icon: "fa-code",
      lightImg: "/assets/light_task_board.png",
      darkImg: "/assets/dark_task_board.png",
      linkText: "Explore Engineering Setup"
    },
    {
      title: "Healthcare Operations",
      subtitle: "SOC 2 & Patient Privacy",
      desc: "Enforce strict staff and patient data boundaries with our dedicated 21-table MySQL tenant isolation (`tenant_yourcompany`). Audit every medical staff attendance stamp and role shift without database bleed.",
      stats: "100% HIPAA/SOC2 Isolated",
      badgeColor: "green",
      icon: "fa-hospital-user",
      lightImg: "/assets/light_attendence.png",
      darkImg: "/assets/dark_attendence.png",
      linkText: "Inspect Healthcare Security"
    },
    {
      title: "Financial Enterprises",
      subtitle: "Cryptographic Audit & Compliance",
      desc: "Maintain immutable audit trails for every financial task, expense sign-off, and user permission modification. Gain real-time executive dashboard visibility into global department resource allocation.",
      stats: "Zero Unauthorized Bleed",
      badgeColor: "blue",
      icon: "fa-building-columns",
      lightImg: "/assets/light_dashboard.png",
      darkImg: "/assets/dark_dashboard.png",
      linkText: "Review Financial Audit Logs"
    },
    {
      title: "Creative & Design Agencies",
      subtitle: "Client Billing & Timesheets",
      desc: "Track client deliverables, agency employee working hours, and billing rates dynamically from one clean dashboard. Give external clients read-only access to specific project progress boards.",
      stats: "2.4x Faster Approvals",
      badgeColor: "purple",
      icon: "fa-palette",
      lightImg: "/assets/light_employees.png",
      darkImg: "/assets/dark_all_user.png",
      linkText: "See Agency Portal"
    }
  ];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border relative overflow-hidden" id="solutions">
      
      {/* Ambient decorative glow */}
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-3xl mx-auto mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-500 font-mono text-xs font-bold mb-4 shadow-sm border border-blue-500/20">
          <i className="fa-solid fa-briefcase"></i> Tailored Industry Architectures
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Solutions Built for Your Domain
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Discover how organizations across modern engineering, healthcare, finance, and creative agencies leverage our isolated tenant pools and real-time workflows.
        </p>

        {/* Interactive Industry Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 p-1.5 bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl max-w-3xl mx-auto">
          {industries.map((ind, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndustry(idx)}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedIndustry === idx
                  ? 'bg-white dark:bg-dark-bg text-slate-900 dark:text-white shadow-md border border-light-border dark:border-dark-border scale-[1.03]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${ind.icon} text-base ${selectedIndustry === idx ? 'text-brand-500' : ''}`}></i>
              <span className="truncate max-w-full">{ind.title.split('&')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Active Industry Hero Card — GSAP Scroll Grid */}
      <div className="gsap-scroll-grid max-w-6xl mx-auto mb-16">
        <div className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 sm:p-10 shadow-soft dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-500 font-mono mb-3 uppercase tracking-wider">
                {industries[selectedIndustry].subtitle}
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
                {industries[selectedIndustry].title}
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {industries[selectedIndustry].desc}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Impact Benchmark</div>
                <div className="font-display font-extrabold text-lg text-accent-green mt-0.5">{industries[selectedIndustry].stats}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/15 text-accent-green flex items-center justify-center text-lg">
                <i className="fa-solid fa-chart-line"></i>
              </div>
            </div>

            <a
              href="#showcase"
              className="inline-flex items-center gap-2.5 font-bold text-sm text-brand-500 hover:text-brand-600 group pt-2"
            >
              <span>{industries[selectedIndustry].linkText}</span>
              <i className="fa-solid fa-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
            </a>
          </div>

          {/* Right Image Window */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-light-border dark:border-dark-border bg-slate-100 dark:bg-dark-bg shadow-lg group">
            <div className="bg-slate-200/80 dark:bg-[#121620] px-4 py-2.5 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              <span className="flex-1 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                {industries[selectedIndustry].title.toLowerCase().replace(/[^a-z0-9]/g, '-')}—workspace.taskflow.io
              </span>
            </div>
            <div className="relative overflow-hidden max-h-[380px]">
              <img src={industries[selectedIndustry].lightImg} alt={industries[selectedIndustry].title} className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <img src={industries[selectedIndustry].darkImg} alt={industries[selectedIndustry].title} className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>

        </div>
      </div>

      {/* 4 Quick Grid Cards underneath */}
      <div className="gsap-scroll-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {industries.map((ind, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedIndustry(idx)}
            className={`gsap-scroll-card bg-white dark:bg-dark-card border rounded-2xl p-5 shadow-soft dark:shadow-soft-dark text-left flex flex-col justify-between group hover:-translate-y-1 transition-all cursor-pointer ${
              selectedIndustry === idx
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-orange-glow'
                : 'border-light-border dark:border-dark-border hover:border-slate-400'
            }`}
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${ind.icon}`}></i>
              </div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                {ind.title.split('&')[0]}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {ind.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-brand-500">
              <span>{selectedIndustry === idx ? 'Active View' : 'Select Domain'}</span>
              <i className={`fa-solid fa-arrow-right transition-transform ${selectedIndustry === idx ? 'translate-x-1' : ''}`}></i>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

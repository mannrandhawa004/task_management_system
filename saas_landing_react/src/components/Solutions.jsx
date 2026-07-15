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
      title: "Remote Dev & Engineering Squads",
      subtitle: "Sprint Velocity & GitHub Sync",
      desc: "Synchronize distributed engineering squads across multiple time zones. Connect Jira or GitHub issues directly to TaskFlow Kanban cards and automate code review notifications via real-time WebSockets.",
      stats: "+38% Sprint Output",
      badgeColor: "brand",
      icon: "fa-code",
      lightImg: "/assets/light_task_board.png",
      darkImg: "/assets/dark_task_board.png",
      linkText: "Explore Engineering Setup",
      features: [
        { title: "Socket.IO Real-Time Board Sync", desc: "Drag-and-drop ticket movements broadcast instantly to all developer screens." },
        { title: "GitHub & GitLab Commit Linking", desc: "Automatically attach pull requests and build statuses to sprint task cards." },
        { title: "Automated Workload Routing", desc: "Smart AI algorithm assigns incoming tickets based on developer bandwidth." },
        { title: "Sprint Burn-down Analytics", desc: "Real-time velocity tracking predicts sprint completion accuracy within ±3%." }
      ]
    },
    {
      title: "Healthcare Medical Operations",
      subtitle: "SOC 2 & Patient Privacy",
      desc: "Enforce strict staff and patient data boundaries with our dedicated 21-table MySQL tenant isolation (`tenant_hospital`). Audit every medical staff attendance stamp and role shift without database bleed.",
      stats: "100% HIPAA/SOC2 Isolated",
      badgeColor: "green",
      icon: "fa-hospital-user",
      lightImg: "/assets/light_attendence.png",
      darkImg: "/assets/dark_attendence.png",
      linkText: "Inspect Healthcare Security",
      features: [
        { title: "Isolated Per-Tenant MySQL Pool", desc: "Your hospital's data resides in `tenant_hospital` with zero shared row overlap." },
        { title: "GPS Geofenced Shift Check-in", desc: "Automate daily check-in/out stamps with hospital GPS coordinate boundaries." },
        { title: "IP Whitelist Validation", desc: "Restrict sensitive attendance portal access exclusively to internal hospital networks." },
        { title: "Cryptographic HR Audit Ledger", desc: "Every shift change, leave request, and PTO sign-off is immutably recorded." }
      ]
    },
    {
      title: "Global Financial Enterprises",
      subtitle: "Cryptographic Audit & Compliance",
      desc: "Maintain immutable audit trails for every financial task, expense sign-off, and user permission modification. Gain real-time executive dashboard visibility into global department resource allocation.",
      stats: "Zero Unauthorized Bleed",
      badgeColor: "blue",
      icon: "fa-building-columns",
      lightImg: "/assets/light_dashboard.png",
      darkImg: "/assets/dark_dashboard.png",
      linkText: "Review Financial Audit Logs",
      features: [
        { title: "Granular RBAC Security Roles", desc: "Enforce strict separation between Super Admins, Department Managers, and Auditors." },
        { title: "Multi-Department Resource Analytics", desc: "Executive dashboard aggregates spend and progress across global business units." },
        { title: "Automated Compliance Export", desc: "Export SOC 2 and financial audit trails to PDF/CSV with verified timestamps." },
        { title: "2FA TOTP Authentication Mandate", desc: "Require Microsoft/Google Authenticator OTP verification on every login." }
      ]
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
      linkText: "See Agency Portal",
      features: [
        { title: "Client Progress Read-Only Portals", desc: "Let external clients review milestone progress without accessing internal notes." },
        { title: "Automated Employee Timesheets", desc: "Convert daily attendance logs directly into billable agency hours." },
        { title: "Multi-Project Deadline Radar", desc: "AI risk detection warns managers when client deliverables risk bottlenecking." },
        { title: "Departmental Talent Directory", desc: "Organize freelancers, full-time designers, and copywriters into clean silos." }
      ]
    }
  ];

  const current = industries[selectedIndustry];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border relative overflow-hidden" id="solutions">
      
      {/* Ambient decorative glow */}
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-3xl mx-auto mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-500 font-mono text-xs font-bold mb-4 shadow-sm border border-blue-500/20">
          <i className="fa-solid fa-briefcase"></i> Tailored Industry Architectures
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Solutions Engineered for Your Domain
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Explore how specific industries leverage our multi-tenant database isolation (`tenant_slug`) and automated workflows to solve domain-specific bottlenecks.
        </p>

        {/* Interactive Industry Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 p-1.5 bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl max-w-3xl mx-auto shadow-inner">
          {industries.map((ind, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndustry(idx)}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedIndustry === idx
                  ? 'bg-white dark:bg-dark-bg text-slate-900 dark:text-white shadow-md border border-light-border dark:border-dark-border scale-[1.03] ring-1 ring-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${ind.icon} text-base ${selectedIndustry === idx ? 'text-brand-500' : ''}`}></i>
              <span className="truncate max-w-full">{ind.title.split(' ')[0]} {ind.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Active Industry Hero Card — GSAP Scroll Grid */}
      <div className="gsap-scroll-grid max-w-6xl mx-auto mb-16">
        <div className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-[32px] p-6 sm:p-10 shadow-2xl text-left grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Text Detail & Feature List */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/15 text-brand-500 font-mono uppercase tracking-wider border border-brand-500/20">
                  {current.subtitle}
                </span>
                <span className="font-mono text-xs font-extrabold text-accent-green bg-green-500/15 px-3 py-1 rounded-full border border-green-500/20">
                  <i className="fa-solid fa-chart-line mr-1"></i> {current.stats}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight mb-3">
                {current.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                {current.desc}
              </p>

              {/* Detailed Feature Explanations Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Key Architectural &amp; Workflow Features:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.features.map((feat, fIdx) => (
                    <div key={fIdx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1">
                        <i className="fa-solid fa-circle-check text-brand-500 text-sm"></i>
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-between">
              <a
                href="#showcase"
                className="inline-flex items-center gap-2 font-bold text-sm text-brand-500 hover:text-brand-600 group"
              >
                <span>{current.linkText}</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
              </a>
              <span className="text-xs font-mono text-slate-400">Dedicated MySQL Pool</span>
            </div>
          </div>

          {/* Right Image Window */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-slate-100 dark:bg-dark-bg shadow-xl flex flex-col group">
            <div className="bg-slate-200/90 dark:bg-[#121620] px-5 py-3 flex items-center gap-2.5 border-b border-light-border dark:border-dark-border">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="flex-1 text-center text-xs font-mono text-slate-500 dark:text-slate-300 font-semibold truncate">
                {current.title.split(' ')[0].toLowerCase()}—portal.taskflow.io
              </span>
              <span className="text-[10px] font-mono text-accent-green bg-green-500/15 px-2 py-0.5 rounded">Live View</span>
            </div>
            <div className="relative flex-1 overflow-hidden min-h-[380px] bg-slate-50 dark:bg-dark-bg">
              <img src={current.lightImg} alt={current.title} className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <img src={current.darkImg} alt={current.title} className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              
              {/* Floating Feature Annotation Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#151924]/95 backdrop-blur-md border border-light-border dark:border-dark-border p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center text-base font-bold flex-shrink-0">
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{current.features[0].title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{current.features[0].desc}</div>
                  </div>
                </div>
                <i className="fa-solid fa-circle-check text-accent-green text-lg hidden sm:block"></i>
              </div>
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
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-orange-glow bg-brand-500/5'
                : 'border-light-border dark:border-dark-border hover:border-slate-400'
            }`}
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${ind.icon}`}></i>
              </div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                {ind.title.split(' ')[0]} {ind.title.split(' ')[1]}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {ind.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs font-bold text-brand-500">
              <span>{selectedIndustry === idx ? 'Active Domain View' : 'Select Domain'}</span>
              <i className={`fa-solid fa-arrow-right transition-transform ${selectedIndustry === idx ? 'translate-x-1' : ''}`}></i>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

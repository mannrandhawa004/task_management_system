import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function Solutions() {
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  // Ensure image/card transitions cleanly on department tab selection
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
      title: "Engineering & Dev Squads",
      subtitle: "Sprint Velocity & RLS Scoping",
      desc: "Synchronize distributed engineering teams across multiple time zones. Connect code reviews directly to TaskFlow Kanban cards and automate assignment routing via real-time Socket.IO 4 WebSockets.",
      stats: "+38% Sprint Output",
      badgeColor: "brand",
      icon: "fa-code",
      lightImg: "/assets/light_task_board.png",
      darkImg: "/assets/dark_task_board.png",
      linkText: "Explore Engineering Scopes",
      features: [
        { title: "Socket.IO 4 Real-Time Board Sync", desc: "Drag-and-drop ticket movements broadcast instantly across all developer screens." },
        { title: "Department-Scoped Project Boards", desc: "Row-Level Security (`department_id = ?`) ensures developers only see engineering tasks." },
        { title: "Add Member Drawer & Memory Search", desc: "Instant client-side search automatically filters engineers inside your assigned department." },
        { title: "Dual-View Grid & Table Dashboard", desc: "Switch instantly between Kanban cards and high-density technical table views." }
      ]
    },
    {
      title: "Project Management Office (PMO)",
      subtitle: "10-Tier Hierarchical Governance",
      desc: "Enforce strict project and task boundaries across complex multi-department programs. Assign entire sub-teams to projects with a single click and enforce two-step Microsoft Authenticator MFA.",
      stats: "10-Tier Hierarchical RBAC",
      badgeColor: "green",
      icon: "fa-sitemap",
      lightImg: "/assets/light_dashboard.png",
      darkImg: "/assets/dark_dashboard.png",
      linkText: "Inspect PMO Governance",
      features: [
        { title: "10-Tier RBAC Hierarchy", desc: "Explicit governance (`Super Admin`, `Admin`, `Project Manager`, `Team Lead` to `Intern`)." },
        { title: "Microsoft Authenticator TOTP QR", desc: "Standard RFC 6238 QR code scan (`otpauth`) requires no manual 16-digit code typing." },
        { title: "Two-Step JWT Verification", desc: "Login flow issues short-lived temporary tokens when `requires2FA: true` is active." },
        { title: "Team Leads & Sub-Squad Hierarchy", desc: "Create specialized teams inside departments with dedicated Team Leads and custom permissions." }
      ]
    },
    {
      title: "Executive & HR Administration",
      subtitle: "Attendance Ledgers & Leave Quotas",
      desc: "Maintain immutable audit trails for every project modification and leave sign-off. Track daily attendance with location tagging (`Office`, `Remote`, `Hybrid`) and automate annual leave deductions.",
      stats: "4 Leave Quota Types",
      badgeColor: "blue",
      icon: "fa-user-clock",
      lightImg: "/assets/light_attendence.png",
      darkImg: "/assets/dark_attendence.png",
      linkText: "Explore HR Attendance Suite",
      features: [
        { title: "Attendance Location Tagging", desc: "Employees check in/out with explicit work location tags (`Office`, `Remote`, `Hybrid`)." },
        { title: "Configurable Leave Quotas", desc: "Manage Annual, Sick, Casual, and Maternity/Paternity leave quotas with automated balance tracking." },
        { title: "Immutable Audit Trails (`/v1/project`)", desc: "Super Admins inspect a tamper-proof log of project updates and security events." },
        { title: "Salary Deduction & Payroll Ledgers", desc: "Comprehensive daily attendance logs and monthly summaries for HR deduction reporting." }
      ]
    },
    {
      title: "Marketing & Cross-Functional Teams",
      subtitle: "Global Search & Collaborative Scoping",
      desc: "Eliminate silos between creative design, content writing, and product marketing. Toggle admin visibility switches to expand project member scopes organization-wide when cross-department collaboration is required.",
      stats: "Instant Redux Caching",
      badgeColor: "purple",
      icon: "fa-layer-group",
      lightImg: "/assets/light_all_task.png",
      darkImg: "/assets/dark_all_task.png",
      linkText: "Inspect Marketing Workflows",
      features: [
        { title: "Unified Global Command Search", desc: "Fast search across all marketing campaigns, tasks, and employee directories." },
        { title: "Cross-Functional Admin Toggle", desc: "Expand member provisioning scope organization-wide when collaborating outside department." },
        { title: "4 Priority Levels & Statuses", desc: "Track campaigns from `To Do` to `Completed` with `Urgent` and `High` priority markers." },
        { title: "Redux Toolkit State Slices", desc: "Client-side `projectSlice` and `taskSlice` ensure zero UI lag on status updates." }
      ]
    }
  ];

  const current = industries[selectedIndustry];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border relative overflow-hidden" id="solutions">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[160px] rounded-full pointer-events-none -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-blue-500/10 dark:bg-blue-500/15 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      {/* Header with GSAP Scroll Class */}
      <div className="max-w-4xl mx-auto text-center mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-sitemap"></i> Department &amp; Team Scopes
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Tailored Scopes for Every Department
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          Whether you are running an Agile engineering squad, a high-security PMO, or an enterprise HR department, TaskFlow adapts our Row-Level Security (RLS) to your exact organizational structure.
        </p>

        {/* Industry Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10 max-w-5xl mx-auto">
          {industries.map((ind, idx) => {
            const isSelected = selectedIndustry === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndustry(idx)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-500 shadow-orange-glow scale-105 ring-2 ring-brand-500/30'
                    : 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-dark-bg text-brand-500'
                  }`}>
                    <i className={`fa-solid ${ind.icon}`}></i>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 dark:bg-dark-bg text-slate-500'
                  }`}>
                    {ind.stats}
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-sm leading-tight mb-1">{ind.title}</div>
                  <div className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{ind.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Panel for Selected Department */}
      <div className="gsap-scroll-grid rounded-[36px] bg-white dark:bg-dark-card border-2 border-brand-500/30 dark:border-brand-500/40 shadow-2xl overflow-hidden p-6 sm:p-10 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Top: Detailed Architectural Breakdown & Checklists */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 font-mono text-xs font-bold mb-4 border border-light-border dark:border-dark-border">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                <span>Active Scope: {current.title}</span>
              </div>
              <h3 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white mb-3">
                {current.subtitle}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {current.desc}
              </p>

              {/* 4 Architectural Features Grid Beside/Below */}
              <div className="space-y-3 mb-8">
                {current.features.map((feat, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">{feat.title}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-light-border dark:border-dark-border flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-green">
                <i className="fa-solid fa-shield-halved"></i> 100% Parameterized MySQL 8
              </span>
              <a href="#pricing" className="text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1.5 transition-transform hover:translate-x-1">
                <span>{current.linkText}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          {/* Right: Department Screenshot with Live Telemetry Badge */}
          <div className="lg:col-span-7 relative">
            <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-2xl bg-slate-100 dark:bg-dark-bg relative group">
              {/* Fake browser header */}
              <div className="bg-slate-200/80 dark:bg-[#131722] px-4 py-2.5 flex items-center justify-between border-b border-light-border dark:border-dark-border text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span className="ml-2 font-bold">app.taskflow.io/department/{current.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
                </div>
                <span className="text-accent-green font-bold">● RLS SCOPED</span>
              </div>

              {/* Theme adaptive image */}
              <div className="relative overflow-hidden">
                <img src={current.lightImg} alt={current.title} className="block dark:hidden w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-105 max-h-[480px]" />
                <img src={current.darkImg} alt={current.title} className="hidden dark:block w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-105 max-h-[480px]" />
                
                {/* Floating Telemetry Pill */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 dark:bg-[#151924]/95 backdrop-blur-md p-3.5 rounded-2xl border border-light-border dark:border-dark-border shadow-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center text-base flex-shrink-0 font-bold">
                    <i className={`fa-solid ${current.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{current.title} Pool</span>
                      <span className="text-[10px] bg-brand-500 text-white px-2 py-0.2 rounded font-mono font-bold">{current.stats}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      Endpoint: `/v1/project?departmentId=assigned`
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}

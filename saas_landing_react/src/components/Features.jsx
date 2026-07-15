import React from 'react';

export default function Features() {
  const mainFeatures = [
    {
      title: "Automatically Assign Tasks",
      desc: "Distribute sprint tickets instantly based on developer bandwidth, skillset specialization, and department KPIs using smart AI routing.",
      icon: "fa-bolt-lightning",
      color: "brand",
      badge: "AI Powered",
      linkText: "Explore workflow rules"
    },
    {
      title: "Dedicated Tenant MySQL Pools",
      desc: "Every workspace gets an isolated 21-table MySQL database (`tenant_yourcompany`) with zero shared row bleed or noisy neighbors.",
      icon: "fa-database",
      color: "green",
      badge: "SaaS Isolation",
      linkText: "Inspect multi-tenant architecture"
    },
    {
      title: "Real-Time HR Attendance",
      desc: "Automate daily check-in/out stamps with office GPS geofencing and IP validation directly synced into your payroll and leave ledger.",
      icon: "fa-user-clock",
      color: "blue",
      badge: "GPS & IP Validated",
      linkText: "View HR attendance portal"
    }
  ];

  const gridPills = [
    { title: "Socket.IO Real-Time Sync", desc: "Instant Kanban card drag updates across all active team screens", icon: "fa-tower-broadcast", color: "text-brand-500 bg-brand-500/15" },
    { title: "Granular RBAC Security", desc: "Custom role permissions for Super Admins, Managers, and Members", icon: "fa-key", color: "text-accent-green bg-green-500/15" },
    { title: "Automated Audit Trails", desc: "Every login, task update, and project deletion is immutably logged", icon: "fa-list-check", color: "text-blue-500 bg-blue-500/15" },
    { title: "Departmental Sub-Teams", desc: "Separate Engineering, Marketing, HR, and Sales into clean silos", icon: "fa-sitemap", color: "text-purple-500 bg-purple-500/15" },
    { title: "2FA TOTP Authentication", desc: "Microsoft & Google Authenticator multi-factor login protection", icon: "fa-shield-halved", color: "text-amber-500 bg-amber-500/15" },
    { title: "Automated Leave Ledgers", desc: "One-click PTO approvals with automatic attendance calendar blocks", icon: "fa-calendar-check", color: "text-red-500 bg-red-500/15" },
  ];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border relative overflow-hidden" id="features">
      
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 dark:bg-brand-500/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>

      {/* Header with GSAP Scroll Class */}
      <div className="max-w-3xl mx-auto mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-microchip"></i> Enterprise Workflow Engine
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Engineered for Scale, Speed &amp; Security
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Our multi-tenant architecture empowers you to automate repetitive tasks, synchronize real-time team boards, and enforce military-grade database isolation.
        </p>
      </div>

      {/* 3 Main Horizontal Feature Cards — GSAP Stagger Grid */}
      <div className="gsap-scroll-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
        {mainFeatures.map((feat, idx) => (
          <div
            key={idx}
            className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:border-brand-500 transition-all duration-500 text-left flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top accent glow line on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-green to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                  feat.color === 'brand' ? 'bg-brand-500/15 text-brand-500' :
                  feat.color === 'green' ? 'bg-green-500/15 text-accent-green' : 'bg-blue-500/15 text-blue-500'
                }`}>
                  <i className={`fa-solid ${feat.icon}`}></i>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 border border-light-border dark:border-dark-border">
                  {feat.badge}
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3 group-hover:text-brand-500 transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {feat.desc}
              </p>
            </div>

            <div className={`text-xs font-bold flex items-center gap-2 group-hover:translate-x-1.5 transition-transform duration-300 ${
              feat.color === 'brand' ? 'text-brand-500' :
              feat.color === 'green' ? 'text-accent-green' : 'text-blue-500'
            }`}>
              <span>{feat.linkText}</span>
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== WHY CHOOSE TASKFLOW (6 GRID PILLS) ==================== */}
      <div className="max-w-3xl mx-auto mb-14 gsap-scroll-header">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          Why Choose TaskFlow.io
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Everything your modern engineering, HR, and project management teams need to collaborate under one unified roof.
        </p>
      </div>

      <div className="gsap-scroll-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {gridPills.map((pill, idx) => (
          <div
            key={idx}
            className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-soft dark:shadow-soft-dark hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 flex items-center gap-4 text-left group hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${pill.color}`}>
              <i className={`fa-solid ${pill.icon}`}></i>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                {pill.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {pill.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

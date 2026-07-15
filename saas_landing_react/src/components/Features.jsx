import React from 'react';

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border" id="features">
      
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          Automate Complex Workflow
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Our cloud multi-tenant architecture enables you to automate repetitive tasks, synchronize team boards, and enforce role security.
        </p>
      </div>

      {/* 3 Horizontal Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
        
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-soft dark:shadow-soft-dark hover:-translate-y-1 transition-all text-left flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center text-xl mb-5">
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Automatically Assign Tasks</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Distribute sprint tickets instantly based on developer bandwidth and department specialization.
            </p>
          </div>
          <div className="text-xs font-semibold text-brand-500 flex items-center gap-1.5">
            <span>Learn about automation</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-soft dark:shadow-soft-dark hover:-translate-y-1 transition-all text-left flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-green-500/15 text-accent-green flex items-center justify-center text-xl mb-5">
              <i className="fa-solid fa-database"></i>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Dedicated Tenant DBs</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Every workspace gets an isolated 21-table MySQL database pool (`tenant_yourcompany`) with zero shared row bleed.
            </p>
          </div>
          <div className="text-xs font-semibold text-accent-green flex items-center gap-1.5">
            <span>100% data isolation</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-soft dark:shadow-soft-dark hover:-translate-y-1 transition-all text-left flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl mb-5">
              <i className="fa-solid fa-user-clock"></i>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Real-Time Attendance</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Automate daily check-in/out stamps with office GPS geofencing and IP validation directly in the HR ledger.
            </p>
          </div>
          <div className="text-xs font-semibold text-blue-500 flex items-center gap-1.5">
            <span>Explore HR suite</span> <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

      </div>

      {/* ==================== WHY CHOOSE TASKFLOW (6 GRID PILLS) ==================== */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-3">
          Why Choose TaskFlow.io
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Everything your modern enterprise needs to scale sustainably under one roof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-brand-500 flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Team Task Collaboration</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Socket.IO real-time Kanban sync</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 text-accent-green flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-folder-tree"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">21 Isolated Schemas</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users, tasks, roles, &amp; attendance</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Granular RBAC Matrix</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin, Manager, Employee</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-key"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">TOTP 2FA Security</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Google &amp; Microsoft Auth compatible</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-memory"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">LRU Pool Eviction</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Auto recovery of idle DB pools</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft dark:shadow-soft-dark flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base flex-shrink-0">
            <i className="fa-solid fa-scroll"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Audit Log Ledgers</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Immutable compliance timestamps</p>
          </div>
        </div>

      </div>

    </section>
  );
}

import React from 'react';

export default function PartnersSecurity() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border">
      
      <div className="mb-10">
        <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest mb-6">Integration Partners</h3>
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 font-display font-extrabold text-xl sm:text-2xl text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-brands fa-slack text-purple-500"></i> Slack</span>
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-brands fa-google text-red-500"></i> Workspace</span>
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-solid fa-n text-slate-700 dark:text-slate-300"></i> Notion</span>
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-brands fa-jira text-blue-500"></i> Jira</span>
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-brands fa-trello text-cyan-500"></i> Trello</span>
          <span className="flex items-center gap-2 hover:text-brand-500 transition-colors"><i className="fa-solid fa-bolt text-amber-500"></i> Zapier</span>
        </div>
      </div>

      <div className="pt-12 border-t border-light-border dark:border-dark-border max-w-4xl mx-auto">
        <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest mb-6">Security &amp; Assurance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center text-lg flex-shrink-0 font-bold">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-white">SOC 2 Type II</div>
              <div className="text-[10px] text-slate-400">Certified Audited</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 text-accent-green flex items-center justify-center text-lg flex-shrink-0 font-bold">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-white">End-to-End Encrypted</div>
              <div className="text-[10px] text-slate-400">TLS 1.3 &amp; Bcrypt</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-lg flex-shrink-0 font-bold">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Granular RBAC</div>
              <div className="text-[10px] text-slate-400">Isolated Permissions</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-lg flex-shrink-0 font-bold">
              <i className="fa-solid fa-database"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-white">99.99% Uptime SLA</div>
              <div className="text-[10px] text-slate-400">Automated LRU Pool</div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}

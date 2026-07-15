import React, { useState } from 'react';

export default function Pricing({ onOpenCheckout }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border relative overflow-hidden" id="pricing">
      
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-brand-500/5 dark:bg-brand-500/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-3xl mx-auto mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20">
          <i className="fa-solid fa-tags"></i> Transparent Multi-Tenant Tiers
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          Simple, Predictable Pricing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Start for free, scale with dedicated MySQL pools (`tenant_yourcompany`), and pay only for active developers in your workspace.
        </p>

        {/* Billing Toggle Switch */}
        <div className="mt-8 inline-flex items-center gap-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full p-2.5 shadow-soft">
          <span className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          
          <button 
            type="button"
            onClick={() => setIsAnnual(!isAnnual)} 
            className="w-14 h-7 rounded-full bg-brand-500 relative transition-all focus:outline-none shadow-inner cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm ${isAnnual ? 'left-[29px]' : 'left-1'}`}></div>
          </button>
          
          <span className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="bg-accent-green/20 text-accent-green text-[10px] px-2.5 py-0.5 rounded-full font-extrabold animate-pulse">
              SAVE 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid — GSAP Scroll Stagger */}
      <div className="gsap-scroll-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left items-stretch">
        
        {/* Starter Plan */}
        <div className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-soft-dark flex flex-col justify-between hover:-translate-y-2 hover:border-slate-400 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Starter Workspace</span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-500">Free Tier</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For small dev squads &amp; side projects</p>
            
            <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-light-border dark:border-dark-border">
              <span className="font-display font-extrabold text-5xl text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-400 text-xs font-medium">/ month forever</span>
            </div>
            
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 mb-8 font-medium">
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Up to 5 Team Members</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Shared Tenant DB Pool</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Standard Kanban &amp; Tasks</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> 7-Day Audit Log Ledger</li>
            </ul>
          </div>

          <button
            onClick={() => onOpenCheckout(1, "Starter Workspace")}
            className="w-full py-3.5 rounded-2xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-dark-hover font-bold text-xs text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
          >
            Deploy Free Workspace
          </button>
        </div>

        {/* Professional Suite — Featured */}
        <div className="gsap-scroll-card bg-white dark:bg-dark-card border-2 border-brand-500 rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between md:-translate-y-4 hover:-translate-y-6 transition-all duration-300">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-orange-glow">
            Most Popular Suite
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Professional Suite</span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-500">Dedicated Pool</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For scaling engineering &amp; product teams</p>
            
            <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-light-border dark:border-dark-border">
              <span className="font-display font-extrabold text-5xl text-slate-900 dark:text-white">
                ${isAnnual ? '64' : '79'}
              </span>
              <span className="text-slate-400 text-xs font-medium">/ month {isAnnual && '(billed annually)'}</span>
            </div>
            
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 mb-8 font-medium">
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-brand-500 text-sm"></i> Up to 50 Team Members</li>
              <li className="flex items-center gap-3 font-bold text-slate-900 dark:text-white"><i className="fa-solid fa-check text-brand-500 text-sm"></i> Dedicated MySQL Database (`tenant_slug`)</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-brand-500 text-sm"></i> Real-Time Attendance &amp; GPS Check-In</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-brand-500 text-sm"></i> Custom RBAC Role Permissions</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-brand-500 text-sm"></i> Unlimited Audit Trail Storage</li>
            </ul>
          </div>

          <button
            onClick={() => onOpenCheckout(2, "Professional Suite")}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold text-xs text-white transition-all shadow-orange-glow cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <span>Start 14-Day Free Trial</span> <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        {/* Enterprise Cloud */}
        <div className="gsap-scroll-card bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-soft-dark flex flex-col justify-between hover:-translate-y-2 hover:border-slate-400 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Enterprise Cloud</span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-accent-green/15 text-accent-green">SLA Guarantee</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For large enterprises requiring strict SOC 2</p>
            
            <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-light-border dark:border-dark-border">
              <span className="font-display font-extrabold text-5xl text-slate-900 dark:text-white">
                ${isAnnual ? '159' : '199'}
              </span>
              <span className="text-slate-400 text-xs font-medium">/ month {isAnnual && '(billed annually)'}</span>
            </div>
            
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 mb-8 font-medium">
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Unlimited Team Members</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Multiple Dedicated Read/Write Replicas</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Custom Subdomains (`app.company.com`)</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> Dedicated Technical Account Manager</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-check text-accent-green text-sm"></i> 99.99% Uptime SLA &amp; BAA</li>
            </ul>
          </div>

          <button
            onClick={() => onOpenCheckout(3, "Enterprise Cloud")}
            className="w-full py-3.5 rounded-2xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-dark-hover font-bold text-xs text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
          >
            Contact Enterprise Sales
          </button>
        </div>

      </div>

    </section>
  );
}

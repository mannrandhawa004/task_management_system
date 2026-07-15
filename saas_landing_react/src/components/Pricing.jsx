import React, { useState } from 'react';

export default function Pricing({ onOpenCheckout }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-light-border dark:border-dark-border" id="pricing">
      
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          Simple, Transparent Multi-Tenant Pricing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Start for free, scale with dedicated MySQL pools, and pay only for the developers in your workspace.
        </p>

        {/* Billing Toggle Switch */}
        <div className="mt-8 inline-flex items-center gap-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full p-2 shadow-soft">
          <span className={`text-xs font-bold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          
          <button 
            type="button"
            onClick={() => setIsAnnual(!isAnnual)} 
            className="w-14 h-7 rounded-full bg-brand-500 relative transition-all focus:outline-none shadow-inner"
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm ${isAnnual ? 'left-[29px]' : 'left-1'}`}></div>
          </button>
          
          <span className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="bg-accent-green/20 text-accent-green text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              SAVE 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
        
        {/* Starter Plan */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-soft-dark flex flex-col justify-between hover:border-slate-400 transition-all">
          <div>
            <div className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Starter Workspace</div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For small dev squads &amp; side projects</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-extrabold text-4xl text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-400 text-xs font-medium">/ month forever</span>
            </div>
            
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-8">
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Up to 5 Team Members</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Shared Tenant DB Pool</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Standard Kanban Boards</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> 7-Day Audit Log Ledger</li>
            </ul>
          </div>

          <button 
            onClick={() => onOpenCheckout(1, 'Starter Workspace')} 
            className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-white hover:bg-brand-500 hover:text-white transition-all shadow-sm"
          >
            Start Free
          </button>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="bg-white dark:bg-dark-card border-2 border-brand-500 rounded-3xl p-8 shadow-2xl dark:shadow-[0_20px_50px_rgba(255,107,44,0.15)] flex flex-col justify-between relative transform md:-translate-y-2">
          <div className="absolute -top-3.5 right-6 bg-brand-500 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-orange-glow tracking-wide uppercase">
            Most Popular
          </div>
          <div>
            <div className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Professional Suite</div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">For scaling agile teams &amp; enterprises</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-extrabold text-4xl text-slate-900 dark:text-white">
                ${isAnnual ? '64' : '79'}
              </span>
              <span className="text-slate-400 text-xs font-medium">/ user / month</span>
            </div>
            
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-8">
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-brand-500 font-bold"></i> Up to 50 Team Members</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-brand-500 font-bold"></i> Isolated 21-Table MySQL Pool</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-brand-500 font-bold"></i> Real-time Socket.IO Sync</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-brand-500 font-bold"></i> Automated Attendance Geofencing</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-brand-500 font-bold"></i> 1-Year Immutable Audit Ledger</li>
            </ul>
          </div>

          <button 
            onClick={() => onOpenCheckout(2, 'Professional Suite')} 
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-orange-glow"
          >
            Deploy Isolated Tenant
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-soft dark:shadow-soft-dark flex flex-col justify-between hover:border-slate-400 transition-all">
          <div>
            <div className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Enterprise Cloud</div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Unlimited scale &amp; dedicated VPCs</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display font-extrabold text-4xl text-slate-900 dark:text-white">
                ${isAnnual ? '159' : '199'}
              </span>
              <span className="text-slate-400 text-xs font-medium">/ user / month</span>
            </div>
            
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-8">
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Unlimited Team Members</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Dedicated AWS / GCP VPC Pool</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> Custom RBAC Permission Matrix</li>
              <li className="flex items-center gap-2.5"><i className="fa-solid fa-check text-accent-green"></i> 24/7 Dedicated DevOps Support</li>
            </ul>
          </div>

          <button 
            onClick={() => onOpenCheckout(3, 'Enterprise Cloud')} 
            className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-white hover:bg-brand-500 hover:text-white transition-all shadow-sm"
          >
            Contact Sales
          </button>
        </div>

      </div>

    </section>
  );
}

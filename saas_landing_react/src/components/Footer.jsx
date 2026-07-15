import React from 'react';

export default function Footer({ onOpenCheckout }) {
  return (
    <footer className="border-t border-light-border dark:border-dark-border bg-white dark:bg-[#0b0e14] transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/10 blur-[150px] pointer-events-none -z-10"></div>

      {/* Bottom CTA Banner */}
      <div className="max-w-6xl mx-auto px-6 py-24 border-b border-light-border dark:border-dark-border text-center relative">
        <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-dark-card border border-light-border dark:border-dark-border rounded-[36px] p-8 sm:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-5 border border-brand-500/20">
            <i className="fa-solid fa-rocket animate-bounce"></i> Instant MySQL Provisioning
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
            Ready to Upgrade Your Enterprise Workflow?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Deploy your dedicated multi-tenant database pool (`tenant_yourcompany`) today and start managing projects with complete security and zero latency.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onOpenCheckout(2, 'Professional Suite')} 
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-orange-glow hover:-translate-y-1 scale-100 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start Your 14-Day Free Trial</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
            <a
              href="#showcase"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-dark-bg text-slate-900 dark:text-white font-bold text-sm border border-light-border dark:border-dark-border hover:border-brand-500 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-code text-brand-500"></i> Review API Specs
            </a>
          </div>
        </div>
      </div>

      {/* Footer Main Links */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10 text-xs">
        
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <a href="#hero" className="flex items-center gap-3 group no-underline">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-orange-glow">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Task<span className="text-brand-500">Flow</span>
            </span>
          </a>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            The next-generation multi-tenant enterprise task and attendance platform built with isolated database pools (`tenant_slug`) and real-time Socket.IO synchronization.
          </p>
          <div className="flex items-center gap-3.5 text-slate-400 dark:text-slate-500 text-base pt-1">
            <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-all"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-all"><i className="fa-brands fa-github"></i></a>
            <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-all"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center hover:text-brand-500 hover:border-brand-500 transition-all"><i className="fa-brands fa-discord"></i></a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3.5 uppercase tracking-wider text-[11px]">Product</h4>
          <ul className="space-y-2.5 text-slate-500 dark:text-slate-400">
            <li><a href="#showcase" className="hover:text-brand-500 transition-colors">Live Screenshots</a></li>
            <li><a href="#features" className="hover:text-brand-500 transition-colors">Kanban Boards</a></li>
            <li><a href="#features" className="hover:text-brand-500 transition-colors">Attendance Tracker</a></li>
            <li><a href="#pricing" className="hover:text-brand-500 transition-colors">Enterprise Pricing</a></li>
            <li><a href="#solutions" className="hover:text-brand-500 transition-colors">Industry Pools</a></li>
          </ul>
        </div>

        {/* Architecture Links */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3.5 uppercase tracking-wider text-[11px]">Architecture</h4>
          <ul className="space-y-2.5 text-slate-500 dark:text-slate-400">
            <li><a href="#faq" className="hover:text-brand-500 transition-colors">Per-Tenant Isolation</a></li>
            <li><a href="#faq" className="hover:text-brand-500 transition-colors">MySQL Pool Eviction</a></li>
            <li><a href="#faq" className="hover:text-brand-500 transition-colors">Socket.IO WebSockets</a></li>
            <li><a href="#faq" className="hover:text-brand-500 transition-colors">SOC 2 Compliance</a></li>
            <li><a href="#faq" className="hover:text-brand-500 transition-colors">REST API Docs</a></li>
          </ul>
        </div>

        {/* System Status & Legal */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3.5 uppercase tracking-wider text-[11px]">Platform Status</h4>
          <div className="bg-slate-100 dark:bg-[#131722] p-3.5 rounded-2xl border border-light-border dark:border-dark-border mb-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-accent-green mb-1">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">99.99% Uptime (Last 90 days)</div>
          </div>
          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
          </div>
        </div>

      </div>

    </footer>
  );
}

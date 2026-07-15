import React from 'react';

export default function Footer({ onOpenCheckout }) {
  return (
    <footer className="border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-card transition-colors duration-300">
      
      {/* Bottom CTA Banner */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-b border-light-border dark:border-dark-border text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-6">
            Ready to Upgrade Your Enterprise Workflow?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8">
            Deploy your dedicated multi-tenant database pool today and start managing projects with complete peace of mind.
          </p>
          <button 
            onClick={() => onOpenCheckout(2, 'Professional Suite')} 
            className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-orange-glow hover:-translate-y-0.5"
          >
            Start Your 14-Day Free Trial
          </button>
        </div>
      </div>

      {/* Footer Main Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        
        {/* Brand Column */}
        <div className="col-span-2">
          <a href="#hero" className="flex items-center gap-3 group mb-4 no-underline">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-base shadow-orange-glow">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Task<span className="text-brand-500">Flow</span>
            </span>
          </a>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-4">
            The next-generation multi-tenant enterprise task and attendance platform built with isolated database pools and real-time Socket.IO synchronization.
          </p>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-base">
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fa-brands fa-github"></i></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><i className="fa-brands fa-discord"></i></a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Product</h4>
          <ul className="space-y-2 text-slate-500 dark:text-slate-400">
            <li><a href="#showcase" className="hover:text-brand-500 transition-colors">Live Screenshots</a></li>
            <li><a href="#features" className="hover:text-brand-500 transition-colors">Kanban Boards</a></li>
            <li><a href="#features" className="hover:text-brand-500 transition-colors">Attendance Tracker</a></li>
            <li><a href="#pricing" className="hover:text-brand-500 transition-colors">Enterprise Pricing</a></li>
          </ul>
        </div>

        {/* Architecture Links */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Architecture</h4>
          <ul className="space-y-2 text-slate-500 dark:text-slate-400">
            <li><a href="#solutions" className="hover:text-brand-500 transition-colors">21 Isolated Schemas</a></li>
            <li><a href="#solutions" className="hover:text-brand-500 transition-colors">LRU Pool Eviction</a></li>
            <li><a href="#solutions" className="hover:text-brand-500 transition-colors">Socket.IO Real-time</a></li>
            <li><a href="#solutions" className="hover:text-brand-500 transition-colors">Security &amp; SOC 2</a></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="font-display font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-[11px]">Company</h4>
          <ul className="space-y-2 text-slate-500 dark:text-slate-400">
            <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-brand-500 transition-colors">System Status</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-light-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>&copy; {new Date().getFullYear()} TaskFlow.io Enterprise Systems. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 font-mono text-[10px] text-accent-green flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
          <span>Compiled with React + Vite + PostCSS (Zero CDN Runtime)</span>
        </div>
      </div>

    </footer>
  );
}

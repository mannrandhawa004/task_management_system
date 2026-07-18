import React from 'react';

export default function Navbar({ isDark, toggleTheme, onOpenLogin, onOpenCheckout }) {
  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-2xl border-b border-light-border dark:border-dark-border transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left Logo */}
        <a href="#hero" className="flex items-center gap-3 group no-underline">
          <img src="/assets/taskflow-logo-modern.png" alt="TaskFlow" className="h-auto w-[142px] object-contain transition-transform group-hover:scale-[1.03]" />
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-brand-500/15 text-brand-500 px-2 py-0.5 rounded border border-brand-500/20 ml-1">
            v2.4 Enterprise
          </span>
        </a>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-7 font-medium text-sm text-slate-600 dark:text-slate-300">
          <a href="#hero" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Overview</a>
          <a href="#showcase" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
            <span>Live Previews</span>
          </a>
          <a href="#features" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Architecture</a>
          <a href="#solutions" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Industries</a>
          <a href="#pricing" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">FAQ</a>
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center text-slate-600 dark:text-amber-400 hover:scale-105 transition-all shadow-sm cursor-pointer" 
            title="Toggle Light / Dark Mode"
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-lg animate-spin-slow"></i>
            ) : (
              <i className="fa-solid fa-moon text-lg"></i>
            )}
          </button>

          <button 
            onClick={onOpenLogin} 
            className="hidden sm:inline-block font-semibold text-sm px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-dark-card transition-all cursor-pointer"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => onOpenCheckout(2, 'Professional Suite')} 
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-orange-glow hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Deploy Free</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>

        </div>

      </div>
    </header>
  );
}

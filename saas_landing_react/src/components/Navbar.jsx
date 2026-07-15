import React from 'react';

export default function Navbar({ isDark, toggleTheme, onOpenLogin, onOpenCheckout }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-xl border-b border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left Logo */}
        <a href="#hero" className="flex items-center gap-3 group no-underline">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-orange-glow group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            Task<span className="text-brand-500">Flow</span>
          </span>
        </a>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
          <a href="#hero" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Products</a>
          <a href="#showcase" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Live Demo</a>
          <a href="#features" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">FAQ</a>
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center text-slate-600 dark:text-amber-400 hover:scale-105 transition-all shadow-sm" 
            title="Toggle Light / Dark Mode"
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-lg"></i>
            ) : (
              <i className="fa-solid fa-moon text-lg"></i>
            )}
          </button>

          <button 
            onClick={onOpenLogin} 
            className="hidden sm:inline-block font-semibold text-sm px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => onOpenCheckout(2, 'Professional Suite')} 
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-dark-card text-slate-900 dark:text-white border border-light-border dark:border-dark-border hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-500 transition-all shadow-soft dark:shadow-soft-dark"
          >
            Sign Up
          </button>

        </div>

      </div>
    </header>
  );
}

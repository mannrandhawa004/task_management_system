import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState('all');

  // Ensure new/filtered cards always animate cleanly to 100% visibility on tab change
  useEffect(() => {
    const cards = document.querySelectorAll('#showcase .gsap-scroll-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [activeTab]);

  const categories = [
    { id: 'all', label: 'All Previews', icon: 'fa-layer-group' },
    { id: 'analytics', label: 'Analytics & Dashboards', icon: 'fa-chart-pie' },
    { id: 'workflow', label: 'Task & Kanban Boards', icon: 'fa-kanban' },
    { id: 'team', label: 'Team & Attendance', icon: 'fa-users-viewfinder' },
  ];

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border relative overflow-hidden" id="showcase">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 dark:bg-brand-500/15 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      {/* Header with GSAP Scroll Class */}
      <div className="max-w-3xl mx-auto text-center mb-16 gsap-scroll-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold mb-4 shadow-sm border border-brand-500/20 animate-pulse-soft">
          <i className="fa-solid fa-display"></i> Live Application Previews
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-5 leading-tight">
          See TaskFlow In Action
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Every screenshot below is compiled directly from our enterprise MySQL platform — instantly adapting between your light and dark themes with zero layout shifts.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100 dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl max-w-xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-brand-500 text-white shadow-orange-glow scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GSAP Scroll Grid Container */}
      <div className="gsap-scroll-grid space-y-10">
        
        {/* Row 1: Full-width Dashboard Preview */}
        {(activeTab === 'all' || activeTab === 'analytics') && (
          <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] group hover:border-brand-500/60 transition-all duration-500">
            {/* macOS Window Bar */}
            <div className="bg-slate-100/90 dark:bg-[#121620] px-6 py-3.5 flex items-center justify-between border-b border-light-border dark:border-dark-border backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400/90 hover:bg-red-500 transition-colors"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 hover:bg-amber-500 transition-colors"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-400/90 hover:bg-green-500 transition-colors"></span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-dark-bg px-3.5 py-1 rounded-full border border-light-border dark:border-dark-border text-xs font-mono text-slate-500 dark:text-slate-300 shadow-sm">
                <i className="fa-solid fa-lock text-[10px] text-accent-green"></i>
                <span>app.taskflow.io/tenant_acmecorp/dashboard</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-brand-500 bg-brand-500/10 px-3 py-1 rounded-lg">
                <i className="fa-solid fa-bolt"></i> Live Real-Time Analytics
              </div>
            </div>
            {/* Screenshots */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-dark-bg">
              <img src="/assets/light_dashboard.png" alt="Dashboard Light" className="block dark:hidden w-full h-auto max-h-[580px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]" />
              <img src="/assets/dark_dashboard.png" alt="Dashboard Dark" className="hidden dark:block w-full h-auto max-h-[580px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]" />
              
              {/* Floating Overlay Badge on Hover */}
              <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border border-light-border dark:border-dark-border px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="w-3 h-3 rounded-full bg-accent-green animate-ping"></div>
                <div className="text-left font-sans">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">Velocity Chart Active</div>
                  <div className="text-[10px] text-slate-400 font-mono">Sprint #42 — +24% output</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Two-column (Kanban Board + Attendance Tracker) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(activeTab === 'all' || activeTab === 'workflow') && (
            <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-brand-500 transition-all duration-300 flex flex-col">
              <div className="bg-slate-100/90 dark:bg-[#121620] px-5 py-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-300 font-semibold">/workflow/kanban-board</span>
                <span className="text-[10px] bg-brand-500/15 text-brand-500 font-bold px-2.5 py-0.5 rounded-full">Drag &amp; Drop</span>
              </div>
              <div className="relative flex-1 bg-slate-50 dark:bg-dark-bg overflow-hidden">
                <img src="/assets/light_task_board.png" alt="Task Board Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <img src="/assets/dark_task_board.png" alt="Task Board Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>
          )}
          
          {(activeTab === 'all' || activeTab === 'team') && (
            <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-accent-green transition-all duration-300 flex flex-col">
              <div className="bg-slate-100/90 dark:bg-[#121620] px-5 py-3 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-300 font-semibold">/attendance/calendar</span>
                <span className="text-[10px] bg-green-500/15 text-accent-green font-bold px-2.5 py-0.5 rounded-full">Automated Check-In</span>
              </div>
              <div className="relative flex-1 bg-slate-50 dark:bg-dark-bg overflow-hidden">
                <img src="/assets/light_attendence.png" alt="Attendance Light" className="block dark:hidden w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <img src="/assets/dark_attendence.png" alt="Attendance Dark" className="hidden dark:block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Three-column (All Tasks List, Projects Workspace, Team Directory) */}
        {(activeTab === 'all' || activeTab === 'workflow' || activeTab === 'team') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {(activeTab === 'all' || activeTab === 'workflow') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-blue-500 transition-all duration-300 flex flex-col">
                <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-2.5 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300 font-bold">/tasks/master-list</span>
                  <span className="text-[9px] bg-blue-500/15 text-blue-500 font-bold px-2 py-0.5 rounded">Filter Pool</span>
                </div>
                <div className="relative flex-1 bg-slate-50 dark:bg-dark-bg overflow-hidden">
                  <img src="/assets/light_all_task.png" alt="All Tasks Light" className="block dark:hidden w-full h-auto max-h-[300px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_all_task.png" alt="All Tasks Dark" className="hidden dark:block w-full h-auto max-h-[300px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'workflow') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-purple-500 transition-all duration-300 flex flex-col">
                <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-2.5 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300 font-bold">/projects/overview</span>
                  <span className="text-[9px] bg-purple-500/15 text-purple-500 font-bold px-2 py-0.5 rounded">Milestones</span>
                </div>
                <div className="relative flex-1 bg-slate-50 dark:bg-dark-bg overflow-hidden">
                  <img src="/assets/dark_all_projects.png" alt="All Projects" className="w-full h-auto max-h-[300px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'team') && (
              <div className="gsap-scroll-card rounded-3xl overflow-hidden border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-soft dark:shadow-soft-dark group hover:border-amber-500 transition-all duration-300 flex flex-col">
                <div className="bg-slate-100/90 dark:bg-[#121620] px-4 py-2.5 flex items-center justify-between border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300 font-bold">/team/directory</span>
                  <span className="text-[9px] bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded">RBAC Roles</span>
                </div>
                <div className="relative flex-1 bg-slate-50 dark:bg-dark-bg overflow-hidden">
                  <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-auto max-h-[300px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <img src="/assets/dark_all_user.png" alt="Users Dark" className="hidden dark:block w-full h-auto max-h-[300px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}

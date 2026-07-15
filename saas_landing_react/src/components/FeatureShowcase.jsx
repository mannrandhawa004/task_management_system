import React from 'react';

export default function FeatureShowcase() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-light-border dark:border-dark-border" id="showcase">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-500 font-mono text-xs font-bold mb-4">
          <i className="fa-solid fa-display"></i> Live Application Previews
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
          See TaskFlow In Action
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Every screenshot below is compiled directly into the React application — instantly adapting to your active theme.
        </p>
      </div>

      {/* Row 1: Full-width Dashboard */}
      <div className="mb-10 rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] group hover:shadow-orange-glow transition-all duration-500">
        <div className="bg-slate-100 dark:bg-dark-card px-5 py-3 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
          <span className="w-3 h-3 rounded-full bg-green-400"></span>
          <span className="flex-1 text-center text-xs font-mono text-slate-400">Dashboard — Project Analytics &amp; Velocity</span>
        </div>
        <img src="/assets/light_dashboard.png" alt="Dashboard Light" className="block dark:hidden w-full h-auto max-h-[520px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]" />
        <img src="/assets/dark_dashboard.png" alt="Dashboard Dark" className="hidden dark:block w-full h-auto max-h-[520px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]" />
      </div>

      {/* Row 2: Two-column (Task Board + Attendance) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark group hover:border-brand-500 transition-all duration-300">
          <div className="bg-slate-100 dark:bg-dark-card px-5 py-3 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span className="flex-1 text-center text-xs font-mono text-slate-400">Kanban Task Board — Drag &amp; Drop</span>
          </div>
          <img src="/assets/light_task_board.png" alt="Task Board Light" className="block dark:hidden w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <img src="/assets/dark_task_board.png" alt="Task Board Dark" className="hidden dark:block w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>
        
        <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark group hover:border-accent-green transition-all duration-300">
          <div className="bg-slate-100 dark:bg-dark-card px-5 py-3 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span className="flex-1 text-center text-xs font-mono text-slate-400">Attendance Tracker — Check-In / Calendar</span>
          </div>
          <img src="/assets/light_attendence.png" alt="Attendance Light" className="block dark:hidden w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <img src="/assets/dark_attendence.png" alt="Attendance Dark" className="hidden dark:block w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>
      </div>

      {/* Row 3: Three-column (All Tasks, All Projects, Team Members) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark group hover:border-blue-500 transition-all duration-300">
          <div className="bg-slate-100 dark:bg-dark-card px-4 py-2.5 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="flex-1 text-center text-[10px] font-mono text-slate-400">All Tasks List</span>
          </div>
          <img src="/assets/light_all_task.png" alt="All Tasks Light" className="block dark:hidden w-full h-auto max-h-[280px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <img src="/assets/dark_all_task.png" alt="All Tasks Dark" className="hidden dark:block w-full h-auto max-h-[280px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>

        <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark group hover:border-purple-500 transition-all duration-300">
          <div className="bg-slate-100 dark:bg-dark-card px-4 py-2.5 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="flex-1 text-center text-[10px] font-mono text-slate-400">Projects Workspace</span>
          </div>
          <img src="/assets/dark_all_projects.png" alt="All Projects" className="w-full h-auto max-h-[280px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>

        <div className="rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft dark:shadow-soft-dark group hover:border-amber-500 transition-all duration-300">
          <div className="bg-slate-100 dark:bg-dark-card px-4 py-2.5 flex items-center gap-2 border-b border-light-border dark:border-dark-border">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="flex-1 text-center text-[10px] font-mono text-slate-400">Team Members</span>
          </div>
          <img src="/assets/light_employees.png" alt="Employees Light" className="block dark:hidden w-full h-auto max-h-[280px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <img src="/assets/dark_all_user.png" alt="Users Dark" className="hidden dark:block w-full h-auto max-h-[280px] object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>
      </div>
    </section>
  );
}
